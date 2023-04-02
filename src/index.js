import { clearConsole } from './cli/utils/cli.general.tools.js'
import {
  setupMainOption,
  handleSearchByName,
  handleSearchByLink
} from './cli/interactions.js'
import { developMode } from './utils/tools.js'

import { spinner } from '@clack/prompts'
import { playAudio } from './core/audio.js'
import { PATHS } from './config.js'

const showError = console.error

async function main () {
  developMode(process.argv[2] === '--dev')
  clearConsole()

  if (process.argv[3] === '--autoplay') {
    const loader = spinner()

    loader.start('Playing in dev mode...')
    playAudio({ path: PATHS.absolutes.audio('sample.mp3') })

    return loader.stop()
  }

  const mainOption = await setupMainOption()

  if (mainOption === 'name') {
    handleSearchByName()
  } else {
    handleSearchByLink()
  }
}

main().catch(showError)
