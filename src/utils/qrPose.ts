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

/** Pose in on-screen pixels — matches the visible camera preview. */
export function computeOverlayPose(location: QrLocation): OverlayPose {
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

  const qrWidth = Math.hypot(tr.x - tl.x, tr.y - tl.y)
  const rotation = Math.atan2(tr.y - tl.y, tr.x - tl.x)

  return {
    x: overlayCenter.x,
    y: overlayCenter.y,
    width: qrWidth * 1.8,
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
