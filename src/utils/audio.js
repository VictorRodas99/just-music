import { exec } from 'node:child_process'
import { getScriptPath } from './tools.js'

const playAudioForWindows = (path) => {
  const scriptPath = getScriptPath('windows.ps1')
  const command = `Powershell.exe PowerShell.exe -ExecutionPolicy Bypass -File ${scriptPath} | ${path}`

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Something went wrong:\n${error}`)
      process.exit(1)
    }
  })
}

const playAudioForLinux = (path) => {
  console.log('Linux not supported yet')
  process.exit(1)
}

const playAudioForMacOs = (path) => {
  console.log('Mac Os not supported yet!')
  process.exit(1)
}

const otherSystemMessage = () => {
  console.log(`${process.platform} not supported`)
  process.exit(1)
}

export function playAudio (path) {
  const actionsForSystem = {
    win32: playAudioForWindows,
    linux: playAudioForLinux,
    darwin: playAudioForMacOs
  }

  const play = actionsForSystem[process.platform] ?? otherSystemMessage
  play(path)
}
