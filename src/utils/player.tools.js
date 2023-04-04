import { playRandomSongFrom } from '../cli/utils/playlist.js'

export const restartTimer = (newDuration) => {
  if (global.timer) {
    global.timer.restart(newDuration)
  }
}

export const nextSongHandler = () => {
  if (global.playlistPlayOption === 'random') {
    playRandomSongFrom(global.playlist)
  }
}

export const restartPlayer = (currentProcess) => {
  currentProcess.stdin.write('close\n')
}
