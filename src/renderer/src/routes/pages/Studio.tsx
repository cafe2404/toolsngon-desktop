import { useMemo, useState } from 'react'
import {
  VideoEditor,
  createProjectFromTask,
  type EditorProject,
} from '@renderer/video-editor'

export default function Studio(): React.JSX.Element {
  const initialProject = useMemo(
    () =>
      createProjectFromTask({
        width: 1080,
        height: 1920,
        fps: 30,
        videos: [],
        audios: [],
      }),
    [],
  )
  const [project, setProject] = useState<EditorProject>(initialProject)

  return <VideoEditor project={project} onChange={setProject} />
}
