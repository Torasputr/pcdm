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

export async function loadArModel() {
  let model: THREE.Object3D
  try {
    model = await loadGltf(AR_MODEL_SRC)
  } catch {
    model = await loadGltf(AR_MODEL_FALLBACK)
  }

  const box = new THREE.Box3().setFromObject(model)
  const size = box.getSize(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z) || 1
  const scale = MODEL_SCALE / maxDim

  model.scale.multiplyScalar(scale)

  box.setFromObject(model)
  const center = box.getCenter(new THREE.Vector3())
  model.position.sub(center)

  const wrapper = new THREE.Group()
  wrapper.add(model)
  wrapper.position.set(MODEL_POSITION.x, MODEL_POSITION.y, MODEL_POSITION.z)
  wrapper.rotation.set(MODEL_ROTATION.x, MODEL_ROTATION.y, MODEL_ROTATION.z)

  return wrapper
}
