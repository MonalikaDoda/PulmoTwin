import React, { useState } from 'react'
import { Sliders, RotateCcw, ArrowDownRight, Wind, Pill, Thermometer } from 'lucide-react'

export default function WhatIfSimulator({ patientId, baselineRisk = 18.0, onRunSimulation, simulationResult }) {
  const [deltaAqi, setDeltaAqi] = useState(0)
  const [deltaAdherence, setDeltaAdherence] = useState(0)
  const [deltaDust, setDeltaDust] = useState(0)
  const [deltaTempSwing, setDeltaTempSwing] = useState(0)

  const handleSliderChange = (type, val) => {
    let newAqi = deltaAqi
    let newAdh = deltaAdherence
    let newDust = deltaDust
    let newTemp = deltaTempSwing

    if (type === 'aqi') { newAqi = val; setDeltaAqi(val) }
    if (type === 'adherence') { newAdh = val; setDeltaAdherence(val) }
    if (type === 'dust') { newDust = val; setDeltaDust(val) }
    if (type === 'temp') { newTemp = val; setDeltaTempSwing(val) }

    onRunSimulation({
      delta_aqi: newAqi,
      delta_adherence: newAdh / 100.0,
      delta_dust: newDust,
      delta_temp_swing: newTemp
    })
  }

  const handleReset = () => {
    setDeltaAqi(0)
    setDeltaAdherence(0)
    setDeltaDust(0)
    setDeltaTempSwing(0)
    onRunSimulation({ delta_aqi: 0, delta_adherence: 0, delta_dust: 0, delta_temp_swing: 0 })
  }

  const simScore = simulationResult ? simulationResult.simulated_risk_score : baselineRisk
  const riskReduction = simulationResult ? simulationResult.relative_risk_reduction_percent : 0

  return (
    <div className="editorial-card" style={{ padding: '24px 28px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <h3 className="heading-serif" style={{ fontSize: 18 }}>
            What-If Counterfactual Twin
          </h3>
          <button
            onClick={handleReset}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11.5,
              color: 'var(--text-muted)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <RotateCcw size={11} /> Reset
          </button>
        </div>

        <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 16 }}>
          Simulate outpatient protective interventions (HEPA air filtration, strict inhaler compliance, thermal regulation).
        </p>

        {/* Sliders List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          
          {/* Slider 1: AQI */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>
                Indoor Air Purifier (AQI Delta)
              </span>
              <strong style={{ color: deltaAqi < 0 ? 'var(--teal-deep)' : 'var(--text-muted)' }}>
                {deltaAqi} AQI
              </strong>
            </div>
            <input
              type="range"
              min="-150"
              max="0"
              step="10"
              value={deltaAqi}
              onChange={(e) => handleSliderChange('aqi', parseFloat(e.target.value))}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-light)', marginTop: 2 }}>
              <span>-150 (HEPA High)</span>
              <span>0 (Current Ambient)</span>
            </div>
          </div>

          {/* Slider 2: Adherence */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>
                Inhaler Adherence Boost
              </span>
              <strong style={{ color: deltaAdherence > 0 ? 'var(--teal-deep)' : 'var(--text-muted)' }}>
                +{deltaAdherence}%
              </strong>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={deltaAdherence}
              onChange={(e) => handleSliderChange('adherence', parseFloat(e.target.value))}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-light)', marginTop: 2 }}>
              <span>Baseline</span>
              <span>+50% (Strict Compliance)</span>
            </div>
          </div>

          {/* Slider 3: Thermal Swing */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>
                Thermal Swing Stabilization
              </span>
              <strong style={{ color: deltaTempSwing < 0 ? 'var(--teal-deep)' : 'var(--text-muted)' }}>
                {deltaTempSwing}°C
              </strong>
            </div>
            <input
              type="range"
              min="-8"
              max="0"
              step="1"
              value={deltaTempSwing}
              onChange={(e) => handleSliderChange('temp', parseFloat(e.target.value))}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-light)', marginTop: 2 }}>
              <span>-8°C (Climate Controlled)</span>
              <span>0°C (Unregulated)</span>
            </div>
          </div>

        </div>
      </div>

      {/* Outcome Strip */}
      <div style={{
        marginTop: 18,
        padding: '12px 16px',
        background: 'var(--bg-subtle)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 6
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Simulated 48h Risk
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span className="font-serif" style={{ fontSize: 28, fontWeight: 600, color: simScore >= 50 ? 'var(--risk-coral)' : 'var(--teal-deep)' }}>
                {simScore.toFixed(1)}%
              </span>
              <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                (Baseline: {baselineRisk.toFixed(1)}%)
              </span>
            </div>
          </div>

          {riskReduction > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              color: 'var(--teal-deep)',
              fontWeight: 700,
              fontSize: 12
            }}>
              <ArrowDownRight size={14} />
              -{riskReduction.toFixed(0)}% Risk Reduction
            </div>
          )}
        </div>

        <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.5 }}>
          {simulationResult?.clinical_takeaway || 'Adjust sliders to simulate protective outpatient interventions.'}
        </p>
      </div>

    </div>
  )
}
