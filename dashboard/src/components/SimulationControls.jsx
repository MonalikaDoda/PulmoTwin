import React from 'react'
import { Play, Pause, FastForward, RotateCcw, AlertTriangle, Calendar, Gauge } from 'lucide-react'

export default function SimulationControls({
  currentDay = 365,
  maxDays = 365,
  currentDate = '',
  isPlaying = false,
  playbackSpeed = 1,
  onPlayToggle,
  onSpeedChange,
  onDayChange,
  onJumpToNextAlert,
  onResetToLatest,
  alertsInYear = []
}) {
  const speeds = [0.5, 1, 2, 5, 10]

  return (
    <div
      className="editorial-card"
      style={{
        padding: '16px 24px',
        marginBottom: 20,
        background: '#ffffff',
        border: '1px solid var(--border-medium)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 12
        }}
      >
        {/* Playback Controls & Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Play/Pause Button */}
          <button
            onClick={onPlayToggle}
            className="editorial-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              background: isPlaying ? 'var(--coral-wash)' : 'var(--teal-wash)',
              color: isPlaying ? 'var(--risk-coral)' : 'var(--teal-deep)',
              border: `1px solid ${isPlaying ? 'var(--risk-coral)' : 'var(--teal-mid)'}`,
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 6,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {isPlaying ? (
              <>
                <Pause size={15} fill="currentColor" /> Pause Replay
              </>
            ) : (
              <>
                <Play size={15} fill="currentColor" /> Play Simulation
              </>
            )}
          </button>

          {/* Speed Selector */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--bg-warm)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 6,
              padding: 2
            }}
          >
            <span style={{ fontSize: 11, color: 'var(--text-muted)', padding: '0 8px', fontWeight: 500 }}>
              SPEED:
            </span>
            {speeds.map((spd) => (
              <button
                key={spd}
                onClick={() => onSpeedChange(spd)}
                style={{
                  background: playbackSpeed === spd ? '#ffffff' : 'transparent',
                  color: playbackSpeed === spd ? 'var(--teal-deep)' : 'var(--text-muted)',
                  border: playbackSpeed === spd ? '1px solid var(--border-medium)' : 'none',
                  borderRadius: 4,
                  padding: '3px 8px',
                  fontSize: 11.5,
                  fontWeight: playbackSpeed === spd ? 700 : 500,
                  cursor: 'pointer',
                  boxShadow: playbackSpeed === spd ? '0 1px 3px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Jump to Next Alert */}
          <button
            onClick={onJumpToNextAlert}
            className="editorial-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'white',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-main)',
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 500,
              borderRadius: 6,
              cursor: 'pointer'
            }}
            title="Fast-forward simulation to the patient's next clinical alert or prodromal flare"
          >
            <FastForward size={14} color="var(--risk-amber)" /> Jump to Next Alert
          </button>

          {/* Reset to Today */}
          {currentDay < maxDays && (
            <button
              onClick={onResetToLatest}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: 12,
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              <RotateCcw size={12} /> Jump to Day 365 (Present)
            </button>
          )}
        </div>

        {/* Current Date & Day Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'var(--bg-warm)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 6,
              padding: '5px 12px',
              fontSize: 12.5,
              fontWeight: 500,
              color: 'var(--text-main)'
            }}
          >
            <Calendar size={13} color="var(--teal-mid)" />
            <span>
              <strong>Day {currentDay}</strong> / {maxDays} {currentDate ? `• ${currentDate}` : ''}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11.5,
              color: isPlaying ? 'var(--teal-deep)' : 'var(--text-muted)'
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: isPlaying ? 'var(--risk-green)' : 'var(--text-light)',
                boxShadow: isPlaying ? '0 0 0 2px rgba(16, 185, 129, 0.2)' : 'none'
              }}
            />
            {isPlaying ? 'Replaying year...' : 'Simulation Paused'}
          </div>
        </div>
      </div>

      {/* Scrubbing Range Slider */}
      <div style={{ position: 'relative', width: '100%', paddingTop: 4 }}>
        <input
          type="range"
          min={1}
          max={maxDays}
          value={currentDay}
          onChange={(e) => onDayChange(Number(e.target.value))}
          style={{
            width: '100%',
            height: 6,
            appearance: 'none',
            background: 'var(--border-subtle)',
            borderRadius: 3,
            outline: 'none',
            cursor: 'ew-resize',
            accentColor: 'var(--teal-deep)'
          }}
        />

        {/* Alert Markers Along the Scrubber */}
        {alertsInYear && alertsInYear.length > 0 && (
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: 10,
              marginTop: -2,
              pointerEvents: 'none'
            }}
          >
            {alertsInYear.map((alt) => {
              const leftPct = ((alt.day_number - 1) / (maxDays - 1)) * 100
              return (
                <div
                  key={alt.alert_id || alt.day_number}
                  style={{
                    position: 'absolute',
                    left: `${leftPct}%`,
                    top: 0,
                    width: 3,
                    height: 8,
                    background: 'var(--risk-coral)',
                    borderRadius: 1,
                    transform: 'translateX(-50%)',
                    opacity: 0.85
                  }}
                  title={`Alert on Day ${alt.day_number}: ${alt.primary_trigger || 'Flare warning'}`}
                />
              )
            })}
          </div>
        )}

        {/* Timeline Tick Labels */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 10.5,
            color: 'var(--text-light)',
            marginTop: 4
          }}
        >
          <span>Day 1 (Oct 2025)</span>
          <span>Day 90 (Winter Smog Peak)</span>
          <span>Day 180 (Spring Pollen)</span>
          <span>Day 270 (Monsoon Air Relief)</span>
          <span>Day 365 (Present Day)</span>
        </div>
      </div>
    </div>
  )
}
