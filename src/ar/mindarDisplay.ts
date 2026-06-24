import type { MindARThree } from 'mind-ar/dist/mindar-image-three.prod.js'

export function syncMindARViewport(mindar: MindARThree) {
  const { video, renderer, cssRenderer } = mindar
  const width = window.innerWidth
  const height = window.innerHeight

  mindar.resize()

  Object.assign(video.style, {
    position: 'absolute',
    left: '0',
    top: '0',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: 'none',
    zIndex: '1',
  })

  renderer.setClearColor(0x000000, 0)
  renderer.setSize(width, height, false)
  Object.assign(renderer.domElement.style, {
    position: 'absolute',
    left: '0',
    top: '0',
    width: '100%',
    height: '100%',
    zIndex: '2',
    background: 'transparent',
  })

  cssRenderer.domElement.style.display = 'none'
  cssRenderer.setSize(width, height)
}

export function disposeMindAR(mindar: MindARThree, container: HTMLElement) {
  mindar.renderer.setAnimationLoop(null)
  mindar.stop()
  mindar.renderer.domElement.remove()
  mindar.cssRenderer.domElement.remove()
  container.replaceChildren()
}
