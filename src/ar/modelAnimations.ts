import * as THREE from 'three'

export class ModelAnimations {
  private mixer: THREE.AnimationMixer
  private clips: THREE.AnimationClip[]
  private index = -1
  private activeAction: THREE.AnimationAction | null = null

  constructor(root: THREE.Object3D, clips: THREE.AnimationClip[]) {
    this.mixer = new THREE.AnimationMixer(root)
    this.clips = clips
  }

  get hasAnimations() {
    return this.clips.length > 0
  }

  get clipNames() {
    return this.clips.map((clip, i) => clip.name || `Animation ${i + 1}`)
  }

  next(): string | null {
    if (!this.clips.length) return null

    this.index = (this.index + 1) % this.clips.length
    const clip = this.clips[this.index]

    if (this.activeAction) {
      this.activeAction.stop()
    }

    const action = this.mixer.clipAction(clip)
    action.reset()
    action.setLoop(THREE.LoopOnce, 1)
    action.clampWhenFinished = true
    action.play()
    this.activeAction = action

    return clip.name || `Animation ${this.index + 1}`
  }

  update(delta: number) {
    this.mixer.update(delta)
  }

  dispose() {
    this.mixer.stopAllAction()
  }
}
