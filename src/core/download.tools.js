import { createOutputFolder } from './utils/checkFolder.js'
import { createWriteStream } from 'node:fs'
import { PATHS } from '../config.js'
import ytdl from 'ytdl-core'
import ytSearch from 'ytsr'

let currentStream = null

export const getAudioFormatsFromUrl = async (url) => {
  const resultsInfo = await ytdl.getInfo(url)
  const audioFormats = ytdl.filterFormats(resultsInfo.formats, 'audioonly')

  return audioFormats
}

export const createStream = () => {
  createOutputFolder()
  const samplePath = PATHS.audio('sample.mp3')

  if (currentStream) {
    currentStream.end()
  }

  const writableStream = createWriteStream(samplePath)
  currentStream = writableStream

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

/**
 * @typedef {import('node:fs').WriteStream} WriteStream
 *
 * @param {{ url: string, givenMimeType: string | undefined }} info
 * @returns { {writableStream: WriteStream, filePath: string} }
 */
export function downloadAudioBy ({ url, givenMimeType }) {
  const { writableStream, filePath } = createStream()

  ytdl(url, { filter: (format) => format.mimeType === givenMimeType })
    .pipe(writableStream)

  return {
    writableStream,
    filePath
  }
}
