import React from 'react'
import { MapPin, Pill, Activity, AlertCircle, Heart, Moon, Wind } from 'lucide-react'

export default function PatientHeader({ patient, riskInfo }) {
  if (!patient) return null

  const isAlert = riskInfo?.risk_score >= 50

  return (
    <div className="editorial-card" style={{ padding: '22px 28px', marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        
        {/* Left: Patient Demographics & Staging */}
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
            <h2 className="heading-serif" style={{ fontSize: 26, color: 'var(--text-serif)' }}>
              {patient.name}
            </h2>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {patient.patient_id} • {patient.age}y {patient.sex}
            </span>
            <span style={{
              fontSize: 12,
              fontWeight: 600,
              padding: '2px 9px',
              borderRadius: 4,
              background: patient.condition === 'COPD' ? '#f0fdf4' : '#faf5ff',
              color: patient.condition === 'COPD' ? '#166534' : '#6b21a8',
              border: `1px solid ${patient.condition === 'COPD' ? '#bbf7d0' : '#e9d5ff'}`
            }}>
              {patient.condition}: {patient.severity_stage}
            </span>

            {isAlert && (
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 4,
                background: 'var(--risk-coral)',
                color: '#ffffff'
              }}>
                <AlertCircle size={12} />
                ALERT WINDOW ACTIVE
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 6, fontSize: 12.5, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <MapPin size={13} color="var(--teal-deep)" />
              {patient.delhi_zone} Zone ({patient.latitude}°N, {patient.longitude}°E)
            </span>
            <span>•</span>
            <span>
              Smoking: <strong>{patient.smoking_status} ({patient.pack_years} pack-years)</strong>
            </span>
            <span>•</span>
            <span>
              Past Exacerbations (12m): <strong>{patient.past_flare_ups_year}</strong>
            </span>
            <span>•</span>
            <span>
              Baseline Adherence: <strong>{Math.round(patient.baseline_adherence * 100)}%</strong>
            </span>
          </div>
        </div>

        {/* Right: Personal Physiological Baselines Strip */}
        <div style={{
          display: 'flex',
          gap: 16,
          background: 'var(--bg-subtle)',
          padding: '8px 16px',
          borderRadius: 6,
          border: '1px solid var(--border-subtle)',
          fontSize: 11.5
        }}>
          <div>
            <span style={{ color: 'var(--text-light)', display: 'block' }}>Base SpO2</span>
            <strong style={{ color: 'var(--text-main)', fontSize: 13 }}>{Number(patient.baseline_spo2 || 95).toFixed(1)}%</strong>
          </div>
          <div style={{ width: 1, background: 'var(--border-medium)' }} />
          <div>
            <span style={{ color: 'var(--text-light)', display: 'block' }}>Base HR</span>
            <strong style={{ color: 'var(--text-main)', fontSize: 13 }}>{Number(patient.baseline_heart_rate || 75).toFixed(1)} bpm</strong>
          </div>
          <div style={{ width: 1, background: 'var(--border-medium)' }} />
          <div>
            <span style={{ color: 'var(--text-light)', display: 'block' }}>Base RR</span>
            <strong style={{ color: 'var(--text-main)', fontSize: 13 }}>{Number(patient.baseline_resp_rate || 16).toFixed(1)} rpm</strong>
          </div>
          <div style={{ width: 1, background: 'var(--border-medium)' }} />
          <div>
            <span style={{ color: 'var(--text-light)', display: 'block' }}>Base Sleep</span>
            <strong style={{ color: 'var(--text-main)', fontSize: 13 }}>{Number(patient.baseline_sleep_hours || 7).toFixed(1)}h</strong>
          </div>
          <div style={{ width: 1, background: 'var(--border-medium)' }} />
          <div>
            <span style={{ color: 'var(--text-light)', display: 'block' }}>Base Steps</span>
            <strong style={{ color: 'var(--text-main)', fontSize: 13 }}>{Math.round(Number(patient.baseline_steps || 5000)).toLocaleString()}</strong>
          </div>
        </div>

      </div>

      {/* Regimen & Comorbidities Line */}
      <div style={{
        marginTop: 12,
        paddingTop: 10,
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 12,
        color: 'var(--text-muted)',
        flexWrap: 'wrap',
        gap: 8
      }}>
        <div>
          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Active Inhaler Regimen:</span> {patient.medications}
        </div>
        <div>
          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Comorbidities:</span> {patient.comorbidities || 'None documented'}
        </div>
      </div>
    </div>
  )
}
