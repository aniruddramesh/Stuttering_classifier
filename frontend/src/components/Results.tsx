import { useEffect, useMemo, useState } from 'react'
import type { InferenceResult } from '../api'
import ProbabilityBars from './ProbabilityBars'
import Timeline from './Timeline'

type Props = {
  file: File
  result: InferenceResult
}

function pct(x: number): string {
  return `${(x * 100).toFixed(1)}%`
}

function badgeStyle(label: string): React.CSSProperties {
  const isFluent = label === 'Fluent'
  return {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 10px',
    borderRadius: 999,
    fontWeight: 700,
    fontSize: 14,
    border: `1px solid ${isFluent ? '#86efac' : '#fecaca'}`,
    background: isFluent ? '#dcfce7' : '#fee2e2',
    color: isFluent ? '#14532d' : '#7f1d1d',
  }
}

export default function Results({ file, result }: Props) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  useEffect(() => {
    const url = URL.createObjectURL(file)
    setAudioUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const card = useMemo(
    () => ({
      border: '1px solid #e5e7eb',
      borderRadius: 12,
      padding: 18,
      background: '#fff',
      marginBottom: 14,
    }),
    [],
  )

  return (
    <div>
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ marginBottom: 8 }}>
              <span style={badgeStyle(result.predicted_label)}>{result.predicted_label}</span>
            </div>
            <div style={{ color: '#374151' }}>
              <div>Confidence: {pct(result.confidence)}</div>
              <div>Stutter percentage: {result.stutter_pct.toFixed(1)}%</div>
              <div>Duration: {result.duration_sec.toFixed(2)}s</div>
            </div>
          </div>

          <div style={{ minWidth: 280 }}>
            {audioUrl && <audio controls src={audioUrl} style={{ width: '100%' }} />}
          </div>
        </div>
      </div>

      <div style={card}>
        <h2 style={{ marginTop: 0 }}>Class probabilities</h2>
        <ProbabilityBars probs={result.class_probs} />
      </div>

      <div style={card}>
        <h2 style={{ marginTop: 0 }}>Timeline</h2>
        <Timeline timeline={result.timeline} />
      </div>
    </div>
  )
}
