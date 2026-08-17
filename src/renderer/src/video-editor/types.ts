export type EditorAssetType = 'video' | 'audio' | 'image'

export interface EditorAsset {
  id: string
  type: EditorAssetType
  src: string
  name?: string
  duration?: number
  width?: number
  height?: number
}

export interface EditorClip {
  id: string
  assetId: string
  trackId: string
  start: number
  duration: number
  sourceStart?: number
  sourceDuration?: number
}

export interface EditorTrack {
  id: string
  type: EditorAssetType
  name?: string
  clips: EditorClip[]
}

export interface EditorProject {
  version: 1
  width: number
  height: number
  fps: number
  duration: number
  assets: EditorAsset[]
  tracks: EditorTrack[]
}

export interface OpenStudioOptions {
  taskId?: string
  width?: number
  height?: number
  fps?: number
  videos?: EditorAsset[]
  audios?: EditorAsset[]
  images?: EditorAsset[]
  project?: Partial<EditorProject>
}
