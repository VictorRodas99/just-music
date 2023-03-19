import { intro, select, text, spinner, cancel } from '@clack/prompts'
import { mapResults } from '../utils/tools.js'
import { handleCancel, getRandomSongFrom } from '../utils/cli.tools.js'
import { getVideosBySearch, getAudioFormatsFromUrl, downloadAudioBy } from '../utils/download.tools.js'
import color from 'picocolors'
import ytpl from 'ytpl'

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
  const [firstAudioFormat] = await getAudioFormatsFromUrl(
    songSelected.url
  )

  loader.start('Downloading...')

  downloadAudioBy({
    url: songSelected.url,
    givenMimeType: firstAudioFormat.mimeType
  })

  loader.stop(`Playing "${songSelected.title}"`)
}

export async function handleSearchByLink () {
  const loader = spinner()

  const onlyVideoOrPlaylist = await select({
    message: 'Only a single song or a playlist?',
    options: [
      { value: 'playlist', label: 'Show all the songs in a playlist' },
      { value: 'link', label: 'Link', hint: 'Just one specific song' }
    ]
  })

  handleCancel(onlyVideoOrPlaylist)

  if (onlyVideoOrPlaylist === 'playlist') {
    // Handle playlist
    const playlistUrl = await text({
      message: 'Give the playlist link',
      placeholder: 'here...'
    })

    handleCancel(playlistUrl)

    const playlistID = await ytpl.getPlaylistID(playlistUrl)
    const isValid = ytpl.validateID(playlistID)

    if (!isValid) {
      cancel('The given url is not valid!')
      process.exit(1)
    }

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
      const songSelected = getRandomSongFrom(playlist.items)

      // TODO: wrap this in a function bc it repeats above
      const [firstAudioFormat] = await getAudioFormatsFromUrl(
        songSelected.url
      )

      loader.start('Downloading...')

      downloadAudioBy({
        url: songSelected.url,
        givenMimeType: firstAudioFormat.mimeType
      })

      loader.stop(`Playing "${songSelected.title}"`)
    }

    // const search = await ytpl(playlistID, { pages: 1 })
  }
}
