import { BrowserWindow } from 'electron'
import { autoUpdater } from 'electron-updater'

export function registerAutoUpdater(mainWindow: BrowserWindow): void {
  autoUpdater.on('checking-for-update', () => {
    mainWindow?.webContents.send('update-checking')
  })

  autoUpdater.on('update-available', (info) => {
    mainWindow?.webContents.send('update-available', info)
  })

  autoUpdater.on('update-not-available', (info) => {
    mainWindow?.webContents.send('update-not-available', info)
  })

  autoUpdater.on('error', (err) => {
    mainWindow?.webContents.send('update-error', { message: err.message })
  })

  autoUpdater.on('download-progress', (progressObj) => {
    mainWindow?.webContents.send('update-progress', progressObj)
  })

  autoUpdater.on('update-downloaded', (info) => {
    mainWindow?.webContents.send('update-downloaded', info)
    autoUpdater.quitAndInstall()
  })

  autoUpdater.checkForUpdatesAndNotify()
}
