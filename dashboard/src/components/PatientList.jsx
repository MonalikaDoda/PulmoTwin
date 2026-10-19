import React, { useState } from 'react'
import { Search, ChevronRight } from 'lucide-react'

export default function PatientList({ patients = [], selectedPatientId, onSelectPatient }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [conditionFilter, setConditionFilter] = useState('ALL')
  const [riskFilter, setRiskFilter] = useState('ALL')

  const filtered = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.patient_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.delhi_zone.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCond = conditionFilter === 'ALL' || p.condition === conditionFilter
    const matchesRisk = riskFilter === 'ALL' || 
                        (riskFilter === 'HIGH_ALERT' ? p.flare_impending_48h : p.risk_level === riskFilter)
    
    return matchesSearch && matchesCond && matchesRisk
  })

  return (
    <div className="editorial-card" style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
        <div>
          <h3 className="heading-serif" style={{ fontSize: 18 }}>
            Cohort Triage
          </h3>
          <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
            Ranked by 48h Risk
          </span>
        </div>
        <span style={{ fontSize: 11, color: 'var(--text-light)', fontWeight: 500 }}>
          {filtered.length} of {patients.length} Pts
        </span>
      </div>

      {/* Search Input */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: 'var(--bg-subtle)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 6,
        padding: '6px 10px',
        marginBottom: 8
      }}>
        <Search size={13} color="var(--text-light)" style={{ marginRight: 6 }} />
        <input
          type="text"
          placeholder="Filter by name, ID, or zone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            border: 'none',
            background: 'transparent',
            outline: 'none',
            fontSize: 12,
            width: '100%',
            color: 'var(--text-main)'
          }}
        />
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        <div style={{ display: 'flex', background: 'var(--bg-subtle)', padding: 2, borderRadius: 4, fontSize: 11 }}>
          {['ALL', 'COPD', 'Asthma'].map(c => (
            <button
              key={c}
              onClick={() => setConditionFilter(c)}
              style={{
                padding: '2px 7px',
                borderRadius: 3,
                fontWeight: conditionFilter === c ? 600 : 400,
                background: conditionFilter === c ? '#ffffff' : 'transparent',
                color: conditionFilter === c ? 'var(--text-main)' : 'var(--text-muted)',
                border: conditionFilter === c ? '1px solid var(--border-subtle)' : 'none'
              }}
            >
              {c}
            </button>
          ))}
        </div>

        <button
          onClick={() => setRiskFilter(riskFilter === 'HIGH_ALERT' ? 'ALL' : 'HIGH_ALERT')}
          style={{
            padding: '2px 8px',
            borderRadius: 4,
            fontSize: 11,
            fontWeight: 600,
            background: riskFilter === 'HIGH_ALERT' ? 'var(--risk-coral-bg)' : 'var(--bg-subtle)',
            color: riskFilter === 'HIGH_ALERT' ? 'var(--risk-coral)' : 'var(--text-muted)',
            border: riskFilter === 'HIGH_ALERT' ? '1px solid #fecaca' : '1px solid var(--border-subtle)'
          }}
        >
          Alerts
        </button>
      </div>

      {/* Patient List Rows */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {filtered.map(p => {
          const isSelected = p.patient_id === selectedPatientId
          const isHigh = p.risk_score >= 50

          return (
            <div
              key={p.patient_id}
              onClick={() => onSelectPatient(p.patient_id)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 10px',
                borderRadius: 4,
                background: isSelected ? 'var(--teal-light)' : 'transparent',
                border: isSelected ? '1px solid var(--teal-deep)' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'background 0.1s ease'
              }}
              onMouseOver={(e) => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-subtle)' }}
              onMouseOut={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
            >
              <div>
                <div style={{ fontSize: 12.5, fontWeight: isSelected ? 600 : 500, color: 'var(--text-main)' }}>
                  {p.name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-light)' }}>
                  {p.patient_id} • {p.condition} • {p.delhi_zone}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: isHigh ? 'var(--risk-coral)' : 'var(--teal-deep)'
                }}>
                  {p.risk_score.toFixed(0)}%
                </span>
                <ChevronRight size={13} color={isSelected ? 'var(--teal-deep)' : 'var(--border-medium)'} />
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}
