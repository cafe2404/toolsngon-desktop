import puppeteer, { Browser, Page } from 'puppeteer'
import { Account } from '../types/global'
import { join } from 'path'
import { app } from 'electron'
import { prepareExtension } from './utils'
interface LaunchOptions {
  id: string
  url: string
  account: Account
}

export default async function launchChrome(
  options: LaunchOptions
): Promise<{ browser: Browser; page: Page }> {
  const { id, url, account } = options
  // 1️⃣ Mở Chrome thật sự bằng chrome-launcher
  const userDataDir = join(app.getPath('userData'), 'chrome-profile', `profile-${id}`)
  const extensionFolders: string[] = []
  if (account?.extensions) {
    for (const ext of account.extensions) {
      try {
        const extPath = await prepareExtension(ext.zip_file, ext.extension_id) // folder unpacked
        extensionFolders.push(extPath)
      } catch (err) {
        console.error(`⚠️ Failed to prepare extension ${ext.name}:`, err)
      }
    }
  }
  const customArgs = [`--user-data-dir=${userDataDir}`, `--start-maximized`]

  const browser = await puppeteer.launch({
    defaultViewport: null,
    args: customArgs,
    enableExtensions: extensionFolders,
    headless: false,
    pipe: true
  })
  const [page] = await browser.pages()
  if (account?.device?.user_agent) {
    await page.setUserAgent(account.device.user_agent)
  }
  if (account.cookies && account.cookies.length > 0) {
    await Promise.all(
      account?.cookies.map((c) =>
        page
          .setCookie({
            url: `${c.secure ? 'https' : 'http'}://${(c.domain ?? '').replace(/^\./, '')}${c.path || '/'}`,
            name: c.name,
            value: c.value,
            domain: c.domain,
            path: c.path || '/',
            secure: c.secure || false,
            httpOnly: c.httpOnly || false,
            expires: c.expirationDate
          })
          .catch((err) => console.error('Set cookie fail', c.name, err))
      )
    )
  }
  await page.goto(url)
  return { browser, page }
}
