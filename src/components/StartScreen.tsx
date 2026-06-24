import { scene } from '../config/scene'

interface StartScreenProps {
  onStart: () => void
  loading: boolean
  error: string | null
}

export function StartScreen({ onStart, loading, error }: StartScreenProps) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-[#0a0a0f] text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background: `radial-gradient(ellipse 80% 50% at 50% -10%, ${scene.accent}55, transparent)`,
        }}
      />

      <div className="relative flex flex-1 flex-col items-center justify-center gap-8 px-6 pb-10 pt-16">
        <div className="space-y-2 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/40">
            Web AR
          </p>
          <h1 className="text-3xl font-bold tracking-tight">{scene.name}</h1>
          <p className="mx-auto max-w-xs text-sm leading-relaxed text-white/55">
            {scene.tagline}
          </p>
        </div>

        <div className="relative">
          <div
            className="absolute -inset-3 rounded-2xl opacity-30 blur-xl"
            style={{ backgroundColor: scene.accent }}
          />
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-3 shadow-2xl">
            <img
              src={scene.cardImage}
              alt="Card target"
              className="h-44 w-44 rounded-xl bg-white object-contain"
            />
          </div>
          <p className="mt-3 text-center text-xs text-white/40">
            Point camera at this card artwork
          </p>
        </div>

        <button
          type="button"
          onClick={onStart}
          disabled={loading}
          className="w-full max-w-xs rounded-2xl py-4 text-base font-semibold text-white shadow-lg transition active:scale-[0.98] disabled:opacity-70"
          style={{
            background: `linear-gradient(135deg, ${scene.accent}, ${scene.accent}cc)`,
            boxShadow: `0 8px 32px ${scene.accent}44`,
          }}
        >
          {loading ? 'Loading…' : scene.startButton}
        </button>

        {error && (
          <p className="max-w-xs text-center text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
