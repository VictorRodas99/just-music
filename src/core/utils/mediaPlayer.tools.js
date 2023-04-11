import { restartPlayer } from '../../utils/player.tools.js'
import { getMediaPlayerAction } from '../../cli/interactions.js'
import { mediaPlayerEventHandler } from '../audio.js'
import { parseOutput } from '../../utils/tools.js'

/**
 * @typedef {import('node:child_process').ChildProcessWithoutNullStreams} Process
 * @param {Process} mediaPlayerProcess
 */
export async function handleUserInput (mediaPlayerProcess) {
  while (true) {
    const userOption = await getMediaPlayerAction()
    mediaPlayerProcess.stdin.write(`${userOption}\n`)

    if (userOption === 'next') {
      break
    } else if (userOption === 'close') {
      process.exit(0)
    }
  }
}

/**
 * @typedef {import('node:child_process').ChildProcessWithoutNullStreams} Process
 * @param {Process} mediaPlayerProcess
 */
export function handleProcessOutput (mediaPlayerProcess) {
  const outputHandler = (chunk) => {
    const mode = parseOutput(chunk.toString())
    const isInPlaylistMode = global.sessionMode === 'playlist'

    if (mode === 'pause') {
      global.timer.pause()
    } else if (mode === 'resume') {
      global.timer.resume()
    } else if (mode === 'nextsong' && isInPlaylistMode) {
      restartPlayer(mediaPlayerProcess)
      mediaPlayerEventHandler.emit('next')
    }
  }

  mediaPlayerProcess.stdout.on('data', outputHandler)
}

/**
 * @typedef {import('node:child_process').ChildProcessWithoutNullStreams} Process
 * @param {Process} mediaPlayerProcess
 */
export function handleProcessError (mediaPlayerProcess) {
  mediaPlayerProcess.stderr.on('data', (chunk) => {
    console.error(chunk.toString())
  })
}
