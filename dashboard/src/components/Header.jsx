import React from 'react'
import { Activity, BookOpen, AlertCircle, ShieldCheck } from 'lucide-react'

export default function Header({ onOpenDrawer, isBackendOnline }) {
  return (
    <header style={{
      background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Top Disclaimer Banner */}
      <div style={{
        background: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        padding: '6px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        fontSize: 12,
        color: 'var(--text-muted)',
        letterSpacing: '0.01em'
      }}>
        <AlertCircle size={13} color="var(--teal-mid)" />
        <span>Research prototype using synthetic patient data. Not a diagnostic tool.</span>
      </div>

      {/* Main Navigation Bar */}
      <div style={{
        padding: '14px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        
        {/* Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 6,
            background: 'var(--teal-deep)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff'
          }}>
            <Activity size={20} strokeWidth={2} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span className="font-serif" style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-serif)', letterSpacing: '-0.02em' }}>
                PulmoTwin
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                Edition 2.0
              </span>
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
              Respiratory Digital Twin • 48-hour flare-up forecast
            </p>
          </div>
        </div>

        {/* Right Controls: Engine Status & Model Drawer Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Status Dot */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            color: isBackendOnline ? 'var(--teal-mid)' : '#b91c1c'
          }}>
            <span style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: isBackendOnline ? 'var(--teal-mid)' : '#e11d48',
              display: 'inline-block'
            }} />
            <span style={{ fontWeight: 500 }}>
              {isBackendOnline ? 'Model Engine Connected' : 'Connecting to API...'}
            </span>
          </div>

          <div style={{ width: 1, height: 20, background: 'var(--border-subtle)' }} />

          {/* Model & Validation Drawer Button */}
          <button
            onClick={onOpenDrawer}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              background: 'transparent',
              border: '1px solid var(--border-medium)',
              borderRadius: 6,
              padding: '6px 12px',
              fontSize: 12.5,
              fontWeight: 500,
              color: 'var(--text-main)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-subtle)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <BookOpen size={14} color="var(--teal-deep)" />
            <span>Model & validation</span>
          </button>
        </div>

      </div>
    </header>
  )
}
