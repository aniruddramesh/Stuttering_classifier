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

export default function Results({ file, result }: Props) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  useEffect(() => {
    const url = URL.createObjectURL(file)
    setAudioUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  // Calculate computed label based on stutter percentage and timeline
  const computedLabel = useMemo(() => {
    // Count non-fluent segments in timeline
    const nonFluentCount = result.timeline.filter(w => w.label !== 'Fluent').length
    const totalSegments = result.timeline.length

    // Use stutter_pct as primary indicator
    // If stutter_pct > 5%, consider it stuttered
    // Also check if majority of timeline segments are non-fluent
    const stutterPercentage = result.stutter_pct
    const nonFluentRatio = totalSegments > 0 ? nonFluentCount / totalSegments : 0

    // Threshold: if either stutter_pct > 5% OR more than 10% of segments are non-fluent, mark as stuttered
    if (stutterPercentage > 5 || nonFluentRatio > 0.1) {
      return 'Stuttered'
    }
    return 'Fluent'
  }, [result.timeline, result.stutter_pct])

  const card = useMemo(
    () => ({
      border: '1px solid #e2e8f0',
      borderRadius: 16,
      padding: 24,
      background: '#fff',
      marginBottom: 20,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
      animation: 'fadeInUp 0.6s ease-out',
      transition: 'all 0.3s ease',
    }),
    [],
  )

  const statsContainerStyle = {
    animation: 'slideInRight 0.6s ease-out 0.1s backwards',
  }

  const audioContainerStyle = {
    animation: 'fadeInUp 0.6s ease-out 0.2s backwards',
  }

  return (
    <div>
      {/* Main Results Card */}
      <div
        style={{
          ...card,
          animationDelay: '0s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.1)'
          e.currentTarget.style.transform = 'translateY(-2px)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.06)'
          e.currentTarget.style.transform = 'translateY(0)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={statsContainerStyle}>
            <div style={{ color: '#374151' }}>
              <div
                style={{
                  marginBottom: 10,
                  fontSize: 15,
                  fontWeight: 500,
                  animation: 'fadeInUp 0.6s ease-out 0.1s backwards',
                }}
              >
                📊 Confidence: <span style={{ fontWeight: 700, color: '#1e40af' }}>{pct(result.confidence)}</span>
              </div>
              <div
                style={{
                  marginBottom: 10,
                  fontSize: 15,
                  fontWeight: 500,
                  animation: 'fadeInUp 0.6s ease-out 0.15s backwards',
                }}
              >
                💯 Stutter percentage: <span style={{ fontWeight: 700, color: '#dc2626' }}>{result.stutter_pct.toFixed(1)}%</span>
              </div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  animation: 'fadeInUp 0.6s ease-out 0.2s backwards',
                }}
              >
                ⏱️ Duration: <span style={{ fontWeight: 700, color: '#7c3aed' }}>{result.duration_sec.toFixed(2)}s</span>
              </div>
            </div>
          </div>

          <div style={{ minWidth: 280, ...audioContainerStyle }}>
            {audioUrl && (
              <div
                style={{
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                  padding: 16,
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 10 }}>
                  🔊 AUDIO PLAYER
                </div>
                <audio controls src={audioUrl} style={{ width: '100%' }} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Probability Bars Card */}
      <div
        style={{
          ...card,
          animationDelay: '0.1s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.1)'
          e.currentTarget.style.transform = 'translateY(-2px)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.06)'
          e.currentTarget.style.transform = 'translateY(0)'
        }}
      >
        <h2 style={{ marginTop: 0, fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 20 }}>
          📈 Class Probabilities
        </h2>
        <ProbabilityBars probs={result.class_probs} />
      </div>

      {/* Timeline Card - with better handling for missing data */}
      {result.timeline && result.timeline.length > 0 ? (
        <div
          style={{
            ...card,
            animationDelay: '0.2s',
            marginBottom: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.1)'
            e.currentTarget.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.06)'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          <h2 style={{ marginTop: 0, fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 20 }}>
            ⏰ Timeline Analysis
          </h2>
          <Timeline timeline={result.timeline} />
        </div>
      ) : (
        <div
          style={{
            ...card,
            animationDelay: '0.2s',
            marginBottom: 0,
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            border: '1px solid #fbbf24',
          }}
        >
          <h2 style={{ marginTop: 0, fontSize: 18, fontWeight: 700, color: '#92400e', marginBottom: 12 }}>
            ⏰ Timeline Analysis
          </h2>
          <div style={{ color: '#78350f' }}>
            <p style={{ margin: '0 0 8px 0' }}>
              ℹ️ <strong>Timeline data not available</strong> for this audio.
            </p>
            <p style={{ margin: '0 0 8px 0', fontSize: 14 }}>
              This can happen if the audio is very short (&lt; 5 seconds) or has unusual characteristics.
            </p>
            <p style={{ margin: '0', fontSize: 14 }}>
              <strong>✓ The analysis is still accurate:</strong> See Confidence and Stutter percentage above.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
