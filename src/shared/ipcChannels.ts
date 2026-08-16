export const IPC_CHANNELS = {
  app: {
    openExternal: 'open-external',
    getDeviceUuid: 'os:get-device-uuid',
    getInfo: 'os:get-app-info',
    deepLink: 'deep-link'
  },
  auth: {
    save: 'auth:save',
    get: 'auth:get',
    clear: 'auth:clear'
  },
  browser: {
    tabs: {
      attach: 'bv:attach',
      openChrome: 'bv:open-chrome',
      setBounds: 'bv:set-bounds',
      focus: 'bv:focus',
      navigate: 'bv:navigate',
      back: 'bv:back',
      forward: 'bv:forward',
      reload: 'bv:reload',
      stop: 'bv:stop',
      destroy: 'bv:destroy',
      destroyAll: 'bv:destroy-all',
      openWindow: 'bv:open-window',
      closeWindow: 'bv:close-window',
      detachedWindowClosed: 'bv:detached-window-closed',
      injectScript: 'bv:inject-script',
      toggleFullscreen: 'bv:toggle-fullscreen',
      setCookies: 'bv:set-cookies',
      getCookies: 'bv:get-cookies',
      captureScreenshot: 'bv:capture-screenshot',
      getInfo: 'bv:get-info',
      getSessionStorage: 'bv:get-session-storage',
      getLocalStorage: 'bv:get-local-storage',
      getIndexedDb: 'bv:get-indexed-db',
      getWebSql: 'bv:get-web-sql',
      getCache: 'bv:get-cache',
      updated: 'bv:update',
      newTab: 'new-tab'
    },
    profiles: {
      destroy: 'bv:destroy-profile',
      clearData: 'bv:clear-profile-data'
    },
    extensions: {
      togglePanel: 'bv:toggle-extension-panel',
      closePanel: 'bv:close-extension-panel'
    },
    storage: {
      clearAllData: 'bv:clear-all-data'
    }
  },
  supportGuide: {
    open: 'support-guide:open',
    getPayload: 'support-guide:get-payload',
    payloadUpdated: 'support-guide:payload-updated'
  },
  updates: {
    checking: 'update-checking',
    available: 'update-available',
    notAvailable: 'update-not-available',
    error: 'update-error',
    progress: 'update-progress',
    downloaded: 'update-downloaded'
  }
} as const
