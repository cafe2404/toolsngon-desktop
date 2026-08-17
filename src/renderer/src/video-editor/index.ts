export { default as VideoEditor } from './VideoEditor'
export {
  addAsset,
  addClip,
  createProject,
  createProjectFromTask,
  importAssets,
  serializeProject,
} from './api'
export type {
  EditorAsset,
  EditorAssetType,
  EditorClip,
  EditorProject,
  EditorTrack,
  OpenStudioOptions,
} from './types'
