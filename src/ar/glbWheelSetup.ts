import * as THREE from 'three'

const MESH_COLORS: Record<string, string> = {
  pDiscShape1: '#E63946',
  pDiscShape2: '#FFD700',
  pCubeShape1: '#1a1a2e',
  pCubeShape2: '#C9A227',
  pCylinderShape1: '#FFD700',
}

export function applyGlbMaterials(model: THREE.Object3D) {
  model.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return

    const color = MESH_COLORS[child.name] ?? '#888899'
    const needsMaterial =
      !child.material ||
      (Array.isArray(child.material) && child.material.length === 0)

    if (needsMaterial) {
      child.material = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.55,
        metalness: child.name.includes('Disc') ? 0.25 : 0.1,
      })
      return
    }

    const mats = Array.isArray(child.material) ? child.material : [child.material]
    mats.forEach((mat) => {
      if (
        mat instanceof THREE.MeshStandardMaterial ||
        mat instanceof THREE.MeshPhysicalMaterial
      ) {
        if (!mat.map && mat.color.getHex() === 0xffffff) {
          mat.color.set(color)
        }
        mat.metalness = Math.min(mat.metalness, 0.35)
        mat.roughness = Math.max(mat.roughness, 0.4)
      }
      mat.needsUpdate = true
    })
  })
}

export function createWheelSpinClips(model: THREE.Object3D): THREE.AnimationClip[] {
  const wheel =
    model.getObjectByName('pDisc1') ??
    model.children.find((child) => child.name.toLowerCase().includes('disc'))

  if (!wheel) return []

  const axis = 'y'
  const path = `${wheel.name}.rotation[${axis}]`

  return [
    new THREE.AnimationClip('Spin', 2.4, [
      new THREE.NumberKeyframeTrack(path, [0, 2.4], [0, Math.PI * 2]),
    ]),
    new THREE.AnimationClip('Big Spin', 3.2, [
      new THREE.NumberKeyframeTrack(path, [0, 3.2], [0, Math.PI * 2 * 3]),
    ]),
    new THREE.AnimationClip('Slow Spin', 4, [
      new THREE.NumberKeyframeTrack(path, [0, 4], [0, Math.PI * 2]),
    ]),
  ]
}
