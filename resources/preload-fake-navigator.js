// preload-fake-navigator.js
;(() => {
  const fake = {
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
    platform: 'Win32',
    appVersion:
      '5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
    appName: 'Netscape'
  }

  // Override prototype
  const navProto = Object.getPrototypeOf(navigator)
  Object.defineProperty(navProto, 'userAgent', { get: () => fake.userAgent, configurable: true })
  Object.defineProperty(navProto, 'platform', { get: () => fake.platform, configurable: true })
  Object.defineProperty(navProto, 'appVersion', { get: () => fake.appVersion, configurable: true })
  Object.defineProperty(navProto, 'appName', { get: () => fake.appName, configurable: true })
})()
