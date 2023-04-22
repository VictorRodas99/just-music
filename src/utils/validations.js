import ytpl from 'ytpl'
import ytdl from 'ytdl-core'

export const validateSingleVideoURL = (value) => {
  if (!ytdl.validateURL(value)) return 'It is not a valid video url!'
}

export const validatePlaylistURL = (value) => {
  const errorMessage = 'Is not a valid playlist link!'

  try {
    ytpl.getPlaylistID(value)
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unable to find a id')) {
      return errorMessage
    }
  }

  const isValid = ytpl.validateID(value)

  if (!isValid) {
    return errorMessage
  }
}
