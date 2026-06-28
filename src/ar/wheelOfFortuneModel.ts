import * as THREE from 'three'

const SEGMENT_COLORS = [
  '#E63946',
  '#FFD166',
  '#06D6A0',
  '#118AB2',
  '#8338EC',
  '#FF6B35',
  '#2EC4B6',
  '#EF476F',
]

/** Procedural wheel based on the WheelOfFortune Maya proxy (disc + stand + pointer). */
export function buildWheelOfFortuneModel(): {
  model: THREE.Group
  clips: THREE.AnimationClip[]
} {
  const root = new THREE.Group()
  root.name = 'WheelOfFortune'

  const stand = new THREE.Group()
  stand.name = 'stand'

  const backMat = new THREE.MeshStandardMaterial({ color: '#1a1a2e', roughness: 0.7 })
  const goldMat = new THREE.MeshStandardMaterial({
    color: '#FFD700',
    metalness: 0.45,
    roughness: 0.35,
  })
  const hubMat = new THREE.MeshStandardMaterial({
    color: '#C9A227',
    metalness: 0.55,
    roughness: 0.3,
  })

  const back = new THREE.Mesh(new THREE.BoxGeometry(0.72, 1.05, 0.06), backMat)
  back.position.set(0, 0.52, -0.04)
  stand.add(back)

  const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.08, 0.12), goldMat)
  shelf.position.set(0, 0.18, 0.02)
  stand.add(shelf)

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 0.06, 32), goldMat)
  base.position.set(0, 0.03, 0)
  stand.add(base)

  const wheel = new THREE.Group()
  wheel.name = 'wheel'
  wheel.position.set(0, 0.58, 0.06)

  const wheelDisc = new THREE.Group()
  const segmentAngle = (Math.PI * 2) / SEGMENT_COLORS.length

  SEGMENT_COLORS.forEach((color, i) => {
    const shape = new THREE.Shape()
    shape.moveTo(0, 0)
    shape.lineTo(0.46, 0)
    shape.absarc(0, 0, 0.46, 0, segmentAngle, false)
    shape.lineTo(0, 0)

    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: 0.04,
      bevelEnabled: false,
    })
    geom.rotateX(-Math.PI / 2)
    geom.translate(0, 0.02, 0)

    const mesh = new THREE.Mesh(
      geom,
      new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.05 }),
    )
    mesh.rotation.y = i * segmentAngle
    wheelDisc.add(mesh)
  })

  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(0.46, 0.025, 12, 64),
    goldMat,
  )
  rim.rotation.x = Math.PI / 2
  rim.position.y = 0.02
  wheelDisc.add(rim)

  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.06, 24), hubMat)
  hub.position.y = 0.03
  wheelDisc.add(hub)

  wheel.add(wheelDisc)

  const pointer = new THREE.Mesh(
    new THREE.ConeGeometry(0.06, 0.14, 3),
    new THREE.MeshStandardMaterial({ color: '#FFD700', metalness: 0.5, roughness: 0.35 }),
  )
  pointer.rotation.x = Math.PI
  pointer.position.set(0, 0.98, 0.08)
  stand.add(pointer)

  const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 20), hubMat)
  crown.position.set(0, 1.02, 0.06)
  stand.add(crown)

  root.add(stand)
  root.add(wheel)

  const clips = [
    new THREE.AnimationClip('Spin', 2.4, [
      new THREE.NumberKeyframeTrack('wheel.rotation[y]', [0, 2.4], [0, Math.PI * 2]),
    ]),
    new THREE.AnimationClip('Big Spin', 3.2, [
      new THREE.NumberKeyframeTrack('wheel.rotation[y]', [0, 3.2], [0, Math.PI * 2 * 3]),
    ]),
    new THREE.AnimationClip('Slow Spin', 4, [
      new THREE.NumberKeyframeTrack('wheel.rotation[y]', [0, 4], [0, Math.PI * 2]),
    ]),
  ]

  return { model: root, clips }
}
