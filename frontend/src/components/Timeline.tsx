import { useMemo, useState } from 'react'
import type { WindowResult } from '../api'

type Props = {
  timeline: WindowResult[]
}

export default function Timeline({ timeline }: Props) {
  const [ascending, setAscending] = useState(true)
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)

  const sorted = useMemo(() => {
    const copy = [...timeline]
    copy.sort((a, b) => (ascending ? a.start_sec - b.start_sec : b.start_sec - a.start_sec))
    return copy
  }, [timeline, ascending])

  const allFluent = useMemo(
    () => sorted.length > 0 && sorted.every((w) => w.label === 'Fluent'),
    [sorted],
  )

  if (!sorted.length) {
    return (
      <div
        style={{
          color: '#6b7280',
          padding: 20,
          background: '#f9fafb',
          borderRadius: 10,
          textAlign: 'center',
          animation: 'fadeInUp 0.5s ease-out',
        }}
      >
        No windows to display
      </div>
    )
  }

  if (allFluent) {
    return (
      <div
        style={{
          color: '#64748b',
          padding: 20,
          background: '#f9fafb',
          borderRadius: 10,
          textAlign: 'center',
          animation: 'fadeInUp 0.5s ease-out',
        }}
      >
        No stuttering events detected in timeline.
      </div>
    )
  }

  return (
    <div style={{ overflowX: 'auto', animation: 'fadeInUp 0.5s ease-out' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
            <th
              onClick={() => setAscending((v) => !v)}
              style={{
                textAlign: 'left',
                padding: 14,
                cursor: 'pointer',
                borderBottom: '2px solid #e2e8f0',
                fontWeight: 700,
                fontSize: 13,
                color: '#334155',
                userSelect: 'none',
                transition: 'all 0.2s ease',
              }}
              title="Sort by start time"
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#e2e8f0'
                e.currentTarget.style.color = '#1e293b'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = '#334155'
              }}
            >
              ⏱️ Start {ascending ? '▲' : '▼'}
            </th>
            <th
              style={{
                textAlign: 'left',
                padding: 14,
                borderBottom: '2px solid #e2e8f0',
                fontWeight: 700,
                fontSize: 13,
                color: '#334155',
              }}
            >
              ⏱️ End
            </th>
            <th
              style={{
                textAlign: 'right',
                padding: 14,
                borderBottom: '2px solid #e2e8f0',
                fontWeight: 700,
                fontSize: 13,
                color: '#334155',
              }}
            >
              📊 Confidence
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((w, idx) => (
            <tr
              key={`${w.start_sec}-${idx}`}
              style={{
                background: hoveredRow === idx ? '#f8fafc' : 'transparent',
                animation: `fadeInUp 0.4s ease-out ${0.05 * idx}s backwards`,
                transition: 'all 0.2s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={() => setHoveredRow(idx)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <td
                style={{
                  padding: 14,
                  borderBottom: '1px solid #f1f5f9',
                  fontVariantNumeric: 'tabular-nums',
                  color: '#475569',
                  fontWeight: 500,
                }}
              >
                {w.start_sec.toFixed(2)}s
              </td>
              <td
                style={{
                  padding: 14,
                  borderBottom: '1px solid #f1f5f9',
                  fontVariantNumeric: 'tabular-nums',
                  color: '#475569',
                  fontWeight: 500,
                }}
              >
                {w.end_sec.toFixed(2)}s
              </td>
              <td
                style={{
                  padding: 14,
                  borderBottom: '1px solid #f1f5f9',
                  textAlign: 'right',
                  fontWeight: 700,
                  color: w.confidence >= 0.8 ? '#16a34a' : w.confidence >= 0.6 ? '#f59e0b' : '#dc2626',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {(w.confidence * 100).toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
