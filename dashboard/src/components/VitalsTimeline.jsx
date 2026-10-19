import React, { useState } from 'react'
import { Activity, Wind, Eye } from 'lucide-react'

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
      <div className="editorial-card" style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading continuous telemetry history...
      </div>
    )
  }

  // Window data up to active simulation day
  const activeDayNumber = currentDay !== null && currentDay !== undefined ? currentDay : 365
  const upToActive = history.filter(d => (d.day_number || 0) <= activeDayNumber)
  const displayData = upToActive.length > 0 ? upToActive.slice(-activeHorizon) : history.slice(-activeHorizon)
  const nPoints = displayData.length

  const width = 860
  const height = 300
  const padLeft = 44
  const padRight = 50
  const padTop = 20
  const padBottom = 26
  const plotW = width - padLeft - padRight
  const plotH = height - padTop - padBottom

  const getX = (idx) => padLeft + (idx / Math.max(1, nPoints - 1)) * plotW

  // Subplot 1: SpO2 (84 to 100) -> top half
  const spo2Top = padTop
  const spo2H = plotH * 0.44
  const getSpO2Y = (val) => spo2Top + spo2H - ((val - 84) / (100 - 84)) * spo2H
  const getHrY = (val) => spo2Top + spo2H - ((val - 50) / (130 - 50)) * spo2H

  // Subplot 2: Env / Steps -> bottom half
  const envTop = padTop + plotH * 0.56
  const envH = plotH * 0.44
  const maxEnv = Math.max(300, ...displayData.map(d => d.aqi_cpcb_mean || 100))
  const getEnvY = (val) => envTop + envH - ((val - 0) / (maxEnv - 0)) * envH

  const createPath = (fn) => {
    return displayData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${fn(d).toFixed(1)}`).join(' ')
  }

  const pathSpO2 = createPath(d => getSpO2Y(d.spo2))
  const pathHR = createPath(d => getHrY(d.resting_heart_rate))
  const pathEnv = createPath(d => {
    if (selectedOverlay === 'dust') return getEnvY(d.dust_mean || 30)
    if (selectedOverlay === 'pollen') return getEnvY((d.simulated_pollen_index || 15) * 3)
    if (selectedOverlay === 'weather') return getEnvY((d.temperature_2m_mean || 25) * 8)
    return getEnvY(d.aqi_cpcb_mean || 100)
  })

  const hoveredData = hoveredIdx !== null ? displayData[hoveredIdx] : displayData[displayData.length - 1]

  return (
    <div className="editorial-card" style={{ padding: '24px 28px', marginBottom: 20 }}>
      
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 16 }}>
        <div>
          <h3 className="heading-serif" style={{ fontSize: 18 }}>
            Longitudinal Telemetry & Atmospheric Alignment
          </h3>
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
            Fused daily multi-sensor vitals with Open-Meteo CAMS air quality and ERA5 weather
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          
          {/* Overlay Selector */}
          <div style={{ display: 'flex', background: 'var(--bg-subtle)', padding: 2, borderRadius: 6, fontSize: 11 }}>
            {[
              { id: 'aqi', label: 'CAMS AQI' },
              { id: 'dust', label: 'Dust' },
              { id: 'weather', label: 'Temp (C)' },
              { id: 'pollen', label: 'Pollen (Sim)' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedOverlay(tab.id)}
                style={{
                  padding: '3px 9px',
                  borderRadius: 4,
                  fontWeight: 500,
                  background: selectedOverlay === tab.id ? '#ffffff' : 'transparent',
                  color: selectedOverlay === tab.id ? 'var(--text-main)' : 'var(--text-muted)',
                  border: selectedOverlay === tab.id ? '1px solid var(--border-subtle)' : '1px solid transparent'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Horizon Selector */}
          <div style={{ display: 'flex', background: 'var(--bg-subtle)', padding: 2, borderRadius: 6, fontSize: 11 }}>
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
                  fontWeight: 600,
                  background: activeHorizon === h.days ? 'var(--teal-deep)' : 'transparent',
                  color: activeHorizon === h.days ? '#ffffff' : 'var(--text-muted)'
                }}
              >
                {h.label}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* SVG Timeline Canvas */}
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', display: 'block' }}
          onMouseLeave={() => setHoveredIdx(null)}
        >
          {/* Subtle Grid Dividers */}
          <line x1={padLeft} y1={spo2Top} x2={width - padRight} y2={spo2Top} stroke="#e8e5df" strokeDasharray="3,3" />
          <line x1={padLeft} y1={spo2Top + spo2H} x2={width - padRight} y2={spo2Top + spo2H} stroke="#d8d4cc" />
          <line x1={padLeft} y1={envTop} x2={width - padRight} y2={envTop} stroke="#e8e5df" strokeDasharray="3,3" />
          <line x1={padLeft} y1={envTop + envH} x2={width - padRight} y2={envTop + envH} stroke="#d8d4cc" />

          {/* Shaded 48h Warning Alert Windows */}
          {displayData.map((d, i) => {
            if (d.flare_up_next_48h === 1) {
              const x1 = getX(i) - (plotW / nPoints / 2)
              const w = plotW / nPoints
              return (
                <rect key={`alert-${i}`} x={x1} y={padTop} width={w} height={plotH} fill="#fef08a" opacity="0.38" />
              )
            }
            return null
          })}

          {/* Acute Flare Onset Markers */}
          {displayData.map((d, i) => {
            if (d.flare_up_onset === 1) {
              const x = getX(i)
              return (
                <g key={`flare-${i}`}>
                  <line x1={x} y1={padTop} x2={x} y2={padTop + plotH} stroke="var(--risk-coral)" strokeWidth={1.8} />
                  <circle cx={x} cy={padTop + 4} r={3.5} fill="var(--risk-coral)" />
                </g>
              )
            }
            return null
          })}

          {/* Active Simulation Scrubber Cursor */}
          {(() => {
            const activePointIdx = displayData.findIndex(d => d.day_number === activeDayNumber)
            const activeX = activePointIdx !== -1 ? getX(activePointIdx) : getX(displayData.length - 1)
            return (
              <g>
                <line x1={activeX} y1={padTop} x2={activeX} y2={padTop + plotH} stroke="var(--teal-deep)" strokeWidth={2} strokeDasharray="4,3" />
                <rect x={activeX - 32} y={padTop - 14} width={64} height={15} rx={3} fill="var(--teal-deep)" />
                <text x={activeX} y={padTop - 3} textAnchor="middle" fontSize={9} fontWeight={700} fill="#ffffff">
                  Day {activeDayNumber}
                </text>
              </g>
            )
          })()}

          {/* Baseline SpO2 dashed line */}
          {patientBaselines.baseline_spo2 && (
            <line
              x1={padLeft}
              y1={getSpO2Y(patientBaselines.baseline_spo2)}
              x2={width - padRight}
              y2={getSpO2Y(patientBaselines.baseline_spo2)}
              stroke="var(--teal-deep)"
              strokeWidth={1.2}
              strokeDasharray="4,4"
              opacity={0.5}
            />
          )}

          {/* Steps Bars */}
          {displayData.map((d, i) => {
            const barW = Math.max(1.5, (plotW / nPoints) * 0.55)
            const stepH = Math.min(envH, ((d.steps || 4000) / 12000) * envH)
            const x = getX(i) - barW / 2
            const y = envTop + envH - stepH
            return (
              <rect key={`step-${i}`} x={x} y={y} width={barW} height={stepH} fill="#8a9491" opacity="0.3" rx={1} />
            )
          })}

          {/* Environmental Overlay Line */}
          <path d={pathEnv} fill="none" stroke="#d97706" strokeWidth={2} strokeLinecap="round" />

          {/* Resting HR Line */}
          <path d={pathHR} fill="none" stroke="#be123c" strokeWidth={1.5} strokeDasharray="3,2" opacity={0.7} />

          {/* SpO2 Line */}
          <path d={pathSpO2} fill="none" stroke="var(--teal-deep)" strokeWidth={2.4} strokeLinecap="round" />

          {/* Y Axis Labels */}
          <text x={padLeft - 6} y={getSpO2Y(98)} fill="var(--teal-deep)" fontSize={9} textAnchor="end" fontWeight={600}>98%</text>
          <text x={padLeft - 6} y={getSpO2Y(90)} fill="var(--risk-coral)" fontSize={9} textAnchor="end" fontWeight={600}>90%</text>
          <text x={width - padRight + 6} y={getHrY(105)} fill="#be123c" fontSize={9} textAnchor="start">105 bpm</text>
          <text x={width - padRight + 6} y={getHrY(70)} fill="#be123c" fontSize={9} textAnchor="start">70 bpm</text>
          <text x={width - padRight + 6} y={getEnvY(maxEnv * 0.85)} fill="#d97706" fontSize={9} textAnchor="start">
            {selectedOverlay === 'weather' ? '35°C' : selectedOverlay === 'dust' ? '200 ug' : selectedOverlay === 'pollen' ? '75 pol' : '300 AQI'}
          </text>

          {/* Mouse Hitboxes */}
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

          {/* Hover Indicator */}
          {hoveredIdx !== null && (
            <g>
              <line x1={getX(hoveredIdx)} y1={padTop} x2={getX(hoveredIdx)} y2={padTop + plotH} stroke="#18201e" strokeWidth={1} strokeDasharray="2,2" />
              <circle cx={getX(hoveredIdx)} cy={getSpO2Y(displayData[hoveredIdx].spo2)} r={4} fill="var(--teal-deep)" stroke="#ffffff" strokeWidth={1.5} />
            </g>
          )}

          {/* Dates */}
          <text x={padLeft} y={height - 6} fill="#8a9491" fontSize={9.5} textAnchor="start">{displayData[0]?.date}</text>
          <text x={width - padRight} y={height - 6} fill="#8a9491" fontSize={9.5} textAnchor="end">{displayData[nPoints - 1]?.date}</text>
        </svg>
      </div>

      {/* Hover Readout Bar */}
      {hoveredData && (
        <div style={{
          marginTop: 12,
          padding: '8px 14px',
          background: 'var(--bg-subtle)',
          borderRadius: 6,
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 12,
          flexWrap: 'wrap',
          gap: 10
        }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Date: </span>
            <strong>{hoveredData.date}</strong> (Day {hoveredData.day_number})
          </div>

          <div style={{ display: 'flex', gap: 14 }}>
            <span>SpO2: <strong style={{ color: 'var(--teal-deep)' }}>{hoveredData.spo2}%</strong></span>
            <span>HR: <strong>{hoveredData.resting_heart_rate} bpm</strong></span>
            <span>RR: <strong>{hoveredData.respiratory_rate} rpm</strong></span>
            <span>Sleep: <strong>{hoveredData.sleep_hours}h</strong></span>
            <span>Steps: <strong>{hoveredData.steps?.toLocaleString()}</strong></span>
            <span>CAMS NAQI: <strong style={{ color: '#d97706' }}>{hoveredData.aqi_cpcb_mean}</strong></span>
          </div>

          {hoveredData.flare_up_next_48h === 1 && (
            <span style={{ color: 'var(--risk-coral)', fontWeight: 600, fontSize: 11 }}>
              ⚠️ Impending Exacerbation Window
            </span>
          )}
        </div>
      )}

    </div>
  )
}
