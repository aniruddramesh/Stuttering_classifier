import { useMemo, useState } from 'react'

type Props = {
  probs: Record<string, number>
}

const ORDER = ['Fluent', 'Repetition', 'Prolongation', 'Block']

function barColor(label: string, p: number): string {
  if (label === 'Fluent') return '#16a34a'
  return p >= 0.5 ? '#dc2626' : '#f59e0b'
}

function barIcon(label: string): string {
  switch (label) {
    case 'Fluent':
      return '✨'
    case 'Repetition':
      return '🔁'
    case 'Prolongation':
      return '📏'
    case 'Block':
      return '🚫'
    default:
      return '📊'
  }
}

export default function ProbabilityBars({ probs }: Props) {
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null)

  const rows = useMemo(
    () =>
      ORDER.map((label) => {
        const p = typeof probs[label] === 'number' ? probs[label] : 0
        return { label, p }
      }),
    [probs],
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {rows.map(({ label, p }, idx) => (
        <div
          key={label}
          style={{
            display: 'grid',
            gridTemplateColumns: '140px 1fr 80px',
            gap: 10,
            alignItems: 'center',
            animation: `fadeInUp 0.5s ease-out ${0.05 * idx}s backwards`,
            transition: 'all 0.3s ease',
            opacity: hoveredLabel === null || hoveredLabel === label ? 1 : 0.4,
          }}
          onMouseEnter={() => setHoveredLabel(label)}
          onMouseLeave={() => setHoveredLabel(null)}
        >
          <div style={{ fontWeight: 700, fontSize: 14, color: '#334155', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 18 }}>{barIcon(label)}</span>
            {label}
          </div>
          <div
            style={{
              height: 14,
              background: '#f1f5f9',
              borderRadius: 999,
              overflow: 'hidden',
              border: '1px solid #e2e8f0',
            }}
          >
            <div
              style={{
                width: `${Math.max(0, Math.min(1, p)) * 100}%`,
                height: '100%',
                background: barColor(label, p),
                animation: `fadeInUp 0.8s ease-out ${0.1 + 0.05 * idx}s backwards`,
                transition: 'all 0.3s ease',
                boxShadow: hoveredLabel === label ? `0 0 12px ${barColor(label, p)}` : 'none',
              }}
            />
          </div>
          <div
            style={{
              textAlign: 'right',
              fontVariantNumeric: 'tabular-nums',
              fontWeight: 600,
              color: '#1e293b',
              fontSize: 13,
            }}
          >
            {(p * 100).toFixed(1)}%
          </div>
        </div>
      ))}
    </div>
  )
}
