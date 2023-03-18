import { exec } from 'node:child_process'
import { getScriptPath } from './tools.js'

const playAudioForWindows = (path) => {
  const scriptPath = getScriptPath('windows.ps1')
  const pipeScriptToStdin = `powershell Get-Content ${scriptPath} | Powershell.exe -noprofile -`
  const acceptAll = '| echo "E"'
  const giveArgument = `| ${path}`
  // const command = `powershell Get-Content ${scriptPath} | Powershell.exe -noprofile - | echo 'Z' | ${path}`
  const hideStdout = '| Out-Null'

  const command = `${pipeScriptToStdin} ${acceptAll} ${giveArgument} ${hideStdout}`

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
