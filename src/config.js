import url from 'url'
import path from 'path'

const configPath = url.fileURLToPath(import.meta.url)
export const srcRootPath = path.dirname(configPath)

export const PATHS = {
  audio: 'outputs',
  scripts: 'audio-scripts'
}
