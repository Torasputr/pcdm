import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { AR_MODEL_FALLBACK, AR_MODEL_SRC } from '../config'
import type { OverlayPose } from '../utils/qrPose'

interface ModelOverlayProps {
  pose: OverlayPose | null
  width: number
  height: number
}

function centerModel(model: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(model)
  const center = box.getCenter(new THREE.Vector3())
  model.position.sub(center)
}

function normalizeModel(model: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(model)
  const size = box.getSize(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z) || 1
  model.scale.setScalar(1 / maxDim)
  centerModel(model)
}

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return
    child.geometry.dispose()
    const materials = Array.isArray(child.material)
      ? child.material
      : [child.material]
    materials.forEach((material) => material.dispose())
  })
}

async function loadModel(url: string) {
  const loader = new GLTFLoader()
  const gltf = await loader.loadAsync(url)
  const model = gltf.scene
  normalizeModel(model)
  // GLB models are Y-up; screen space is Y-down in our orthographic camera.
  model.rotation.x = Math.PI
  return model
}

export function ModelOverlay({ pose, width, height }: ModelOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const poseRef = useRef<OverlayPose | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null)
  const anchorRef = useRef<THREE.Group | null>(null)
  const modelRef = useRef<THREE.Object3D | null>(null)

  poseRef.current = pose

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(0, 1, 1, 0, 0.1, 100)
    camera.position.z = 10

    scene.add(new THREE.AmbientLight(0xffffff, 1.4))
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.6)
    keyLight.position.set(2, -2, 4)
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5)
    fillLight.position.set(-2, 1, 3)
    scene.add(fillLight)

    const anchor = new THREE.Group()
    scene.add(anchor)

    rendererRef.current = renderer
    cameraRef.current = camera
    anchorRef.current = anchor

    let disposed = false

    const attachModel = (loaded: THREE.Object3D) => {
      if (disposed) {
        disposeObject(loaded)
        return
      }
      if (modelRef.current) {
        anchor.remove(modelRef.current)
        disposeObject(modelRef.current)
      }
      modelRef.current = loaded
      anchor.add(loaded)
    }

    void loadModel(AR_MODEL_SRC)
      .then(attachModel)
      .catch(() => loadModel(AR_MODEL_FALLBACK).then(attachModel))

    let raf = 0
    const tick = () => {
      raf = requestAnimationFrame(tick)

      const currentPose = poseRef.current
      const model = modelRef.current
      if (model && currentPose) {
        anchor.visible = true
        anchor.position.set(currentPose.x, currentPose.y, 0)
        anchor.rotation.z = currentPose.rotation
        anchor.scale.setScalar(currentPose.width)
      } else {
        anchor.visible = false
      }

      renderer.render(scene, camera)
    }

    raf = requestAnimationFrame(tick)

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      if (modelRef.current) {
        disposeObject(modelRef.current)
        modelRef.current = null
      }
      renderer.dispose()
      rendererRef.current = null
      cameraRef.current = null
      anchorRef.current = null
    }
  }, [])

  useEffect(() => {
    const renderer = rendererRef.current
    const camera = cameraRef.current
    if (!renderer || !camera || width === 0 || height === 0) return

    renderer.setSize(width, height, false)
    camera.left = 0
    camera.right = width
    camera.top = 0
    camera.bottom = height
    camera.updateProjectionMatrix()
  }, [width, height])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-20 h-full w-full"
      aria-hidden
    />
  )
}
