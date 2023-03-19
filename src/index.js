import { clearConsole } from './utils/cli.tools.js'
import {
  setupMainOption,
  handleSearchByName,
  handleSearchByLink
} from './cli/interactions.js'
import { developMode } from './utils/tools.js'

const showError = console.error

async function main () {
  developMode(true)
  clearConsole()

  const mainOption = await setupMainOption()

  if (mainOption === 'name') {
    handleSearchByName()
  } else {
    handleSearchByLink()
  }
}

main().catch(showError)
