/**
 * Scene config — edit this like a mini Kivicube project settings panel.
 * Put assets in public/scene/
 */
export const scene = {
  name: 'Wheel of Fortune',
  tagline: 'Scan the card and tap to spin the wheel',
  accent: '#FFD700',

  /** Image printed on the card (must match compiled target). */
  cardImage: '/scene/card-target.jpg',
  /** Compiled MindAR tracker — run `npm run compile-target` after changing card image. */
  mindFile: '/scene/card-target.mind',
  /** `procedural` builds the wheel in code; `glb` loads modelFile. */
  modelKind: 'glb' as 'procedural' | 'glb',
  /** 3D model shown on the card (used when modelKind is `glb`). */
  modelFile: '/scene/model.glb',

  startButton: 'Start AR Experience',
  scanningHint: 'Align the Wheel of Fortune card inside the frame',
  foundHint: 'Move around to explore from different angles',
  tapToAnimateHint: 'Tap the screen to spin the wheel',
  loadingSteps: ['Preparing AR', 'Loading 3D model', 'Starting camera'],

  /**
   * MindAR anchor origin = center of the card image.
   * scale 1.0 ≈ matches the card height; z lifts slightly off the card plane.
   */
  model: {
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: 1.3,
  },
}
