// import { exec } from 'node:child_process'
import { spawn } from 'node:child_process'
import { getScriptPath, otherSystemMessage } from '../utils/tools.js'
import { cliErrorMessage, handleCancel } from '../cli/utils/cli.general.tools.js'

// import { checkMediaPlayerInit } from './playerProccess.js'

/* cli interactions  */
import { text } from '@clack/prompts'

const waitForUserOption = async () => {
  const option = await text({
    message: 'Player controls...',
    placeholder: 'pause | resume | next | close'
  })

  handleCancel(option)

  return option
}
/* ---- */

const playAudioForWindows = async (path) => {
  const scriptPath = getScriptPath('music-player.ps1', 'windows')
  // const command = `PowerShell.exe -ExecutionPolicy Bypass -File ${scriptPath} | ${path}`
  const args = ['-ExecutionPolicy', 'Bypass', '-File', scriptPath, path]

  // exec(command, (error, stdout, stderr) => {
  //   if (error) {
  //     console.error(`Something went wrong:\n${error}`)
  //     process.exit(1)
  //   }
  // })

  const mediaPlayerProcess = spawn('Powershell.exe', args)

  mediaPlayerProcess.stdout.on('data', (data) => {
    console.log(data.toString())
  })

  mediaPlayerProcess.stderr.on('data', (chunk) => {
    console.error(chunk.toString())
  })

  let userOption

  do {
    userOption = await waitForUserOption()
    mediaPlayerProcess.stdin.write(`${userOption}\n`)
  } while (userOption !== 'close')

  process.exit(0)

  // checkMediaPlayerInit()
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
