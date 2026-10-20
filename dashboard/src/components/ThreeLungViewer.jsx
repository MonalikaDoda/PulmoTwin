import React, { useEffect, useRef, useState, useMemo } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { Wind, Activity, AlertCircle, ShieldAlert, Rotate3d, Eye } from 'lucide-react'
import LungTwinHero from './LungTwinHero'

export default function ThreeLungViewer({
  riskScore = 0,
  riskLevel = 'Low',
  respiratoryRate = 16,
  spo2 = 95,
  aqi = 120,
  patientName = 'Patient',
  condition = 'COPD',
  simulationDay = null,
  simulationDate = null
}) {
  const mountRef = useRef(null)
  const [loadError, setLoadError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [use3D, setUse3D] = useState(true)
  const [modelLoaded, setModelLoaded] = useState(false)

  // Smoothly animated risk score for playback transitions
  const [animatedScore, setAnimatedScore] = useState(riskScore)
  const currentScoreRef = useRef(riskScore)

  useEffect(() => {
    let frameId
    const start = currentScoreRef.current
    const target = riskScore
    if (Math.abs(start - target) < 0.05) {
      currentScoreRef.current = target
      setAnimatedScore(target)
      return
    }

    const startTime = performance.now()
    const duration = 240

    const animate = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(1, elapsed / duration)
      const ease = 1 - Math.pow(1 - progress, 3)
      const current = start + (target - start) * ease
      currentScoreRef.current = current
      setAnimatedScore(current)

      if (progress < 1) {
        frameId = requestAnimationFrame(animate)
      } else {
        currentScoreRef.current = target
        setAnimatedScore(target)
      }
    }

    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
  }, [riskScore])

  // Breathing cycle duration in seconds: 60 / respiratory_rate
  const rr = Math.max(10, Math.min(36, respiratoryRate || 16))
  const breathDuration = (60 / rr).toFixed(2)

  // Color Theme: Teal -> Amber -> Coral
  const colorTheme = useMemo(() => {
    if (riskScore >= 50) {
      return {
        hex: 0xe11d48,
        css: '#e11d48',
        emissive: 0x4a0512,
        bgGlow: 'rgba(225, 29, 72, 0.16)',
        tagBg: '#fff1f2',
        tagText: '#be123c',
        statusLabel: 'Elevated Risk'
      }
    }
    if (riskScore >= 25) {
      return {
        hex: 0xd97706,
        css: '#d97706',
        emissive: 0x451a03,
        bgGlow: 'rgba(217, 119, 6, 0.14)',
        tagBg: '#fef3c7',
        tagText: '#92400e',
        statusLabel: 'Moderate Risk'
      }
    }
    return {
      hex: 0x0f4c47,
      css: '#0f4c47',
      emissive: 0x042f2e,
      bgGlow: 'rgba(15, 76, 71, 0.12)',
      tagBg: '#f0fdfa',
      tagText: '#0f4c47',
      statusLabel: 'Stable Twin'
    }
  }, [riskScore])

  // Keep live refs for animation loop
  const rrRef = useRef(rr)
  useEffect(() => { rrRef.current = rr }, [rr])

  const riskHexRef = useRef(colorTheme.hex)
  useEffect(() => { riskHexRef.current = colorTheme.hex }, [colorTheme.hex])

  const aqiRef = useRef(aqi)
  useEffect(() => { aqiRef.current = aqi }, [aqi])

  // Three.js Scene Setup & Animation
  useEffect(() => {
    if (!mountRef.current || !use3D) return

    const container = mountRef.current
    const width = container.clientWidth || 360
    const height = container.clientHeight || 340

    // Scene
    const scene = new THREE.Scene()

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000)
    camera.position.set(0, 0, 3.8)

    // Renderer
    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setSize(width, height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.outputColorSpace = THREE.SRGBColorSpace
      container.appendChild(renderer.domElement)
    } catch (e) {
      console.warn('[ThreeLungViewer] WebGL initialization failed, falling back to SVG:', e)
      setLoadError(true)
      return
    }

    // Hospital Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0)
    keyLight.position.set(3, 4, 5)
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0xccfbf1, 1.2)
    fillLight.position.set(-3, -2, -2)
    scene.add(fillLight)

    const rimLight = new THREE.DirectionalLight(0xffedd5, 1.0)
    rimLight.position.set(0, 5, -4)
    scene.add(rimLight)

    // Root model holder
    const modelGroup = new THREE.Group()
    scene.add(modelGroup)

    // Floating AQI Particles
    const particleCount = 200
    const particleGeometry = new THREE.BufferGeometry()
    const particlePositions = new Float32Array(particleCount * 3)
    const particleVelocities = []

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3 + 0] = (Math.random() - 0.5) * 4.0
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 3.5
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 2.5
      particleVelocities.push({
        y: -(0.002 + Math.random() * 0.005),
        x: (Math.random() - 0.5) * 0.002,
        z: (Math.random() - 0.5) * 0.002
      })
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x94a3b8,
      size: 0.045,
      transparent: true,
      opacity: 0.5,
      blending: THREE.NormalBlending
    })
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial)
    scene.add(particleSystem)

    // Load GLB Model
    const loader = new GLTFLoader()
    let isDisposed = false
    const meshMaterials = []

    loader.load(
      '/lungs.glb',
      (gltf) => {
        if (isDisposed) return
        setLoading(false)
        setModelLoaded(true)

        const root = gltf.scene

        // Center and normalize geometry via Box3
        const box = new THREE.Box3().setFromObject(root)
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z) || 1.0
        const normScale = 2.4 / maxDim

        root.scale.setScalar(normScale)
        root.position.sub(center.clone().multiplyScalar(normScale))

        // Enhance materials with physiological tinting
        root.traverse((child) => {
          if (child.isMesh) {
            const isLungParenchyma = child.name.toLowerCase().includes('lung') || child.name.toLowerCase().includes('respiratoy')
            const mat = new THREE.MeshStandardMaterial({
              color: riskHexRef.current,
              roughness: isLungParenchyma ? 0.35 : 0.6,
              metalness: 0.1,
              emissive: riskHexRef.current,
              emissiveIntensity: 0.15,
              transparent: true,
              opacity: 0.94
            })
            child.material = mat
            meshMaterials.push({ mesh: child, isParenchyma: isLungParenchyma })
          }
        })

        modelGroup.add(root)
      },
      undefined,
      (err) => {
        console.warn('[ThreeLungViewer] Failed to load /lungs.glb, falling back to SVG:', err)
        setLoadError(true)
        setLoading(false)
      }
    )

    // Subtle Drag to Rotate interaction
    let isDragging = false
    let prevMouseX = 0
    let prevMouseY = 0

    const onMouseDown = (e) => {
      isDragging = true
      prevMouseX = e.clientX
      prevMouseY = e.clientY
    }
    const onMouseMove = (e) => {
      if (!isDragging) return
      const deltaX = e.clientX - prevMouseX
      const deltaY = e.clientY - prevMouseY
      modelGroup.rotation.y += deltaX * 0.008
      modelGroup.rotation.x += deltaY * 0.008
      prevMouseX = e.clientX
      prevMouseY = e.clientY
    }
    const onMouseUp = () => { isDragging = false }

    container.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)

    // Animation Timer using performance.now() (avoids deprecated THREE.Clock warning)
    const startTime = performance.now()
    let animationFrameId

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      const elapsed = (performance.now() - startTime) * 0.001

      // 1. Breathing frequency scaled by patient's respiratory rate
      const currentRR = rrRef.current || 16
      const freq = (currentRR * 2 * Math.PI) / 60
      const breathVal = Math.sin(elapsed * freq)

      // Physiological expansion: lungs expand primarily in width and height
      const breathScale = 1.0 + breathVal * 0.075
      const breathScaleY = 1.0 + breathVal * 0.05
      modelGroup.scale.set(breathScale, breathScaleY, breathScale)

      // Gentle idling drift rotation when not dragging
      if (!isDragging) {
        modelGroup.rotation.y = Math.sin(elapsed * 0.4) * 0.18
        modelGroup.rotation.x = Math.sin(elapsed * 0.3) * 0.05
      }

      // 2. Smoothly tint materials based on risk score
      const targetColor = new THREE.Color(riskHexRef.current)
      meshMaterials.forEach(({ mesh }) => {
        if (mesh.material && mesh.material.color) {
          mesh.material.color.lerp(targetColor, 0.05)
          mesh.material.emissive.lerp(targetColor, 0.05)
        }
      })

      // 3. AQI Particles: drift & density
      const currentAqi = aqiRef.current || 120
      const targetOpacity = Math.min(0.85, Math.max(0.15, (currentAqi / 400) * 0.8))
      particleMaterial.opacity = THREE.MathUtils.lerp(particleMaterial.opacity, targetOpacity, 0.05)

      // Shift particle color based on AQI (gray -> amber smog)
      if (currentAqi > 250) {
        particleMaterial.color.setHex(0xb45309) // smog amber
      } else if (currentAqi > 150) {
        particleMaterial.color.setHex(0x78716c) // warm particulate
      } else {
        particleMaterial.color.setHex(0x94a3b8) // clean air particles
      }

      const positions = particleGeometry.attributes.position.array
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += particleVelocities[i].y
        positions[i * 3 + 0] += particleVelocities[i].x
        positions[i * 3 + 2] += particleVelocities[i].z

        // Wrap around bounds
        if (positions[i * 3 + 1] < -1.8) positions[i * 3 + 1] = 1.8
        if (positions[i * 3 + 0] < -2.0) positions[i * 3 + 0] = 2.0
        if (positions[i * 3 + 0] > 2.0) positions[i * 3 + 0] = -2.0
      }
      particleGeometry.attributes.position.needsUpdate = true

      renderer.render(scene, camera)
    }

    animate()

    // Resize handler
    const handleResize = () => {
      if (!mountRef.current || !renderer) return
      const w = mountRef.current.clientWidth || 360
      const h = mountRef.current.clientHeight || 340
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      isDisposed = true
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      container.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)

      if (renderer) {
        renderer.dispose()
        if (renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement)
        }
      }
      particleGeometry.dispose()
      particleMaterial.dispose()
    }
  }, [use3D])

  // Fallback to SVG lung if 3D loading fails or user toggles
  if (loadError || !use3D) {
    return (
      <div style={{ position: 'relative' }}>
        <LungTwinHero
          riskScore={riskScore}
          riskLevel={riskLevel}
          respiratoryRate={respiratoryRate}
          spo2={spo2}
          aqi={aqi}
          patientName={patientName}
          condition={condition}
        />
        {/* Switch back button */}
        {!loadError && (
          <button
            onClick={() => setUse3D(true)}
            style={{
              position: 'absolute',
              top: 18,
              right: 18,
              background: 'white',
              border: '1px solid var(--border-medium)',
              borderRadius: 6,
              padding: '5px 10px',
              fontSize: 11.5,
              color: 'var(--teal-deep)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5
            }}
          >
            <Rotate3d size={13} /> Switch to 3D Twin
          </button>
        )}
      </div>
    )
  }

  return (
    <div
      className="editorial-card"
      style={{
        padding: '28px 32px',
        marginBottom: 20,
        position: 'relative',
        background: `radial-gradient(circle at 45% 45%, ${colorTheme.bgGlow} 0%, rgba(255,255,255,0.95) 70%)`
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 380px) 1fr',
          gap: 32,
          alignItems: 'center'
        }}
      >
        {/* Left Column: 3D Canvas Container */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: 350,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'grab'
          }}
        >
          {/* Three.js mount point */}
          <div
            ref={mountRef}
            style={{
              width: '100%',
              height: '100%',
              outline: 'none'
            }}
          />

          {/* Loader Overlay */}
          {loading && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(251, 249, 245, 0.85)',
                backdropFilter: 'blur(4px)',
                borderRadius: 8,
                zIndex: 10
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  border: '3px solid var(--teal-light)',
                  borderTopColor: 'var(--teal-deep)',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginBottom: 10
                }}
              />
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Loading 3D Respiratory Twin...
              </span>
            </div>
          )}

          {/* Controls pill (3D active / Switch to 2D Schematic) */}
          <div
            style={{
              position: 'absolute',
              bottom: 6,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255, 255, 255, 0.92)',
              border: '1px solid var(--border-medium)',
              borderRadius: 20,
              padding: '3px 10px',
              fontSize: 11,
              color: 'var(--text-muted)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              zIndex: 5
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Rotate3d size={12} color="var(--teal-mid)" /> Drag to inspect
            </span>
            <span style={{ color: 'var(--border-medium)' }}>•</span>
            <button
              onClick={() => setUse3D(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--teal-deep)',
                cursor: 'pointer',
                fontSize: 11,
                padding: 0,
                textDecoration: 'underline'
              }}
            >
              2D View
            </button>
          </div>
        </div>

        {/* Right Column: Hero Metrics & Risk Forecast */}
        <div>
          {/* Status Label & Active Simulation Timestamp */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 8
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  display: 'inline-block',
                  width: 9,
                  height: 9,
                  borderRadius: '50%',
                  background: colorTheme.css,
                  boxShadow: `0 0 0 3px ${colorTheme.bgGlow}`
                }}
              />
              <span
                style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: colorTheme.css
                }}
              >
                {colorTheme.statusLabel} • {condition}
              </span>
            </div>

            {simulationDay && (
              <span
                style={{
                  fontSize: 11.5,
                  fontWeight: 500,
                  background: 'var(--teal-wash)',
                  color: 'var(--teal-deep)',
                  padding: '2px 8px',
                  borderRadius: 4
                }}
              >
                Day {simulationDay} / 365 {simulationDate ? `• ${simulationDate}` : ''}
              </span>
            )}
          </div>

          {/* Large Hero Risk Number */}
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 16,
              marginBottom: 8,
              animation: riskScore >= 50 ? 'alertPulseGentle 2.4s ease-in-out infinite' : 'none',
              transformOrigin: 'left center'
            }}
          >
            <span
              className="heading-serif"
              style={{
                fontSize: 98,
                lineHeight: 0.95,
                fontWeight: 600,
                color: colorTheme.css,
                letterSpacing: '-0.04em'
              }}
            >
              {animatedScore.toFixed(1)}
              <span style={{ fontSize: 40, fontWeight: 400, color: 'var(--text-light)', marginLeft: 3 }}>
                %
              </span>
            </span>

            <div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  lineHeight: 1.3
                }}
              >
                Forecasted Flare-Up Probability
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: 'var(--text-muted)'
                }}
              >
                Next 48 Hours Horizon
              </div>
            </div>
          </div>

          <p
            style={{
              fontSize: 14.5,
              color: 'var(--text-muted)',
              lineHeight: 1.65,
              marginBottom: 22,
              maxWidth: 520
            }}
          >
            {riskScore >= 75
              ? 'Critical prodromal signature detected. Multimodal biomarker drift indicates acute exacerbation risk within 48 hours. Urgent clinical outreach recommended.'
              : riskScore >= 50
              ? 'Elevated risk state. Resting tachycardia and exertional dyspnea combined with elevated Delhi AQI indicate impending airway deterioration.'
              : riskScore >= 25
              ? 'Moderate respiratory stress observed. Sub-clinical SpO2 drift and air quality exposure suggest prophylactic bronchodilator review.'
              : 'Physiological vitals remain congruent with personal baseline. Normal airway dynamics with no prodromal decompensation detected.'}
          </p>

          {/* Real-time Physiological Vitals Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 16,
              paddingTop: 16,
              borderTop: '1px solid var(--border-subtle)'
            }}
          >
            {/* Breathing Frequency */}
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 5, fontWeight: 500 }}>
                <Activity size={13} color="var(--teal-mid)" /> Respiratory rate
              </div>
              <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-main)' }}>
                {respiratoryRate || 16}{' '}
                <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)' }}>
                  rpm ({breathDuration}s cycle)
                </span>
              </div>
            </div>

            {/* Resting SpO2 */}
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 5, fontWeight: 500 }}>
                <Activity size={13} color="var(--teal-mid)" /> Blood oxygen (SpO2)
              </div>
              <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-main)' }}>
                {spo2 || 95}%{' '}
                <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)' }}>
                  resting
                </span>
              </div>
            </div>

            {/* Delhi CAMS AQI */}
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 5, fontWeight: 500 }}>
                <Wind size={13} color="var(--teal-mid)" /> Air quality (NAQI)
              </div>
              <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-main)' }}>
                {aqi || 120}{' '}
                <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)' }}>
                  AQI ({aqi > 200 ? 'Severe' : aqi > 100 ? 'Moderate' : 'Good'})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
