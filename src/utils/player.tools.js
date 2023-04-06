export const restartTimer = (newDuration) => {
  if (global.timer) {
    global.timer.restart(newDuration)
  }
}

export const restartPlayer = (currentProcess) => {
  currentProcess.stdin.write('close\n')
}
