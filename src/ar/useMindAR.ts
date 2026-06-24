import { useCallback, useEffect, useRef, useState } from 'react'
import { MindARThree } from 'mind-ar/dist/mindar-image-three.prod.js'
import * as THREE from 'three'
import { scene } from '../config/scene'
import { addArLighting } from './lighting'
import { loadCardModel } from './loadModel'
import type { ModelAnimations } from './modelAnimations'
import { disposeMindAR, syncMindARViewport } from './mindarDisplay'

const ENTRANCE_SPEED = 0.12

export function useMindAR() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mindarRef = useRef<MindARThree | null>(null)
  const scaleGroupRef = useRef<THREE.Group | null>(null)
  const animationsRef = useRef<ModelAnimations | null>(null)
  const clockRef = useRef(new THREE.Clock())
  const entranceRef = useRef(0)
  const trackingRef = useRef(false)

  const [phase, setPhase] = useState<'idle' | 'loading' | 'ar'>('idle')
  const [loadingStep, setLoadingStep] = useState(0)
  const [isTracking, setIsTracking] = useState(false)
  const [hasAnimations, setHasAnimations] = useState(false)
  const [activeAnimation, setActiveAnimation] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const stop = useCallback(() => {
    const container = containerRef.current
    const mindar = mindarRef.current
    if (mindar && container) disposeMindAR(mindar, container)

    animationsRef.current?.dispose()
    mindarRef.current = null
    scaleGroupRef.current = null
    animationsRef.current = null
    entranceRef.current = 0
    trackingRef.current = false
    clockRef.current = new THREE.Clock()
    setPhase('idle')
    setIsTracking(false)
    setHasAnimations(false)
    setActiveAnimation(null)
    setLoadingStep(0)
    setError(null)
  }, [])

  const playNextAnimation = useCallback(() => {
    if (!trackingRef.current || !animationsRef.current?.hasAnimations) return

    const name = animationsRef.current.next()
    if (name) {
      setActiveAnimation(name)
      navigator.vibrate?.(20)
    }
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
        setActiveAnimation(null)
        scaleGroupRef.current?.scale.setScalar(0.001)
      }

      setLoadingStep(1)
      const { root, scaleGroup, animations } = await loadCardModel()
      scaleGroup.scale.setScalar(0.001)
      scaleGroupRef.current = scaleGroup
      animationsRef.current = animations
      setHasAnimations(animations?.hasAnimations ?? false)
      anchor.group.add(root)

      setLoadingStep(2)
      await mindar.start()
      syncMindARViewport(mindar)

      const { renderer, scene: threeScene, camera } = mindar
      renderer.setAnimationLoop(() => {
        const delta = clockRef.current.getDelta()
        animationsRef.current?.update(delta)

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
      animationsRef.current?.dispose()
      animationsRef.current = null

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

  useEffect(() => {
    if (phase !== 'ar') return

    const onTap = () => playNextAnimation()
    const container = containerRef.current
    const canvas = mindarRef.current?.renderer.domElement

    container?.addEventListener('click', onTap)
    canvas?.addEventListener('click', onTap)

    return () => {
      container?.removeEventListener('click', onTap)
      canvas?.removeEventListener('click', onTap)
    }
  }, [phase, playNextAnimation])

  useEffect(() => () => stop(), [stop])

  return {
    containerRef,
    phase,
    loadingStep,
    isTracking,
    hasAnimations,
    activeAnimation,
    error,
    start,
    stop,
    playNextAnimation,
  }
}
