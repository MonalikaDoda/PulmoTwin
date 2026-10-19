import React from 'react'
import { History, AlertTriangle, CheckCircle2, BellRing } from 'lucide-react'

export default function AlertHistory({ alerts = [], currentDay = 365 }) {
  // Separate alerts into active (matching currentDay), past (<= currentDay), and future (> currentDay)
  const currentDayAlert = alerts.find(a => a.day_number === currentDay)
  const pastAlerts = alerts.filter(a => a.day_number <= currentDay)
  const upcomingAlertsCount = alerts.filter(a => a.day_number > currentDay).length

  return (
    <div className="editorial-card" style={{ padding: '24px 28px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <h3 className="heading-serif" style={{ fontSize: 18, margin: 0 }}>
          Alert History
        </h3>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          365-Day Log ({pastAlerts.length} past{upcomingAlertsCount > 0 ? `, ${upcomingAlertsCount} ahead` : ''})
        </span>
      </div>

      <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 12 }}>
        Chronological audit of 48-hour early warning notifications triggered for this patient.
      </p>

      {/* Active Alert Banner if on an alert day */}
      {currentDayAlert && (
        <div
          style={{
            background: 'var(--coral-wash)',
            border: '1px solid var(--risk-coral)',
            borderRadius: 6,
            padding: '10px 12px',
            marginBottom: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            animation: 'pulse 2s infinite'
          }}
        >
          <BellRing size={16} color="var(--risk-coral)" />
          <div style={{ fontSize: 12, color: 'var(--risk-coral)', fontWeight: 600 }}>
            Active Alert on Day {currentDay}: {currentDayAlert.risk_score}% Risk ({currentDayAlert.primary_trigger})
          </div>
        </div>
      )}

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 310 }}>
        {pastAlerts.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
            No prior exacerbation alerts triggered up to Day {currentDay}.
          </div>
        ) : (
          pastAlerts.map((al, idx) => {
            const followed = al.actual_exacerbation_followed
            const isToday = al.day_number === currentDay

            return (
              <div
                key={al.alert_id || idx}
                style={{
                  background: isToday ? 'var(--coral-wash)' : 'var(--bg-subtle)',
                  border: `1px solid ${isToday ? 'var(--risk-coral)' : 'var(--border-subtle)'}`,
                  borderRadius: 4,
                  padding: '8px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <strong style={{ fontSize: 12, color: 'var(--text-main)' }}>{al.date}</strong>
                    <span style={{ fontSize: 10.5, color: 'var(--text-light)' }}>(Day {al.day_number})</span>
                    {isToday && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--risk-coral)', background: 'white', padding: '1px 5px', borderRadius: 3 }}>
                        CURRENT DAY
                      </span>
                    )}
                  </div>

                  <span style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: followed ? 'var(--risk-coral)' : 'var(--teal-deep)'
                  }}>
                    {al.risk_score}% Risk
                  </span>
                </div>

                <div style={{ fontSize: 11.5, color: 'var(--text-main)' }}>
                  Trigger: <span style={{ color: 'var(--text-muted)' }}>{al.primary_trigger}</span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 10.5,
                  color: followed ? 'var(--risk-coral)' : 'var(--teal-deep)',
                  fontWeight: 500,
                  marginTop: 2
                }}>
                  {followed ? (
                    <>
                      <AlertTriangle size={11} color="var(--risk-coral)" />
                      <span>Exacerbation developed within 48h (Validated)</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={11} color="var(--teal-deep)" />
                      <span>Averted with early intervention</span>
                    </>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

    </div>
  )
}
