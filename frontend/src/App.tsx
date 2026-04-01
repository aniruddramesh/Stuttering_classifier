import { useCallback, useMemo, useState } from 'react'
import Upload from './components/Upload'
import Results from './components/Results'
import type { InferenceResult } from './api'
import { runInference } from './api'

export default function App() {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<InferenceResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onAnalyse = useCallback(async (selected: File) => {
    setLoading(true)
    setError(null)
    setFile(selected)
    setResult(null)
    try {
      const r = await runInference(selected)
      setResult(r)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  const onReset = useCallback(() => {
    setFile(null)
    setResult(null)
    setError(null)
    setLoading(false)
  }, [])

  const containerStyle = useMemo(
    () => ({
      maxWidth: 980,
      margin: '0 auto',
      padding: '40px 24px',
      flex: 1,
      display: 'flex',
      flexDirection: 'column' as const,
      animation: 'fadeInUp 0.6s ease-out',
    }),
    [],
  )

  const headerWrapperStyle = useMemo(
    () => ({
      marginBottom: 36,
      paddingBottom: 28,
      borderBottom: '2px solid rgba(255, 255, 255, 0.2)',
      animation: 'slideInDown 0.7s ease-out',
    }),
    [],
  )

  const headerTitleStyle = useMemo(
    () => ({
      fontSize: 48,
      fontWeight: 800 as const,
      background: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)',
      backgroundSize: '200% 200%',
      WebkitBackgroundClip: 'text' as const,
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text' as const,
      marginBottom: 8,
      letterSpacing: '-0.02em',
      animation: 'gradientShift 6s ease infinite, slideInDown 0.7s ease-out',
    }),
    [],
  )

  const headerSubtitleStyle = useMemo(
    () => ({
      fontSize: 16,
      color: '#4b5563',
      fontWeight: 500,
      animation: 'fadeInUp 0.8s ease-out 0.1s backwards',
    }),
    [],
  )

  const errorStyle = useMemo(
    () => ({
      background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 1%)',
      border: '1px solid #f87171',
      color: '#7f1d1d',
      padding: 16,
      borderRadius: 12,
      marginBottom: 20,
      fontWeight: 500,
      boxShadow: '0 4px 6px rgba(220, 38, 38, 0.1)',
      animation: 'slideInRight 0.4s ease-out',
    }),
    [],
  )

  const loadingStyle = useMemo(
    () => ({
      marginBottom: 20,
      padding: 16,
      background: 'rgba(59, 130, 246, 0.1)',
      borderLeft: '4px solid #3b82f6',
      borderRadius: 8,
      color: '#1e40af',
      fontWeight: 600,
      fontSize: 15,
      animation: 'slideInRight 0.4s ease-out',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    }),
    [],
  )

  return (
    <div style={containerStyle}>
      <div style={headerWrapperStyle}>
        <h1 style={headerTitleStyle}>Stuttering Detection</h1>
        <p style={headerSubtitleStyle}>
          Analyze audio & video files to detect stuttering patterns with advanced AI
        </p>
      </div>

      {error && (
        <div style={errorStyle}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          {error}
        </div>
      )}

      {loading && (
        <div style={loadingStyle}>
          <svg
            style={{
              display: 'inline-block',
              animation: 'spin 1s linear infinite',
              width: 20,
              height: 20,
              flexShrink: 0,
            }}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25" />
            <path
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Analyzing your file with AI magic…</span>
        </div>
      )}

      {!result && <Upload disabled={loading} onAnalyse={onAnalyse} />}

      {result && file && (
        <div style={{ animation: 'fadeInUp 0.5s ease-out' }}>
          <div style={{ marginBottom: 24 }}>
            <button
              onClick={onReset}
              style={{
                padding: '12px 20px',
                borderRadius: 10,
                border: 'none',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 15,
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(37, 99, 235, 0.4)'
                e.currentTarget.style.transform = 'translateY(-4px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <span>←</span> Analyse another file
            </button>
          </div>
          <Results file={file} result={result} />
        </div>
      )}
    </div>
  )
}
