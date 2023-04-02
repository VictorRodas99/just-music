import ytSearch from 'ytsr'
import ytdl from 'ytdl-core'
import { createWriteStream } from 'node:fs'
import { getAudioAbsPath } from '../utils/tools.js'
// import { playAudio } from './audio.js'

export const getAudioFormatsFromUrl = async (url) => {
  const resultsInfo = await ytdl.getInfo(url)
  const audioFormats = ytdl.filterFormats(resultsInfo.formats, 'audioonly')

  return audioFormats
}

export const createStream = () => {
  const samplePath = getAudioAbsPath('sample.mp3')
  const writableStream = createWriteStream(samplePath)

  return {
    writableStream,
    filePath: samplePath
  }
}

export async function getVideosBySearch (query) {
  if (typeof query !== 'string') {
    throw new TypeError('Given query isn\'t a string')
  }

  const rawResults = await ytSearch(query)
  const onlyVideos = rawResults.items.filter((item) => item.type === 'video')

  return onlyVideos
}

export function downloadAudioBy ({ url, givenMimeType }) {
  const { writableStream, filePath } = createStream()

  ytdl(url, { filter: (format) => format.mimeType === givenMimeType })
    .pipe(writableStream)

  // writableStream.on('finish', () => playAudio(filePath))
  return {
    writableStream,
    filePath
  }
}
