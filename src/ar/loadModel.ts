import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { scene } from '../config/scene'
import {
  applyGlbMaterials,
  createWheelSpinClips,
  normalizeWheelClips,
  prepareWheelGlbModel,
} from './glbWheelSetup'
import { ModelAnimations } from './modelAnimations'
import { buildWheelOfFortuneModel } from './wheelOfFortuneModel'

export interface CardModel {
  root: THREE.Group
  scaleGroup: THREE.Group
  animations: ModelAnimations | null
}

function applyProceduralTransform(model: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(model)
  const size = box.getSize(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z) || 1
  model.scale.multiplyScalar(scene.model.scale / maxDim)

  box.setFromObject(model)
  model.position.sub(box.getCenter(new THREE.Vector3()))
  model.position.y -= box.min.y
}

function wrapModel(
  model: THREE.Object3D,
  clips: THREE.AnimationClip[],
  useGlbLayout: boolean,
): CardModel {
  if (!useGlbLayout) {
    applyProceduralTransform(model)
  }

  const scaleGroup = new THREE.Group()
  scaleGroup.add(model)

  const root = new THREE.Group()
  root.add(scaleGroup)
  root.position.set(
    scene.model.position.x,
    scene.model.position.y,
    scene.model.position.z,
  )

  if (!useGlbLayout) {
    root.rotation.set(
      scene.model.rotation.x,
      scene.model.rotation.y,
      scene.model.rotation.z,
    )
  }

  const animations =
    clips.length > 0 ? new ModelAnimations(model, clips) : null

  return { root, scaleGroup, animations }
}

export async function loadCardModel(): Promise<CardModel> {
  if (scene.modelKind === 'procedural') {
    const { model, clips } = buildWheelOfFortuneModel()
    return wrapModel(model, clips, false)
  }

  const gltf = await new GLTFLoader().loadAsync(scene.modelFile)
  const model = gltf.scene

  applyGlbMaterials(model)
  prepareWheelGlbModel(model)

  const clips =
    gltf.animations.length > 0
      ? normalizeWheelClips(gltf.animations)
      : createWheelSpinClips(model)

  return wrapModel(model, clips, true)
}
