import type { EditorAsset, EditorClip, EditorProject, EditorTrack, OpenStudioOptions } from './types'

const DEFAULT_PROJECT: EditorProject = {
  version: 1,
  width: 1080,
  height: 1920,
  fps: 30,
  duration: 0,
  assets: [],
  tracks: [
    { id: 'video-1', type: 'video', name: 'Video', clips: [] },
    { id: 'audio-1', type: 'audio', name: 'Audio', clips: [] },
  ],
}

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value))

export function createProject(options: Partial<EditorProject> = {}): EditorProject {
  return {
    ...clone(DEFAULT_PROJECT),
    ...options,
    assets: options.assets ? clone(options.assets) : [],
    tracks: options.tracks ? clone(options.tracks) : clone(DEFAULT_PROJECT.tracks),
  }
}

export function addAsset(project: EditorProject, asset: EditorAsset): EditorProject {
  const next = clone(project)
  const existing = next.assets.findIndex((item) => item.id === asset.id)
  if (existing >= 0) next.assets[existing] = clone(asset)
  else next.assets.push(clone(asset))
  return next
}

export function addClip(
  project: EditorProject,
  clip: EditorClip,
  track?: EditorTrack,
): EditorProject {
  const next = clone(project)
  let target = next.tracks.find((item) => item.id === clip.trackId)
  if (!target) {
    target = track ?? { id: clip.trackId, type: 'video', clips: [] }
    next.tracks.push(target)
  }
  target.clips.push(clone(clip))
  next.duration = Math.max(next.duration, clip.start + clip.duration)
  return next
}

export function importAssets(
  project: EditorProject,
  assets: EditorAsset[],
  trackId = 'video-1',
): EditorProject {
  let next = clone(project)
  let cursor = next.duration

  for (const asset of assets) {
    next = addAsset(next, asset)
    const duration = asset.duration ?? 5
    next = addClip(next, {
      id: `clip-${asset.id}`,
      assetId: asset.id,
      trackId: asset.type === 'audio' ? 'audio-1' : trackId,
      start: cursor,
      duration,
    })
    if (asset.type !== 'audio') cursor += duration
  }

  return next
}

export function createProjectFromTask(options: OpenStudioOptions): EditorProject {
  if (options.project) {
    return createProject({
      ...options.project,
      width: options.project.width ?? options.width ?? 1080,
      height: options.project.height ?? options.height ?? 1920,
      fps: options.project.fps ?? options.fps ?? 30,
    })
  }

  let project = createProject({
    width: options.width ?? 1080,
    height: options.height ?? 1920,
    fps: options.fps ?? 30,
  })

  project = importAssets(project, [
    ...(options.videos ?? []),
    ...(options.images ?? []),
  ])

  for (const audio of options.audios ?? []) {
    project = addAsset(project, audio)
    project = addClip(project, {
      id: `clip-${audio.id}`,
      assetId: audio.id,
      trackId: 'audio-1',
      start: 0,
      duration: audio.duration ?? project.duration,
    })
  }

  return project
}

export function serializeProject(project: EditorProject): string {
  return JSON.stringify(project, null, 2)
}
