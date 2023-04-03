import url from 'url'
import path from 'path'

const configPath = url.fileURLToPath(import.meta.url)
export const srcRootPath = path.dirname(configPath)

const FOLDERS = {
  audio: 'outputs',
  mediaPlayerScripts: 'scripts'
}

export const PATHS = {
  audio: getAudioPath,
  scripts: getScriptPath
}

/**
 * Returns downloaded song absolute path
 * @param {string} fileName
 * @returns {string} path
 */
function getAudioPath (fileName) {
  if (!fileName) {
    throw new Error('File name must be provided')
  }

  if (typeof fileName !== 'string') {
    throw new TypeError('File name must be a string')
  }

  return path.join(srcRootPath, FOLDERS.audio, fileName)
}

/**
 * Returns the shell script absolute path
 * @param {string} scriptName
 * @returns {string} path
 */
function getScriptPath (scriptName) {
  if (!scriptName) {
    throw new Error('No script name was provided')
  }

  if (typeof scriptName !== 'string') {
    throw new Error('Script name must be a string')
  }

  const currentExtension = scriptName.split('.').at(-1)

  if (!currentExtension) {
    throw new Error('The provided script name does not have an extension')
  }

  const extensions = {
    windows: ['ps1', 'bat'],
    unix: ['.sh', '.zsh']
  }

  const entries = Object.entries(extensions)
  const system = entries.map(
    ([system, systemExtensions]) => {
      const extension = systemExtensions.find((extension) => extension === currentExtension)

      return extension
        ? system
        : null
    }
  ).find(Boolean)

  if (!system) {
    throw new Error(`The provided extension "${currentExtension}" is not supported on the current system`)
  }

  return path.join(srcRootPath, FOLDERS.mediaPlayerScripts, system, scriptName)
}
