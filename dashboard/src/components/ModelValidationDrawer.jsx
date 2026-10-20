import React from 'react'
import { X, BookOpen, AlertTriangle, Database, Clock, Activity, Cpu, Wind, Info, Heart } from 'lucide-react'
import ErrorBoundary from './ErrorBoundary'

function ModelValidationDrawerInner({ isOpen, onClose, analyticsData }) {
  if (!isOpen) return null

  // Extract from analyticsData (fed from model/comprehensive_metrics.json via /api/analytics/model-performance)
  const ablation = Array.isArray(analyticsData?.ablation_summary) ? analyticsData.ablation_summary : [
    { model_name: "M1: Vitals Only", feature_count: 17, roc_auc: 0.9982, pr_auc: 0.9042, recall: 0.9409, precision: 0.7511, f1_score: 0.8353 },
    { model_name: "M2: Vitals + EHR", feature_count: 27, roc_auc: 0.9981, pr_auc: 0.9020, recall: 0.9382, precision: 0.7603, f1_score: 0.8400 },
    { model_name: "M3: Vitals + EHR + CAMS AQI", feature_count: 35, roc_auc: 0.9982, pr_auc: 0.9068, recall: 0.9382, precision: 0.7562, f1_score: 0.8374 },
    { model_name: "M4: Full Multi-Modal (+ Weather/Dust/Pollen)", feature_count: 46, roc_auc: 0.9982, pr_auc: 0.9078, recall: 0.9341, precision: 0.7563, f1_score: 0.8358 }
  ]

  const leadTime = analyticsData?.lead_time_summary || {
    total_test_flare_events: 372,
    sensitivity_at_48h_ahead: 1.0,
    sensitivity_at_36h_ahead: 1.0,
    sensitivity_at_24h_ahead: 1.0,
    sensitivity_at_12h_ahead: 0.9543,
    total_alerts_triggered_in_test_cohort: 919,
    average_alerts_per_patient_per_month: 0.77,
    average_alerts_per_patient_per_year: 9.19
  }

  const dropout = Array.isArray(analyticsData?.dropout_robustness) ? analyticsData.dropout_robustness : [
    { dropout_rate_percent: 0, roc_auc: 0.9982, recall: 0.9341, precision: 0.7563, f1_score: 0.8358 },
    { dropout_rate_percent: 10, roc_auc: 0.9963, recall: 0.7876, precision: 0.7532, f1_score: 0.7700 },
    { dropout_rate_percent: 20, roc_auc: 0.9925, recall: 0.6102, precision: 0.7868, f1_score: 0.6874 },
    { dropout_rate_percent: 30, roc_auc: 0.9861, recall: 0.3790, precision: 0.7855, f1_score: 0.5113 }
  ]

  const primaryRecall = analyticsData?.recall !== undefined ? (analyticsData.recall * 100).toFixed(1) : '93.4'
  const monthlyAlertDays = leadTime.average_alerts_per_patient_per_month !== undefined 
    ? Number(leadTime.average_alerts_per_patient_per_month).toFixed(2) 
    : '0.77'
  const yearlyAlertDays = leadTime.average_alerts_per_patient_per_year !== undefined
    ? Number(leadTime.average_alerts_per_patient_per_year).toFixed(2)
    : '9.19'

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
        maxWidth: 640,
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
              <h2 className="heading-serif" style={{ fontSize: 20, margin: 0 }}>
                Model & Validation
              </h2>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, marginBottom: 0 }}>
              Live data from model/comprehensive_metrics.json & open data provenance
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Drawer"
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
            <strong style={{ color: 'var(--teal-deep)' }}>Architecture Overview:</strong> Gradient-boosted decision trees (XGBoost) trained with a strict <strong>patient-level GroupShuffleSplit</strong> (400 train patients, 100 test patients; 182,500 patient-days total). Zero cross-patient or future-day leakage.
          </div>

          {/* Section 1: Multi-Modal Ablation Study */}
          <div>
            <h3 className="heading-serif" style={{ fontSize: 16, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Cpu size={15} color="var(--teal-deep)" />
              1. Multi-Modal Ablation Benchmarks
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
              Evaluated strictly on unseen held-out test patients ($N=100$) over a full 365-day cycle:
            </p>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5, textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '6px 4px' }}>Model Stage</th>
                  <th style={{ padding: '6px 4px' }}>ROC-AUC</th>
                  <th style={{ padding: '6px 4px' }}>PR-AUC</th>
                  <th style={{ padding: '6px 4px' }}>Recall (Day)</th>
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
                    <td style={{ padding: '8px 4px' }}>{Number(m.roc_auc).toFixed(4)}</td>
                    <td style={{ padding: '8px 4px' }}>{Number(m.pr_auc).toFixed(4)}</td>
                    <td style={{ padding: '8px 4px', color: 'var(--teal-deep)' }}>{(Number(m.recall) * 100).toFixed(1)}%</td>
                    <td style={{ padding: '8px 4px' }}>{(Number(m.precision) * 100).toFixed(1)}%</td>
                    <td style={{ padding: '8px 4px' }}>{Number(m.f1_score).toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Plain honest ablation finding */}
            <div style={{
              marginTop: 10,
              padding: '10px 12px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 6,
              fontSize: 11.5,
              color: 'var(--text-muted)',
              lineHeight: 1.5
            }}>
              <strong>Honest Ablation Finding:</strong> On this synthetic dataset, continuous wearable vitals (M1) already yield PR-AUC 0.9042 and F1 0.8353. Adding static EHR and environmental features (M4) provides virtually negligible quantitative gain (+0.0036 PR-AUC, +0.0005 F1), showing that vital sign drift accounts for nearly all predictive signal in the generator.
            </div>
          </div>

          {/* Section 2: Event-Level Advance Detection vs Day-Level Recall */}
          <div>
            <h3 className="heading-serif" style={{ fontSize: 16, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={15} color="var(--teal-deep)" />
              2. Event-Level Advance Detection vs. Day-Level Recall
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 8 }}>
              <div style={{ background: 'var(--bg-subtle)', padding: '12px 14px', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 500 }}>
                  Event Detection (48h Ahead)
                </span>
                <div className="font-serif" style={{ fontSize: 28, color: 'var(--teal-deep)', fontWeight: 600 }}>
                  100.0%
                </div>
                <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                  372 of 372 test flare events had an alert on Day -2 or Day -1.
                </span>
              </div>

              <div style={{ background: 'var(--bg-subtle)', padding: '12px 14px', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 500 }}>
                  Day-Level Test Recall
                </span>
                <div className="font-serif" style={{ fontSize: 28, color: 'var(--teal-deep)', fontWeight: 600 }}>
                  {primaryRecall}%
                </div>
                <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                  695 of 744 individual impending flare days flagged (49 false neg days).
                </span>
              </div>
            </div>

            <div style={{
              marginTop: 10,
              padding: '10px 12px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 6,
              fontSize: 11.5,
              color: 'var(--text-muted)',
              lineHeight: 1.5
            }}>
              <strong>Exact Lead-Time Rules:</strong>
              <br/>• <strong>48h/36h/24h Rule:</strong> An acute flare event is counted as detected if an alert fired on either Day <em>d - 2</em> or Day <em>d - 1</em>. Every test flare event had at least one alert (372/372 = 100%).
              <br/>• <strong>12h Rule:</strong> Checked strictly on Day <em>d - 1</em> specifically (355/372 = 95.4%).
              <br/>• <strong>Workload Metric ({monthlyAlertDays} alert days/patient/month):</strong> Counts <strong>individual alert days</strong> (919 total alert days / 1200 patient-months in test set), <em>not</em> grouped episodes. Multi-day episodes average ~0.25–0.30 per patient per month.
            </div>
          </div>

          {/* Section 2b: Delhi Seasonal Pollen Formula */}
          <div style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 14,
            padding: '14px 16px'
          }}>
            <h4 className="heading-serif" style={{ fontSize: 14.5, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Wind size={14} color="var(--teal-deep)" />
              Delhi Seasonal Pollen Formula (Illustrative Curve)
            </h4>
            <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 8, lineHeight: 1.5 }}>
              Illustrative seasonal curve with peaks placed near seasons in Delhi pollen calendars; not fitted to measured data:
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
              • <strong>Spring Peak (DOY 75 / Mid-March):</strong> Tree pollen season window.<br/>
              • <strong>Autumn Peak (DOY 290 / Mid-October):</strong> Weed & grass pollen season window.<br/>
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
                  <th style={{ padding: '6px 4px' }}>Assessment</th>
                </tr>
              </thead>
              <tbody>
                {dropout.map(d => (
                  <tr key={d.dropout_rate_percent} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '6px 4px', fontWeight: 500 }}>{d.dropout_rate_percent}% Missing</td>
                    <td style={{ padding: '6px 4px' }}>{Number(d.roc_auc).toFixed(4)}</td>
                    <td style={{ padding: '6px 4px' }}>{(Number(d.recall) * 100).toFixed(1)}%</td>
                    <td style={{ padding: '6px 4px' }}>{(Number(d.precision) * 100).toFixed(1)}%</td>
                    <td style={{ padding: '6px 4px', color: d.dropout_rate_percent <= 10 ? 'var(--teal-deep)' : 'var(--risk-amber)' }}>
                      {d.dropout_rate_percent === 0 ? 'Optimal Benchmark' :
                       d.dropout_rate_percent <= 10 ? 'Resilient (<8% F1 loss)' :
                       d.dropout_rate_percent <= 20 ? 'Degrading' : 'Sensor loss alert'}
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
              Honest Scientific & Clinical Limitations
            </h4>
            <ul style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4, margin: 0 }}>
              <li><strong>Synthetic Patient Cohort:</strong> Uses GOLD/GINA stage categories; proportions are our assumptions. All records are synthetic. Flare labels were assigned by our own drift simulation rules; high metrics reflect rule recovery on synthetic data rather than clinical efficacy.</li>
              <li><strong>Flare Frequency in Cohort:</strong> The synthetic cohort averages <strong>~3.64 flare-ups per patient per year</strong> (1,821 events across 500 patients over 365 days; 372 flares across 100 test patients). In real-world outpatient populations, annual flare rates are often lower.</li>
              <li><strong>Dust Flare Hazard Modeling:</strong> In <code>calculate_daily_flare_hazard</code>, dust excess (<code>max(0.0, dust - 50.0)</code>) was <em>not capped</em> before calculating the multiplier. While the composite daily hazard was capped by an overall ceiling of 0.12 (12%/day), rare pre-monsoon dust spikes created large multiplier values.</li>
              <li><strong>No Real Patient Evidence:</strong> No clinical trials or prospective studies have evaluated this tool on real patients.</li>
              <li><strong>Real Modelled/Reanalysis Weather & Air Quality:</strong> Data retrieved from Open-Meteo (Copernicus CAMS and ECMWF ERA5-Land reanalysis); not physical hardware station feeds. Weather data by Open-Meteo.com under CC BY 4.0.</li>
              <li><strong>Simulated Pollen:</strong> Illustrative seasonal curve placed near calendar seasons, not fitted to measured aerobiological trap data.</li>
              <li><strong>What-If Simulator:</strong> Demonstrates model mathematical sensitivity on synthetic feature distributions, not a verified clinical therapeutic effect.</li>
              <li><strong>Built With AI Assistance:</strong> Built with AI coding assistance (Antigravity).</li>
            </ul>
          </div>

          {/* Section 5: Assets & Credits */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
            <h4 className="heading-serif" style={{ fontSize: 14, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Database size={14} color="var(--teal-deep)" />
              Assets & Credits
            </h4>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              <div>• <strong>3D Lung Model:</strong> "Lungs" by prasanth.k on Sketchfab (<a href="https://skfb.ly/oqOP7" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--teal-deep)' }}>https://skfb.ly/oqOP7</a>), licensed under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--teal-deep)' }}>Creative Commons Attribution (CC BY 4.0)</a>.</div>
              <div>• <strong>Weather & Air Quality:</strong> Open-Meteo.com (Copernicus CAMS & ECMWF ERA5-Land Reanalysis) under CC BY 4.0.</div>
              <div>• <strong>Cohort Categories:</strong> Uses GOLD/GINA stage categories; proportions are our assumptions.</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}

export default function ModelValidationDrawer(props) {
  return (
    <ErrorBoundary title="Model & Validation Drawer Error">
      <ModelValidationDrawerInner {...props} />
    </ErrorBoundary>
  )
}
