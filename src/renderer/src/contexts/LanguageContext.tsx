/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { Language, translations } from '../locales'

type TranslationValue = string | TranslationObject

interface TranslationObject {
  [key: string]: TranslationValue
}
type TranslationParams = Record<string, string | number>

type LanguageContextValue = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string, params?: TranslationParams) => string
}

const LANGUAGE_STORAGE_KEY = 'toolsngon.language'

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

const isLanguage = (value: string | null): value is Language => value === 'en' || value === 'vi'

const getInitialLanguage = (): Language => {
  const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY)
  if (isLanguage(storedLanguage)) return storedLanguage

  const browserLanguage = navigator.language.toLowerCase()
  return browserLanguage.startsWith('vi') ? 'vi' : 'en'
}

const getNestedTranslation = (language: Language, key: string): TranslationValue | undefined => {
  return key.split('.').reduce<TranslationValue | undefined>((current, segment) => {
    if (!current || typeof current !== 'object') return undefined
    return current[segment]
  }, translations[language] as TranslationValue)
}

const interpolate = (message: string, params?: TranslationParams): string => {
  if (!params) return message

  return Object.entries(params).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, String(value)),
    message
  )
}

export const LanguageProvider = ({
  children
}: {
  children: React.ReactNode
}): React.JSX.Element => {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage)

  const setLanguage = (nextLanguage: Language): void => {
    setLanguageState(nextLanguage)
  }

  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
    document.documentElement.lang = language
  }, [language])

  const value = useMemo<LanguageContextValue>(() => {
    const t = (key: string, params?: TranslationParams): string => {
      const translated = getNestedTranslation(language, key) ?? getNestedTranslation('vi', key)
      if (typeof translated !== 'string') return key

      return interpolate(translated, params)
    }

    return { language, setLanguage, t }
  }, [language])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export const useLanguage = (): LanguageContextValue => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider')
  }

  return context
}
