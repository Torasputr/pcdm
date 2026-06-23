import { scene } from '../../config'

interface ArHudProps {
  isTracking: boolean
  onClose: () => void
}

export function ArHud({ isTracking, onClose }: ArHudProps) {
  return (
    <>
      <div className="absolute inset-x-0 top-0 z-40 flex items-center justify-between px-4 pb-8 pt-4 bg-gradient-to-b from-black/70 to-transparent">
        <div>
          <p className="text-sm font-semibold">{scene.name}</p>
          <p
            className="text-xs transition-colors duration-300"
            style={{ color: isTracking ? '#4ade80' : 'rgba(255,255,255,0.45)' }}
          >
            {isTracking ? '● Target locked' : '○ Scanning…'}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/40 text-lg leading-none backdrop-blur-md transition hover:bg-black/60"
          aria-label="Close AR"
        >
          ×
        </button>
      </div>

      <div
        className={`pointer-events-none absolute inset-x-0 bottom-0 z-40 px-6 pb-8 pt-12 transition-opacity duration-500 ${
          isTracking ? 'opacity-100' : 'opacity-90'
        }`}
        style={{
          background:
            'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)',
        }}
      >
        <p className="text-center text-sm text-white/75">
          {isTracking ? scene.foundHint : scene.scanningHint}
        </p>
      </div>
    </>
  )
}
