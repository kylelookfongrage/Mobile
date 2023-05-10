import { ResizeMode } from "expo-av";
import VideoPlayer from "expo-video-player"
import React, { useRef, useState, useEffect } from "react";
import { Audio, Video as OriginalVideo } from 'expo-av';

interface DefaultVideoPlayerProps {
  style: any;
  resizeMode?: ResizeMode;
  uri: string;
}
export const DefaultVideoPlayer = (props: DefaultVideoPlayerProps) => {
  const refVideo = useRef<null>(null)
  return <VideoPlayer
    style={props.style}
    videoProps={{
      resizeMode: props.resizeMode || ResizeMode.CONTAIN,
      // ❗ source is required https://docs.expo.io/versions/latest/sdk/video/#props
      source: {
        uri: props.uri,
      },
      ref: refVideo,
    }}
    fullscreen={{
      visible: true,
    }}
  />
}

const triggerAudio = async (ref) => {
  await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
  ref.current.playAsync();
};

export const Video = ({ ...props }) => {
  const ref = useRef(null);
  const [status, setStatus] = useState({});

  useEffect(() => {
    if (status.isPlaying) triggerAudio(ref);
  }, [ref, status.isPlaying]);

  return (
    <OriginalVideo
      ref={ref}
      onPlaybackStatusUpdate={(status) => setStatus(status)}
      useNativeControls
      {...props}
    />
  );
};