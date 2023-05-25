import { FOLDERS, srcRootPath } from '../../config.js'
import { mkdir } from 'node:fs/promises'
import path from 'path'

export async function createOutputFolder () {
  const finalPath = path.join(srcRootPath, FOLDERS.audio)

  try {
    await mkdir(finalPath)
  } catch (error) {
    const { message: errorMessage } = error

    if (!errorMessage) {
      process.exit(1)
    }

    const validReason = errorMessage.split(':')[0] === 'EEXIST'

    if (!validReason) {
      console.log(`Cannot create output folder to store audio\nReason: ${errorMessage}`)
      process.exit(1)
    }
  }
}
