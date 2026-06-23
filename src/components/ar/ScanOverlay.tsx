import { scene } from '../../config'

interface ScanOverlayProps {
  isTracking: boolean
}

export function ScanOverlay({ isTracking }: ScanOverlayProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-30">
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          isTracking ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 45%, transparent 55%, rgba(0,0,0,0.55) 100%)',
        }}
      />

      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`relative h-56 w-56 transition-all duration-500 sm:h-64 sm:w-64 ${
            isTracking ? 'scale-110 opacity-0' : 'scale-100 opacity-100'
          }`}
        >
          <Corner className="left-0 top-0 border-l-2 border-t-2" accent={scene.accent} />
          <Corner
            className="right-0 top-0 border-r-2 border-t-2"
            accent={scene.accent}
          />
          <Corner
            className="bottom-0 left-0 border-b-2 border-l-2"
            accent={scene.accent}
          />
          <Corner
            className="bottom-0 right-0 border-b-2 border-r-2"
            accent={scene.accent}
          />

          <div
            className="scan-line absolute left-2 right-2 h-0.5 rounded-full opacity-80"
            style={{
              background: `linear-gradient(90deg, transparent, ${scene.accent}, transparent)`,
              boxShadow: `0 0 12px ${scene.accent}`,
            }}
          />
        </div>
      </div>

      <div
        className={`absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-2 backdrop-blur-md transition-all duration-300 ${
          isTracking ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <img
          src={scene.targetPreviewSrc}
          alt=""
          className="h-8 w-8 rounded-md bg-white object-contain"
        />
        <span className="text-xs text-white/70">Find this image</span>
      </div>
    </div>
  )
}

function Corner({
  className,
  accent,
}: {
  className: string
  accent: string
}) {
  return (
    <span
      className={`absolute h-8 w-8 rounded-sm ${className}`}
      style={{ borderColor: accent }}
    />
  )
}
