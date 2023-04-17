#!/bin/bash

song_path=$1

cvlc $song_path >/dev/null 2>&1 &
media_player_id=$!

function handle_options {
  user_input=$1

  if [[ $user_input == "pause" ]]; then
    kill -SIGSTOP $media_player_id
    echo "pause"
  elif [[ $user_input == "resume" ]]; then
    kill -SIGCONT "$media_player_id"
    echo "resume"
  elif [[ $user_input == "next" ]]; then
    echo "next song"
  elif [[ $user_input == "close" ]]; then
    kill -SIGTERM "$media_player_id"
    exit 0
  else
    echo "Invalid Option"
  fi
}

while read -r line; do
  if [[ "$line" == "" ]]; then
    break
    exit 0
  fi

  handle_options $line
done