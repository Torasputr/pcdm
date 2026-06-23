declare module 'mind-ar/dist/mindar-image-three.prod.js' {
  import type { Camera, Group, Scene, WebGLRenderer } from 'three'

  export interface MindARAnchor {
    group: Group
    targetIndex: number
    visible: boolean
    onTargetFound: (() => void) | null
    onTargetLost: (() => void) | null
    onTargetUpdate: (() => void) | null
  }

  export interface MindARThreeOptions {
    container: HTMLElement
    imageTargetSrc: string
    maxTrack?: number
    uiLoading?: 'yes' | 'no'
    uiScanning?: 'yes' | 'no'
    uiError?: 'yes' | 'no'
    filterMinCF?: number | null
    filterBeta?: number | null
    warmupTolerance?: number | null
    missTolerance?: number | null
  }

  export class MindARThree {
    constructor(options: MindARThreeOptions)
    container: HTMLElement
    video: HTMLVideoElement
    renderer: WebGLRenderer
    cssRenderer: { domElement: HTMLElement; setSize: (w: number, h: number) => void }
    scene: Scene
    camera: Camera
    anchors: MindARAnchor[]
    addAnchor(targetIndex: number): MindARAnchor
    start(): Promise<void>
    stop(): void
    switchCamera(): void
    resize(): void
  }
}
