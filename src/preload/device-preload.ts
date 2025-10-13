/* eslint-disable @typescript-eslint/no-explicit-any */
import { Device } from '../types/global'

function overrideDeviceProperties(device: Device): void {
  try {
    if (device.language) {
      Object.defineProperty(navigator, 'language', {
        value: device.language,
        configurable: true
      })
      Object.defineProperty(navigator, 'languages', {
        value: [device.language],
        configurable: true
      })
      console.log('✅ Navigator.language overridden:', device.language)
    }
    if (device.platform) {
      Object.defineProperty(navigator, 'platform', {
        value: device.platform,
        configurable: true
      })
      console.log('✅ Navigator.platform overridden:', device.platform)
    }
    if (device.hardware_concurrency) {
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        value: device.hardware_concurrency,
        configurable: true
      })
      console.log('✅ Navigator.hardwareConcurrency overridden:', device.hardware_concurrency)
    }
    if (device.device_memory) {
      Object.defineProperty(navigator, 'deviceMemory', {
        value: device.device_memory,
        configurable: true
      })
      console.log('✅ Navigator.deviceMemory overridden:', device.device_memory)
    }
    if (device.screen_resolution) {
      const [width, height] = device.screen_resolution.split('x').map(Number)
      if (width && height) {
        Object.defineProperty(screen, 'width', { value: width, configurable: true })
        Object.defineProperty(screen, 'availWidth', { value: width, configurable: true })
        Object.defineProperty(screen, 'height', { value: height, configurable: true })
        Object.defineProperty(screen, 'availHeight', { value: height, configurable: true })
        console.log('✅ Screen resolution overridden:', device.screen_resolution)
      }
    }
    if (device.timezone) {
      try {
        const RealDateTimeFormat = Intl.DateTimeFormat
        ;(Intl as any).DateTimeFormat = function (locale?: string, options?: any) {
          options = options || {}
          options.timeZone = device.timezone
          return new RealDateTimeFormat(locale, options)
        }
        console.log('✅ Timezone overridden:', device.timezone)
      } catch (error) {
        console.warn('⚠️ Failed to override timezone:', error)
      }
    }
    console.log('✅ Device properties spoofing applied.')
  } catch (err) {
    console.error('❌ Failed to apply device spoofing:', err)
  }
}

function getArgValue(key: string): string | undefined {
  const prefix = `--${key}=`
  const arg = process.argv.find((a) => a.startsWith(prefix))
  return arg ? arg.replace(prefix, '') : undefined
}

function parseNumber(value?: string): number | undefined {
  if (value === undefined) return undefined
  const n = Number(value)
  return isNaN(n) ? undefined : n
}

const device: Device = {
  id: 0,
  screen_resolution: getArgValue('screenResolution'),
  language: getArgValue('language'),
  timezone: getArgValue('timezone'),
  platform: getArgValue('platform'),
  ip_address: getArgValue('ipAddress'),
  location: getArgValue('location'),
  hardware_concurrency: parseNumber(getArgValue('hardwareConcurrency')),
  device_memory: parseNumber(getArgValue('deviceMemory'))
}

overrideDeviceProperties(device)
