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

const cx = size / 2
const cy = size / 2 + 20
const radius = 200

ctx.fillStyle = '#0f0f1a'
ctx.fillRect(0, 0, size, size)

ctx.strokeStyle = '#FFD700'
ctx.lineWidth = 8
ctx.strokeRect(20, 20, size - 40, size - 40)

const colors = ['#E63946', '#FFD166', '#06D6A0', '#118AB2', '#8338EC', '#FF6B35', '#2EC4B6', '#EF476F']
const segments = colors.length
for (let i = 0; i < segments; i++) {
  const start = (i / segments) * Math.PI * 2 - Math.PI / 2
  const end = ((i + 1) / segments) * Math.PI * 2 - Math.PI / 2
  ctx.beginPath()
  ctx.moveTo(cx, cy)
  ctx.arc(cx, cy, radius, start, end)
  ctx.closePath()
  ctx.fillStyle = colors[i]
  ctx.fill()
  ctx.strokeStyle = '#1a1a2e'
  ctx.lineWidth = 3
  ctx.stroke()
}

ctx.beginPath()
ctx.arc(cx, cy, radius, 0, Math.PI * 2)
ctx.strokeStyle = '#FFD700'
ctx.lineWidth = 10
ctx.stroke()

ctx.beginPath()
ctx.arc(cx, cy, 36, 0, Math.PI * 2)
ctx.fillStyle = '#FFD700'
ctx.fill()
ctx.strokeStyle = '#1a1a2e'
ctx.lineWidth = 4
ctx.stroke()

ctx.fillStyle = '#FFD700'
ctx.font = 'bold 42px sans-serif'
ctx.textAlign = 'center'
ctx.fillText('WHEEL OF', cx, 72)
ctx.fillText('FORTUNE', cx, 118)

ctx.fillStyle = 'rgba(255,255,255,0.35)'
ctx.font = '16px sans-serif'
ctx.fillText('Scan to spin', cx, size - 48)

writeFileSync(join(dir, 'card-target.png'), canvas.toBuffer('image/png'))
console.log('Wrote public/scene/card-target.png')
