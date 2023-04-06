import { handleCancel, downloadAndPlay } from './utils/cli.general.tools.js'
import { getVideosBySearch } from '../core/download.tools.js'
import { intro, select, text, spinner } from '@clack/prompts'
import { handleSingleModeByLink } from './single.js'
import { handlePlaylistMode } from './playlist.js'
import { mapResults } from '../utils/tools.js'
import { SESSIONS } from './config.js'
import color from 'picocolors'

/**
 * @typedef {('pause' | 'resume' | 'next' | 'close')} UserOptionPlaylist
 * @typedef {('pause' | 'resume' | 'close')} UserOptionSingle
 * @typedef {UserOptionSingle | UserOptionPlaylist} UserOption
 *
 * @returns {Promise<UserOption>}
 */
export const getMediaPlayerAction = async () => {
  const controls = global.sessionMode === 'playlist'
    ? 'pause | resume | next | close'
    : 'pause | resume | close'

  const option = await text({
    message: 'Player controls...',
    placeholder: controls
  })

  handleCancel(option)

  return option
}

/**
 * @typedef {import('ytsr').Item} Item
 * @typedef { { url: string, id: string, title: string, duration: string } } SongInfo
 * @param {Item[]} results
 * @returns {Promise<SongInfo>}
 */
export async function giveOptionsToUser (results) {
  const errorMessage = "Your requested song wasn't found..."

  if (!Array.isArray(results)) {
    throw new Error(errorMessage)
  }

  if (results.length <= 0) {
    throw new Error(errorMessage)
  }

  const mappedResults = mapResults({ results, limit: 5 })

  const songSelected = await select({
    message: 'Results...',
    options: mappedResults.map(({ url, id, title, duration, verified }) => {
      return {
        value: { url, id, title, duration },
        label: `${title} ${verified ? '✔' : ''}`,
        hint: duration
      }
    })
  })

  handleCancel(songSelected)

  return songSelected
}

/**
 * @returns {Promise<('name' | 'link')>}
 */
export async function setupMainOption () {
  intro(color.inverse(' just music... '))

  const linkOrName = await select({
    message: 'Do you want to search by link or name?',
    options: [
      { value: 'name', label: 'Just the name of the song' },
      { value: 'link', label: 'Link', hint: 'A valid youtube link' }
    ]
  })

  handleCancel(linkOrName)

  return linkOrName
}

export async function handleSearchByName () {
  global.sessionMode = SESSIONS.singleMode

  const loader = spinner()

  const query = await text({
    message: 'What\'s the name of your song?',
    placeholder: 'Around the world - Daft Punk'
  })

  handleCancel(query)

  loader.start('Searching for the song...')

  const results = await getVideosBySearch(query)

  loader.stop()

  const songSelected = await giveOptionsToUser(results)
  downloadAndPlay(songSelected)
}

export async function handleSearchByLink () {
  const singleOrPlaylist = await select({
    message: 'Only a single song or a playlist?',
    options: [
      { value: 'playlist', label: 'Show all the songs in a playlist' },
      { value: 'link', label: 'Link', hint: 'Just one specific song' }
    ]
  })

  handleCancel(singleOrPlaylist)

  const finalAction = singleOrPlaylist === 'playlist'
    ? handlePlaylistMode
    : handleSingleModeByLink

  finalAction()
}
