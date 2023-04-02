param (
    [Parameter(Mandatory = $true)]
    [string]$rawPath
)

Add-Type -AssemblyName PresentationCore

$mediaPlayer = New-Object System.Windows.Media.MediaPlayer
$songPath = (Convert-Path $rawPath)

$mediaPlayer.Open($songPath)
$mediaPlayer.Play()

function handleOptions {
    param (
        [Parameter(Mandatory = $true)]
        [string]$userInput,

        [Parameter(Mandatory = $true)]
        [System.Windows.Media.MediaPlayer]$mediaPlayer
    )

    switch ($userInput) {
        "pause" {
            $mediaPlayer.Pause()
            Write-Output "pause"
        }

        "resume" {
            $mediaPlayer.Play()
            Write-Output "resume"
        }

        "next" {
            Write-Output "next song"
        }

        "close" {
            $mediaPlayer.Stop()
            exit
        }

        default {
            Write-Output "Invalid Option"
        }
    }
}

$reader = New-Object System.IO.StreamReader([System.Console]::OpenStandardInput()) # reads from the stdin (data comes from node js)

while ($true) {
    $line = $reader.ReadLine()
    if ($line -eq $null) { break }
    handleOptions $line $mediaPlayer
}

# $MediaPlayer = [Windows.Media.Playback.MediaPlayer, Windows.Media, ContentType = WindowsRuntime]::New()
# $MediaPlayer.Source = [Windows.Media.Core.MediaSource]::CreateFromUri($args[0])
# $MediaPlayer.Play()