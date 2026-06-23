import { useCallback, useEffect, useRef, useState } from 'react'
import { MindARThree } from 'mind-ar/dist/mindar-image-three.prod.js'
import { MINDAR_TARGET_SRC } from '../config'
import { loadArModel } from '../utils/loadArModel'

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

  const [isActive, setIsActive] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [isTracking, setIsTracking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const stopAR = useCallback(() => {
    const container = containerRef.current
    const mindar = mindarRef.current
    if (mindar && container) {
      disposeMindAR(mindar, container)
    }
    mindarRef.current = null
    setIsActive(false)
    setIsTracking(false)
    setIsStarting(false)
  }, [])

  const startAR = useCallback(async () => {
    const container = containerRef.current
    if (!container || isStarting) return

    setError(null)
    setIsStarting(true)

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
      anchor.onTargetFound = () => setIsTracking(true)
      anchor.onTargetLost = () => setIsTracking(false)

      const model = await loadArModel()
      anchor.group.add(model)

      const { renderer, scene, camera } = mindarThree
      await mindarThree.start()

      renderer.setAnimationLoop(() => {
        renderer.render(scene, camera)
      })

      setIsActive(true)
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
    } finally {
      setIsStarting(false)
    }
  }, [isStarting])

  useEffect(() => () => stopAR(), [stopAR])

  return (
    <div className="relative h-full w-full bg-black text-white">
      <div
        ref={containerRef}
        className={`h-full w-full ${isActive ? '' : 'invisible'}`}
        aria-hidden={!isActive}
      />

      {!isActive && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-6 px-6 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">MindAR Model</h1>
            <p className="max-w-sm text-sm text-white/70">
              Point your camera at the printed target image. The 3D model locks
              onto it and stays in place.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void startAR()}
            disabled={isStarting}
            className="rounded-full bg-white px-8 py-3 text-sm font-semibold text-black transition hover:bg-white/90 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
          >
            {isStarting ? 'Loading AR…' : 'Start AR'}
          </button>

          {error && (
            <p className="max-w-sm text-sm text-red-400" role="alert">
              {error}
            </p>
          )}

          <div className="max-w-sm space-y-2 text-xs text-white/45">
            <p>
              Point your camera at your QR code (open{' '}
              <code className="text-white/60">/qr-target.png</code> on another
              screen or print it).
            </p>
            <p>
              Recompile after changing the image:{' '}
              <code className="text-white/60">npm run compile-target</code>
            </p>
          </div>
        </div>
      )}

      {isActive && (
        <>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/80 to-transparent px-4 pb-6 pt-16">
            <p className="text-center text-sm text-white/80">
              {isTracking
                ? 'Target found — model anchored'
                : 'Point camera at the target image…'}
            </p>
          </div>

          <button
            type="button"
            onClick={stopAR}
            className="absolute right-4 top-4 z-40 rounded-full bg-black/50 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-black/70"
          >
            Stop
          </button>
        </>
      )}
    </div>
  )
}
