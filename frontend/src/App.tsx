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
      padding: 24,
      fontFamily:
        'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    }),
    [],
  )

  return (
    <div style={containerStyle}>
      <h1 style={{ marginBottom: 12 }}>Stuttering Detection</h1>

      {error && (
        <div
          style={{
            background: '#fee2e2',
            border: '1px solid #fecaca',
            color: '#7f1d1d',
            padding: 12,
            borderRadius: 8,
            marginBottom: 12,
          }}
        >
          {error}
        </div>
      )}

      {loading && (
        <div style={{ marginBottom: 12 }}>
          <span>Running inference…</span>
        </div>
      )}

      {!result && <Upload disabled={loading} onAnalyse={onAnalyse} />}

      {result && file && (
        <div>
          <div style={{ marginBottom: 12 }}>
            <button
              onClick={onReset}
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                background: '#fff',
                cursor: 'pointer',
              }}
            >
              Analyse another
            </button>
          </div>
          <Results file={file} result={result} />
        </div>
      )}
    </div>
  )
}
