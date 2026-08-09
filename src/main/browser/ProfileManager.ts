export function addProfileTab(
  profileViews: Map<string, Set<string>>,
  viewProfiles: Map<string, string>,
  profileId: string | undefined,
  tabId: string
): void {
  if (!profileId) return
  if (!profileViews.has(profileId)) {
    profileViews.set(profileId, new Set())
  }
  profileViews.get(profileId)!.add(tabId)
  viewProfiles.set(tabId, profileId)
}

export function removeProfileTab(
  profileViews: Map<string, Set<string>>,
  profileId: string,
  tabId: string
): void {
  if (!profileViews.has(profileId)) return
  profileViews.get(profileId)!.delete(tabId)
  if (profileViews.get(profileId)!.size === 0) {
    profileViews.delete(profileId)
  }
}
