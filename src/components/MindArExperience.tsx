import { useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { MindARThree } from 'mind-ar/dist/mindar-image-three.prod.js'
import { MINDAR_TARGET_SRC } from '../config'
import { loadArModel } from '../utils/loadArModel'
import { ArHud } from './ar/ArHud'
import { LoadingOverlay } from './ar/LoadingOverlay'
import { ScanOverlay } from './ar/ScanOverlay'
import { StartScreen } from './ar/StartScreen'

const ENTRANCE_SPEED = 0.12

function configureMindARDisplay(mindar: MindARThree) {
  const { renderer, video } = mindar

  renderer.setClearColor(0x000000, 0)
  renderer.domElement.style.background = 'transparent'
  renderer.domElement.style.zIndex = '2'

  video.style.zIndex = '1'
  video.style.objectFit = 'cover'

  mindar.resize()
}

function disposeMindAR(mindar: MindARThree, container: HTMLElement) {
  mindar.renderer.setAnimationLoop(null)
  mindar.stop()
  mindar.renderer.domElement.remove()
  mindar.cssRenderer.domElement.remove()
  container.replaceChildren()
}

export function MindArExperience() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mindarRef = useRef<MindARThree | null>(null)
  const modelRef = useRef<THREE.Group | null>(null)
  const entranceRef = useRef(0)
  const trackingRef = useRef(false)

  const [isActive, setIsActive] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [isTracking, setIsTracking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const stopAR = useCallback(() => {
    const container = containerRef.current
    const mindar = mindarRef.current
    if (mindar && container) {
      disposeMindAR(mindar, container)
    }
    mindarRef.current = null
    modelRef.current = null
    entranceRef.current = 0
    trackingRef.current = false
    setIsActive(false)
    setIsTracking(false)
    setIsStarting(false)
    setLoadingStep(0)
  }, [])

  const startAR = useCallback(async () => {
    const container = containerRef.current
    if (!container || isStarting) return

    setError(null)
    setIsStarting(true)
    setLoadingStep(0)

    try {
      const mindarThree = new MindARThree({
        container,
        imageTargetSrc: MINDAR_TARGET_SRC,
        uiLoading: 'no',
        uiScanning: 'no',
        uiError: 'no',
        filterMinCF: 0.0001,
        filterBeta: 0.001,
      })
      mindarRef.current = mindarThree

      const anchor = mindarThree.addAnchor(0)

      anchor.onTargetFound = () => {
        trackingRef.current = true
        setIsTracking(true)
        if (navigator.vibrate) navigator.vibrate(40)
      }

      anchor.onTargetLost = () => {
        trackingRef.current = false
        entranceRef.current = 0
        setIsTracking(false)
        if (modelRef.current) {
          modelRef.current.scale.setScalar(0.001)
        }
      }

      setLoadingStep(1)
      const model = await loadArModel()
      model.scale.setScalar(0.001)
      modelRef.current = model
      anchor.group.add(model)

      setLoadingStep(2)
      const { renderer, scene, camera } = mindarThree
      await mindarThree.start()

      configureMindARDisplay(mindarThree)

      renderer.setAnimationLoop(() => {
        if (trackingRef.current && modelRef.current) {
          entranceRef.current = Math.min(
            1,
            entranceRef.current + ENTRANCE_SPEED,
          )
          const eased = 1 - Math.pow(1 - entranceRef.current, 3)
          modelRef.current.scale.setScalar(Math.max(0.001, eased))
        }
        renderer.render(scene, camera)
      })

      setIsStarting(false)
      setIsActive(true)

      requestAnimationFrame(() => {
        mindarRef.current?.resize()
      })
    } catch (err) {
      const container = containerRef.current
      if (mindarRef.current && container) {
        disposeMindAR(mindarRef.current, container)
        mindarRef.current = null
      }

      const message =
        err instanceof Error && err.message
          ? err.message
          : 'Could not start AR. Use HTTPS and allow camera access.'

      setError(message)
      setIsActive(false)
      setIsStarting(false)
    }
  }, [isStarting])

  useEffect(() => {
    if (!isActive) return

    const onResize = () => mindarRef.current?.resize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [isActive])

  useEffect(() => () => stopAR(), [stopAR])

  return (
    <div className="relative h-full w-full bg-black text-white">
      <div
        ref={containerRef}
        className="relative z-0 h-full w-full overflow-hidden"
      />

      {!isActive && (
        <StartScreen
          onStart={() => void startAR()}
          isLoading={isStarting}
          error={error}
        />
      )}

      {isStarting && !isActive && <LoadingOverlay step={loadingStep} />}

      {isActive && (
        <>
          <ScanOverlay isTracking={isTracking} />
          <ArHud isTracking={isTracking} onClose={stopAR} />
        </>
      )}
    </div>
  )
}
