export const scene = {
  name: 'Physical Card',
  tagline: 'Point your camera at the card to unlock the AR experience',
  targetPreviewSrc: '/qr-target.png',
  accent: '#5B8CFF',
  startButton: 'Start AR Experience',
  scanningHint: 'Align the image inside the frame',
  foundHint: 'Move around to explore from different angles',
  loadingSteps: ['Preparing AR engine', 'Loading 3D content', 'Starting camera'],
}

export const AR_MODEL_SRC = '/model.glb'

export const AR_MODEL_FALLBACK =
  'https://modelviewer.dev/shared-assets/models/Astronaut.glb'

export const MINDAR_TARGET_SRC = '/targets.mind'

export const MODEL_POSITION = { x: 0.5, y: 0.85, z: 0.15 }
export const MODEL_ROTATION = { x: 0, y: 0, z: 0 }
export const MODEL_SCALE = 0.45
