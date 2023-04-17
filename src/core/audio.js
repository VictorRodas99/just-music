import { cliErrorMessage, logSongProgress } from '../cli/utils/cli.general.tools.js'
import { otherSystemMessage, songDurationToMiliseconds } from '../utils/tools.js'
import { executeAudioScript } from './utils/mediaPlayer.tools.js'
import { OPTIONS, SESSIONS } from '../cli/config.js'
import { PATHS } from '../config.js'

import { EventEmitter } from 'node:events'

export const mediaPlayerEventHandler = new EventEmitter()

const playAudioForWindows = async (audioPath) => {
  if (!audioPath || typeof audioPath !== 'string') {
    throw new Error(`Invalid audio path... (${audioPath})`)
  }

  const scriptPath = PATHS.scripts('music-player.ps1')
  const args = ['-ExecutionPolicy', 'Bypass', '-File', scriptPath, audioPath]

  executeAudioScript('Powershell.exe', args)
}

const playAudioForLinux = (audioPath) => {
  if (!audioPath || typeof audioPath !== 'string') {
    throw new Error(`Invalid audio path... (${audioPath})`)
  }

  const scriptPath = PATHS.scripts('music-player.sh')
  const args = [scriptPath, audioPath]

  executeAudioScript('bash', args)
}

const playAudioForMacOs = (audioPath) => {
  cliErrorMessage('Mac Os not supported yet!')
}

/**
 * @typedef {import('../cli/interactions.js').SongInfo} SongInfo
 * @param { { path: string, song: SongInfo | undefined } } info
 */
export function playAudio ({ path, song }) {
  const actionsForSystem = {
    win32: playAudioForWindows,
    linux: playAudioForLinux,
    darwin: playAudioForMacOs
  }

  const play = actionsForSystem[process.platform] ?? otherSystemMessage
  play(path)

  if (song) { // If it isn't in autoplay mode
    const songDuration = songDurationToMiliseconds(song.duration)

    const eventToEmit = global.sessionMode === SESSIONS.playlistMode && global.playlistPlayOption !== OPTIONS.playlist.one
      ? () => mediaPlayerEventHandler.emit('next')
      : () => mediaPlayerEventHandler.emit('end') // just stop if the song ends

    logSongProgress(songDuration, eventToEmit)
  }
}
