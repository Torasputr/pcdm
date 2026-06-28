import * as THREE from 'three'
import { scene } from '../config/scene'

const MESH_COLORS: Record<string, string> = {
  pDiscShape1: '#E63946',
  pDiscShape2: '#FFD700',
  pCubeShape1: '#2d3436',
  pCubeShape2: '#C9A227',
  pCylinderShape1: '#FFD700',
}

export function applyGlbMaterials(model: THREE.Object3D) {
  model.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return

    const color = MESH_COLORS[child.name] ?? '#888899'
    child.material = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.5,
      metalness: child.name.includes('Disc') || child.name.includes('Cylinder') ? 0.35 : 0.1,
    })
  })
}

/** Orient Blender export so the wheel faces the camera and sits on the card. */
export function prepareWheelGlbModel(model: THREE.Object3D) {
  // Authored Y-up, wheel disc normal along +X, assembly depth in -Z.
  model.rotation.set(0, Math.PI / 2, 0)

  const box = new THREE.Box3().setFromObject(model)
  const size = box.getSize(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z) || 1
  model.scale.multiplyScalar(scene.model.scale / maxDim)

  box.setFromObject(model)
  model.position.sub(box.getCenter(new THREE.Vector3()))
  model.position.z -= box.min.z
}

export function createWheelSpinClips(model: THREE.Object3D): THREE.AnimationClip[] {
  const wheel = model.getObjectByName('pDisc1')
  if (!wheel) return []

  const path = `${wheel.name}.rotation[z]`

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
