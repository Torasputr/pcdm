import { scene } from '../config/scene'

export function LoadingScreen({ step }: { step: number }) {
  const label = scene.loadingSteps[step] ?? scene.loadingSteps.at(-1)

  return (
    <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center gap-6 bg-black/90 backdrop-blur-md">
      <div
        className="h-14 w-14 animate-spin rounded-full border-[3px] border-white/10"
        style={{ borderTopColor: scene.accent }}
      />
      <div className="space-y-3 text-center">
        <p className="text-sm font-medium">{label}</p>
        <div className="flex justify-center gap-1.5">
          {scene.loadingSteps.map((_, i) => (
            <span
              key={i}
              className="h-1.5 rounded-full transition-all"
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
