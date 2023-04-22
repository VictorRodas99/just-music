import { developMode } from './tools.js'

/**
 * @typedef {{ mode: ('autoplay' | 'normal') }} PureMode
 * @typedef {{ mode: ('error' | '-name' | '-link'), payload: string }} ModePayload
 *
 * @param {Array<string>} args
 * @returns {PureMode | ModePayload}
 */
export function handleArgumentsByCall (args) {
  const givenModes = args.filter((arg) => arg.startsWith('-'))

  developMode(givenModes.includes('--dev'))

  if (givenModes.includes('--autoplay')) {
    return {
      mode: 'autoplay'
    }
  }

  const givenPlayModes = givenModes.filter(
    (arg) => arg !== '--dev'
  )

  if (givenPlayModes.length === 0) {
    return {
      mode: 'normal'
    }
  }

  const validPlayModes = ['-name', '-link']
  const [mode] = givenPlayModes.filter((arg) => validPlayModes.includes(arg))

  if (!mode) {
    return {
      mode: 'error',
      payload: 'Invalid or missing mode were given'
    }
  }

  const indexOfName = args.indexOf(mode) + 1
  const givenName = args.at(indexOfName)

  if (!givenName) {
    return {
      mode: 'error',
      payload: 'Invalid or missing name were given'
    }
  }

  return {
    mode,
    payload: givenName
  }
}
