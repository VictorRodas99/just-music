import { spawn } from 'node:child_process'
import { otherSystemMessage, songDurationToMiliseconds, parseOutput } from '../utils/tools.js'
import { cliErrorMessage } from '../cli/utils/cli.general.tools.js'
import { PATHS } from '../config.js'
import { getMediaPlayerAction } from '../cli/interactions.js'

import { EventEmitter } from 'node:events'
import Timer from '../utils/timer.js'
import { restartPlayer, nextSongHandler } from '../utils/player.tools.js'

export const mediaPlayerEventHandler = new EventEmitter()

const playAudioForWindows = async (song) => {
  const scriptPath = PATHS.scripts('music-player.ps1')
  const args = ['-ExecutionPolicy', 'Bypass', '-File', scriptPath, song.path]

  const mediaPlayerProcess = spawn('Powershell.exe', args)

  mediaPlayerEventHandler.on('restart', () => restartPlayer(mediaPlayerProcess))

  mediaPlayerProcess.stdout.on('data', (data) => {
    const mode = parseOutput(data.toString())
    const isInPlaylistMode = global.sessionMode === 'playlist'

    if (isInPlaylistMode) {
      if (mode === 'pause') {
        global.timer.pause()
      } else if (mode === 'resume') {
        global.timer.resume()
      } else if (mode === 'nextsong') {
        restartPlayer(mediaPlayerProcess)
        nextSongHandler()
      }
    }
  })

  mediaPlayerProcess.stderr.on('data', (chunk) => {
    console.error(chunk.toString())
  })

  let userOption

  do {
    userOption = await getMediaPlayerAction()
    mediaPlayerProcess.stdin.write(`${userOption}\n`)
  } while (userOption !== 'close')

  process.exit(0)
}

const playAudioForLinux = (song) => {
  cliErrorMessage('Linux not supported yet')
}

const playAudioForMacOs = (song) => {
  cliErrorMessage('Mac Os not supported yet!')
}

export function playAudio ({ path, song }) {
  const songDuration = songDurationToMiliseconds(song.duration)

  if (global.sessionMode === 'playlist') {
    // TODO: restart the timer if next event is triggered

    // Call 'next' event when the song ends
    global.timer = new Timer(() => {
      mediaPlayerEventHandler.emit('next')
    }, songDuration)
  }

  const actionsForSystem = {
    win32: playAudioForWindows,
    linux: playAudioForLinux,
    darwin: playAudioForMacOs
  }

  const play = actionsForSystem[process.platform] ?? otherSystemMessage
  play({ path, duration: songDuration })
}
