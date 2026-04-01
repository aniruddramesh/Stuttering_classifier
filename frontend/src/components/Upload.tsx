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
      background: '#fff',
      borderRadius: 16,
      padding: 28,
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
      border: '1px solid rgba(0, 0, 0, 0.05)',
      animation: 'fadeInUp 0.6s ease-out 0.2s backwards',
    }),
    [],
  )

  const dropStyle = useMemo(
    () => ({
      border: `2px dashed ${dragOver ? '#3b82f6' : '#cbd5e1'}`,
      borderRadius: 14,
      padding: 32,
      textAlign: 'center' as const,
      background: dragOver
        ? 'linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%)'
        : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      userSelect: 'none' as const,
      transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      opacity: disabled ? 0.6 : 1,
      transform: dragOver && !disabled ? 'scale(1.02)' : 'scale(1)',
    }),
    [dragOver, disabled],
  )

  const iconStyle = {
    fontSize: 56,
    marginBottom: 12,
    display: 'inline-block',
    animation: file ? 'bounce 0.6s ease-out' : dragOver ? 'bounce 1s ease-in-out infinite' : 'fadeIn 0.5s ease-out',
    transition: 'all 0.3s ease',
  }

  const titleStyle = {
    fontWeight: 700,
    fontSize: 18,
    color: '#1e293b',
    marginBottom: 6,
    animation: 'fadeInUp 0.6s ease-out 0.1s backwards',
  }

  const subtitleStyle = {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
    animation: 'fadeInUp 0.6s ease-out 0.15s backwards',
  }

  const fileInfoStyle = {
    animation: 'slideInRight 0.4s ease-out',
  }

  return (
    <div style={cardStyle}>
      <div
        onClick={onPick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        style={dropStyle}
      >
        <div style={iconStyle}>{file || dragOver ? '🎯' : '📁'}</div>
        <div style={titleStyle}>{dragOver ? 'Drop your file here!' : 'Drag and drop your file here'}</div>
        <div style={subtitleStyle}>{dragOver ? 'Release to upload' : 'or click to browse from your computer'}</div>
        <div style={{ fontSize: 12, color: '#94a3b8', animation: 'fadeIn 0.5s ease-out 0.2s backwards' }}>
          Supported: {SUPPORTED.join(' • ')}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="video/*,audio/*"
          onChange={onInputChange}
          disabled={disabled}
          style={{ display: 'none' }}
        />
      </div>

      <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #e2e8f0' }}>
        {file ? (
          <div style={fileInfoStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 24, animation: 'bounce 0.6s ease-out' }}>✓</span>
              <div>
                <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 15 }}>{file.name}</div>
                <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                  {formatBytes(file.size)}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              fontSize: 14,
              color: '#94a3b8',
              animation: 'fadeIn 0.5s ease-out 0.3s backwards',
            }}
          >
            No file selected
          </div>
        )}
      </div>

      <div style={{ marginTop: 20, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={() => file && onAnalyse(file)}
          disabled={!canAnalyse}
          style={{
            padding: '12px 24px',
            borderRadius: 10,
            border: 'none',
            background: canAnalyse
              ? 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)'
              : '#cbd5e1',
            color: '#fff',
            cursor: canAnalyse ? 'pointer' : 'not-allowed',
            fontWeight: 700,
            fontSize: 15,
            boxShadow: canAnalyse ? '0 4px 12px rgba(124, 58, 237, 0.3)' : 'none',
            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            animation: file && canAnalyse ? 'pulse 2s ease-in-out infinite' : 'fadeIn 0.5s ease-out 0.3s backwards',
          }}
          onMouseEnter={(e) => {
            if (canAnalyse) {
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(124, 58, 237, 0.4)'
              e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = canAnalyse ? '0 4px 12px rgba(124, 58, 237, 0.3)' : 'none'
            e.currentTarget.style.transform = 'translateY(0) scale(1)'
          }}
        >
          {disabled ? '⏳ Processing…' : '🚀 Analyse'}
        </button>
      </div>
    </div>
  )
}
