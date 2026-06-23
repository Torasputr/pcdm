import { scene } from '../../config'

interface LoadingOverlayProps {
  step: number
}

export function LoadingOverlay({ step }: LoadingOverlayProps) {
  const label = scene.loadingSteps[step] ?? scene.loadingSteps.at(-1)

  return (
    <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center gap-6 bg-black/85 backdrop-blur-md">
      <div className="relative h-16 w-16">
        <div
          className="absolute inset-0 animate-spin rounded-full border-[3px] border-white/10"
          style={{ borderTopColor: scene.accent }}
        />
        <div
          className="absolute inset-2 animate-pulse rounded-full opacity-30"
          style={{ backgroundColor: scene.accent }}
        />
      </div>

      <div className="space-y-3 text-center">
        <p className="text-sm font-medium text-white/90">{label}</p>
        <div className="flex justify-center gap-1.5">
          {scene.loadingSteps.map((_, i) => (
            <span
              key={i}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === step ? 24 : 6,
                backgroundColor: i <= step ? scene.accent : 'rgba(255,255,255,0.15)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
