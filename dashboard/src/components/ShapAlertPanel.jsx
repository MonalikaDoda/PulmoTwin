import React from 'react'
import { HelpCircle, ArrowUpRight, ArrowDownRight, Sparkles, CheckCircle2 } from 'lucide-react'

export default function ShapAlertPanel({ shapData, patientBaselines }) {
  if (!shapData || !shapData.top_factors) {
    return (
      <div className="clinical-card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>
          Why This Alert? (Explainable AI)
        </h3>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Calculating SHAP TreeExplainer attributions...</p>
      </div>
    )
  }

  const factors = shapData.top_factors || []

  return (
    <div className="clinical-card" style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={16} color="var(--teal-600)" />
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Why This Alert?
            </h3>
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>
            Top 3 SHAP Attributions
          </span>
        </div>

        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
          Deconstruction of today's 48-hour forecast using cooperative game theory (TreeExplainer).
        </p>

        {/* Factors List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {factors.map((f, i) => {
            const isRisk = f.shap_value > 0
            const maxMag = Math.max(2.0, ...factors.map(x => x.magnitude || 1))
            const barPct = Math.min(100, (f.magnitude / maxMag) * 100)

            return (
              <div
                key={f.feature || i}
                style={{
                  background: 'var(--bg-subtle)',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid var(--border-light)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>
                    #{i + 1} {f.friendly_name}
                  </span>
                  
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    fontSize: 11,
                    fontWeight: 700,
                    color: isRisk ? 'var(--risk-high)' : 'var(--risk-low)'
                  }}>
                    {isRisk ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                    {isRisk ? `+${f.shap_value.toFixed(2)} Risk` : `${f.shap_value.toFixed(2)} Relief`}
                  </span>
                </div>

                {/* Progress magnitude bar */}
                <div style={{ width: '100%', height: 5, background: 'var(--border-light)', borderRadius: 3, overflow: 'hidden', margin: '6px 0' }}>
                  <div style={{
                    width: `${barPct}%`,
                    height: '100%',
                    background: isRisk ? 'linear-gradient(90deg, #f97316 0%, #dc2626 100%)' : 'var(--risk-low)',
                    borderRadius: 3
                  }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)' }}>
                  <span>Current Reading: <strong>{f.feature_value}</strong></span>
                  <span>{f.impact}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Clinical Bottom Annotation */}
      <div style={{
        marginTop: 14,
        paddingTop: 10,
        borderTop: '1px solid var(--border-light)',
        fontSize: 11,
        color: 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }}>
        <CheckCircle2 size={13} color="var(--teal-600)" />
        <span>Attributions update in real-time as sensor streams and CAMS air quality update.</span>
      </div>

    </div>
  )
}
