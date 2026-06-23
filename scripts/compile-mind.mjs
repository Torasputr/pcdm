import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createCanvas, loadImage } from '@napi-rs/canvas'
import * as tf from '@tensorflow/tfjs'
import { CompilerBase } from '../node_modules/mind-ar/src/image-target/compiler-base.js'
import { buildTrackingImageList } from '../node_modules/mind-ar/src/image-target/image-list.js'
import { extractTrackingFeatures } from '../node_modules/mind-ar/src/image-target/tracker/extract-utils.js'
import '../node_modules/mind-ar/src/image-target/detector/kernels/cpu/index.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

class NodeCompiler extends CompilerBase {
  createProcessCanvas(img) {
    return createCanvas(img.width, img.height)
  }

  compileTrack({ progressCallback, targetImages, basePercent }) {
    return new Promise((resolve) => {
      const percentPerImage = (100 - basePercent) / targetImages.length
      let percent = 0
      const list = []

      for (let i = 0; i < targetImages.length; i++) {
        const targetImage = targetImages[i]
        const imageList = buildTrackingImageList(targetImage)
        const percentPerAction = percentPerImage / imageList.length

        const trackingData = extractTrackingFeatures(imageList, () => {
          percent += percentPerAction
          progressCallback(basePercent + percent)
        })
        list.push(trackingData)
      }

      resolve(list)
    })
  }
}

const imagePath = process.argv[2] ?? join(__dirname, '../public/qr-target.png')
const outputPath = process.argv[3] ?? join(__dirname, '../public/targets.mind')

await tf.setBackend('cpu')
await tf.ready()

const img = await loadImage(readFileSync(imagePath))
const compiler = new NodeCompiler()

process.stdout.write(`Compiling ${imagePath}...\n`)

await compiler.compileImageTargets([img], (percent) => {
  process.stdout.write(`\rProgress: ${percent.toFixed(1)}%`)
})

const buffer = compiler.exportData()
writeFileSync(outputPath, Buffer.from(buffer))

process.stdout.write(`\nSaved ${outputPath} (${buffer.byteLength} bytes)\n`)
