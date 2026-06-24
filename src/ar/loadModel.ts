import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { scene } from '../config/scene'

export interface CardModel {
  root: THREE.Group
  scaleGroup: THREE.Group
}

export async function loadCardModel(): Promise<CardModel> {
  const loader = new GLTFLoader()
  let gltf
  try {
    gltf = await loader.loadAsync(scene.modelFile)
  } catch {
    gltf = await loader.loadAsync(
      'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
    )
  }
  const model = gltf.scene

  model.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return
    const mats = Array.isArray(child.material) ? child.material : [child.material]
    mats.forEach((mat) => {
      if (
        mat instanceof THREE.MeshStandardMaterial ||
        mat instanceof THREE.MeshPhysicalMaterial
      ) {
        mat.metalness = Math.min(mat.metalness, 0.3)
        mat.roughness = Math.max(mat.roughness, 0.45)
      }
      mat.needsUpdate = true
    })
  })

  const box = new THREE.Box3().setFromObject(model)
  const size = box.getSize(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z) || 1
  model.scale.multiplyScalar(scene.model.scale / maxDim)

  box.setFromObject(model)
  model.position.sub(box.getCenter(new THREE.Vector3()))

  const scaleGroup = new THREE.Group()
  scaleGroup.add(model)

  const root = new THREE.Group()
  root.add(scaleGroup)
  root.position.set(
    scene.model.position.x,
    scene.model.position.y,
    scene.model.position.z,
  )
  root.rotation.set(
    scene.model.rotation.x,
    scene.model.rotation.y,
    scene.model.rotation.z,
  )

  return { root, scaleGroup }
}
