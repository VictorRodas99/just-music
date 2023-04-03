import { spawn } from 'node:child_process'
import { otherSystemMessage } from '../utils/tools.js'
import { cliErrorMessage } from '../cli/utils/cli.general.tools.js'
import { PATHS } from '../config.js'
import { getMediaPlayerAction } from '../cli/interactions.js'

const playAudioForWindows = async (path) => {
  const scriptPath = PATHS.scripts('music-player.ps1')
  const args = ['-ExecutionPolicy', 'Bypass', '-File', scriptPath, path]

  const mediaPlayerProcess = spawn('Powershell.exe', args)

  mediaPlayerProcess.stdout.on('data', (data) => {
    console.log(data.toString())
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

const playAudioForLinux = (path) => {
  cliErrorMessage('Linux not supported yet')
}

const playAudioForMacOs = (path) => {
  cliErrorMessage('Mac Os not supported yet!')
}

export function playAudio ({ path, song }) {
  // const songDuration = songDurationToMiliseconds(song.duration)

  const actionsForSystem = {
    win32: playAudioForWindows,
    linux: playAudioForLinux,
    darwin: playAudioForMacOs
  }

  const play = actionsForSystem[process.platform] ?? otherSystemMessage
  play(path)
  /*
  const player = actionsForSytem... rest of code
  player().on('play', play)
  player().on('close', resetApp)
  player().on('next', someFunctionThatPlaysNextMusicIfExists)
  */
}
