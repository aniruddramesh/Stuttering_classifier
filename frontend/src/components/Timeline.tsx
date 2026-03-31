import { useMemo, useState } from 'react'
import type { WindowResult } from '../api'

type Props = {
  timeline: WindowResult[]
}

function badgeStyle(label: string): React.CSSProperties {
  const isFluent = label === 'Fluent'
  return {
    display: 'inline-flex',
    padding: '4px 8px',
    borderRadius: 999,
    fontWeight: 700,
    fontSize: 12,
    border: `1px solid ${isFluent ? '#86efac' : '#fed7aa'}`,
    background: isFluent ? '#dcfce7' : '#ffedd5',
    color: isFluent ? '#14532d' : '#7c2d12',
  }
}

export default function Timeline({ timeline }: Props) {
  const [ascending, setAscending] = useState(true)

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
    return <div style={{ color: '#6b7280' }}>No windows to display</div>
  }

  if (allFluent) {
    return <div style={{ color: '#14532d', fontWeight: 600 }}>No stutter detected</div>
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th
              onClick={() => setAscending((v) => !v)}
              style={{
                textAlign: 'left',
                padding: 10,
                cursor: 'pointer',
                borderBottom: '1px solid #e5e7eb',
              }}
              title="Sort by start time"
            >
              Start {ascending ? '▲' : '▼'}
            </th>
            <th style={{ textAlign: 'left', padding: 10, borderBottom: '1px solid #e5e7eb' }}>
              End
            </th>
            <th style={{ textAlign: 'left', padding: 10, borderBottom: '1px solid #e5e7eb' }}>
              Label
            </th>
            <th style={{ textAlign: 'right', padding: 10, borderBottom: '1px solid #e5e7eb' }}>
              Confidence
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((w, idx) => (
            <tr key={`${w.start_sec}-${idx}`}>
              <td
                style={{
                  padding: 10,
                  borderBottom: '1px solid #f3f4f6',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {w.start_sec.toFixed(2)}s
              </td>
              <td
                style={{
                  padding: 10,
                  borderBottom: '1px solid #f3f4f6',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {w.end_sec.toFixed(2)}s
              </td>
              <td style={{ padding: 10, borderBottom: '1px solid #f3f4f6' }}>
                <span style={badgeStyle(w.label)}>{w.label}</span>
              </td>
              <td
                style={{
                  padding: 10,
                  borderBottom: '1px solid #f3f4f6',
                  textAlign: 'right',
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
