import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import {
  AR_MODEL_FALLBACK,
  AR_MODEL_SRC,
  MODEL_POSITION,
  MODEL_ROTATION,
  MODEL_SCALE,
} from '../config'

async function loadGltf(url: string) {
  const loader = new GLTFLoader()
  const gltf = await loader.loadAsync(url)
  return gltf.scene
}

function prepareMaterials(root: THREE.Object3D) {
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return

    const materials = Array.isArray(child.material)
      ? child.material
      : [child.material]

    materials.forEach((material) => {
      if (
        material instanceof THREE.MeshStandardMaterial ||
        material instanceof THREE.MeshPhysicalMaterial
      ) {
        material.metalness = Math.min(material.metalness, 0.35)
        material.roughness = Math.max(material.roughness, 0.45)
        material.envMapIntensity = 1
      }
      material.needsUpdate = true
    })
  })
}

export async function loadArModel() {
  let model: THREE.Object3D
  try {
    model = await loadGltf(AR_MODEL_SRC)
  } catch {
    model = await loadGltf(AR_MODEL_FALLBACK)
  }

  prepareMaterials(model)

  const box = new THREE.Box3().setFromObject(model)
  const size = box.getSize(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z) || 1
  const scale = MODEL_SCALE / maxDim

  model.scale.multiplyScalar(scale)

  box.setFromObject(model)
  const center = box.getCenter(new THREE.Vector3())
  model.position.sub(center)

  const scaleGroup = new THREE.Group()
  scaleGroup.add(model)

  const anchor = new THREE.Group()
  anchor.add(scaleGroup)
  anchor.position.set(MODEL_POSITION.x, MODEL_POSITION.y, MODEL_POSITION.z)
  anchor.rotation.set(MODEL_ROTATION.x, MODEL_ROTATION.y, MODEL_ROTATION.z)

  return { root: anchor, scaleGroup }
}
