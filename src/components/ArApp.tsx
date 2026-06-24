import { useMindAR } from '../ar/useMindAR'
import { LoadingScreen } from './LoadingScreen'
import { ScanHud } from './ScanHud'
import { StartScreen } from './StartScreen'

export function ArApp() {
  const {
    containerRef,
    phase,
    loadingStep,
    isTracking,
    hasAnimations,
    activeAnimation,
    error,
    start,
    stop,
  } = useMindAR()

  return (
    <div className="fixed inset-0 bg-black text-white">
      <div
        ref={containerRef}
        className="ar-viewport absolute inset-0 cursor-pointer overflow-hidden"
      />

      {phase === 'idle' && (
        <StartScreen
          onStart={() => void start()}
          loading={false}
          error={error}
        />
      )}

      {phase === 'loading' && <LoadingScreen step={loadingStep} />}

      {phase === 'ar' && (
        <ScanHud
          isTracking={isTracking}
          hasAnimations={hasAnimations}
          activeAnimation={activeAnimation}
          onClose={stop}
        />
      )}
    </div>
  )
}
