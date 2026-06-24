import { useCallback, useEffect, useRef, useState } from 'react'
import { MindARThree } from 'mind-ar/dist/mindar-image-three.prod.js'
import type * as THREE from 'three'
import { scene } from '../config/scene'
import { addArLighting } from './lighting'
import { loadCardModel } from './loadModel'
import { disposeMindAR, syncMindARViewport } from './mindarDisplay'

const ENTRANCE_SPEED = 0.12

export function useMindAR() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mindarRef = useRef<MindARThree | null>(null)
  const scaleGroupRef = useRef<THREE.Group | null>(null)
  const entranceRef = useRef(0)
  const trackingRef = useRef(false)

  const [phase, setPhase] = useState<'idle' | 'loading' | 'ar'>('idle')
  const [loadingStep, setLoadingStep] = useState(0)
  const [isTracking, setIsTracking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const stop = useCallback(() => {
    const container = containerRef.current
    const mindar = mindarRef.current
    if (mindar && container) disposeMindAR(mindar, container)

    mindarRef.current = null
    scaleGroupRef.current = null
    entranceRef.current = 0
    trackingRef.current = false
    setPhase('idle')
    setIsTracking(false)
    setLoadingStep(0)
    setError(null)
  }, [])

  const start = useCallback(async () => {
    const container = containerRef.current
    if (!container || phase === 'loading') return

    setError(null)
    setPhase('loading')
    setLoadingStep(0)

    try {
      const mindar = new MindARThree({
        container,
        imageTargetSrc: scene.mindFile,
        uiLoading: 'no',
        uiScanning: 'no',
        uiError: 'no',
        filterMinCF: 0.0001,
        filterBeta: 0.001,
      })
      mindarRef.current = mindar
      addArLighting(mindar.scene)

      const anchor = mindar.addAnchor(0)
      anchor.onTargetFound = () => {
        trackingRef.current = true
        setIsTracking(true)
        navigator.vibrate?.(40)
      }
      anchor.onTargetLost = () => {
        trackingRef.current = false
        entranceRef.current = 0
        setIsTracking(false)
        scaleGroupRef.current?.scale.setScalar(0.001)
      }

      setLoadingStep(1)
      const { root, scaleGroup } = await loadCardModel()
      scaleGroup.scale.setScalar(0.001)
      scaleGroupRef.current = scaleGroup
      anchor.group.add(root)

      setLoadingStep(2)
      await mindar.start()
      syncMindARViewport(mindar)

      const { renderer, scene: threeScene, camera } = mindar
      renderer.setAnimationLoop(() => {
        if (trackingRef.current && scaleGroupRef.current) {
          entranceRef.current = Math.min(1, entranceRef.current + ENTRANCE_SPEED)
          const eased = 1 - (1 - entranceRef.current) ** 3
          scaleGroupRef.current.scale.setScalar(Math.max(0.001, eased))
        }
        renderer.render(threeScene, camera)
      })

      setPhase('ar')
      requestAnimationFrame(() => {
        if (mindarRef.current) syncMindARViewport(mindarRef.current)
      })
    } catch (err) {
      const container = containerRef.current
      if (mindarRef.current && container) {
        disposeMindAR(mindarRef.current, container)
        mindarRef.current = null
      }
      setError(
        err instanceof Error
          ? err.message
          : 'Could not start AR. Use HTTPS and allow camera access.',
      )
      setPhase('idle')
    }
  }, [phase])

  useEffect(() => {
    if (phase !== 'ar') return
    const onResize = () => {
      if (mindarRef.current) syncMindARViewport(mindarRef.current)
    }
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
    }
  }, [phase])

  useEffect(() => () => stop(), [stop])

  return {
    containerRef,
    phase,
    loadingStep,
    isTracking,
    error,
    start,
    stop,
  }
}
