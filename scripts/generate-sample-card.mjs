import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createCanvas } from '@napi-rs/canvas'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dir = join(__dirname, '../public/scene')
mkdirSync(dir, { recursive: true })

const size = 600
const canvas = createCanvas(size, size)
const ctx = canvas.getContext('2d')

ctx.fillStyle = '#f8f6f1'
ctx.fillRect(0, 0, size, size)
ctx.strokeStyle = '#1a1a2e'
ctx.lineWidth = 6
ctx.strokeRect(24, 24, size - 48, size - 48)
ctx.fillStyle = '#1a1a2e'
ctx.beginPath()
ctx.arc(300, 220, 90, 0, Math.PI * 2)
ctx.fill()
ctx.fillStyle = '#5b8cff'
ctx.beginPath()
ctx.moveTo(300, 150)
ctx.lineTo(360, 280)
ctx.lineTo(240, 280)
ctx.closePath()
ctx.fill()
ctx.fillStyle = '#1a1a2e'
ctx.font = 'bold 48px sans-serif'
ctx.textAlign = 'center'
ctx.fillText('PHYSICAL', 300, 400)
ctx.fillText('CARD', 300, 460)

writeFileSync(join(dir, 'card-target.png'), canvas.toBuffer('image/png'))
console.log('Wrote public/scene/card-target.png')
