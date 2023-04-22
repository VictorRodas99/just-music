import { autoplay, cliErrorMessage } from './cli/utils/cli.general.tools.js'
import {
  setupMainOption,
  handleSearchByName,
  handleSearchByLink
} from './cli/interactions.js'
import { handleArgumentsByCall } from './utils/handleArgs.js'

const showError = console.error

async function main () {
  console.clear()
  const options = handleArgumentsByCall(process.argv)

  if (options.mode === 'autoplay') {
    return autoplay()
  }

  if (options.mode === 'normal') {
    const mainOption = await setupMainOption()

    const mainAction = mainOption === 'name'
      ? handleSearchByName
      : handleSearchByLink

    return mainAction()
  }

  const { mode, payload } = options

  if (mode === 'error') {
    return cliErrorMessage(payload)
  }

  const mainAction = mode === '-name'
    ? handleSearchByName
    : handleSearchByLink

  return mainAction({ payload })
}

main().catch(showError)
