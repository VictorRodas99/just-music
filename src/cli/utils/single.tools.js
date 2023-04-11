import { mediaPlayerEventHandler } from '../../core/audio.js'
import { handleSearchByName } from '../interactions.js'
import { handleCancel } from './cli.general.tools.js'
import { confirm } from '@clack/prompts'

export const handleSongEnd = async () => {
  mediaPlayerEventHandler.emit('restart')

  const shouldContinue = await confirm({
    message: 'Do you want to continue?',
    initialValue: false
  })

  handleCancel(shouldContinue)

  if (!shouldContinue) {
    process.exit(0)
  }

  await handleSearchByName(true)
}
