import { copyFileSync, existsSync, mkdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const assetsDir = join(root, '../Assets/WheelOfFortune')
const destDir = join(root, 'public/scene')

const pairs = [
  { source: join(assetsDir, 'Proxy 1.glb'), dest: join(destDir, 'model.glb') },
  { source: join(assetsDir, 'proxy 1.jpg'), dest: join(destDir, 'card-target.jpg') },
]

mkdirSync(destDir, { recursive: true })

for (const { source, dest } of pairs) {
  if (!existsSync(source)) continue

  const needsCopy =
    !existsSync(dest) || statSync(source).mtimeMs > statSync(dest).mtimeMs

  if (needsCopy) {
    copyFileSync(source, dest)
    console.log(`sync-assets: copied ${source.split(/[/\\]/).pop()} → public/scene/${dest.split(/[/\\]/).pop()}`)
  }
}
