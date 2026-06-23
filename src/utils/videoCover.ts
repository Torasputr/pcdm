import { CAMERA_FRAME_ROTATION } from '../config'

export function drawVideoCover(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  destWidth: number,
  destHeight: number,
) {
  const videoWidth = video.videoWidth
  const videoHeight = video.videoHeight
  if (!videoWidth || !videoHeight || !destWidth || !destHeight) return

  const destAspect = destWidth / destHeight
  const videoAspect = videoWidth / videoHeight

  let sx = 0
  let sy = 0
  let sw = videoWidth
  let sh = videoHeight

  if (videoAspect > destAspect) {
    sw = videoHeight * destAspect
    sx = (videoWidth - sw) / 2
  } else {
    sh = videoWidth / destAspect
    sy = (videoHeight - sh) / 2
  }

  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, destWidth, destHeight)
}

/**
 * Draw the camera frame the same way the browser shows it on screen.
 * Phone cameras usually deliver landscape frames while the screen is portrait.
 */
export function drawVideoFrameMatchingPreview(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  displayWidth: number,
  displayHeight: number,
) {
  const videoWidth = video.videoWidth
  const videoHeight = video.videoHeight
  if (!videoWidth || !videoHeight) return

  ctx.setTransform(1, 0, 0, 1, 0, 0)

  const portraitScreen = displayHeight > displayWidth
  const landscapeFrame = videoWidth > videoHeight

  if (portraitScreen && landscapeFrame && CAMERA_FRAME_ROTATION !== 0) {
    const radians = (CAMERA_FRAME_ROTATION * Math.PI) / 180
    ctx.save()

    if (CAMERA_FRAME_ROTATION === 90) {
      ctx.translate(displayWidth, 0)
      ctx.rotate(Math.PI / 2)
      drawVideoCover(ctx, video, displayHeight, displayWidth)
    } else if (CAMERA_FRAME_ROTATION === -90) {
      ctx.translate(0, displayHeight)
      ctx.rotate(-Math.PI / 2)
      drawVideoCover(ctx, video, displayHeight, displayWidth)
    } else if (CAMERA_FRAME_ROTATION === 180) {
      ctx.translate(displayWidth, displayHeight)
      ctx.rotate(Math.PI)
      drawVideoCover(ctx, video, displayWidth, displayHeight)
    } else {
      ctx.rotate(radians)
      drawVideoCover(ctx, video, displayWidth, displayHeight)
    }

    ctx.restore()
    return
  }

  drawVideoCover(ctx, video, displayWidth, displayHeight)
}
