import React, { useState } from 'react'
import { Activity, Wind, Sparkles, AlertCircle } from 'lucide-react'

export default function VitalsTimeline({ 
  history = [], 
  patientBaselines = {}, 
  activeHorizon = 30, 
  onHorizonChange,
  currentDay = 365 
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null)
  const [selectedOverlay, setSelectedOverlay] = useState('aqi') // 'aqi', 'dust', 'weather', 'pollen'

  if (!history || history.length === 0) {
    return (
      <div
        style={{
          background: '#080e1e',
          color: '#94a3b8',
          padding: 32,
          textAlign: 'center',
          borderRadius: 20,
          border: '1px solid #1e293b'
        }}
      >
        Connecting to longitudinal patient telemetry...
      </div>
    )
  }

  // Window data up to active simulation day
  const activeDayNumber = currentDay !== null && currentDay !== undefined ? currentDay : 365
  const upToActive = history.filter(d => (d.day_number || 0) <= activeDayNumber)
  const displayData = upToActive.length > 0 ? upToActive.slice(-activeHorizon) : history.slice(-activeHorizon)
  const nPoints = displayData.length

  const width = 860
  const height = 340
  const padLeft = 52
  const padRight = 62
  const padTop = 32
  const padBottom = 32
  const plotW = width - padLeft - padRight
  const plotH = height - padTop - padBottom

  const getX = (idx) => padLeft + (idx / Math.max(1, nPoints - 1)) * plotW

  // Subplot 1: Vitals (SpO2 & HR) -> top 50%
  const vitalsTop = padTop
  const vitalsH = plotH * 0.46
  const getSpO2Y = (val) => vitalsTop + vitalsH - ((val - 82) / (100 - 82)) * vitalsH
  const getHrY = (val) => vitalsTop + vitalsH - ((val - 50) / (125 - 50)) * vitalsH

  // Subplot 2: Environmental (AQI / Dust / Weather / Pollen) & Steps -> bottom 44%
  const envTop = padTop + plotH * 0.56
  const envH = plotH * 0.44
  const maxEnv = Math.max(300, ...displayData.map(d => d.aqi_cpcb_mean || 100))
  const getEnvY = (val) => envTop + envH - ((val - 0) / (maxEnv - 0)) * envH

  const createPath = (fn) => {
    return displayData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${fn(d).toFixed(1)}`).join(' ')
  }

  const pathSpO2 = createPath(d => getSpO2Y(Number(d.spo2 || 95)))
  const pathHR = createPath(d => getHrY(Number(d.resting_heart_rate || 75)))
  const pathEnv = createPath(d => {
    if (selectedOverlay === 'dust') return getEnvY(Number(d.dust_mean || 30))
    if (selectedOverlay === 'pollen') return getEnvY(Number(d.simulated_pollen_index || 15) * 3)
    if (selectedOverlay === 'weather') return getEnvY(Number(d.temperature_2m_mean || 25) * 8)
    return getEnvY(Number(d.aqi_cpcb_mean || 100))
  })

  const hoveredData = hoveredIdx !== null ? displayData[hoveredIdx] : displayData[displayData.length - 1]

  return (
    <div
      style={{
        background: 'linear-gradient(180deg, #070d1e 0%, #0b132b 100%)',
        border: '1px solid #1e293b',
        borderRadius: 22,
        padding: '24px 28px',
        color: '#f8fafc',
        boxShadow: '0 8px 30px rgba(7, 13, 30, 0.45)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative top pulse strip */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: 'linear-gradient(90deg, #00f5d4 0%, #38bdf8 40%, #f43f5e 70%, #f59e0b 100%)',
          opacity: 0.85
        }}
      />

      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#00f5d4',
                boxShadow: '0 0 10px #00f5d4'
              }}
            />
            <h3 style={{ fontSize: 17, fontWeight: 600, color: '#ffffff', margin: 0, letterSpacing: '-0.01em' }}>
              Longitudinal Telemetry & Atmospheric Alignment
            </h3>
            <span
              style={{
                fontSize: 10.5,
                background: 'rgba(0, 245, 212, 0.12)',
                color: '#00f5d4',
                border: '1px solid rgba(0, 245, 212, 0.28)',
                padding: '2px 7px',
                borderRadius: 4,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}
            >
              Patient Monitor
            </span>
          </div>
          <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>
            Real-time biometric continuous telemetry synchronized with Open-Meteo CAMS atmospheric data
          </p>
        </div>

        {/* Legend with units & Horizon controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          
          {/* Horizon Window Selector */}
          <div style={{ display: 'flex', background: '#131e3a', padding: 2, borderRadius: 6, border: '1px solid #1e2d4d' }}>
            {[
              { days: 7, label: '7D' },
              { days: 30, label: '30D' },
              { days: 365, label: '365D' }
            ].map(h => (
              <button
                key={h.days}
                onClick={() => onHorizonChange(h.days)}
                style={{
                  padding: '3px 10px',
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  background: activeHorizon === h.days ? '#00f5d4' : 'transparent',
                  color: activeHorizon === h.days ? '#070d1e' : '#94a3b8',
                  transition: 'all 0.2s ease'
                }}
              >
                {h.label}
              </button>
            ))}
          </div>

          {/* Environmental Overlay Switcher */}
          <div style={{ display: 'flex', background: '#131e3a', padding: 2, borderRadius: 6, border: '1px solid #1e2d4d' }}>
            {[
              { id: 'aqi', label: 'CAMS AQI' },
              { id: 'dust', label: 'Dust (µg/m³)' },
              { id: 'weather', label: 'Temp (°C)' },
              { id: 'pollen', label: 'Pollen (illustrative seasonal index, not measured data)' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedOverlay(tab.id)}
                title={tab.label}
                style={{
                  padding: '3px 10px',
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: 'none',
                  background: selectedOverlay === tab.id ? '#f59e0b' : 'transparent',
                  color: selectedOverlay === tab.id ? '#070d1e' : '#94a3b8',
                  maxWidth: tab.id === 'pollen' ? 240 : 'none',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab.id === 'pollen' ? 'Pollen (Illustrative Index)' : tab.label}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Sensor Legend Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          marginBottom: 12,
          padding: '6px 12px',
          background: 'rgba(15, 23, 42, 0.75)',
          borderRadius: 8,
          border: '1px solid #1e293b',
          fontSize: 11.5,
          flexWrap: 'wrap'
        }}
      >
        <span style={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: 10 }}>
          Telemetry Legend:
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 14, height: 3, background: '#00f5d4', borderRadius: 2, display: 'inline-block', boxShadow: '0 0 6px #00f5d4' }} />
          <span style={{ color: '#00f5d4', fontWeight: 600 }}>SpO2 (%)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 14, height: 3, background: '#f43f5e', borderRadius: 2, display: 'inline-block', boxShadow: '0 0 6px #f43f5e' }} />
          <span style={{ color: '#f43f5e', fontWeight: 600 }}>Heart Rate (bpm)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 14, height: 3, background: '#f59e0b', borderRadius: 2, display: 'inline-block', boxShadow: '0 0 6px #f59e0b' }} />
          <span style={{ color: '#f59e0b', fontWeight: 600 }}>
            {selectedOverlay === 'dust' ? 'Dust (µg/m³)' : selectedOverlay === 'weather' ? 'Temperature (°C)' : selectedOverlay === 'pollen' ? 'Simulated Pollen' : 'CAMS NAQI (CPCB-calibrated)'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, background: '#334155', borderRadius: 2, display: 'inline-block' }} />
          <span style={{ color: '#94a3b8' }}>Steps (Daily Activity)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
          <span style={{ width: 8, height: 8, background: '#ef4444', borderRadius: '50%', display: 'inline-block' }} />
          <span style={{ color: '#fca5a5', fontSize: 11 }}>Acute Flare Onset</span>
        </div>
      </div>

      {/* SVG Timeline Canvas */}
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', display: 'block' }}
          onMouseLeave={() => setHoveredIdx(null)}
        >
          <defs>
            {/* Glow filters for lines */}
            <filter id="glow-teal" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-coral" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-amber" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Subplot 1 Background & Grid (Vitals) */}
          <rect x={padLeft} y={vitalsTop} width={plotW} height={vitalsH} fill="rgba(15, 23, 42, 0.45)" rx={4} />
          <line x1={padLeft} y1={vitalsTop} x2={width - padRight} y2={vitalsTop} stroke="#1e293b" strokeDasharray="3,3" />
          <line x1={padLeft} y1={vitalsTop + vitalsH * 0.5} x2={width - padRight} y2={vitalsTop + vitalsH * 0.5} stroke="#1e293b" strokeDasharray="3,3" />
          <line x1={padLeft} y1={vitalsTop + vitalsH} x2={width - padRight} y2={vitalsTop + vitalsH} stroke="#334155" />

          {/* Subplot 2 Background & Grid (Atmospheric & Mobility) */}
          <rect x={padLeft} y={envTop} width={plotW} height={envH} fill="rgba(15, 23, 42, 0.45)" rx={4} />
          <line x1={padLeft} y1={envTop} x2={width - padRight} y2={envTop} stroke="#1e293b" strokeDasharray="3,3" />
          <line x1={padLeft} y1={envTop + envH * 0.5} x2={width - padRight} y2={envTop + envH * 0.5} stroke="#1e293b" strokeDasharray="3,3" />
          <line x1={padLeft} y1={envTop + envH} x2={width - padRight} y2={envTop + envH} stroke="#334155" />

          {/* Shaded 48h Warning Alert Windows */}
          {displayData.map((d, i) => {
            if (d.flare_up_next_48h === 1) {
              const x1 = getX(i) - (plotW / nPoints / 2)
              const w = plotW / nPoints
              return (
                <rect
                  key={`alert-${i}`}
                  x={x1}
                  y={padTop}
                  width={w}
                  height={plotH}
                  fill="rgba(244, 63, 94, 0.15)"
                />
              )
            }
            return null
          })}

          {/* Acute Flare Onset Vertical Markers */}
          {displayData.map((d, i) => {
            if (d.flare_up_onset === 1) {
              const x = getX(i)
              return (
                <g key={`flare-${i}`}>
                  <line x1={x} y1={padTop} x2={x} y2={padTop + plotH} stroke="#f43f5e" strokeWidth={1.8} strokeDasharray="2,2" />
                  <circle cx={x} cy={padTop + 4} r={3.5} fill="#f43f5e" />
                  <text x={x} y={padTop - 4} fill="#f43f5e" fontSize={8} fontWeight={700} textAnchor="middle">ONSET</text>
                </g>
              )
            }
            return null
          })}

          {/* Steps Activity Bars in Bottom Subplot */}
          {displayData.map((d, i) => {
            const barW = Math.max(1.5, (plotW / nPoints) * 0.5)
            const stepH = Math.min(envH, ((d.steps || 4000) / 12000) * envH)
            const x = getX(i) - barW / 2
            const y = envTop + envH - stepH
            return (
              <rect key={`step-${i}`} x={x} y={y} width={barW} height={stepH} fill="#334155" opacity="0.6" rx={1} />
            )
          })}

          {/* Baseline SpO2 dashed line */}
          {patientBaselines.baseline_spo2 && (
            <g>
              <line
                x1={padLeft}
                y1={getSpO2Y(patientBaselines.baseline_spo2)}
                x2={width - padRight}
                y2={getSpO2Y(patientBaselines.baseline_spo2)}
                stroke="#00f5d4"
                strokeWidth={1}
                strokeDasharray="4,4"
                opacity={0.35}
              />
            </g>
          )}

          {/* Resting HR Line */}
          <path
            d={pathHR}
            fill="none"
            stroke="#f43f5e"
            strokeWidth={1.8}
            strokeDasharray="4,3"
            filter="url(#glow-coral)"
            opacity={0.85}
          />

          {/* SpO2 Line */}
          <path
            d={pathSpO2}
            fill="none"
            stroke="#00f5d4"
            strokeWidth={2.5}
            strokeLinecap="round"
            filter="url(#glow-teal)"
          />

          {/* Environmental Overlay Line */}
          <path
            d={pathEnv}
            fill="none"
            stroke="#f59e0b"
            strokeWidth={2}
            strokeLinecap="round"
            filter="url(#glow-amber)"
          />

          {/* Active Simulation Scrubber Cursor */}
          {(() => {
            const activePointIdx = displayData.findIndex(d => d.day_number === activeDayNumber)
            const activeX = activePointIdx !== -1 ? getX(activePointIdx) : getX(displayData.length - 1)
            return (
              <g>
                <line x1={activeX} y1={padTop} x2={activeX} y2={padTop + plotH} stroke="#00f5d4" strokeWidth={1.8} strokeDasharray="3,2" />
                <rect x={activeX - 30} y={padTop - 16} width={60} height={15} rx={3} fill="#00f5d4" />
                <text x={activeX} y={padTop - 5} textAnchor="middle" fontSize={9} fontWeight={800} fill="#070d1e">
                  Day {activeDayNumber}
                </text>
              </g>
            )
          })()}

          {/* Subplot 1 Left Axis Labels: SpO2 */}
          <text x={padLeft - 8} y={getSpO2Y(98)} fill="#00f5d4" fontSize={9.5} textAnchor="end" fontWeight={600}>98%</text>
          <text x={padLeft - 8} y={getSpO2Y(90)} fill="#f43f5e" fontSize={9.5} textAnchor="end" fontWeight={600}>90%</text>
          <text x={padLeft - 8} y={getSpO2Y(84)} fill="#64748b" fontSize={9.5} textAnchor="end">84%</text>

          {/* Subplot 1 Right Axis Labels: Heart Rate */}
          <text x={width - padRight + 8} y={getHrY(110)} fill="#f43f5e" fontSize={9.5} textAnchor="start" fontWeight={600}>110 bpm</text>
          <text x={width - padRight + 8} y={getHrY(75)} fill="#94a3b8" fontSize={9.5} textAnchor="start">75 bpm</text>
          <text x={width - padRight + 8} y={getHrY(55)} fill="#64748b" fontSize={9.5} textAnchor="start">55 bpm</text>

          {/* Subplot 2 Left Axis Labels: Steps */}
          <text x={padLeft - 8} y={envTop + 10} fill="#94a3b8" fontSize={9} textAnchor="end">10k steps</text>
          <text x={padLeft - 8} y={envTop + envH} fill="#64748b" fontSize={9} textAnchor="end">0</text>

          {/* Subplot 2 Right Axis Labels: Environmental Indicator */}
          <text x={width - padRight + 8} y={getEnvY(maxEnv * 0.85)} fill="#f59e0b" fontSize={9.5} textAnchor="start" fontWeight={600}>
            {selectedOverlay === 'weather' ? '35.0°C' : selectedOverlay === 'dust' ? '250.0 µg' : selectedOverlay === 'pollen' ? '80.0' : `${Math.round(maxEnv * 0.85)} AQI`}
          </text>
          <text x={width - padRight + 8} y={envTop + envH} fill="#64748b" fontSize={9} textAnchor="start">
            0
          </text>

          {/* Hitboxes for Hover Interaction */}
          {displayData.map((d, i) => {
            const x = getX(i)
            const w = plotW / nPoints
            return (
              <rect
                key={`hit-${i}`}
                x={x - w / 2}
                y={padTop}
                width={w}
                height={plotH}
                fill="transparent"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredIdx(i)}
              />
            )
          })}

          {/* Hover Crosshair Marker */}
          {hoveredIdx !== null && (
            <g>
              <line x1={getX(hoveredIdx)} y1={padTop} x2={getX(hoveredIdx)} y2={padTop + plotH} stroke="#ffffff" strokeWidth={1} strokeDasharray="2,2" opacity={0.6} />
              <circle cx={getX(hoveredIdx)} cy={getSpO2Y(Number(displayData[hoveredIdx].spo2 || 95))} r={4.5} fill="#00f5d4" stroke="#070d1e" strokeWidth={2} />
              <circle cx={getX(hoveredIdx)} cy={getHrY(Number(displayData[hoveredIdx].resting_heart_rate || 75))} r={4.5} fill="#f43f5e" stroke="#070d1e" strokeWidth={2} />
            </g>
          )}

          {/* Date Range Labels */}
          <text x={padLeft} y={height - 8} fill="#64748b" fontSize={10} textAnchor="start">{displayData[0]?.date}</text>
          <text x={width - padRight} y={height - 8} fill="#64748b" fontSize={10} textAnchor="end">{displayData[nPoints - 1]?.date}</text>
        </svg>
      </div>

      {/* Hover Readout Bar */}
      {hoveredData && (
        <div
          style={{
            marginTop: 14,
            padding: '10px 16px',
            background: 'rgba(15, 23, 42, 0.9)',
            borderRadius: 8,
            border: '1px solid #1e293b',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 12,
            flexWrap: 'wrap',
            gap: 12
          }}
        >
          <div>
            <span style={{ color: '#94a3b8' }}>Telemetry Record: </span>
            <strong style={{ color: '#ffffff' }}>{hoveredData.date}</strong>
            <span style={{ color: '#64748b', marginLeft: 4 }}>(Day {hoveredData.day_number})</span>
          </div>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <span>
              SpO2: <strong style={{ color: '#00f5d4' }}>{Number(hoveredData.spo2 || 95).toFixed(1)}%</strong>
            </span>
            <span>
              HR: <strong style={{ color: '#f43f5e' }}>{Number(hoveredData.resting_heart_rate || 75).toFixed(1)} bpm</strong>
            </span>
            <span>
              RR: <strong style={{ color: '#38bdf8' }}>{Number(hoveredData.respiratory_rate || 16).toFixed(1)} rpm</strong>
            </span>
            <span>
              Sleep: <strong style={{ color: '#cbd5e1' }}>{Number(hoveredData.sleep_hours || 7).toFixed(1)}h</strong>
            </span>
            <span>
              Steps: <strong style={{ color: '#cbd5e1' }}>{Math.round(Number(hoveredData.steps || 4000)).toLocaleString()}</strong>
            </span>
            <span>
              CAMS NAQI: <strong style={{ color: '#f59e0b' }}>{Number(hoveredData.aqi_cpcb_mean || 100).toFixed(1)}</strong>
            </span>
            {selectedOverlay === 'dust' && (
              <span>Dust: <strong style={{ color: '#fbbf24' }}>{Number(hoveredData.dust_mean || 30).toFixed(1)} µg/m³</strong></span>
            )}
            {selectedOverlay === 'pollen' && (
              <span>Sim. Pollen: <strong style={{ color: '#fbbf24' }}>{Number(hoveredData.simulated_pollen_index || 15).toFixed(1)}</strong></span>
            )}
          </div>

          {hoveredData.flare_up_next_48h === 1 && (
            <span style={{ color: '#f43f5e', fontWeight: 600, fontSize: 11.5, display: 'flex', alignItems: 'center', gap: 4 }}>
              <AlertCircle size={13} color="#f43f5e" /> Impending 48h Flare Window
            </span>
          )}
        </div>
      )}

    </div>
  )
}
