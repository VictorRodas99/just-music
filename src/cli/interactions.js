import { intro, select, text, spinner } from '@clack/prompts'
import { mapResults } from '../utils/tools.js'
import { handleCancel, getRandomSongFrom, downloadAndPlay } from './utils/cli.general.tools.js'
import { getVideosBySearch } from '../core/download.tools.js'
import { getPlaylistIDFromUser } from './utils/playlist.js'
import color from 'picocolors'
import ytpl from 'ytpl'

export const getMediaPlayerAction = async () => {
  const option = await text({
    message: 'Player controls...',
    placeholder: 'pause | resume | next | close'
  })

  handleCancel(option)

  return option
}

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
    options: mappedResults.map((result) => {
      return {
        value: { url: result.url, id: result.id, title: result.title },
        label: result.title,
        hint: result.duration
      }
    })
  })

  handleCancel(songSelected)

  return songSelected
}

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
  const loader = spinner()

  const query = await text({
    message: "What's the name of your song?",
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
  const onlyVideoOrPlaylist = await select({
    message: 'Only a single song or a playlist?',
    options: [
      { value: 'playlist', label: 'Show all the songs in a playlist' },
      { value: 'link', label: 'Link', hint: 'Just one specific song' }
    ]
  })

  handleCancel(onlyVideoOrPlaylist)

  if (onlyVideoOrPlaylist === 'playlist') {
    const playlistID = await getPlaylistIDFromUser()

    const playOption = await select({
      message: 'Select the mode you want',
      options: [
        { value: 'random', label: 'Play random songs from the playlist' },
        { value: 'order', label: 'Play songs in order' },
        { value: 'single', label: 'Select the song you want' }
      ]
    })

    handleCancel(playOption)
    const playlist = await ytpl(playlistID)

    if (playOption === 'random') {
      const song = getRandomSongFrom(playlist.items)
      console.log(song)
      downloadAndPlay(song)
    } else if (playOption === 'order') {
      // TODO: wait until the last music being played ends
    }

    // const search = await ytpl(playlistID, { pages: 1 })
  }
}
