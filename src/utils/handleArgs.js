import { developMode } from './tools.js'
import { MODES } from '../config.js'

/**
 * @typedef {{ mode: ('--help' | 'normal' | '--vesrsion') }} PureMode
 * @typedef {{ mode: ('error' | '-name' | '-link'), payload: string }} ModePayload
 *
 * @param {Array<string>} args
 * @returns {PureMode | ModePayload}
 */
export function handleArgumentsByCall (args) {
  const ERROR_PAYLOAD = {
    mode: MODES.error,
    payload: 'Invalid or missing mode were given'
  }

  const givenModes = args.filter((arg) => arg.startsWith('-'))

  developMode(givenModes.includes(MODES.dev))

  if (givenModes.includes(MODES.help)) {
    return {
      mode: MODES.help
    }
  }

  if (givenModes.includes(MODES.version)) {
    return {
      mode: MODES.version
    }
  }

  const givenPlayModes = givenModes.filter(
    (arg) => arg !== MODES.dev
  )

  if (givenPlayModes.length === 0) {
    return {
      mode: MODES.normal
    }
  }

  const mode = givenPlayModes.find(
    (arg) => arg === MODES.byName || arg === MODES.byLink
  )

  if (!mode) {
    return ERROR_PAYLOAD
  }

  const indexOfParam = args.indexOf(mode) + 1
  const givenParametter = args.at(indexOfParam)

  if (!givenParametter) {
    return ERROR_PAYLOAD
  }

  return {
    mode,
    payload: givenParametter
  }
}
