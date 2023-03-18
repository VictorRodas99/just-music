$MediaPlayer = [Windows.Media.Playback.MediaPlayer, Windows.Media, ContentType = WindowsRuntime]::New();
$MediaPlayer.Source = [Windows.Media.Core.MediaSource]::CreateFromUri($args[0]);
$MediaPlayer.Play();

echo "Playing $args[0]";