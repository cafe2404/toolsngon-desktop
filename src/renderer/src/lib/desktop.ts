export const desktop = window.desktop

export type DesktopBridge = typeof desktop
export type DesktopBounds = Parameters<typeof desktop.browser.tabs.setBounds>[1]
