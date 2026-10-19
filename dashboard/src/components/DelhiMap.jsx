import React from 'react'
import { MapPin, Wind, Thermometer } from 'lucide-react'

export default function DelhiMap({ stations = [], selectedPatient, dayNumber = null, currentDate = '' }) {
  const minLat = 28.52
  const maxLat = 28.84
  const minLon = 77.02
  const maxLon = 77.34

  const mapW = 440
  const mapH = 300

  const getMapX = (lon) => {
    return ((lon - minLon) / (maxLon - minLon)) * (mapW - 80) + 40
  }

  const getMapY = (lat) => {
    return mapH - (((lat - minLat) / (maxLat - minLat)) * (mapH - 60) + 30)
  }

  const getAqiColor = (aqi) => {
    if (aqi > 300) return '#be123c' // Coral / Crimson
    if (aqi > 200) return '#ea580c' // Orange
    if (aqi > 100) return '#d97706' // Amber
    return '#0f766e' // Deep Teal
  }

  return (
    <div className="editorial-card" style={{ padding: '24px 28px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <h3 className="heading-serif" style={{ fontSize: 18, margin: 0 }}>
            Delhi NCR Atmospheric Map
          </h3>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>
            {dayNumber ? `Day ${dayNumber} ${currentDate ? `(${currentDate})` : ''} • 5 CAMS Stations` : '5 CAMS Stations'}
          </span>
        </div>

        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
          Copernicus CAMS NAQI readings aligned to patient residential location.
        </p>

        {/* Canvas Map */}
        <div style={{
          position: 'relative',
          width: '100%',
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 8,
          overflow: 'hidden'
        }}>
          <svg viewBox={`0 0 ${mapW} ${mapH}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
            
            {/* Outline */}
            <path
              d="M 50 110 C 100 45, 230 35, 350 75 C 410 115, 430 215, 380 275 C 300 305, 170 295, 80 245 Z"
              fill="#ffffff"
              stroke="#e8e5df"
              strokeWidth={1.2}
            />

            {/* Yamuna Curve */}
            <path
              d="M 270 20 Q 285 100 260 170 T 300 300"
              fill="none"
              stroke="#bae6fd"
              strokeWidth={3.5}
              strokeLinecap="round"
            />

            {/* Stations */}
            {stations.map((st) => {
              const x = getMapX(st.longitude)
              const y = getMapY(st.latitude)
              const aqiCol = getAqiColor(st.cpcb_aqi)
              const isPatientStation = selectedPatient?.delhi_zone === st.station

              return (
                <g key={st.station}>
                  <circle cx={x} cy={y} r={isPatientStation ? 18 : 12} fill={aqiCol} opacity={0.15} />
                  <circle cx={x} cy={y} r={isPatientStation ? 6 : 4.5} fill={aqiCol} stroke="#ffffff" strokeWidth={1.5} />
                  
                  <rect
                    x={x - 36}
                    y={y + 8}
                    width={72}
                    height={18}
                    rx={3}
                    fill="#ffffff"
                    stroke="#e8e5df"
                    strokeWidth={1}
                  />
                  <text
                    x={x}
                    y={y + 20}
                    textAnchor="middle"
                    fontSize={9}
                    fontWeight={600}
                    fill="var(--text-main)"
                  >
                    {st.station}: {st.cpcb_aqi}
                  </text>
                </g>
              )
            })}

            {/* Patient Pin */}
            {selectedPatient && (
              <g>
                {(() => {
                  const px = getMapX(selectedPatient.longitude)
                  const py = getMapY(selectedPatient.latitude)
                  return (
                    <g>
                      <circle cx={px} cy={py} r={14} fill="var(--teal-deep)" opacity={0.25} className="pulse-badge" />
                      <circle cx={px} cy={py} r={6} fill="var(--teal-deep)" stroke="#ffffff" strokeWidth={2} />
                      
                      <rect
                        x={px - 50}
                        y={py - 26}
                        width={100}
                        height={20}
                        rx={4}
                        fill="var(--teal-deep)"
                      />
                      <text
                        x={px}
                        y={py - 13}
                        textAnchor="middle"
                        fontSize={9}
                        fontWeight={600}
                        fill="#ffffff"
                      >
                        📍 {selectedPatient.patient_id} ({selectedPatient.name.split(' ')[0]})
                      </text>
                    </g>
                  )
                })()}
              </g>
            )}

          </svg>
        </div>

        {/* Stations Mini Readout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 6, marginTop: 10 }}>
          {stations.map(st => (
            <div
              key={st.station}
              style={{
                background: selectedPatient?.delhi_zone === st.station ? 'var(--bg-subtle)' : '#ffffff',
                border: `1px solid ${selectedPatient?.delhi_zone === st.station ? 'var(--teal-deep)' : 'var(--border-subtle)'}`,
                padding: '6px 8px',
                borderRadius: 4,
                fontSize: 11
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                <span>{st.station}</span>
                <span style={{ color: getAqiColor(st.cpcb_aqi) }}>{st.cpcb_aqi}</span>
              </div>
              <div style={{ color: 'var(--text-light)', fontSize: 10 }}>
                PM2.5: {st.pm2_5} • {st.temperature_c}°C
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        marginTop: 10,
        paddingTop: 8,
        borderTop: '1px solid var(--border-subtle)',
        fontSize: 10.5,
        color: 'var(--text-light)'
      }}>
        *Data Source: Open-Meteo CAMS Modelled Data converted to CPCB NAQI.
      </div>

    </div>
  )
}
