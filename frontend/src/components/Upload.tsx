import { useCallback, useMemo, useRef, useState } from 'react'

type Props = {
  disabled?: boolean
  onAnalyse: (file: File) => void
}

const SUPPORTED = ['mp4', 'avi', 'mov', 'mkv', 'wav', 'mp3', 'm4a', 'flac']

function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let v = bytes
  let i = 0
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024
    i += 1
  }
  return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

export default function Upload({ disabled, onAnalyse }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const onPick = useCallback(() => {
    if (disabled) return
    inputRef.current?.click()
  }, [disabled])

  const onFileSelected = useCallback((f: File | null) => {
    setFile(f)
  }, [])

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0] || null
      onFileSelected(f)
    },
    [onFileSelected],
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragOver(false)
      if (disabled) return
      const f = e.dataTransfer.files?.[0] || null
      onFileSelected(f)
    },
    [disabled, onFileSelected],
  )

  const onDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (disabled) return
      setDragOver(true)
    },
    [disabled],
  )

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
  }, [])

  const canAnalyse = !!file && !disabled

  const cardStyle = useMemo(
    () => ({
      border: '1px solid #e5e7eb',
      borderRadius: 12,
      padding: 18,
      background: '#fff',
    }),
    [],
  )

  const dropStyle = useMemo(
    () => ({
      border: `2px dashed ${dragOver ? '#60a5fa' : '#d1d5db'}`,
      borderRadius: 12,
      padding: 22,
      textAlign: 'center' as const,
      background: dragOver ? '#eff6ff' : '#fafafa',
      cursor: disabled ? 'not-allowed' : 'pointer',
      userSelect: 'none' as const,
    }),
    [dragOver, disabled],
  )

  return (
    <div style={cardStyle}>
      <div
        onClick={onPick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        style={dropStyle}
      >
        <div style={{ fontWeight: 600, marginBottom: 6 }}>
          Drag-and-drop + click to upload
        </div>
        <div style={{ fontSize: 13, color: '#6b7280' }}>Accept: video/*, audio/*</div>
        <input
          ref={inputRef}
          type="file"
          accept="video/*,audio/*"
          onChange={onInputChange}
          disabled={disabled}
          style={{ display: 'none' }}
        />
      </div>

      <div style={{ marginTop: 12 }}>
        {file ? (
          <div>
            <div style={{ fontWeight: 600 }}>{file.name}</div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>{formatBytes(file.size)}</div>
          </div>
        ) : (
          <div style={{ fontSize: 13, color: '#6b7280' }}>No file selected</div>
        )}
      </div>

      <div style={{ marginTop: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
        <button
          onClick={() => file && onAnalyse(file)}
          disabled={!canAnalyse}
          style={{
            padding: '10px 14px',
            borderRadius: 8,
            border: '1px solid #e5e7eb',
            background: canAnalyse ? '#111827' : '#9ca3af',
            color: '#fff',
            cursor: canAnalyse ? 'pointer' : 'not-allowed',
          }}
        >
          Analyse
        </button>
        <div style={{ fontSize: 13, color: '#6b7280' }}>
          Supported formats: {SUPPORTED.join(', ')}
        </div>
      </div>
    </div>
  )
}
