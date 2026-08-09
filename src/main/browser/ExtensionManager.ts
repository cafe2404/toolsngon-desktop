import fs from 'fs'
import { join } from 'path'

type ExtensionLike = Record<string, unknown> & {
  extension_id?: string
  actual_extension_id?: string
  popup_url?: string
  panel_url?: string
  sidebar_url?: string
  popupUrl?: string
  sidebarUrl?: string
}

export function getExtensionPanelKey(profileId: string, extensionId: string): string {
  return `${profileId}:${extensionId}`
}

export async function resolveExtensionPanelUrl(
  extension: ExtensionLike,
  extensionPath?: string
): Promise<string | undefined> {
  const extensionId = extension.actual_extension_id || extension.extension_id
  if (!extensionId) return undefined

  const explicitPanelUrl =
    extension.popup_url ||
    extension.panel_url ||
    extension.sidebar_url ||
    extension.popupUrl ||
    extension.sidebarUrl

  let panelUrl = explicitPanelUrl ? String(explicitPanelUrl) : undefined

  if (!panelUrl && extensionPath) {
    try {
      const manifest = JSON.parse(
        await fs.promises.readFile(join(extensionPath, 'manifest.json'), 'utf-8')
      )
      const candidatePaths = [
        manifest?.action?.default_popup ||
          manifest?.browser_action?.default_popup ||
          manifest?.page_action?.default_popup,
        manifest?.side_panel?.default_path,
        manifest?.sidebar_action?.default_panel,
        manifest?.options_ui?.page,
        manifest?.options_page,
        'popup.html',
        'options.html',
        'index.html'
      ]
        .filter(Boolean)
        .map((candidatePath) => String(candidatePath).replace(/^\//, ''))

      const manifestPanelPath =
        candidatePaths.find((candidatePath) => fs.existsSync(join(extensionPath, candidatePath))) ||
        candidatePaths[0]

      if (manifestPanelPath) {
        panelUrl = `chrome-extension://${extensionId}/${manifestPanelPath}`
      }
    } catch (err) {
      console.error(`Failed to read manifest for extension ${extensionId}:`, err)
    }
  }

  if (!panelUrl) {
    return `chrome-extension://${extensionId}/popup.html`
  }

  if (!/^(https?:|file:|chrome-extension:)/i.test(panelUrl)) {
    return `chrome-extension://${extensionId}/${panelUrl.replace(/^\//, '')}`
  }

  return panelUrl
}
