import { isCancel, cancel } from '@clack/prompts'
import { getRandomNumber } from './tools.js'

export const clearConsole = () => {
  process.stdout.write('\u001b[2J\u001b[0;0H')
  console.log()
}

export const handleCancel = (propmtResult) => {
  if (isCancel(propmtResult)) {
    cancel('Operation cancelled')
    return process.exit(0)
  }
}

export const getRandomSongFrom = (playlistItems) => {
  const total = playlistItems.length
  return playlistItems[getRandomNumber(total) - 1]
}
