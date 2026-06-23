export interface OverlayPose {
  x: number
  y: number
  width: number
  rotation: number
}

interface Point {
  x: number
  y: number
}

interface QrLocation {
  topLeftCorner: Point
  topRightCorner: Point
  bottomRightCorner: Point
  bottomLeftCorner: Point
}

function videoToDisplay(
  point: Point,
  videoWidth: number,
  videoHeight: number,
  displayWidth: number,
  displayHeight: number,
): Point {
  const videoAspect = videoWidth / videoHeight
  const displayAspect = displayWidth / displayHeight

  let scale: number
  let offsetX: number
  let offsetY: number

  if (videoAspect > displayAspect) {
    scale = displayHeight / videoHeight
    offsetX = (displayWidth - videoWidth * scale) / 2
    offsetY = 0
  } else {
    scale = displayWidth / videoWidth
    offsetX = 0
    offsetY = (displayHeight - videoHeight * scale) / 2
  }

  return {
    x: point.x * scale + offsetX,
    y: point.y * scale + offsetY,
  }
}

export function computeOverlayPose(
  location: QrLocation,
  videoWidth: number,
  videoHeight: number,
  displayWidth: number,
  displayHeight: number,
): OverlayPose {
  const { topLeftCorner: tl, topRightCorner: tr, bottomLeftCorner: bl } =
    location

  const center = {
    x: (tl.x + tr.x + location.bottomRightCorner.x + bl.x) / 4,
    y: (tl.y + tr.y + location.bottomRightCorner.y + bl.y) / 4,
  }

  const topMid = {
    x: (tl.x + tr.x) / 2,
    y: (tl.y + tr.y) / 2,
  }

  const qrHeight = Math.hypot(bl.x - tl.x, bl.y - tl.y)

  const dx = topMid.x - center.x
  const dy = topMid.y - center.y
  const len = Math.hypot(dx, dy) || 1
  const upX = dx / len
  const upY = dy / len

  const offset = qrHeight * 0.55
  const overlayCenter = {
    x: center.x + upX * (qrHeight / 2 + offset),
    y: center.y + upY * (qrHeight / 2 + offset),
  }

  const displayCenter = videoToDisplay(
    overlayCenter,
    videoWidth,
    videoHeight,
    displayWidth,
    displayHeight,
  )
  const displayTL = videoToDisplay(
    tl,
    videoWidth,
    videoHeight,
    displayWidth,
    displayHeight,
  )
  const displayTR = videoToDisplay(
    tr,
    videoWidth,
    videoHeight,
    displayWidth,
    displayHeight,
  )

  const qrDisplayWidth = Math.hypot(
    displayTR.x - displayTL.x,
    displayTR.y - displayTL.y,
  )
  const rotation = Math.atan2(
    displayTR.y - displayTL.y,
    displayTR.x - displayTL.x,
  )

  return {
    x: displayCenter.x,
    y: displayCenter.y,
    width: qrDisplayWidth * 1.8,
    rotation,
  }
}

export function smoothAngle(current: number, target: number, alpha: number) {
  let delta = target - current
  while (delta > Math.PI) delta -= 2 * Math.PI
  while (delta < -Math.PI) delta += 2 * Math.PI
  return current + alpha * delta
}

export function smoothPose(
  current: OverlayPose | null,
  target: OverlayPose,
  alpha: number,
): OverlayPose {
  if (!current) return target

  return {
    x: current.x + alpha * (target.x - current.x),
    y: current.y + alpha * (target.y - current.y),
    width: current.width + alpha * (target.width - current.width),
    rotation: smoothAngle(current.rotation, target.rotation, alpha),
  }
}
