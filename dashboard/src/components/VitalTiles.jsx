import React from 'react'
import { Activity, Heart, Wind, Moon, Footprints, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'

// Helper to render an SVG sparkline from an array of numbers
function MiniSparkline({ data = [], color = '#0f4c47', width = 90, height = 28 }) {
  if (!data || data.length < 2) {
    return <div style={{ width, height }} />
  }

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * (width - 8) + 4
    const y = height - 4 - ((val - min) / range) * (height - 8)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')

  const fillPoints = `${points} ${width - 4},${height} 4,${height}`

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <polygon points={fillPoints} fill={`url(#grad-${color.replace('#', '')})`} />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      {/* End point dot */}
      {data.length > 0 && (() => {
        const lastVal = data[data.length - 1]
        const lastX = width - 4
        const lastY = height - 4 - ((lastVal - min) / range) * (height - 8)
        return <circle cx={lastX} cy={lastY} r="3" fill={color} />
      })()}
    </svg>
  )
}

export default function VitalTiles({
  currentTelemetry,
  patientBaselines = {},
  recentHistory = []
}) {
  if (!currentTelemetry) return null

  // Extract past 7 days of history for sparklines
  const last7 = recentHistory.slice(-7)
  const spo2Spark = last7.map(d => d.spo2 ?? 95)
  const hrSpark = last7.map(d => d.resting_heart_rate ?? 75)
  const rrSpark = last7.map(d => d.respiratory_rate ?? 16)
  const sleepSpark = last7.map(d => d.sleep_hours ?? 7)
  const stepsSpark = last7.map(d => d.steps ?? 4500)

  // Current values (formatted to 1 decimal place, steps whole)
  const spo2 = Number(currentTelemetry.spo2 ?? 95)
  const hr = Number(currentTelemetry.resting_heart_rate ?? 75)
  const rr = Number(currentTelemetry.respiratory_rate ?? 16)
  const sleep = Number(currentTelemetry.sleep_hours ?? 7)
  const steps = Math.round(Number(currentTelemetry.steps ?? 4500))

  // Baselines
  const baseSpo2 = Number(patientBaselines.baseline_spo2 ?? 95)
  const baseHr = Number(patientBaselines.baseline_heart_rate ?? 75)
  const baseRr = Number(patientBaselines.baseline_resp_rate ?? 16)
  const baseSleep = Number(patientBaselines.baseline_sleep_hours ?? 7)
  const baseSteps = Math.round(Number(patientBaselines.baseline_steps ?? 5500))

  // Shifts vs baseline
  const dSpo2 = spo2 - baseSpo2
  const dHr = hr - baseHr
  const dRr = rr - baseRr
  const dSleep = sleep - baseSleep
  const dStepsPct = baseSteps > 0 ? Math.round(((steps - baseSteps) / baseSteps) * 100) : 0

  const tiles = [
    {
      id: 'spo2',
      label: 'Blood Oxygen (SpO2)',
      icon: Activity,
      value: `${spo2.toFixed(1)}%`,
      delta: `${dSpo2 > 0 ? '+' : ''}${dSpo2.toFixed(1)}%`,
      baseText: `base ${baseSpo2.toFixed(1)}%`,
      isAdverse: dSpo2 < -1.0,
      isWarning: dSpo2 < -0.5,
      direction: dSpo2 > 0.1 ? 'up' : dSpo2 < -0.1 ? 'down' : 'flat',
      spark: spo2Spark.length >= 2 ? spo2Spark : [spo2, spo2],
      accentColor: dSpo2 < -1.0 ? '#e11d48' : '#0f766e'
    },
    {
      id: 'hr',
      label: 'Resting Heart Rate',
      icon: Heart,
      value: `${hr.toFixed(1)} bpm`,
      delta: `${dHr > 0 ? '+' : ''}${dHr.toFixed(1)} bpm`,
      baseText: `base ${baseHr.toFixed(1)} bpm`,
      isAdverse: dHr > 6.0,
      isWarning: dHr > 3.0,
      direction: dHr > 0.5 ? 'up' : dHr < -0.5 ? 'down' : 'flat',
      spark: hrSpark.length >= 2 ? hrSpark : [hr, hr],
      accentColor: dHr > 6.0 ? '#e11d48' : dHr > 3.0 ? '#d97706' : '#0f766e'
    },
    {
      id: 'rr',
      label: 'Respiratory Rate',
      icon: Wind,
      value: `${rr.toFixed(1)} rpm`,
      delta: `${dRr > 0 ? '+' : ''}${dRr.toFixed(1)} rpm`,
      baseText: `base ${baseRr.toFixed(1)} rpm`,
      isAdverse: dRr > 3.0,
      isWarning: dRr > 1.5,
      direction: dRr > 0.3 ? 'up' : dRr < -0.3 ? 'down' : 'flat',
      spark: rrSpark.length >= 2 ? rrSpark : [rr, rr],
      accentColor: dRr > 3.0 ? '#e11d48' : dRr > 1.5 ? '#d97706' : '#0f766e'
    },
    {
      id: 'sleep',
      label: 'Nocturnal Sleep',
      icon: Moon,
      value: `${sleep.toFixed(1)} hrs`,
      delta: `${dSleep > 0 ? '+' : ''}${dSleep.toFixed(1)} hrs`,
      baseText: `base ${baseSleep.toFixed(1)} hrs`,
      isAdverse: dSleep < -1.5,
      isWarning: dSleep < -0.8,
      direction: dSleep > 0.2 ? 'up' : dSleep < -0.2 ? 'down' : 'flat',
      spark: sleepSpark.length >= 2 ? sleepSpark : [sleep, sleep],
      accentColor: dSleep < -1.5 ? '#e11d48' : dSleep < -0.8 ? '#d97706' : '#0f766e'
    },
    {
      id: 'steps',
      label: 'Daily Steps',
      icon: Footprints,
      value: `${steps.toLocaleString()}`,
      delta: `${dStepsPct > 0 ? '+' : ''}${dStepsPct}%`,
      baseText: `base ${baseSteps.toLocaleString()}`,
      isAdverse: dStepsPct < -30,
      isWarning: dStepsPct < -15,
      direction: dStepsPct > 5 ? 'up' : dStepsPct < -5 ? 'down' : 'flat',
      spark: stepsSpark.length >= 2 ? stepsSpark : [steps, steps],
      accentColor: dStepsPct < -30 ? '#e11d48' : dStepsPct < -15 ? '#d97706' : '#0f766e'
    }
  ]

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 36
      }}
    >
      {tiles.map((tile) => {
        const IconComponent = tile.icon
        const isHazard = tile.isAdverse || tile.isWarning

        return (
          <div
            key={tile.id}
            className="editorial-card"
            style={{
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderRadius: 20,
              background: 'rgba(255, 255, 255, 0.72)',
              border: `1px solid ${isHazard ? (tile.isAdverse ? 'rgba(225, 29, 72, 0.25)' : 'rgba(217, 119, 6, 0.25)') : 'rgba(255, 255, 255, 0.85)'}`,
              boxShadow: '0 8px 24px -4px rgba(24, 39, 75, 0.04)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
          >
            {/* Top row: Label & Icon */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 500 }}>
                {tile.label}
              </span>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: isHazard ? (tile.isAdverse ? 'rgba(225, 29, 72, 0.1)' : 'rgba(217, 119, 6, 0.1)') : 'rgba(15, 76, 71, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: tile.accentColor
                }}
              >
                <IconComponent size={14} />
              </div>
            </div>

            {/* Middle row: Big Value & 7-day sparkline */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', margin: '4px 0 10px' }}>
              <div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: 'var(--text-main)',
                    fontFamily: 'var(--font-sans)',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.1
                  }}
                >
                  {tile.value}
                </div>
              </div>

              {/* 7-day sparkline */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <MiniSparkline data={tile.spark} color={tile.accentColor} width={80} height={26} />
                <span style={{ fontSize: 9.5, color: 'var(--text-light)', marginTop: 2 }}>
                  7-day trend
                </span>
              </div>
            </div>

            {/* Bottom row: Delta vs Baseline with Arrow */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: 8,
                borderTop: '1px solid rgba(226, 232, 245, 0.7)',
                fontSize: 11.5
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  fontWeight: 600,
                  color: isHazard ? (tile.isAdverse ? 'var(--risk-coral)' : 'var(--risk-amber)') : 'var(--teal-deep)'
                }}
              >
                {tile.direction === 'up' && <ArrowUpRight size={13} />}
                {tile.direction === 'down' && <ArrowDownRight size={13} />}
                {tile.direction === 'flat' && <Minus size={13} />}
                <span>{tile.delta}</span>
              </div>

              <span style={{ color: 'var(--text-light)', fontSize: 11 }}>
                {tile.baseText}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
