import React, { useState } from 'react'
import { Stethoscope, Send, Pill, PhoneCall, ShieldAlert, Home } from 'lucide-react'

export default function DoctorActionsPanel({ patientId, onLogAction, loggedActions = [] }) {
  const [selectedPreset, setSelectedPreset] = useState('Prescribe 5-Day Oral Prednisolone Burst (30mg)')
  const [customNote, setCustomNote] = useState('')
  const [priority, setPriority] = useState('Urgent')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const PRESET_ACTIONS = [
    { title: 'Prescribe 5-Day Oral Prednisolone Burst (30mg)', icon: Pill },
    { title: 'Schedule Urgent Telehealth Review (Within 12h)', icon: PhoneCall },
    { title: 'Step-Up Inhaler (High-Dose ICS/LABA + LAMA)', icon: Pill },
    { title: 'Dispatch Community Health Worker (Oxygen Check)', icon: Home },
    { title: 'Issue Delhi Severe AQI Shelter-In-Place Advisory', icon: ShieldAlert }
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    const actionData = {
      action_type: selectedPreset,
      notes: customNote || `Standard clinical protocol initiated: ${selectedPreset}`,
      priority: priority
    }

    onLogAction(patientId, actionData).then(() => {
      setCustomNote('')
      setIsSubmitting(false)
    })
  }

  return (
    <div className="editorial-card" style={{ padding: '24px 28px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <h3 className="heading-serif" style={{ fontSize: 18 }}>
            Clinical Order Protocols
          </h3>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Proactive Triage
          </span>
        </div>

        <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 12 }}>
          Initiate targeted outpatient orders to stabilize airway inflammation before acute decompensation.
        </p>

        {/* Action Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
          {PRESET_ACTIONS.map(act => {
            const isSelected = selectedPreset === act.title
            const Icon = act.icon

            return (
              <div
                key={act.title}
                onClick={() => setSelectedPreset(act.title)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '7px 10px',
                  borderRadius: 4,
                  background: isSelected ? 'var(--teal-light)' : 'var(--bg-subtle)',
                  border: isSelected ? '1px solid var(--teal-deep)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: isSelected ? 600 : 400,
                  color: isSelected ? 'var(--teal-deep)' : 'var(--text-main)',
                  transition: 'all 0.1s ease'
                }}
              >
                <Icon size={13} color={isSelected ? 'var(--teal-deep)' : 'var(--text-muted)'} />
                <span style={{ flex: 1 }}>{act.title}</span>
              </div>
            )
          })}
        </div>

        {/* Order Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              style={{
                fontSize: 11.5,
                padding: '6px 8px',
                borderRadius: 4,
                border: '1px solid var(--border-medium)',
                background: '#ffffff',
                fontWeight: 600,
                color: priority === 'Emergency' ? 'var(--risk-coral)' : 'var(--text-main)'
              }}
            >
              <option value="Urgent">Priority: Urgent</option>
              <option value="Emergency">Priority: Emergency</option>
              <option value="Routine">Priority: Routine</option>
            </select>

            <input
              type="text"
              placeholder="Clinical instruction or notes..."
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              style={{
                flex: 1,
                fontSize: 12,
                padding: '6px 10px',
                borderRadius: 4,
                border: '1px solid var(--border-medium)',
                outline: 'none',
                background: '#ffffff'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              background: 'var(--teal-deep)',
              color: '#ffffff',
              padding: '8px 12px',
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Send size={12} />
            <span>{isSubmitting ? 'Recording Order...' : 'Transmit Clinical Order'}</span>
          </button>
        </form>
      </div>

      {/* Logged History */}
      <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Logged Orders ({loggedActions.length})
        </span>

        <div style={{ maxHeight: 90, overflowY: 'auto', marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {loggedActions.length === 0 ? (
            <span style={{ fontSize: 11, color: 'var(--text-light)', fontStyle: 'italic' }}>
              No orders entered for this session.
            </span>
          ) : (
            loggedActions.map(act => (
              <div key={act.action_id} style={{
                background: 'var(--bg-subtle)',
                padding: '5px 8px',
                borderRadius: 4,
                fontSize: 11,
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                  <span>{act.action_type}</span>
                  <span style={{ color: 'var(--text-light)', fontSize: 10 }}>{act.timestamp}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  )
}
