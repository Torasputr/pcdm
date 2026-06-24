/**
 * Scene config — edit this like a mini Kivicube project settings panel.
 * Put assets in public/scene/
 */
export const scene = {
  name: 'Wifi Kawanku',
  tagline: 'Point your camera at the card to unlock the AR experience',
  accent: '#F5B800',

  /** Image printed on the card (must match compiled target). */
  cardImage: '/scene/card-target.png',
  /** Compiled MindAR tracker — run `npm run compile-target` after changing card image. */
  mindFile: '/scene/card-target.mind',
  /** 3D model shown on the card. */
  modelFile: '/scene/model.glb',

  startButton: 'Start AR Experience',
  scanningHint: 'Align your WIFI KAWANKU card inside the frame',
  foundHint: 'Move around to explore from different angles',
  loadingSteps: ['Preparing AR', 'Loading 3D model', 'Starting camera'],

  /** Model placement on the card (MindAR anchor space, card width ≈ 1). */
  model: {
    position: { x: 0.5, y: 0.5, z: 0.1 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: 0.32,
  },
}
