import { useCallback, useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'
import {
  computeOverlayPose,
  smoothPose,
  type OverlayPose,
} from '../utils/qrPose'
import { drawVideoFrameMatchingPreview } from '../utils/videoCover'

const SMOOTHING = 0.72
const LOST_TRACK_MS = 350

function waitForVideoReady(video: HTMLVideoElement) {
  if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
    return Promise.resolve()
  }

  return new Promise<void>((resolve, reject) => {
    const onReady = () => {
      cleanup()
      resolve()
    }
    const onError = () => {
      cleanup()
      reject(new Error('Camera preview failed to start.'))
    }
    const cleanup = () => {
      video.removeEventListener('loadeddata', onReady)
      video.removeEventListener('error', onError)
    }

    video.addEventListener('loadeddata', onReady)
    video.addEventListener('error', onError)
  })
}

export function useQrTracker() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef(0)
  const smoothedPoseRef = useRef<OverlayPose | null>(null)
  const lastDetectedRef = useRef(0)

  const [pose, setPose] = useState<OverlayPose | null>(null)
  const [isActive, setIsActive] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null

    const video = videoRef.current
    if (video) {
      video.srcObject = null
    }

    smoothedPoseRef.current = null
    lastDetectedRef.current = 0
    setIsStarting(false)
    setIsActive(false)
    setPose(null)
  }, [])

  const startCamera = useCallback(async () => {
    setError(null)
    setIsStarting(true)

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera is not supported in this browser.')
      setIsStarting(false)
      return
    }

    const video = videoRef.current
    if (!video) {
      setError('Camera preview is not ready. Refresh and try again.')
      setIsStarting(false)
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })

      streamRef.current = stream
      video.srcObject = stream
      video.muted = true
      video.playsInline = true
      video.setAttribute('playsinline', 'true')

      try {
        await video.play()
      } catch {
        // Some browsers reject play() even after a tap; loadeddata is enough.
      }

      await waitForVideoReady(video)
      setIsActive(true)
    } catch (err) {
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
      video.srcObject = null

      const message =
        err instanceof Error && err.message
          ? err.message
          : 'Could not access the camera. Allow camera permission and use HTTPS.'

      setError(message)
      setIsActive(false)
    } finally {
      setIsStarting(false)
    }
  }, [])

  useEffect(() => {
    if (!isActive) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!video || !canvas || !container) return

    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    const tick = () => {
      rafRef.current = requestAnimationFrame(tick)

      if (video.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA) return

      const now = Date.now()
      const { width, height } = container.getBoundingClientRect()
      if (!width || !height) return

      canvas.width = width
      canvas.height = height
      drawVideoFrameMatchingPreview(ctx, video, width, height)

      const imageData = ctx.getImageData(0, 0, width, height)
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'attemptBoth',
      })

      if (code?.location) {
        const nextPose = computeOverlayPose(code.location)
        smoothedPoseRef.current = smoothPose(
          smoothedPoseRef.current,
          nextPose,
          SMOOTHING,
        )
        lastDetectedRef.current = now
        setPose({ ...smoothedPoseRef.current })
      } else if (
        lastDetectedRef.current > 0 &&
        now - lastDetectedRef.current > LOST_TRACK_MS
      ) {
        smoothedPoseRef.current = null
        setPose(null)
        lastDetectedRef.current = 0
      } else if (smoothedPoseRef.current) {
        setPose({ ...smoothedPoseRef.current })
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [isActive])

  useEffect(() => () => stopCamera(), [stopCamera])

  return {
    videoRef,
    canvasRef,
    containerRef,
    pose,
    isActive,
    isStarting,
    error,
    startCamera,
    stopCamera,
  }
}
