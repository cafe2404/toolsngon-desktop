import { app } from 'electron'
import { join } from 'path'
import fs from 'fs'
import AdmZip from 'adm-zip'

export async function prepareExtension(extensionUrl: string, extensionId: string): Promise<string> {
  const extensionsDir = join(app.getPath('userData'), 'extensions')
  const extensionDir = join(extensionsDir, extensionId)

  // Nếu thư mục đã tồn tại => dùng lại (cache)
  if (fs.existsSync(extensionDir)) {
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
  console.log(extensionDir)
  return extensionDir
}
