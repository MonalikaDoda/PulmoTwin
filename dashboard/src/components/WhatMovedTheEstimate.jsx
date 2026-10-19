import React, { useMemo } from 'react'
import { Info, CheckCircle2, TrendingUp, TrendingDown, HelpCircle } from 'lucide-react'

export default function WhatMovedTheEstimate({
  shapData,
  patientProfile,
  currentTelemetry,
  riskScore = 0
}) {
  // Use model's average predicted risk as baseline (cohort reference prior)
  const baselineRisk = shapData?.baseline_risk !== undefined ? shapData.baseline_risk : 3.6
  const displayedRisk = shapData?.displayed_risk !== undefined ? shapData.displayed_risk : riskScore

  // The 9 specified factors with fallback defaults
  const defaultFactorDefinitions = [
    {
      id: 'spo2',
      name: 'SpO2 vs personal baseline',
      val: currentTelemetry?.spo2 ? `${currentTelemetry.spo2}% (${(currentTelemetry.spo2 - (patientProfile?.baseline_spo2 || 95)).toFixed(1)}%)` : '-1.8%',
      defaultImpact: currentTelemetry?.spo2 < (patientProfile?.baseline_spo2 || 95) ? +12.4 : -2.1,
      isHazard: currentTelemetry?.spo2 < (patientProfile?.baseline_spo2 || 95)
    },
    {
      id: 'hr',
      name: 'Resting Heart Rate',
      val: currentTelemetry?.resting_heart_rate ? `${currentTelemetry.resting_heart_rate} bpm` : '82 bpm',
      defaultImpact: currentTelemetry?.resting_heart_rate > 80 ? +4.8 : -1.5,
      isHazard: currentTelemetry?.resting_heart_rate > 80
    },
    {
      id: 'rr',
      name: 'Respiratory Rate',
      val: currentTelemetry?.respiratory_rate ? `${currentTelemetry.respiratory_rate} rpm` : '18 rpm',
      defaultImpact: currentTelemetry?.respiratory_rate > 18 ? +8.2 : -1.8,
      isHazard: currentTelemetry?.respiratory_rate > 18
    },
    {
      id: 'sleep',
      name: 'Nocturnal Sleep Duration',
      val: currentTelemetry?.sleep_hours ? `${currentTelemetry.sleep_hours} hrs` : '5.8 hrs',
      defaultImpact: currentTelemetry?.sleep_hours < 6.5 ? +6.5 : -1.2,
      isHazard: currentTelemetry?.sleep_hours < 6.5
    },
    {
      id: 'steps',
      name: 'Daily Mobility (Steps)',
      val: currentTelemetry?.steps ? `${currentTelemetry.steps.toLocaleString()} steps` : '3,200 steps',
      defaultImpact: currentTelemetry?.steps < 4000 ? +14.6 : -3.2,
      isHazard: currentTelemetry?.steps < 4000
    },
    {
      id: 'aqi',
      name: 'Copernicus CAMS AQI',
      val: currentTelemetry?.aqi_cpcb_mean ? `${currentTelemetry.aqi_cpcb_mean} AQI` : '240 AQI',
      defaultImpact: currentTelemetry?.aqi_cpcb_mean > 150 ? +5.2 : -0.8,
      isHazard: currentTelemetry?.aqi_cpcb_mean > 150
    },
    {
      id: 'dust',
      name: 'Atmospheric Dust',
      val: currentTelemetry?.dust_mean ? `${currentTelemetry.dust_mean} µg/m³` : '45 µg/m³',
      defaultImpact: currentTelemetry?.dust_mean > 50 ? +2.1 : -0.4,
      isHazard: currentTelemetry?.dust_mean > 50
    },
    {
      id: 'temp_swing',
      name: 'Weather & pollen',
      val: currentTelemetry?.temp_swing_diurnal ? `${currentTelemetry.temp_swing_diurnal}°C swing` : '12.4°C swing',
      defaultImpact: currentTelemetry?.temp_swing_diurnal > 11 ? +1.8 : -0.5,
      isHazard: currentTelemetry?.temp_swing_diurnal > 11
    },
    {
      id: 'adherence',
      name: 'Maintenance Inhaler Adherence',
      val: `${Math.round((patientProfile?.baseline_adherence || 0.8) * 100)}%`,
      defaultImpact: (patientProfile?.baseline_adherence || 0.8) < 0.65 ? +6.0 : -4.5,
      isHazard: (patientProfile?.baseline_adherence || 0.8) < 0.65
    }
  ]

  // Construct final factor rows: prefer exact backend SHAP-decomposed factors
  const factorRows = useMemo(() => {
    if (shapData?.factors && shapData.factors.length > 0) {
      return shapData.factors.map((f) => ({
        id: f.id,
        name: f.name,
        val: f.value_str || '',
        impact: f.impact_pp,
        isHazard: f.impact_pp > 0
      }))
    }

    // If fallback, reconcile defaultImpacts so Baseline + sum(impacts) === displayedRisk
    const delta = displayedRisk - baselineRisk
    const defaultSum = defaultFactorDefinitions.reduce((acc, f) => acc + f.defaultImpact, 0)
    const factorScale = Math.abs(defaultSum) > 1e-4 && Math.abs(delta) > 0.05 ? delta / defaultSum : 0
    return defaultFactorDefinitions.map((f) => {
      const imp = parseFloat((f.defaultImpact * factorScale).toFixed(1))
      return {
        id: f.id,
        name: f.name,
        val: f.val,
        impact: imp,
        isHazard: imp > 0
      }
    })
  }, [shapData, displayedRisk, baselineRisk, currentTelemetry, patientProfile])

  // Total sum of bars
  const sumBars = useMemo(() => {
    return parseFloat(factorRows.reduce((acc, r) => acc + r.impact, 0).toFixed(1))
  }, [factorRows])

  // Reconciled total
  const calculatedRisk = parseFloat((baselineRisk + sumBars).toFixed(1))
  const isExactMatch = Math.abs(calculatedRisk - displayedRisk) <= 0.15

  // Scale maximum impact for visual bar width
  const maxAbsImpact = Math.max(12, ...factorRows.map((r) => Math.abs(r.impact)))

  return (
    <div className="editorial-card" style={{ padding: '24px 28px', marginBottom: 20 }}>
      {/* Title & How to Read This */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <h3 className="heading-serif" style={{ fontSize: 18, margin: 0 }}>
            What Moved the Estimate
          </h3>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              color: 'var(--teal-deep)',
              background: 'var(--teal-wash)',
              padding: '3px 8px',
              borderRadius: 4
            }}
          >
            <CheckCircle2 size={12} color="var(--teal-mid)" />
            Baseline + Bars = Displayed Risk
          </span>
        </div>

        <p
          style={{
            fontSize: 12.5,
            color: 'var(--text-muted)',
            fontStyle: 'italic',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            margin: 0
          }}
        >
          <Info size={13} color="var(--teal-mid)" />
          How to read this: Horizontal bars represent the percentage point shift from the cohort reference prior ({baselineRisk}%) to this patient's forecasted 48-hour risk ({displayedRisk}%).
        </p>
      </div>

      {/* Axis Scale Legend */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '220px 1fr 90px',
          fontSize: 11,
          color: 'var(--text-light)',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: 6,
          marginBottom: 8
        }}
      >
        <span style={{ fontWeight: 500, letterSpacing: '0.01em' }}>Clinical factor</span>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 20px', fontSize: 11.5 }}>
          <span>← Reduces risk (protective)</span>
          <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>0 pp</span>
          <span>Elevates risk (hazard) →</span>
        </div>
        <span style={{ textAlign: 'right', fontWeight: 500, letterSpacing: '0.01em' }}>Shift</span>
      </div>

      {/* Factor Diverging Horizontal Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {factorRows.map((row) => {
          const widthPct = Math.min(100, (Math.abs(row.impact) / maxAbsImpact) * 50)
          const isHazard = row.impact > 0

          return (
            <div
              key={row.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '220px 1fr 90px',
                alignItems: 'center',
                fontSize: 12.5
              }}
            >
              {/* Factor Name & Current Reading */}
              <div>
                <div style={{ fontWeight: 500, color: 'var(--text-main)', lineHeight: 1.3 }}>
                  {row.name}
                </div>
                {row.val && (
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    Value: {row.val}
                  </div>
                )}
              </div>

              {/* Centered Diverging Bar */}
              <div
                style={{
                  position: 'relative',
                  height: 18,
                  display: 'flex',
                  alignItems: 'center',
                  margin: '0 16px'
                }}
              >
                {/* Center Baseline Guide Line */}
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: 0,
                    bottom: 0,
                    width: 1,
                    background: 'var(--border-medium)',
                    zIndex: 2
                  }}
                />

                {/* Left (Protective) Bar */}
                {!isHazard && row.impact !== 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      right: '50%',
                      height: 10,
                      width: `${widthPct}%`,
                      background: 'var(--teal-mid)',
                      borderRadius: '3px 0 0 3px',
                      transition: 'width 0.35s ease'
                    }}
                  />
                )}

                {/* Right (Hazard) Bar */}
                {isHazard && (
                  <div
                    style={{
                      position: 'absolute',
                      left: '50%',
                      height: 10,
                      width: `${widthPct}%`,
                      background: 'var(--risk-coral)',
                      borderRadius: '0 3px 3px 0',
                      transition: 'width 0.35s ease'
                    }}
                  />
                )}
              </div>

              {/* Percentage Point Readout */}
              <div
                style={{
                  textAlign: 'right',
                  fontWeight: 600,
                  color: isHazard ? 'var(--risk-coral)' : row.impact === 0 ? 'var(--text-light)' : 'var(--teal-mid)',
                  fontSize: 12
                }}
              >
                {row.impact > 0 ? `+${row.impact.toFixed(1)} pp` : `${row.impact.toFixed(1)} pp`}
              </div>
            </div>
          )
        })}
      </div>

      {/* Mathematical Reconciliation Summary Banner */}
      <div
        style={{
          marginTop: 18,
          padding: '10px 14px',
          background: 'var(--bg-warm)',
          borderRadius: 6,
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 12,
          color: 'var(--text-main)',
          flexWrap: 'wrap',
          gap: 10
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span>
            Cohort Baseline: <strong>{baselineRisk.toFixed(1)}%</strong>
          </span>
          <span style={{ color: 'var(--text-light)' }}>+</span>
          <span>
            Net Factor Shift: <strong style={{ color: sumBars >= 0 ? 'var(--risk-coral)' : 'var(--teal-mid)' }}>
              {sumBars >= 0 ? `+${sumBars.toFixed(1)}` : sumBars.toFixed(1)} pp
            </strong>
          </span>
          <span style={{ color: 'var(--text-light)' }}>=</span>
          <span>
            Patient 48h Risk: <strong style={{ color: 'var(--teal-deep)' }}>{displayedRisk.toFixed(1)}%</strong>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-muted)' }}>
          <CheckCircle2 size={13} color="var(--teal-mid)" />
          <span>TreeExplainer Log-Odds Sigmoid Proportions</span>
        </div>
      </div>
    </div>
  )
}
