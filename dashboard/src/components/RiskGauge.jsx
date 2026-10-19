import React from 'react'
import { ShieldCheck, AlertOctagon, TrendingUp, Info } from 'lucide-react'

export default function RiskGauge({ riskScore = 0, riskLevel = 'Low', threshold = 84, alertTriggered = false }) {
  // Normalize score between 0 and 100
  const score = Math.min(100, Math.max(0, riskScore))
  
  // Calculate SVG arc parameters (semi-circle from 180deg to 0deg)
  const radius = 80
  const cx = 100
  const cy = 95
  const strokeWidth = 14
  
  // Angle for the score (0 to 180 degrees)
  const angle = (score / 100) * 180
  const angleRad = (Math.PI * (180 - angle)) / 180
  const needleX = cx + (radius - 12) * Math.cos(angleRad)
  const needleY = cy - (radius - 12) * Math.sin(angleRad)

  // Color mapping
  const getColor = (s) => {
    if (s >= 75) return 'var(--risk-crit)'
    if (s >= 50) return 'var(--risk-high)'
    if (s >= 25) return 'var(--risk-mod)'
    return 'var(--risk-low)'
  }

  const riskColor = getColor(score)

  return (
    <div className="clinical-card" style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      
      {/* Card Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            48-Hour Flare Risk
          </h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Digital Twin Forecast Window</p>
        </div>
        <span style={{
          fontSize: 11,
          fontWeight: 700,
          padding: '3px 10px',
          borderRadius: 20,
          background: alertTriggered ? 'var(--risk-crit-bg)' : 'var(--risk-low-bg)',
          color: alertTriggered ? 'var(--risk-crit)' : 'var(--risk-low)',
          border: `1px solid ${alertTriggered ? '#fecaca' : '#bbf7d0'}`
        }}>
          {alertTriggered ? 'HIGH ALERT' : 'CONTROLLED'}
        </span>
      </div>

      {/* Radial Gauge SVG */}
      <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center', marginTop: 10 }}>
        <svg viewBox="0 0 200 115" width="220" height="125">
          {/* Background Arc Bands */}
          {/* Green (0-25) */}
          <path d="M 20 95 A 80 80 0 0 1 43.4 38.4" fill="none" stroke="#d1fae5" strokeWidth={strokeWidth} strokeLinecap="round" />
          {/* Amber (25-50) */}
          <path d="M 43.4 38.4 A 80 80 0 0 1 100 15" fill="none" stroke="#fef3c7" strokeWidth={strokeWidth} />
          {/* Orange (50-75) */}
          <path d="M 100 15 A 80 80 0 0 1 156.6 38.4" fill="none" stroke="#ffedd5" strokeWidth={strokeWidth} />
          {/* Red (75-100) */}
          <path d="M 156.6 38.4 A 80 80 0 0 1 180 95" fill="none" stroke="#fee2e2" strokeWidth={strokeWidth} strokeLinecap="round" />

          {/* Active Progress Arc */}
          <path
            d="M 20 95 A 80 80 0 0 1 180 95"
            fill="none"
            stroke={riskColor}
            strokeWidth={strokeWidth}
            strokeDasharray={Math.PI * radius}
            strokeDashoffset={Math.PI * radius * (1 - score / 100)}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.4s ease' }}
          />

          {/* Threshold Tick Marker at 84% */}
          {(() => {
            const threshAngle = (threshold / 100) * 180
            const threshRad = (Math.PI * (180 - threshAngle)) / 180
            const tX1 = cx + (radius - 10) * Math.cos(threshRad)
            const tY1 = cy - (radius - 10) * Math.sin(threshRad)
            const tX2 = cx + (radius + 10) * Math.cos(threshRad)
            const tY2 = cy - (radius + 10) * Math.sin(threshRad)
            return (
              <line x1={tX1} y1={tY1} x2={tX2} y2={tY2} stroke="#b91c1c" strokeWidth={2.5} strokeDasharray="2,2" />
            )
          })()}

          {/* Needle Indicator */}
          <circle cx={cx} cy={cy} r={6} fill="#0f172a" />
          <line
            x1={cx}
            y1={cy}
            x2={needleX}
            y2={needleY}
            stroke="#0f172a"
            strokeWidth={3}
            strokeLinecap="round"
            style={{ transition: 'all 0.8s ease' }}
          />
        </svg>

        {/* Center Readout */}
        <div style={{
          position: 'absolute',
          bottom: 2,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: 32, fontWeight: 800, color: riskColor, lineHeight: 1 }}>
            {score.toFixed(1)}
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: riskColor, marginTop: 2 }}>
            {riskLevel} Risk Tier
          </span>
        </div>
      </div>

      {/* Threshold & Horizon Info */}
      <div style={{
        marginTop: 12,
        padding: '8px 12px',
        background: 'var(--bg-subtle)',
        borderRadius: 8,
        fontSize: 11,
        color: 'var(--text-muted)',
        display: 'flex',
        flexDirection: 'column',
        gap: 3
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Alert Action Threshold:</span>
          <strong>≥ {threshold.toFixed(0)}% Risk</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Advance Warning Lead:</span>
          <strong style={{ color: 'var(--teal-700)' }}>Up to 48 Hours</strong>
        </div>
      </div>

    </div>
  )
}
