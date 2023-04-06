import { autoplay } from './cli/utils/cli.general.tools.js'
import {
  setupMainOption,
  handleSearchByName,
  handleSearchByLink
} from './cli/interactions.js'
import { developMode } from './utils/tools.js'

const showError = console.error

async function main () {
  developMode(process.argv[2] === '--dev')
  console.clear()

  if (process.argv[3] === '--autoplay') {
    return autoplay()
  }

  const mainOption = await setupMainOption()

  const mainAction = mainOption === 'name'
    ? handleSearchByName
    : handleSearchByLink

  mainAction()
}

main().catch(showError)
