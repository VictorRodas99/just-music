import { handleCancel, downloadAndPlay, mediaPlayerOptionsValidation, parseOption, cliErrorMessage } from './utils/cli.general.tools.js'
import { validateSingleVideoURL, validatePlaylistURL } from '../utils/validations.js'
import { getVideosBySearch } from '../core/download.tools.js'
import { intro, select, text, spinner } from '@clack/prompts'
import { mediaPlayerEventHandler } from '../core/audio.js'
import { handleSongEnd } from './utils/single.tools.js'
import { handleSingleModeByLink } from './single.js'
import { handlePlaylistMode } from './playlist.js'
import { mapResults } from '../utils/tools.js'
import { OPTIONS, SESSIONS } from './config.js'
import color from 'picocolors'

/**
 * @typedef {('pause' | 'resume' | 'next' | 'close')} UserOptionPlaylist
 * @typedef {('pause' | 'resume' | 'close')} UserOptionSingle
 * @typedef {UserOptionSingle | UserOptionPlaylist} UserOption
 *
 * @returns {Promise<UserOption>}
 */
export async function getMediaPlayerAction () {
  const controlOptions = ['pause', 'resume', 'next', 'close']

  const controls = global.sessionMode === 'playlist' && global.playlistPlayOption !== OPTIONS.playlist.one
    ? controlOptions.join(' | ')
    : controlOptions.filter(option => option !== 'next').join(' | ')

  const option = await text({
    message: 'Player controls...',
    placeholder: controls,
    validate: (value) => mediaPlayerOptionsValidation(value, controlOptions)
  })

  handleCancel(option)

  return parseOption(option)
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

/**
 *
 * @param {{ payload: string } | {}} oneLineCall
 * @param {boolean} isNext
 */
export async function handleSearchByName (oneLineCall = {}, isNext = false) {
  if (!isNext) {
    global.sessionMode = SESSIONS.singleMode
  }

  const loader = spinner()
  let query

  if (oneLineCall.payload) {
    query = oneLineCall.payload
  } else {
    query = await text({
      message: `What's the name of your${isNext ? ' next' : ''} song?`,
      placeholder: 'Around the world - Daft Punk',
      validate: (value) => {
        if (!value.trim()) return 'Please, enter the name of the song or the artist'
      }
    })

    handleCancel(query)
  }

  loader.start('Searching for the song...')

  const results = await getVideosBySearch(query)

  loader.stop()

  const songSelected = oneLineCall.payload
    ? results.at(0)
    : await giveOptionsToUser(results)

  downloadAndPlay(songSelected)

  mediaPlayerEventHandler.once('end', () => setImmediate(handleSongEnd))
}

export async function handleSearchByLink (oneLineCall = {}) {
  if (!oneLineCall.payload) {
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

    return finalAction()
  }

  const givenLink = oneLineCall.payload
  const invalidLinkError = validateSingleVideoURL(givenLink)

  if (invalidLinkError) {
    const invalidPlaylistError = validatePlaylistURL(givenLink)

    if (!invalidPlaylistError) {
      return handlePlaylistMode({ payload: givenLink })
    }

    return cliErrorMessage(invalidLinkError)
  }

  handleSingleModeByLink({ payload: givenLink })
}
