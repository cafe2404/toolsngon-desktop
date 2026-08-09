import { Cookie, Session } from 'electron'
import { Account } from '../../types/global'

export function getProfilePartition(profileId: string | undefined, fallbackId: string): string {
  return profileId ? `persist:profile-${profileId}` : `persist:profile-${fallbackId}`
}

export function getDeviceArguments(account?: Account): string[] | undefined {
  const device = account?.device
  if (!device) return undefined

  return [
    `--screenResolution=${device.screen_resolution}`,
    `--language=${device.language}`,
    `--timezone=${device.timezone}`,
    `--platform=${device.platform}`,
    `--hardwareConcurrency=${device.hardware_concurrency}`,
    `--deviceMemory=${device.device_memory}`
  ]
}

export async function setCookiesForSession(
  session: Session | undefined,
  cookies: Cookie[] | undefined
): Promise<boolean> {
  if (!session || !cookies) return false

  await Promise.all(
    cookies.map((c) => {
      const isHost = c.name.startsWith('__Host-')
      const isSecurePrefix = c.name.startsWith('__Secure-')
      const cookieObj: Electron.CookiesSetDetails = {
        url: `${c.secure || isHost || isSecurePrefix ? 'https' : 'http'}://${(c.domain ?? '').replace(/^\./, '')}${c.path || '/'}`,
        name: c.name,
        value: c.value,
        path: isHost ? '/' : c.path || '/',
        secure: isHost || isSecurePrefix ? true : c.secure || false,
        httpOnly: c.httpOnly || false,
        expirationDate: c.expirationDate
      }

      if (!isHost && c.domain) {
        cookieObj.domain = c.domain
      }

      return session.cookies
        .set(cookieObj)
        .catch((err) => console.error('Set cookie fail', c.name, err))
    })
  )

  return true
}

export async function clearSessionData(sessions: Iterable<Session>): Promise<void> {
  const clearTasks: Array<Promise<void>> = []

  for (const session of sessions) {
    clearTasks.push(session.clearCache())
    clearTasks.push(
      session.clearStorageData({
        storages: [
          'cookies',
          'filesystem',
          'indexdb',
          'localstorage',
          'shadercache',
          'serviceworkers',
          'cachestorage',
          'websql'
        ]
      })
    )
  }

  await Promise.allSettled(clearTasks)
}
