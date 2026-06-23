import * as THREE from 'three'

export function addArLighting(scene: THREE.Scene) {
  scene.add(new THREE.AmbientLight(0xffffff, 2.8))
  scene.add(new THREE.HemisphereLight(0xffffff, 0x555555, 1.4))

  const key = new THREE.DirectionalLight(0xffffff, 2)
  key.position.set(0.5, 2, 1.5)
  scene.add(key)

  const fill = new THREE.DirectionalLight(0xffffff, 0.9)
  fill.position.set(-1, 0.5, 2)
  scene.add(fill)
}
