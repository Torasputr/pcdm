// Drop your GLB at `public/model.glb`
export const AR_MODEL_SRC = '/model.glb'

export const AR_MODEL_FALLBACK =
  'https://modelviewer.dev/shared-assets/models/Astronaut.glb'

// Compiled MindAR target. Replace with your own from:
// https://hiukim.github.io/mind-ar-js-doc/tools/compile
export const MINDAR_TARGET_SRC = '/targets.mind'

// Model transform in MindAR anchor space (target width ~= 1 unit).
// Raise `y` to float higher above the printed target.
export const MODEL_POSITION = { x: 0.5, y: 0.85, z: 0.15 }
export const MODEL_ROTATION = { x: 0, y: 0, z: 0 }
export const MODEL_SCALE = 0.45
