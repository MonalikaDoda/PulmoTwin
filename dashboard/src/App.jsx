import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import PatientHeader from './components/PatientHeader'
import ThreeLungViewer from './components/ThreeLungViewer'
import VitalTiles from './components/VitalTiles'
import SimulationControls from './components/SimulationControls'
import WhatMovedTheEstimate from './components/WhatMovedTheEstimate'
import VitalsTimeline from './components/VitalsTimeline'
import WhatIfSimulator from './components/WhatIfSimulator'
import DelhiMap from './components/DelhiMap'
import PatientList from './components/PatientList'
import DoctorActionsPanel from './components/DoctorActionsPanel'
import AlertHistory from './components/AlertHistory'
import ModelValidationDrawer from './components/ModelValidationDrawer'
import ErrorBoundary from './components/ErrorBoundary'
import { Sliders, ChevronDown } from 'lucide-react'

const API_BASE = 'http://localhost:8000/api'

export default function App() {
  const [patients, setPatients] = useState([])
  const [selectedPatientId, setSelectedPatientId] = useState(null)
  const [patientProfile, setPatientProfile] = useState(null)
  const [riskData, setRiskData] = useState(null)
  const [historyData, setHistoryData] = useState([])
  const [shapData, setShapData] = useState(null)
  const [alertsHistory, setAlertsHistory] = useState([])
  const [delhiStations, setDelhiStations] = useState([])
  const [analyticsData, setAnalyticsData] = useState(null)
  const [simulationResult, setSimulationResult] = useState(null)

  // Live Longitudinal Simulation State
  const [simulationTimeline, setSimulationTimeline] = useState([])
  const [currentDay, setCurrentDay] = useState(365)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)

  // Collapsible "More tools" section
  const [showMoreTools, setShowMoreTools] = useState(false)

  const [activeHorizon, setActiveHorizon] = useState(30)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isBackendOnline, setIsBackendOnline] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // 1. Initial Load: Fetch Patient Cohort, Delhi Stations & Analytics
  useEffect(() => {
    fetchCohort()
    fetchEnvironment()
    fetchAnalytics()
  }, [])

  const fetchCohort = async () => {
    try {
      const res = await fetch(`${API_BASE}/patients`)
      if (res.ok) {
        const data = await res.json()
        setPatients(data)
        setIsBackendOnline(true)
        if (data.length > 0 && !selectedPatientId) {
          setSelectedPatientId(data[0].patient_id)
        }
      }
    } catch (e) {
      console.warn('API fetch failed, retrying in background...', e)
      setIsBackendOnline(false)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchEnvironment = async (dayNum = null) => {
    try {
      const url = dayNum ? `${API_BASE}/environment/delhi?day_number=${dayNum}` : `${API_BASE}/environment/delhi`
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setDelhiStations(data.monitoring_stations || [])
      }
    } catch (e) {
      console.warn('Failed to fetch Delhi environment:', e)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${API_BASE}/analytics/model-performance`)
      if (res.ok) {
        const data = await res.json()
        setAnalyticsData(data)
      }
    } catch (e) {
      console.warn('Failed to fetch model analytics:', e)
    }
  }

  // 2. When Selected Patient Changes: Fetch Profile, Risk, History, SHAP, Alerts, and Simulation Timeline
  useEffect(() => {
    if (!selectedPatientId) return

    setIsPlaying(false)
    setCurrentDay(365)

    const loadPatientDetails = async () => {
      try {
        const resProf = await fetch(`${API_BASE}/patients/${selectedPatientId}`)
        if (resProf.ok) setPatientProfile(await resProf.json())

        const resRisk = await fetch(`${API_BASE}/patients/${selectedPatientId}/risk`)
        if (resRisk.ok) setRiskData(await resRisk.json())

        const resHist = await fetch(`${API_BASE}/patients/${selectedPatientId}/history?days=365`)
        if (resHist.ok) {
          const h = await resHist.json()
          setHistoryData(h.history || [])
        }

        const resShap = await fetch(`${API_BASE}/patients/${selectedPatientId}/shap`)
        if (resShap.ok) setShapData(await resShap.json())

        const resAlerts = await fetch(`${API_BASE}/patients/${selectedPatientId}/alerts`)
        if (resAlerts.ok) {
          const a = await resAlerts.json()
          setAlertsHistory(a.alerts || [])
        }

        // Fetch 365-day Simulation Timeline
        const resTimeline = await fetch(`${API_BASE}/patients/${selectedPatientId}/simulation-timeline`)
        if (resTimeline.ok) {
          const t = await resTimeline.json()
          setSimulationTimeline(t.timeline || [])
        }

        setSimulationResult(null)
      } catch (err) {
        console.error('Error loading patient telemetry:', err)
      }
    }

    loadPatientDetails()
  }, [selectedPatientId])

  // 3. Simulation Playback Timer Loop
  useEffect(() => {
    if (!isPlaying) return

    const intervalMs = Math.max(50, Math.round(750 / playbackSpeed))
    const timer = setInterval(() => {
      setCurrentDay((prev) => {
        if (prev >= 365) {
          setIsPlaying(false)
          return 365
        }
        return prev + 1
      })
    }, intervalMs)

    return () => clearInterval(timer)
  }, [isPlaying, playbackSpeed])

  // 4. Update Atmospheric Map when Current Day changes
  useEffect(() => {
    if (currentDay && currentDay <= 365) {
      fetchEnvironment(currentDay)
    }
  }, [currentDay])

  // Active Simulation Step Data Derivation
  const activeDayData = simulationTimeline.length >= currentDay ? simulationTimeline[currentDay - 1] : null

  const activeRiskScore = activeDayData?.risk_score ?? (riskData?.risk_score || 0)
  const activeRiskLevel = activeDayData?.risk_level ?? (riskData?.risk_level || 'Low')
  const activeRespRate = activeDayData?.respiratory_rate ?? (patientProfile?.baseline_resp_rate || 16)
  const activeSpo2 = activeDayData?.spo2 ?? (patientProfile?.baseline_spo2 || 95)
  const activeAqi = activeDayData?.aqi_cpcb_mean ?? 120
  const activeDate = activeDayData?.date || ''

  const activeShapData = activeDayData?.factors
    ? {
        patient_id: selectedPatientId,
        day_number: activeDayData.day_number,
        baseline_risk: activeDayData.baseline_risk,
        displayed_risk: activeDayData.risk_score,
        delta: activeDayData.delta,
        sum_bars: activeDayData.sum_bars,
        factors: activeDayData.factors
      }
    : shapData

  const activeTelemetryForBars = activeDayData
    ? {
        spo2: activeDayData.spo2,
        resting_heart_rate: activeDayData.resting_heart_rate,
        respiratory_rate: activeDayData.respiratory_rate,
        sleep_hours: activeDayData.sleep_hours,
        steps: activeDayData.steps,
        aqi_cpcb_mean: activeDayData.aqi_cpcb_mean,
        dust_mean: activeDayData.dust_mean,
        temp_swing_diurnal: activeDayData.temp_swing_diurnal
      }
    : (historyData.length > 0 ? historyData[historyData.length - 1] : null)

  const handleJumpToNextAlert = () => {
    if (!simulationTimeline || simulationTimeline.length === 0) return

    // Search for next alert strictly after currentDay
    const nextAlert = simulationTimeline.find(
      (d) => d.day_number > currentDay && (d.alert_triggered || d.flare_up_next_48h)
    )

    if (nextAlert) {
      setCurrentDay(nextAlert.day_number)
      setIsPlaying(false)
    } else {
      // Loop to first alert in the year
      const firstAlert = simulationTimeline.find((d) => d.alert_triggered || d.flare_up_next_48h)
      if (firstAlert) {
        setCurrentDay(firstAlert.day_number)
        setIsPlaying(false)
      }
    }
  }

  const handleHorizonChange = (days) => {
    setActiveHorizon(days)
  }

  const handleRunSimulation = async (params) => {
    if (!selectedPatientId) return
    try {
      const res = await fetch(`${API_BASE}/patients/${selectedPatientId}/what-if`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      })
      if (res.ok) {
        const result = await res.json()
        setSimulationResult(result)
        return result
      }
    } catch (e) {
      console.error('Simulation error:', e)
    }
  }

  const handleLogAction = async (pid, actionData) => {
    try {
      const res = await fetch(`${API_BASE}/patients/${pid}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actionData)
      })
      if (res.ok) {
        const resProf = await fetch(`${API_BASE}/patients/${pid}`)
        if (resProf.ok) setPatientProfile(await resProf.json())
      }
    } catch (e) {
      console.error('Failed to log action:', e)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Editorial Header */}
      <Header
        onOpenDrawer={() => setIsDrawerOpen(true)}
        isBackendOnline={isBackendOnline}
      />

      {/* Main Workspace Layout with Generous Calm Spacing */}
      <main
        className="dashboard-main-grid"
        style={{
          flex: 1,
          padding: '36px 40px',
          maxWidth: 1620,
          margin: '0 auto',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '310px 1fr',
          gap: 36
        }}
      >
        {/* Left Column: Patient Cohort Triage (Quieter Card) */}
        <aside className="dashboard-aside" style={{ height: 'calc(100vh - 140px)', position: 'sticky', top: 110 }}>
          <PatientList
            patients={patients}
            selectedPatientId={selectedPatientId}
            onSelectPatient={(pid) => setSelectedPatientId(pid)}
          />
        </aside>

        {/* Right Main Column: Patient Digital Twin */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {/* Patient Banner */}
          {patientProfile && (
            <div style={{ marginBottom: 28 }}>
              <PatientHeader
                patient={patientProfile}
                riskInfo={{
                  risk_score: activeRiskScore,
                  risk_level: activeRiskLevel
                }}
              />
            </div>
          )}

          {/* Interactive Live Simulation Controller (Kept exactly as it is) */}
          <div style={{ marginBottom: 36 }}>
            <SimulationControls
              currentDay={currentDay}
              maxDays={365}
              currentDate={activeDate}
              isPlaying={isPlaying}
              playbackSpeed={playbackSpeed}
              onPlayToggle={() => setIsPlaying(!isPlaying)}
              onSpeedChange={(spd) => setPlaybackSpeed(spd)}
              onDayChange={(d) => setCurrentDay(d)}
              onJumpToNextAlert={handleJumpToNextAlert}
              onResetToLatest={() => {
                setCurrentDay(365)
                setIsPlaying(false)
              }}
              alertsInYear={alertsHistory}
            />
          </div>

          {/* HERO: 3D Respiratory Digital Twin with Dynamic Risk Tinting & Enlarge Risk Stat */}
          <div style={{ marginBottom: 38 }}>
            <ErrorBoundary title="3D Respiratory Twin Viewer">
              <ThreeLungViewer
                riskScore={activeRiskScore}
                riskLevel={activeRiskLevel}
                respiratoryRate={activeRespRate}
                spo2={activeSpo2}
                aqi={activeAqi}
                patientName={patientProfile?.name || 'Patient'}
                condition={patientProfile?.condition || 'COPD'}
                simulationDay={currentDay}
                simulationDate={activeDate}
              />
            </ErrorBoundary>
          </div>

          {/* Under Hero: 5 Vital Tiles with Baseline Delta & 7-Day Sparkline */}
          <div style={{ marginBottom: 38 }}>
            <VitalTiles
              currentTelemetry={activeTelemetryForBars}
              patientBaselines={patientProfile || {}}
              recentHistory={historyData.filter(d => (d.day_number || 0) <= currentDay)}
            />
          </div>

          {/* "What Moved the Estimate": Exact SHAP Proportional Sharing */}
          <div style={{ marginBottom: 38 }}>
            <WhatMovedTheEstimate
              shapData={activeShapData}
              patientProfile={patientProfile}
              currentTelemetry={activeTelemetryForBars}
              riskScore={activeRiskScore}
            />
          </div>

          {/* Continuous Multi-Sensor Timeline Windowed to Simulation Day */}
          <div style={{ marginBottom: 38 }}>
            <VitalsTimeline
              history={historyData}
              patientBaselines={patientProfile || {}}
              activeHorizon={activeHorizon}
              onHorizonChange={handleHorizonChange}
              currentDay={currentDay}
            />
          </div>

          {/* Alert History Audit Log */}
          <div style={{ marginBottom: 38 }}>
            <AlertHistory
              alerts={alertsHistory}
              currentDay={currentDay}
            />
          </div>

          {/* Collapsible "More Tools" Section: What-If, Delhi Map & Doctor Orders */}
          <div style={{ marginTop: 6, marginBottom: 52 }}>
            <button
              onClick={() => setShowMoreTools(!showMoreTools)}
              className="editorial-btn"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 24px',
                background: 'rgba(255, 255, 255, 0.72)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.85)',
                borderRadius: 20,
                cursor: 'pointer',
                color: 'var(--text-main)',
                fontSize: 14,
                fontWeight: 500,
                boxShadow: '0 4px 16px rgba(24, 39, 75, 0.03)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Sliders size={17} color="var(--teal-deep)" />
                <span style={{ fontWeight: 600, color: 'var(--text-serif)', fontFamily: 'var(--font-serif)', fontSize: 16 }}>
                  More clinical tools & scenario simulators
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  (What-If counterfactual, Delhi NCR atmospheric map & physician orders)
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 12.5 }}>
                <span>{showMoreTools ? 'Hide tools' : 'Show tools (3)'}</span>
                <ChevronDown
                  size={16}
                  style={{
                    transform: showMoreTools ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.25s ease'
                  }}
                />
              </div>
            </button>

            {showMoreTools && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: 24,
                  marginTop: 20
                }}
              >
                <WhatIfSimulator
                  patientId={selectedPatientId}
                  baselineRisk={activeRiskScore}
                  onRunSimulation={handleRunSimulation}
                  simulationResult={simulationResult}
                />

                <DelhiMap
                  stations={delhiStations}
                  selectedPatient={patientProfile}
                  dayNumber={currentDay}
                  currentDate={activeDate}
                />

                <DoctorActionsPanel
                  patientId={selectedPatientId}
                  onLogAction={handleLogAction}
                  loggedActions={patientProfile?.actions_log || []}
                />
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Model & Validation Drawer */}
      <ModelValidationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        analyticsData={analyticsData}
      />
    </div>
  )
}
