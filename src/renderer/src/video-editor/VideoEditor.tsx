import { useEffect, useMemo, useRef, useState } from 'react'
import type { EditorProject, EditorTrack } from './types'
import { serializeProject } from './api'
import './video-editor.css'

interface VideoEditorProps {
  project: EditorProject
  onChange?: (project: EditorProject) => void
}

export default function VideoEditor({ project, onChange }: VideoEditorProps): React.JSX.Element {
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null)
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({})

  useEffect(() => {
    onChange?.(project)
  }, [project, onChange])

  const selectedClip = useMemo(() => {
    if (!selectedClipId) return null
    for (const track of project.tracks) {
      const clip = track.clips.find((item) => item.id === selectedClipId)
      if (clip) return { clip, track }
    }
    return null
  }, [project, selectedClipId])

  return (
    <div className="flow-editor">
      <header className="flow-editor__toolbar">
        <div>
          <strong>Studio</strong>
          <span className="flow-editor__meta">
            {project.width}×{project.height} · {project.fps} FPS · {project.duration.toFixed(1)}s
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            const blob = new Blob([serializeProject(project)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const anchor = document.createElement('a')
            anchor.href = url
            anchor.download = 'flowngon-project.json'
            anchor.click()
            URL.revokeObjectURL(url)
          }}
        >
          Save project
        </button>
      </header>

      <section className="flow-editor__workspace">
        <div className="flow-editor__preview">
          {selectedClip ? (
            <div className="flow-editor__selected">
              <span>{selectedClip.clip.id}</span>
              <small>{selectedClip.track.name ?? selectedClip.track.type}</small>
            </div>
          ) : (
            <div className="flow-editor__empty">Select a clip</div>
          )}
        </div>

        <aside className="flow-editor__inspector">
          <h3>Properties</h3>
          {selectedClip ? (
            <>
              <label>Start<input value={selectedClip.clip.start.toFixed(2)} readOnly /></label>
              <label>Duration<input value={selectedClip.clip.duration.toFixed(2)} readOnly /></label>
              <label>Asset<input value={selectedClip.clip.assetId} readOnly /></label>
            </>
          ) : (
            <p>Choose a clip to inspect it.</p>
          )}
        </aside>
      </section>

      <section className="flow-editor__timeline">
        <div className="flow-editor__ruler">
          {Array.from({ length: Math.max(1, Math.ceil(project.duration)) }, (_, index) => (
            <span key={index}>{index}s</span>
          ))}
        </div>
        {project.tracks.map((track) => (
          <TrackRow
            key={track.id}
            track={track}
            project={project}
            selectedClipId={selectedClipId}
            onSelect={setSelectedClipId}
            videoRefs={videoRefs}
          />
        ))}
      </section>
    </div>
  )
}

function TrackRow({
  track,
  project,
  selectedClipId,
  onSelect,
}: {
  track: EditorTrack
  project: EditorProject
  selectedClipId: string | null
  onSelect: (id: string) => void
  videoRefs: React.MutableRefObject<Record<string, HTMLVideoElement | null>>
}): React.JSX.Element {
  return (
    <div className="flow-editor__track">
      <div className="flow-editor__track-name">{track.name ?? track.type}</div>
      <div className="flow-editor__track-lane">
        {track.clips.map((clip) => {
          const asset = project.assets.find((item) => item.id === clip.assetId)
          const width = Math.max(80, (clip.duration / Math.max(project.duration, 1)) * 100)
          const left = (clip.start / Math.max(project.duration, 1)) * 100
          return (
            <button
              key={clip.id}
              type="button"
              className={`flow-editor__clip ${selectedClipId === clip.id ? 'is-selected' : ''}`}
              style={{ left: `${left}%`, width: `${width}%` }}
              onClick={() => onSelect(clip.id)}
              title={asset?.src}
            >
              <span>{asset?.name ?? asset?.src?.split(/[\\/]/).pop() ?? clip.assetId}</span>
              <small>{clip.duration.toFixed(1)}s</small>
            </button>
          )
        })}
      </div>
    </div>
  )
}
