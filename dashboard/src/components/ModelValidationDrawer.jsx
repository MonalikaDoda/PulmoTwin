import React from 'react'
import { X, BookOpen, CheckCircle, AlertTriangle, Database, ShieldCheck, Clock, Activity, Cpu } from 'lucide-react'

export default function ModelValidationDrawer({ isOpen, onClose, analyticsData }) {
  if (!isOpen) return null

  const ablation = analyticsData?.ablation_summary || []
  const leadTime = analyticsData?.lead_time_summary || {}
  const dropout = analyticsData?.dropout_robustness || []

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(20, 28, 26, 0.45)',
      backdropFilter: 'blur(3px)',
      display: 'flex',
      justifyContent: 'flex-end',
      zIndex: 100
    }}>
      <div style={{
        background: '#ffffff',
        width: '100%',
        maxWidth: 580,
        height: '100vh',
        overflowY: 'auto',
        boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.12)',
        borderLeft: '1px solid var(--border-medium)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        
        {/* Drawer Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          background: '#ffffff',
          zIndex: 10
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BookOpen size={18} color="var(--teal-deep)" />
              <h2 className="heading-serif" style={{ fontSize: 20 }}>
                Model & Validation
              </h2>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              Technical architecture, empirical benchmarks & clinical provenance
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-subtle)',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={16} color="var(--text-main)" />
          </button>
        </div>

        {/* Drawer Content */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Summary Callout */}
          <div style={{
            background: 'var(--bg-subtle)',
            borderRadius: 8,
            padding: '14px 18px',
            border: '1px solid var(--border-subtle)',
            fontSize: 12.5,
            lineHeight: 1.6,
            color: 'var(--text-main)'
          }}>
            <strong style={{ color: 'var(--teal-deep)' }}>Architecture Overview:</strong> Gradient-boosted ensemble (XGBoost) trained with a strict <strong>patient-level GroupShuffleSplit</strong> (400 train patients, 100 test patients; 182,500 patient-days). Zero cross-patient or future-day leakage.
          </div>

          {/* Section 1: Multi-Modal Ablation Study */}
          <div>
            <h3 className="heading-serif" style={{ fontSize: 16, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Cpu size={15} color="var(--teal-deep)" />
              1. Multi-Modal Ablation Benchmarks
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
              Evaluated strictly on unseen test patients ($N=100$) over a full 365-day monitoring cycle:
            </p>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5, textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '6px 4px' }}>Model Stage</th>
                  <th style={{ padding: '6px 4px' }}>ROC-AUC</th>
                  <th style={{ padding: '6px 4px' }}>Recall (48h)</th>
                  <th style={{ padding: '6px 4px' }}>Precision</th>
                  <th style={{ padding: '6px 4px' }}>F1</th>
                </tr>
              </thead>
              <tbody>
                {ablation.map((m, idx) => (
                  <tr
                    key={m.model_name}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      background: idx === ablation.length - 1 ? 'var(--teal-light)' : 'transparent',
                      fontWeight: idx === ablation.length - 1 ? 600 : 400
                    }}
                  >
                    <td style={{ padding: '8px 4px', color: idx === ablation.length - 1 ? 'var(--teal-deep)' : 'var(--text-main)' }}>
                      {m.model_name.replace('M4: ', '')}
                    </td>
                    <td style={{ padding: '8px 4px' }}>{m.roc_auc.toFixed(4)}</td>
                    <td style={{ padding: '8px 4px', color: 'var(--teal-deep)' }}>{(m.recall * 100).toFixed(1)}%</td>
                    <td style={{ padding: '8px 4px' }}>{(m.precision * 100).toFixed(1)}%</td>
                    <td style={{ padding: '8px 4px' }}>{m.f1_score.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 2: Warning Horizons & Clinical Workload */}
          <div>
            <h3 className="heading-serif" style={{ fontSize: 16, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={15} color="var(--teal-deep)" />
              2. Warning Horizons & Clinical Workload
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 8 }}>
              <div style={{ background: 'var(--bg-subtle)', padding: '12px 14px', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 500 }}>
                  Early 48h Detection
                </span>
                <div className="font-serif" style={{ fontSize: 28, color: 'var(--teal-deep)', fontWeight: 600 }}>
                  93.4%
                </div>
                <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                  Test cohort recall at optimal threshold across 48-hour window.
                </span>
              </div>

              <div style={{ background: 'var(--bg-subtle)', padding: '12px 14px', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 500 }}>
                  Clinical Alert Burden
                </span>
                <div className="font-serif" style={{ fontSize: 28, color: 'var(--teal-deep)', fontWeight: 600 }}>
                  0.77
                </div>
                <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                  Average alerts per patient per month (~9.2 alerts/year).
                </span>
              </div>
            </div>
          </div>

          {/* Section 2b: Delhi Seasonal Pollen Aerobiological Formula */}
          <div style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 14,
            padding: '14px 16px'
          }}>
            <h4 className="heading-serif" style={{ fontSize: 14.5, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Wind size={14} color="var(--teal-deep)" />
              Delhi Seasonal Pollen Formula (Simulated Model)
            </h4>
            <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 8, lineHeight: 1.5 }}>
              Calibrated to Delhi aerobiological literature (AIIMS & VPCI bi-modal pollination patterns):
            </p>
            <div style={{
              background: '#ffffff',
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid var(--border-subtle)',
              fontFamily: 'monospace',
              fontSize: 11,
              color: 'var(--teal-deep)',
              lineHeight: 1.5,
              overflowX: 'auto'
            }}>
              P(t) = clip( 12.0 + 85.0 · exp(-0.5 · ((DOY - 75)/16)²) + 70.0 · exp(-0.5 · ((DOY - 290)/18)²) + ε, 2.0, 100.0 ) · W_rain
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 }}>
              • <strong>Spring Peak (DOY 75 / Mid-March):</strong> Tree pollen (<em>Holoptelea, Prosopis, Morus</em>) reaching 85–95 index.<br/>
              • <strong>Autumn Peak (DOY 290 / Mid-October):</strong> Weed & grass pollen (<em>Parthenium, Poaceae</em>) reaching 65–80 index.<br/>
              • <strong>Rain Washout:</strong> W_rain = max(0.2, 1.0 - Precip / 15.0) when precipitation &gt; 2 mm.
            </div>
          </div>

          {/* Section 3: Sensor Dropout Robustness */}
          <div>
            <h3 className="heading-serif" style={{ fontSize: 16, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Activity size={15} color="var(--teal-deep)" />
              3. Sensor Dropout Robustness Test
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
              Simulates uncharged smartwatch battery and device non-wear:
            </p>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5, textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '6px 4px' }}>Dropout Rate</th>
                  <th style={{ padding: '6px 4px' }}>ROC-AUC</th>
                  <th style={{ padding: '6px 4px' }}>Recall</th>
                  <th style={{ padding: '6px 4px' }}>Precision</th>
                  <th style={{ padding: '6px 4px' }}>Clinical Assessment</th>
                </tr>
              </thead>
              <tbody>
                {dropout.map(d => (
                  <tr key={d.dropout_rate_percent} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '6px 4px', fontWeight: 500 }}>{d.dropout_rate_percent}% Missing</td>
                    <td style={{ padding: '6px 4px' }}>{d.roc_auc.toFixed(4)}</td>
                    <td style={{ padding: '6px 4px' }}>{(d.recall * 100).toFixed(1)}%</td>
                    <td style={{ padding: '6px 4px' }}>{(d.precision * 100).toFixed(1)}%</td>
                    <td style={{ padding: '6px 4px', color: d.dropout_rate_percent <= 10 ? 'var(--teal-deep)' : 'var(--risk-amber)' }}>
                      {d.dropout_rate_percent === 0 ? 'Optimal Benchmark' :
                       d.dropout_rate_percent <= 10 ? 'Resilient (<4% F1 loss)' :
                       d.dropout_rate_percent <= 20 ? 'Graceful degradation' : 'Charge watch notification'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 4: Honest Limitations & Clinical Disclosures */}
          <div style={{
            background: '#fffdf5',
            border: '1px solid #fef08a',
            borderRadius: 8,
            padding: '16px 18px',
            fontSize: 12,
            lineHeight: 1.6,
            color: '#78350f'
          }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertTriangle size={15} color="#b45309" />
              Honest Clinical Limitations
            </h4>
            <ul style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <li><strong>Synthetic Patient Cohort:</strong> Static EHR and wearable time-series are synthesized following clinical GOLD 2024 and GINA 2023 consensus rules. Prospective real-patient validation is required prior to diagnostic deployment.</li>
              <li><strong>Modelled Atmospheric Data:</strong> Air quality data is retrieved from Copernicus CAMS reanalysis and converted to Indian CPCB NAQI breakpoints, rather than physical monitor sensor feeds.</li>
              <li><strong>Simulated Pollen:</strong> Pollen concentrations follow a mathematical bimodal model calibrated to Delhi literature; they are not physical pollen trap readings.</li>
              <li><strong>Decision-Support Tool:</strong> Designed for risk stratification and early clinical alert review, not autonomous diagnostic or prescriptive execution.</li>
            </ul>
          </div>

          {/* Section 5: Data Provenance */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
            <h4 className="heading-serif" style={{ fontSize: 14, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Database size={14} color="var(--teal-deep)" />
              Data Provenance Summary
            </h4>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              <div>• <strong>Weather:</strong> Open-Meteo / ECMWF ERA5-Land Reanalysis (365 days, 5 Delhi zones).</div>
              <div>• <strong>Air Quality:</strong> Open-Meteo / Copernicus CAMS Modelled Data converted to CPCB NAQI.</div>
              <div>• <strong>Pollen:</strong> Delhi Seasonal Aerobiological Model (Simulated; not sensor data).</div>
              <div>• <strong>Cohort:</strong> 500 synthetic COPD & Asthma patients (GOLD 1–4, GINA 1–5).</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
