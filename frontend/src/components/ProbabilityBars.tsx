import { useMemo } from 'react'

type Props = {
  probs: Record<string, number>
}

const ORDER = ['Fluent', 'Repetition', 'Prolongation', 'Block', 'Interjection']

function barColor(label: string, p: number): string {
  if (label === 'Fluent') return '#16a34a'
  return p >= 0.5 ? '#dc2626' : '#f59e0b'
}

export default function ProbabilityBars({ probs }: Props) {
  const rows = useMemo(
    () =>
      ORDER.map((label) => {
        const p = typeof probs[label] === 'number' ? probs[label] : 0
        return { label, p }
      }),
    [probs],
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {rows.map(({ label, p }) => (
        <div
          key={label}
          style={{
            display: 'grid',
            gridTemplateColumns: '140px 1fr 80px',
            gap: 10,
            alignItems: 'center',
          }}
        >
          <div style={{ fontWeight: 600 }}>{label}</div>
          <div
            style={{
              height: 12,
              background: '#f3f4f6',
              borderRadius: 999,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${Math.max(0, Math.min(1, p)) * 100}%`,
                height: '100%',
                background: barColor(label, p),
              }}
            />
          </div>
          <div style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
            {(p * 100).toFixed(1)}%
          </div>
        </div>
      ))}
    </div>
  )
}
