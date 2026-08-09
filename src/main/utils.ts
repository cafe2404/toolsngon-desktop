import { app } from 'electron'
import { join } from 'path'
import fs from 'fs'
import AdmZip from 'adm-zip'

const OPTIONS_FALLBACK_MARKER = 'toolsngon-open-options-fallback'

async function ensureOpenOptionsFallback(extensionDir: string): Promise<void> {
  try {
    const manifestPath = join(extensionDir, 'manifest.json')
    if (!fs.existsSync(manifestPath)) return

    const manifest = JSON.parse(await fs.promises.readFile(manifestPath, 'utf-8'))
    const backgroundFiles = [
      manifest?.background?.service_worker,
      ...(Array.isArray(manifest?.background?.scripts) ? manifest.background.scripts : [])
    ]
      .filter(Boolean)
      .map((filePath) => String(filePath).replace(/^\//, ''))
      .filter((filePath) => filePath.endsWith('.js'))

    const optionsPage = String(manifest?.options_ui?.page || manifest?.options_page || '').replace(
      /^\//,
      ''
    )
    if (!optionsPage || backgroundFiles.length === 0) return

    const fallbackScript = `/* ${OPTIONS_FALLBACK_MARKER} */
(() => {
  const optionsPage = ${JSON.stringify(optionsPage)};
  const openOptionsPage = (callback) => {
    const done = () => {
      if (typeof callback === 'function') {
        try { callback(); } catch (_) {}
      }
    };
    try {
      const url = chrome.runtime.getURL(optionsPage);
      if (chrome.tabs && typeof chrome.tabs.create === 'function') {
        chrome.tabs.create({ url }, done);
        return Promise.resolve();
      }
    } catch (_) {}
    done();
    return Promise.resolve();
  };
  try {
    Object.defineProperty(chrome.runtime, 'openOptionsPage', {
      configurable: true,
      writable: true,
      value: openOptionsPage
    });
  } catch (_) {
    try { chrome.runtime.openOptionsPage = openOptionsPage; } catch (__) {}
  }
})();
`

    await Promise.all(
      backgroundFiles.map(async (backgroundFile) => {
        const backgroundPath = join(extensionDir, backgroundFile)
        if (!fs.existsSync(backgroundPath)) return

        const source = await fs.promises.readFile(backgroundPath, 'utf-8')
        if (source.includes(OPTIONS_FALLBACK_MARKER)) return

        await fs.promises.writeFile(backgroundPath, `${fallbackScript}\n${source}`, 'utf-8')
      })
    )
  } catch (err) {
    console.error('Failed to patch extension options page fallback:', err)
  }
}

export async function prepareExtension(extensionUrl: string, extensionId: string): Promise<string> {
  const extensionsDir = join(app.getPath('userData'), 'extensions')
  const extensionDir = join(extensionsDir, extensionId)

  // Nếu thư mục đã tồn tại => dùng lại (cache)
  if (fs.existsSync(extensionDir)) {
    await ensureOpenOptionsFallback(extensionDir)
    return extensionDir
  }

  fs.mkdirSync(extensionsDir, { recursive: true })

  const tmpZipPath = join(extensionsDir, `${extensionId}.zip`)
  const response = await fetch(extensionUrl)
  if (!response.ok) throw new Error(`❌ Failed to download extension: ${response.statusText}`)
  const buffer = await response.arrayBuffer()
  fs.writeFileSync(tmpZipPath, Buffer.from(buffer))

  const zip = new AdmZip(tmpZipPath)
  zip.extractAllTo(extensionDir, true)
  fs.unlinkSync(tmpZipPath)
  await ensureOpenOptionsFallback(extensionDir)
  console.log(extensionDir)
  return extensionDir
}
