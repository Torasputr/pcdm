import { scene } from '../config/scene'

export function ScanHud({
  isTracking,
  hasAnimations,
  activeAnimation,
  onClose,
}: {
  isTracking: boolean
  hasAnimations: boolean
  activeAnimation: string | null
  onClose: () => void
}) {
  const bottomHint = !isTracking
    ? scene.scanningHint
    : hasAnimations
      ? scene.tapToAnimateHint
      : scene.foundHint

  return (
    <>
      <div className="pointer-events-none absolute inset-0 z-30">
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${isTracking ? 'opacity-0' : 'opacity-100'}`}
          style={{
            background:
              'radial-gradient(ellipse 70% 55% at 50% 45%, transparent 55%, rgba(0,0,0,0.55) 100%)',
          }}
        />

        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${isTracking ? 'opacity-0' : 'opacity-100'}`}
        >
          <div className="relative h-60 w-60">
            <Corner className="left-0 top-0 border-l-2 border-t-2" />
            <Corner className="right-0 top-0 border-r-2 border-t-2" />
            <Corner className="bottom-0 left-0 border-b-2 border-l-2" />
            <Corner className="bottom-0 right-0 border-b-2 border-r-2" />
            <div
              className="scan-line absolute left-2 right-2 h-0.5 rounded-full"
              style={{
                background: `linear-gradient(90deg, transparent, ${scene.accent}, transparent)`,
              }}
            />
          </div>
        </div>

        <div
          className={`absolute left-4 top-20 flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-2 backdrop-blur-md transition-opacity ${isTracking ? 'opacity-0' : 'opacity-100'}`}
        >
          <img src={scene.cardImage} alt="" className="h-8 w-8 rounded bg-white object-contain" />
          <span className="text-xs text-white/70">Find this card</span>
        </div>
      </div>

      <div className="absolute inset-x-0 top-0 z-40 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent px-4 pb-8 pt-4">
        <div>
          <p className="text-sm font-semibold">{scene.name}</p>
          <p
            className="text-xs"
            style={{ color: isTracking ? '#4ade80' : 'rgba(255,255,255,0.45)' }}
          >
            {isTracking ? '● Target locked' : '○ Scanning…'}
          </p>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/40 text-lg backdrop-blur-md"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 bg-gradient-to-t from-black/75 to-transparent px-6 pb-8 pt-12">
        <p className="text-center text-sm text-white/75">{bottomHint}</p>
        {isTracking && activeAnimation && (
          <p className="mt-1 text-center text-xs text-white/45">{activeAnimation}</p>
        )}
      </div>
    </>
  )
}

function Corner({ className }: { className: string }) {
  return (
    <span
      className={`absolute h-8 w-8 ${className}`}
      style={{ borderColor: scene.accent }}
    />
  )
}
