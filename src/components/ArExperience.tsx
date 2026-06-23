import { useEffect, useState } from 'react'
import { useQrTracker } from '../hooks/useQrTracker'
import { ModelOverlay } from './ModelOverlay'

export function ArExperience() {
  const {
    videoRef,
    canvasRef,
    containerRef,
    pose,
    isActive,
    error,
    startCamera,
    stopCamera,
  } = useQrTracker()

  const [viewSize, setViewSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const container = containerRef.current
    if (!container || !isActive) return

    const updateSize = () => {
      const { width, height } = container.getBoundingClientRect()
      setViewSize({ width, height })
    }

    updateSize()
    const observer = new ResizeObserver(updateSize)
    observer.observe(container)
    return () => observer.disconnect()
  }, [containerRef, isActive])

  return (
    <div className="relative h-full w-full bg-black text-white">
      {!isActive ? (
        <div className="flex h-full flex-col items-center justify-center gap-6 px-6 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">QR AR Model</h1>
            <p className="max-w-sm text-sm text-white/70">
              Point your camera at a QR code. A 3D model will appear floating
              above it.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void startCamera()}
            className="rounded-full bg-white px-8 py-3 text-sm font-semibold text-black transition hover:bg-white/90 active:scale-[0.98]"
          >
            Start AR
          </button>

          {error && (
            <p className="max-w-sm text-sm text-red-400" role="alert">
              {error}
            </p>
          )}

          <p className="max-w-sm text-xs text-white/45">
            Works best on a phone over HTTPS. Add your GLB at{' '}
            <code className="text-white/60">public/model.glb</code>.
          </p>
        </div>
      ) : (
        <>
          <div ref={containerRef} className="relative h-full w-full overflow-hidden">
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-cover"
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="hidden" aria-hidden />

            <ModelOverlay pose={pose} width={viewSize.width} height={viewSize.height} />

            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/80 to-transparent px-4 pb-6 pt-16">
              <p className="text-center text-sm text-white/80">
                {pose
                  ? 'QR detected — 3D model anchored above code'
                  : 'Scanning for QR code…'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={stopCamera}
            className="absolute right-4 top-4 z-40 rounded-full bg-black/50 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-black/70"
          >
            Stop
          </button>
        </>
      )}
    </div>
  )
}
