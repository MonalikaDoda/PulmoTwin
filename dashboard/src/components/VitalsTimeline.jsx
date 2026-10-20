import React, { useState } from 'react'
import { Activity, Wind, AlertCircle } from 'lucide-react'

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
      <div className="editorial-card" style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
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
  const padTop = 28
  const padBottom = 30
  const plotW = width - padLeft - padRight
  const plotH = height - padTop - padBottom

  const getX = (idx) => padLeft + (idx / Math.max(1, nPoints - 1)) * plotW

  // Subplot 1: Vitals (SpO2 & HR) -> top 46%
  const vitalsTop = padTop
  const vitalsH = plotH * 0.46
  const getSpO2Y = (val) => vitalsTop + vitalsH - ((val - 82) / (100 - 82)) * vitalsH
  const getHrY = (val) => vitalsTop + vitalsH - ((val - 50) / (125 - 50)) * vitalsH

  // Subplot 2: Environmental (AQI / Dust / Weather / Pollen) & Steps -> bottom 44%
  const envTop = padTop + plotH * 0.56
  const envH = plotH * 0.44
  const maxEnv = Math.max(300, ...displayData.map(d => Number(d.aqi_cpcb_mean) || 100))
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
    <div className="editorial-card" style={{ padding: '24px 28px', marginBottom: 20 }}>
      
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'var(--teal-deep)',
                boxShadow: '0 0 0 3px var(--teal-wash)'
              }}
            />
            <h3 className="heading-serif" style={{ fontSize: 18, color: 'var(--text-serif)', margin: 0 }}>
              Longitudinal Telemetry & Atmospheric Alignment
            </h3>
            <span
              style={{
                fontSize: 11,
                background: 'var(--teal-wash)',
                color: 'var(--teal-deep)',
                border: '1px solid var(--border-subtle)',
                padding: '2px 8px',
                borderRadius: 4,
                fontWeight: 600,
                letterSpacing: '0.02em'
              }}
            >
              Continuous Timeline
            </span>
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)', margin: 0 }}>
            Multi-sensor wearable telemetry fused with Open-Meteo CAMS atmospheric data and ERA5 weather
          </p>
        </div>

        {/* Horizon and Overlay Selectors */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          
          {/* Horizon Window Selector */}
          <div style={{ display: 'flex', background: 'var(--bg-subtle)', padding: 2, borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
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
                  background: activeHorizon === h.days ? 'var(--teal-deep)' : 'transparent',
                  color: activeHorizon === h.days ? '#ffffff' : 'var(--text-muted)',
                  transition: 'all 0.15s ease'
                }}
              >
                {h.label}
              </button>
            ))}
          </div>

          {/* Environmental Overlay Switcher */}
          <div style={{ display: 'flex', background: 'var(--bg-subtle)', padding: 2, borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
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
                  background: selectedOverlay === tab.id ? '#ffffff' : 'transparent',
                  color: selectedOverlay === tab.id ? 'var(--text-main)' : 'var(--text-muted)',
                  boxShadow: selectedOverlay === tab.id ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                  maxWidth: tab.id === 'pollen' ? 220 : 'none',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  transition: 'all 0.15s ease'
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
          padding: '6px 14px',
          background: 'var(--bg-warm)',
          borderRadius: 8,
          border: '1px solid var(--border-subtle)',
          fontSize: 11.5,
          flexWrap: 'wrap'
        }}
      >
        <span style={{ color: 'var(--text-light)', fontWeight: 600, fontSize: 10.5, letterSpacing: '0.02em' }}>
          CHART LEGEND:
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 14, height: 3, background: '#0f766e', borderRadius: 2, display: 'inline-block' }} />
          <span style={{ color: '#0f766e', fontWeight: 600 }}>SpO2 (%)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 14, height: 3, background: '#be123c', borderRadius: 2, display: 'inline-block' }} />
          <span style={{ color: '#be123c', fontWeight: 600 }}>Heart Rate (bpm)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 14, height: 3, background: '#b45309', borderRadius: 2, display: 'inline-block' }} />
          <span style={{ color: '#b45309', fontWeight: 600 }}>
            {selectedOverlay === 'dust' ? 'Dust (µg/m³)' : selectedOverlay === 'weather' ? 'Temperature (°C)' : selectedOverlay === 'pollen' ? 'Simulated Pollen' : 'CAMS NAQI (CPCB-calibrated)'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, background: '#cbd5e1', borderRadius: 2, display: 'inline-block' }} />
          <span style={{ color: 'var(--text-muted)' }}>Steps (Daily Activity)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
          <span style={{ width: 8, height: 8, background: 'var(--risk-coral)', borderRadius: '50%', display: 'inline-block' }} />
          <span style={{ color: 'var(--risk-coral)', fontSize: 11, fontWeight: 500 }}>Acute Flare Onset</span>
        </div>
      </div>

      {/* SVG Timeline Canvas */}
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', display: 'block' }}
          onMouseLeave={() => setHoveredIdx(null)}
        >
          {/* Subplot 1 Background & Grid (Vitals) */}
          <rect x={padLeft} y={vitalsTop} width={plotW} height={vitalsH} fill="rgba(248, 250, 252, 0.6)" rx={4} />
          <line x1={padLeft} y1={vitalsTop} x2={width - padRight} y2={vitalsTop} stroke="#e2e8f0" strokeDasharray="3,3" />
          <line x1={padLeft} y1={vitalsTop + vitalsH * 0.5} x2={width - padRight} y2={vitalsTop + vitalsH * 0.5} stroke="#e2e8f0" strokeDasharray="3,3" />
          <line x1={padLeft} y1={vitalsTop + vitalsH} x2={width - padRight} y2={vitalsTop + vitalsH} stroke="#cbd5e1" />

          {/* Subplot 2 Background & Grid (Atmospheric & Mobility) */}
          <rect x={padLeft} y={envTop} width={plotW} height={envH} fill="rgba(248, 250, 252, 0.6)" rx={4} />
          <line x1={padLeft} y1={envTop} x2={width - padRight} y2={envTop} stroke="#e2e8f0" strokeDasharray="3,3" />
          <line x1={padLeft} y1={envTop + envH * 0.5} x2={width - padRight} y2={envTop + envH * 0.5} stroke="#e2e8f0" strokeDasharray="3,3" />
          <line x1={padLeft} y1={envTop + envH} x2={width - padRight} y2={envTop + envH} stroke="#cbd5e1" />

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
                  fill="#fef08a"
                  opacity="0.38"
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
                  <line x1={x} y1={padTop} x2={x} y2={padTop + plotH} stroke="#be123c" strokeWidth={1.8} strokeDasharray="2,2" />
                  <circle cx={x} cy={padTop + 4} r={3.5} fill="#be123c" />
                  <text x={x} y={padTop - 4} fill="#be123c" fontSize={8} fontWeight={700} textAnchor="middle">ONSET</text>
                </g>
              )
            }
            return null
          })}

          {/* Steps Activity Bars in Bottom Subplot */}
          {displayData.map((d, i) => {
            const barW = Math.max(1.5, (plotW / nPoints) * 0.52)
            const stepH = Math.min(envH, ((Number(d.steps) || 4000) / 12000) * envH)
            const x = getX(i) - barW / 2
            const y = envTop + envH - stepH
            return (
              <rect key={`step-${i}`} x={x} y={y} width={barW} height={stepH} fill="#94a3b8" opacity="0.45" rx={1} />
            )
          })}

          {/* Baseline SpO2 dashed line */}
          {patientBaselines.baseline_spo2 && (
            <line
              x1={padLeft}
              y1={getSpO2Y(Number(patientBaselines.baseline_spo2))}
              x2={width - padRight}
              y2={getSpO2Y(Number(patientBaselines.baseline_spo2))}
              stroke="#0f766e"
              strokeWidth={1.2}
              strokeDasharray="4,4"
              opacity={0.45}
            />
          )}

          {/* Resting HR Line - Deep Crimson */}
          <path
            d={pathHR}
            fill="none"
            stroke="#be123c"
            strokeWidth={1.8}
            strokeDasharray="4,3"
            opacity={0.85}
          />

          {/* SpO2 Line - Deep Teal */}
          <path
            d={pathSpO2}
            fill="none"
            stroke="#0f766e"
            strokeWidth={2.4}
            strokeLinecap="round"
          />

          {/* Environmental Overlay Line - Deep Warm Amber / Bronze */}
          <path
            d={pathEnv}
            fill="none"
            stroke="#b45309"
            strokeWidth={2}
            strokeLinecap="round"
          />

          {/* Active Simulation Scrubber Cursor */}
          {(() => {
            const activePointIdx = displayData.findIndex(d => d.day_number === activeDayNumber)
            const activeX = activePointIdx !== -1 ? getX(activePointIdx) : getX(displayData.length - 1)
            return (
              <g>
                <line x1={activeX} y1={padTop} x2={activeX} y2={padTop + plotH} stroke="var(--teal-deep)" strokeWidth={2} strokeDasharray="3,2" />
                <rect x={activeX - 30} y={padTop - 16} width={60} height={15} rx={3} fill="var(--teal-deep)" />
                <text x={activeX} y={padTop - 5} textAnchor="middle" fontSize={9} fontWeight={700} fill="#ffffff">
                  Day {activeDayNumber}
                </text>
              </g>
            )
          })()}

          {/* Subplot 1 Left Axis Labels: SpO2 */}
          <text x={padLeft - 8} y={getSpO2Y(98)} fill="#0f766e" fontSize={9.5} textAnchor="end" fontWeight={600}>98%</text>
          <text x={padLeft - 8} y={getSpO2Y(90)} fill="#be123c" fontSize={9.5} textAnchor="end" fontWeight={600}>90%</text>
          <text x={padLeft - 8} y={getSpO2Y(84)} fill="#64748b" fontSize={9.5} textAnchor="end">84%</text>

          {/* Subplot 1 Right Axis Labels: Heart Rate */}
          <text x={width - padRight + 8} y={getHrY(110)} fill="#be123c" fontSize={9.5} textAnchor="start" fontWeight={600}>110 bpm</text>
          <text x={width - padRight + 8} y={getHrY(75)} fill="#64748b" fontSize={9.5} textAnchor="start">75 bpm</text>
          <text x={width - padRight + 8} y={getHrY(55)} fill="#94a3b8" fontSize={9.5} textAnchor="start">55 bpm</text>

          {/* Subplot 2 Left Axis Labels: Steps */}
          <text x={padLeft - 8} y={envTop + 10} fill="#64748b" fontSize={9} textAnchor="end">10k</text>
          <text x={padLeft - 8} y={envTop + envH} fill="#94a3b8" fontSize={9} textAnchor="end">0</text>

          {/* Subplot 2 Right Axis Labels: Environmental Indicator */}
          <text x={width - padRight + 8} y={getEnvY(maxEnv * 0.85)} fill="#b45309" fontSize={9.5} textAnchor="start" fontWeight={600}>
            {selectedOverlay === 'weather' ? '35.0°C' : selectedOverlay === 'dust' ? '250.0 µg' : selectedOverlay === 'pollen' ? '80.0' : `${Math.round(maxEnv * 0.85)} AQI`}
          </text>
          <text x={width - padRight + 8} y={envTop + envH} fill="#94a3b8" fontSize={9} textAnchor="start">
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
              <line x1={getX(hoveredIdx)} y1={padTop} x2={getX(hoveredIdx)} y2={padTop + plotH} stroke="#1e293b" strokeWidth={1} strokeDasharray="2,2" opacity={0.6} />
              <circle cx={getX(hoveredIdx)} cy={getSpO2Y(Number(displayData[hoveredIdx].spo2 || 95))} r={4.5} fill="#0f766e" stroke="#ffffff" strokeWidth={2} />
              <circle cx={getX(hoveredIdx)} cy={getHrY(Number(displayData[hoveredIdx].resting_heart_rate || 75))} r={4.5} fill="#be123c" stroke="#ffffff" strokeWidth={2} />
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
            background: 'var(--bg-subtle)',
            borderRadius: 8,
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 12,
            flexWrap: 'wrap',
            gap: 12
          }}
        >
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Telemetry Record: </span>
            <strong style={{ color: 'var(--text-main)' }}>{hoveredData.date}</strong>
            <span style={{ color: 'var(--text-light)', marginLeft: 4 }}>(Day {hoveredData.day_number})</span>
          </div>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <span>
              SpO2: <strong style={{ color: '#0f766e' }}>{Number(hoveredData.spo2 || 95).toFixed(1)}%</strong>
            </span>
            <span>
              HR: <strong style={{ color: '#be123c' }}>{Number(hoveredData.resting_heart_rate || 75).toFixed(1)} bpm</strong>
            </span>
            <span>
              RR: <strong style={{ color: 'var(--teal-deep)' }}>{Number(hoveredData.respiratory_rate || 16).toFixed(1)} rpm</strong>
            </span>
            <span>
              Sleep: <strong style={{ color: 'var(--text-main)' }}>{Number(hoveredData.sleep_hours || 7).toFixed(1)}h</strong>
            </span>
            <span>
              Steps: <strong style={{ color: 'var(--text-main)' }}>{Math.round(Number(hoveredData.steps || 4000)).toLocaleString()}</strong>
            </span>
            <span>
              CAMS NAQI: <strong style={{ color: '#b45309' }}>{Number(hoveredData.aqi_cpcb_mean || 100).toFixed(1)}</strong>
            </span>
            {selectedOverlay === 'dust' && (
              <span>Dust: <strong style={{ color: '#b45309' }}>{Number(hoveredData.dust_mean || 30).toFixed(1)} µg/m³</strong></span>
            )}
            {selectedOverlay === 'pollen' && (
              <span>Sim. Pollen: <strong style={{ color: '#b45309' }}>{Number(hoveredData.simulated_pollen_index || 15).toFixed(1)}</strong></span>
            )}
          </div>

          {hoveredData.flare_up_next_48h === 1 && (
            <span style={{ color: 'var(--risk-coral)', fontWeight: 600, fontSize: 11.5, display: 'flex', alignItems: 'center', gap: 4 }}>
              <AlertCircle size={13} color="var(--risk-coral)" /> Impending 48h Flare Window
            </span>
          )}
        </div>
      )}

    </div>
  )
}
