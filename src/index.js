import { cliErrorMessage } from './cli/utils/cli.general.tools.js'
import {
  setupMainOption,
  handleSearchByName,
  handleSearchByLink
} from './cli/interactions.js'
import { handleArgumentsByCall } from './utils/handleArgs.js'
import { logHelpMessage } from './cli/utils/logMessage.js'
import { MODES } from './config.js'

const showError = console.error

async function main () {
  const options = handleArgumentsByCall(process.argv)

  if (options.mode === MODES.help) {
    return logHelpMessage()
  }

  console.clear()

  if (options.mode === MODES.normal) {
    const mainOption = await setupMainOption()

    const mainAction = mainOption === 'name'
      ? handleSearchByName
      : handleSearchByLink

    return mainAction()
  }

  const { mode, payload } = options

  if (mode === MODES.error) {
    return cliErrorMessage(payload)
  }

  const mainAction = mode === MODES.byName
    ? handleSearchByName
    : handleSearchByLink

  return mainAction({ payload })
}

main().catch(showError)
