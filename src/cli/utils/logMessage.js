import colors from 'picocolors'

export function logHelpMessage () {
  const programTitle = colors.cyan('just-music')

  const logMessage = `
  
    ${programTitle} - A command-line interface (CLI) tool that lets you listen music on your terminal

    USAGE

      $ ${programTitle} --help
      $ ${programTitle} --version
      $ ${programTitle} -name "Song Name - Artist"
      $ ${programTitle} -link https://valid-youtube-link.com

      By default without any flag, ${programTitle} will show a simple interface to choose play options

    OPTIONS

      --help                    Shows this help message
      --version                 Displays the current version of just-music
      -name                     Specifies the name of the song to play
      -link                     Specifies the YouTube link to play
  
  `

  console.log(logMessage)
}
