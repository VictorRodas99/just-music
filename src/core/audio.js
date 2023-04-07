import { handleProcessError, handleProcessOutput, handleUserInput } from './utils/mediaPlayer.tools.js'
import { otherSystemMessage, songDurationToMiliseconds } from '../utils/tools.js'
import { cliErrorMessage } from '../cli/utils/cli.general.tools.js'
import { restartPlayer } from '../utils/player.tools.js'

import { spawn } from 'node:child_process'
import { EventEmitter } from 'node:events'

import Timer from '../utils/timer.js'
import { PATHS } from '../config.js'
import { SESSIONS } from '../cli/config.js'

export const mediaPlayerEventHandler = new EventEmitter()

const playAudioForWindows = async (audioPath) => {
  if (!audioPath || typeof audioPath !== 'string') {
    throw new Error(`Invalid audio path... (${audioPath})`)
  }

  const scriptPath = PATHS.scripts('music-player.ps1')
  const args = ['-ExecutionPolicy', 'Bypass', '-File', scriptPath, audioPath]

  const mediaPlayerProcess = spawn('Powershell.exe', args)

  mediaPlayerEventHandler.on('restart', () => restartPlayer(mediaPlayerProcess))

  handleProcessOutput(mediaPlayerProcess)
  handleProcessError(mediaPlayerProcess)
  handleUserInput(mediaPlayerProcess)
}

const playAudioForLinux = (audioPath) => {
  cliErrorMessage('Linux not supported yet')
}

const playAudioForMacOs = (audioPath) => {
  cliErrorMessage('Mac Os not supported yet!')
}

/**
 * @typedef {import('../cli/interactions.js').SongInfo} SongInfo
 * @param { { path: string, song: SongInfo | undefined } } info
 */
export function playAudio ({ path, song }) {
  if (song) { // If it isn't in autoplay mode
    const songDuration = songDurationToMiliseconds(song.duration)

    const eventToEmit = global.sessionMode === SESSIONS.playlistMode
      ? () => mediaPlayerEventHandler.emit('next')
      : () => mediaPlayerEventHandler.emit('end') // just stop if the song ends

    global.timer = new Timer(eventToEmit, songDuration)
  }

  const actionsForSystem = {
    win32: playAudioForWindows,
    linux: playAudioForLinux,
    darwin: playAudioForMacOs
  }

  const play = actionsForSystem[process.platform] ?? otherSystemMessage
  play(path)
}
