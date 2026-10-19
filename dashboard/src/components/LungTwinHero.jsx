import React, { useMemo } from 'react'
import { Wind, Activity, AlertCircle, ShieldAlert } from 'lucide-react'

export default function LungTwinHero({ 
  riskScore = 0, 
  riskLevel = 'Low', 
  respiratoryRate = 16, 
  spo2 = 95, 
  aqi = 120, 
  patientName = 'Patient',
  condition = 'COPD'
}) {
  // Breathing cycle duration in seconds: 60 / respiratory_rate
  const breathDuration = useMemo(() => {
    const rr = Math.max(10, Math.min(36, respiratoryRate || 16))
    return (60 / rr).toFixed(2)
  }, [respiratoryRate])

  // Color mapping: Teal -> Amber -> Coral
  const colorTheme = useMemo(() => {
    if (riskScore >= 50) {
      return {
        main: '#e11d48',       // Coral / Rose
        alveoli: '#f43f5e',
        glow: 'rgba(225, 29, 72, 0.18)',
        trachea: '#be123c',
        tagBg: '#fff1f2',
        tagText: '#be123c',
        statusLabel: 'Elevated Risk'
      }
    }
    if (riskScore >= 25) {
      return {
        main: '#d97706',       // Amber
        alveoli: '#f59e0b',
        glow: 'rgba(217, 119, 6, 0.15)',
        trachea: '#b45309',
        tagBg: '#fef3c7',
        tagText: '#92400e',
        statusLabel: 'Moderate Risk'
      }
    }
    return {
      main: '#0d9488',         // Deep Teal
      alveoli: '#14b8a6',
      glow: 'rgba(13, 148, 136, 0.14)',
      trachea: '#0f766e',
      tagBg: '#f0fdfa',
      tagText: '#0f766e',
      statusLabel: 'Stable Twin'
    }
  }, [riskScore])

  // Ambient AQI Particle Generator
  // Particle density scales with current AQI
  const particles = useMemo(() => {
    const count = Math.min(65, Math.max(8, Math.round((aqi / 400) * 55)))
    const pts = []
    for (let i = 0; i < count; i++) {
      // Deterministic positions based on index
      const seed = (i * 9301 + 49297) % 233280
      const x = (seed % 280) + 20
      const y = ((seed * 7) % 240) + 15
      const size = (i % 3 === 0) ? 2.5 : 1.6
      const delay = (i * 0.15).toFixed(2)
      const duration = (3.5 + (i % 4) * 0.8).toFixed(1)
      pts.push({ x, y, size, delay, duration })
    }
    return pts
  }, [aqi])

  return (
    <div className="editorial-card" style={{ padding: '28px 32px', marginBottom: 20 }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        alignItems: 'center',
        gap: 32
      }}>
        
        {/* Left: Original Animated Lung Digital Twin */}
        <div style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-subtle)',
          borderRadius: 12,
          padding: '24px 16px',
          border: '1px solid var(--border-subtle)',
          overflow: 'hidden'
        }}>
          
          {/* Subtle Background Radial Glow */}
          <div style={{
            position: 'absolute',
            width: 240,
            height: 240,
            borderRadius: '50%',
            background: colorTheme.glow,
            filter: 'blur(35px)',
            pointerEvents: 'none'
          }} />

          {/* SVG Animated Lung Illustration */}
          <svg
            viewBox="0 0 320 270"
            width="280"
            height="235"
            style={{ overflow: 'visible', zIndex: 2 }}
          >
            <defs>
              <linearGradient id="lungGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colorTheme.alveoli} stopOpacity="0.85" />
                <stop offset="100%" stopColor={colorTheme.main} stopOpacity="0.95" />
              </linearGradient>
            </defs>

            {/* Ambient Floating AQI Particulate Field */}
            <g>
              {particles.map((p, idx) => (
                <circle
                  key={`pt-${idx}`}
                  cx={p.x}
                  cy={p.y}
                  r={p.size}
                  fill={aqi > 250 ? '#b45309' : '#64748b'}
                  opacity={0.35}
                  style={{
                    animation: `particleDrift ${p.duration}s ease-in-out infinite`,
                    animationDelay: `${p.delay}s`
                  }}
                />
              ))}
            </g>

            {/* Trachea & Upper Airway Structure (Anchored) */}
            <g stroke={colorTheme.trachea} strokeWidth="6" strokeLinecap="round" fill="none">
              {/* Trachea Main Stem */}
              <line x1="160" y1="25" x2="160" y2="85" />
              {/* Tracheal Cartilage Rings */}
              <line x1="154" y1="38" x2="166" y2="38" strokeWidth="2.5" opacity="0.6" />
              <line x1="154" y1="52" x2="166" y2="52" strokeWidth="2.5" opacity="0.6" />
              <line x1="154" y1="66" x2="166" y2="66" strokeWidth="2.5" opacity="0.6" />
              {/* Carina / Primary Bronchi Bifurcation */}
              <path d="M 160 85 Q 150 108 128 125" strokeWidth="5" />
              <path d="M 160 85 Q 170 108 192 125" strokeWidth="5" />
            </g>

            {/* Dual Breathing Lung Lobes (Scales dynamically with Respiratory Rate) */}
            <g
              className="breathe-animation"
              style={{
                animationDuration: `${breathDuration}s`
              }}
            >
              {/* Left Lung Lobe (Anatomical Right) */}
              <path
                d="M 148 95
                   C 130 95, 90 110, 75 145
                   C 58 180, 62 230, 88 245
                   C 112 255, 138 238, 144 210
                   C 148 185, 146 135, 148 95 Z"
                fill="url(#lungGradient)"
                stroke={colorTheme.trachea}
                strokeWidth="2.5"
                opacity="0.92"
              />

              {/* Right Lung Lobe (Anatomical Left, slightly smaller cardiac notch) */}
              <path
                d="M 172 95
                   C 190 95, 230 110, 245 145
                   C 262 180, 258 230, 232 245
                   C 208 255, 182 238, 176 210
                   C 172 185, 174 135, 172 95 Z"
                fill="url(#lungGradient)"
                stroke={colorTheme.trachea}
                strokeWidth="2.5"
                opacity="0.92"
              />

              {/* Alveolar Bronchiole Vascular Arborization */}
              <g stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" fill="none">
                {/* Left Arborization */}
                <path d="M 132 125 Q 112 145 98 165" />
                <path d="M 112 145 Q 102 185 110 205" />
                <path d="M 112 145 Q 82 170 78 195" strokeWidth="1.2" />
                {/* Right Arborization */}
                <path d="M 188 125 Q 208 145 222 165" />
                <path d="M 208 145 Q 218 185 210 205" />
                <path d="M 208 145 Q 238 170 242 195" strokeWidth="1.2" />
              </g>
            </g>
          </svg>

          {/* Under-Hero Dynamic Bio-Metrics */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            maxWidth: 290,
            fontSize: 11.5,
            color: 'var(--text-muted)',
            marginTop: 8,
            paddingTop: 8,
            borderTop: '1px solid var(--border-subtle)'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Activity size={13} color={colorTheme.main} />
              Breathing Rate: <strong style={{ color: 'var(--text-main)' }}>{respiratoryRate} rpm</strong>
            </span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Wind size={13} color="#ea580c" />
              Ambient AQI: <strong style={{ color: 'var(--text-main)' }}>{aqi}</strong>
            </span>
          </div>

        </div>

        {/* Right: Large Editorial 0-100 Risk Hero Readout */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              padding: '3px 10px',
              borderRadius: 4,
              background: colorTheme.tagBg,
              color: colorTheme.tagText
            }}>
              {colorTheme.statusLabel}
            </span>

            <span style={{ fontSize: 12, color: 'var(--text-light)' }}>
              Patient Twin • {condition}
            </span>
          </div>

          {/* Huge Serif Risk Numeral */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span
              className="font-serif"
              style={{
                fontSize: 76,
                fontWeight: 600,
                color: riskScore >= 50 ? 'var(--risk-coral)' : riskScore >= 25 ? 'var(--risk-amber)' : 'var(--teal-deep)',
                lineHeight: 0.9,
                letterSpacing: '-0.03em'
              }}
            >
              {riskScore.toFixed(0)}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 24, fontWeight: 300, color: 'var(--text-light)' }}>/ 100</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Next 48 Hours
              </span>
            </div>
          </div>

          {/* Narrative Summary */}
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            {riskScore >= 50 ? (
              <>
                <strong style={{ color: 'var(--risk-coral)' }}>Critical Exacerbation Window:</strong> Fused telemetry exhibits acute prodromal drift. Resting tachycardia, reduced SpO2, and ambient Delhi particulate exposure indicate an impending flare-up within 48 hours.
              </>
            ) : riskScore >= 25 ? (
              <>
                <strong style={{ color: 'var(--risk-amber)' }}>Moderate Vulnerability:</strong> Early signs of mild respiratory resistance and air quality stress. Inhaler adherence and indoor air purification recommended.
              </>
            ) : (
              <>
                <strong style={{ color: 'var(--teal-mid)' }}>Controlled Physiology:</strong> Multi-sensor wearable telemetry matches individual homeostatic baselines. Normal pulmonary stability observed.
              </>
            )}
          </p>

          {/* Key Vitals Snapshot */}
          <div style={{
            display: 'flex',
            gap: 16,
            paddingTop: 12,
            borderTop: '1px solid var(--border-subtle)',
            fontSize: 12,
            color: 'var(--text-muted)'
          }}>
            <div>
              Resting SpO2: <strong style={{ color: spo2 < 92 ? 'var(--risk-coral)' : 'var(--text-main)' }}>{spo2}%</strong>
            </div>
            <span>•</span>
            <div>
              Breathing Rhythm: <strong style={{ color: 'var(--text-main)' }}>{(60 / respiratoryRate).toFixed(1)}s / breath</strong>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
