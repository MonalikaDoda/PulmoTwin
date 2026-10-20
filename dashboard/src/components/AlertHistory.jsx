import React, { useMemo } from 'react'
import { History, AlertTriangle, CheckCircle2, BellRing, Flame } from 'lucide-react'

export default function AlertHistory({ alerts = [], currentDay = 365 }) {
  // 1. Group consecutive alert days into clinical episodes
  const { episodes, activeEpisode, pastEpisodesCount } = useMemo(() => {
    if (!alerts || alerts.length === 0) {
      return { episodes: [], activeEpisode: null, pastEpisodesCount: 0 }
    }

    // Sort alerts chronologically by day_number
    const sorted = [...alerts].sort((a, b) => (a.day_number || 0) - (b.day_number || 0))
    const grouped = []
    let curEp = null

    for (const al of sorted) {
      const dayNum = Number(al.day_number || 0)
      const risk = Number(al.risk_score || 0)

      if (curEp && dayNum === curEp.endDay + 1) {
        // Consecutive day: extend current episode
        curEp.endDay = dayNum
        curEp.endDate = al.date
        curEp.days.push(dayNum)
        curEp.alerts.push(al)
        if (risk > curEp.peakRisk) {
          curEp.peakRisk = risk
          curEp.primaryTrigger = al.primary_trigger || curEp.primaryTrigger
        }
        if (al.actual_exacerbation_followed) {
          curEp.exacerbationFollowed = true
        }
      } else {
        // Non-consecutive: push previous and start new episode
        if (curEp) grouped.push(curEp)
        curEp = {
          id: `ep-${dayNum}`,
          startDay: dayNum,
          endDay: dayNum,
          startDate: al.date,
          endDate: al.date,
          days: [dayNum],
          alerts: [al],
          peakRisk: risk,
          primaryTrigger: al.primary_trigger || 'Elevated risk biomarkers',
          exacerbationFollowed: !!al.actual_exacerbation_followed
        }
      }
    }
    if (curEp) grouped.push(curEp)

    // Filter by currentDay for live playback audit log
    const past = grouped.filter(ep => ep.startDay <= currentDay)
    const active = grouped.find(ep => currentDay >= ep.startDay && currentDay <= ep.endDay)

    return {
      episodes: past,
      activeEpisode: active,
      pastEpisodesCount: past.length
    }
  }, [alerts, currentDay])

  return (
    <div className="editorial-card" style={{ padding: '24px 28px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Title & Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
        <h3 className="heading-serif" style={{ fontSize: 18, margin: 0 }}>
          Alert History & Episode Log
        </h3>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {pastEpisodesCount} clinical {pastEpisodesCount === 1 ? 'episode' : 'episodes'} logged (up to Day {currentDay})
        </span>
      </div>

      <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 14 }}>
        Chronological record of multi-day exacerbation warnings grouped into clinical episodes.
      </p>

      {/* Active Alert Banner if on an active episode day */}
      {activeEpisode && (
        <div
          style={{
            background: 'var(--coral-wash)',
            border: '1px solid var(--risk-coral)',
            borderRadius: 8,
            padding: '10px 14px',
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            animation: 'pulse 2s infinite'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BellRing size={16} color="var(--risk-coral)" />
            <div style={{ fontSize: 12, color: 'var(--risk-coral)', fontWeight: 600 }}>
              Active Episode on Day {currentDay}: Peak {activeEpisode.peakRisk.toFixed(1)}% Risk ({activeEpisode.primaryTrigger})
            </div>
          </div>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--risk-coral)', background: 'white', padding: '2px 7px', borderRadius: 4 }}>
            DAY {currentDay} OF {activeEpisode.startDay === activeEpisode.endDay ? '1' : `${activeEpisode.days.length}`}
          </span>
        </div>
      )}

      {/* Episodes List */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 320, paddingRight: 4 }}>
        {episodes.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12.5 }}>
            No prior exacerbation episodes logged up to Day {currentDay}.
          </div>
        ) : (
          episodes.map((ep) => {
            const isMultiDay = ep.startDay !== ep.endDay
            const isActiveNow = currentDay >= ep.startDay && currentDay <= ep.endDay
            const dateLabel = isMultiDay ? `${ep.startDate} – ${ep.endDate}` : ep.startDate
            const durationLabel = isMultiDay ? `${ep.days.length}-day episode` : 'Single-day alert'

            // Position percentage in the 365-day year
            const stripLeftPct = Math.max(0, Math.min(100, (ep.startDay / 365) * 100))
            const stripWidthPct = Math.max(1.5, Math.min(100, ((ep.endDay - ep.startDay + 1) / 365) * 100))

            return (
              <div
                key={ep.id}
                style={{
                  background: isActiveNow ? 'var(--coral-wash)' : 'var(--bg-subtle)',
                  border: `1px solid ${isActiveNow ? 'var(--risk-coral)' : 'var(--border-subtle)'}`,
                  borderRadius: 8,
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6
                }}
              >
                {/* Header row: Date, duration badge & Peak Risk */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <strong style={{ fontSize: 12.5, color: 'var(--text-main)' }}>
                      {dateLabel}
                    </strong>
                    <span
                      style={{
                        fontSize: 10.5,
                        background: 'rgba(0,0,0,0.05)',
                        padding: '1px 6px',
                        borderRadius: 3,
                        color: 'var(--text-muted)'
                      }}
                    >
                      {durationLabel} (Days {ep.startDay}–{ep.endDay})
                    </span>
                    {isActiveNow && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--risk-coral)', background: '#ffffff', padding: '1px 5px', borderRadius: 3, border: '1px solid var(--risk-coral)' }}>
                        CURRENT
                      </span>
                    )}
                  </div>

                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: ep.peakRisk >= 50 ? 'var(--risk-coral)' : 'var(--teal-deep)'
                    }}
                  >
                    Peak {ep.peakRisk.toFixed(1)}% Risk
                  </span>
                </div>

                {/* Primary trigger */}
                <div style={{ fontSize: 11.5, color: 'var(--text-main)' }}>
                  Trigger: <span style={{ color: 'var(--text-muted)' }}>{ep.primaryTrigger}</span>
                </div>

                {/* Outcome & Small 365-day Timeline Strip */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: ep.exacerbationFollowed ? 'var(--risk-coral)' : 'var(--teal-mid)' }}>
                    {ep.exacerbationFollowed ? (
                      <>
                        <Flame size={12} color="var(--risk-coral)" />
                        <span>Acute flare onset verified within 48h</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={12} color="var(--teal-mid)" />
                        <span>Early intervention / Spontaneous resolution</span>
                      </>
                    )}
                  </div>

                  {/* Small Timeline Strip (365d span) */}
                  <div
                    title={`Day ${ep.startDay} to ${ep.endDay} of 365`}
                    style={{
                      width: 110,
                      height: 6,
                      background: '#e2e8f0',
                      borderRadius: 3,
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        left: `${stripLeftPct}%`,
                        width: `${stripWidthPct}%`,
                        height: '100%',
                        background: ep.peakRisk >= 50 ? 'var(--risk-coral)' : 'var(--teal-mid)',
                        borderRadius: 2
                      }}
                    />
                  </div>
                </div>

              </div>
            )
          })
        )}
      </div>

    </div>
  )
}
