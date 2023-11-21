import { AVPlaybackStatus, ResizeMode } from "expo-av";
import VideoPlayer from "expo-video-player";
import React, { useRef, useState, useEffect } from "react";
import { Audio, Video as OriginalVideo } from "expo-av";
import { ActivityIndicator, Dimensions, Pressable } from "react-native";
import { ExpoIcon } from "./ExpoIcon";
import { View, Text } from "./Themed";
import tw from "twrnc";
import * as Slider from "@miblanchard/react-native-slider";
import { TouchableOpacity } from "react-native-gesture-handler";
import { toHHMMSS } from "../../data";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

interface DefaultVideoPlayerProps {
  style: any;
  resizeMode?: ResizeMode;
  uri: string;
}
export const DefaultVideoPlayer = (props: DefaultVideoPlayerProps) => {
  const refVideo = useRef<null>(null);
  return (
    <VideoPlayer
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
  );
};

const triggerAudio = async (ref: React.MutableRefObject<null>) => {
  await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
  ref.current.playAsync();
};


type TVideoProps = OriginalVideo['props'] & {indicatorTopMargin?: number}
export const Video = ({ ...props }) => {
  const ref = useRef<OriginalVideo | null>(null);
  const [status, setStatus] = useState({});
  const [visible, setVisible] = useState<boolean>(false);
  const [playbackInstanceInfo, setPlaybackInstanceInfo] = useState({
    position: 0,
    duration: 0,
    state: "Buffering",
  });

  useEffect(() => {
    //@ts-ignore
    if (status.isPlaying) triggerAudio(ref);
    //@ts-ignore
  }, [ref, status.isPlaying]);

  const updatePlaybackCallback = (status: AVPlaybackStatus) => {
    setStatus(status);
    if (status.isLoaded) {
      setPlaybackInstanceInfo({
        ...playbackInstanceInfo,
        position: status.positionMillis,
        duration: status.durationMillis || 0,
        state:
          status.positionMillis === status.durationMillis
            ? "Ended"
            : status.isBuffering
            ? "Buffering"
            : status.shouldPlay
            ? "Playing"
            : "Paused",
      });
    } else {
      if (status.isLoaded === false && status.error) {
        const errorMsg = `Encountered a fatal error during playback: ${status.error}`;
        console.log(errorMsg, "error");
      }
    }
  };

  const togglePlay = async () => {
    const shouldPlay = playbackInstanceInfo.state !== "Playing";
    if (ref.current !== null) {
      await ref.current.setStatusAsync({
        shouldPlay,
        positionMillis:
          playbackInstanceInfo.state === "Ended"
            ? 0
            : playbackInstanceInfo.position,
      });
      setPlaybackInstanceInfo({
        ...playbackInstanceInfo,
        position:
          playbackInstanceInfo.state === "Ended"
            ? 0
            : playbackInstanceInfo.position,
        state:
          playbackInstanceInfo.state === "Ended"
            ? "Buffering"
            : "Playing"
            ? "Paused"
            : "Playing",
      });
    }
  };

  const toggleFullScreen = () => {
    if (ref.current) {
      ref.current.presentFullscreenPlayer();
    }
  };

  return (
    <Pressable onPress={() => setVisible(!visible)}>
      <OriginalVideo
        ref={ref}
        useNativeControls={false}
        onPlaybackStatusUpdate={(x) => {
          updatePlaybackCallback(x)
        }}
        {...props}
      />
      {visible && (
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          style={[
            {
              position: "absolute",
              bottom: 50,
              zIndex: 1,
              flex: 1,
              height: props.height,
            },
          ]}
        >
          <View style={tw`items-center justify-center self-center mb-${props.indicatorMarginTop || '30'}`}>
            <Pressable
              onPress={
                playbackInstanceInfo.state === "Buffering" ? null : togglePlay
              }
            >
              {renderIcon(playbackInstanceInfo.state)}
            </Pressable>
          </View>
          <VideoControls
            state={playbackInstanceInfo.state}
            playbackInstance={ref.current}
            toggleFullScreen={toggleFullScreen}
            playbackInstanceInfo={playbackInstanceInfo}
            setPlaybackInstanceInfo={setPlaybackInstanceInfo}
            togglePlay={togglePlay}
          />
        </Animated.View>
      )}
    </Pressable>
  );
};

function renderIcon(state: string | undefined) {
  const size = 50;
  const color = "white";
  if (state === "Buffering") {
    return <ActivityIndicator size={size} />;
  } else if (state === "Playing") {
    return <ExpoIcon name="pause" iconName="ion" size={size} color={color} />;
  } else if (state === "Paused") {
    return <ExpoIcon name="play" iconName="ion" size={size} color={color} />;
  } else if (state === "Ended") {
    return <ExpoIcon name="refresh" iconName="ion" size={size} color={color} />;
  }
  return <Text>What's going on?</Text>;
}

const VideoControls = (props: {
  state: any;
  togglePlay: any;
  playbackInstanceInfo: any;
  setPlaybackInstanceInfo: any;
  playbackInstance: any;
  toggleFullScreen: any;
}) => {
  const {
    state,
    togglePlay,
    playbackInstanceInfo,
    setPlaybackInstanceInfo,
    playbackInstance,
    toggleFullScreen,
  } = props;
  const w = Dimensions.get("screen").width;
  const wm = 0.6;
  return (
    <View
      style={[
        tw`flex-row items-center justify-center px-6 w-12/12`,
        { zIndex: 1 },
      ]}
    >
      <View
        style={tw`flex-row items-center justify-between rounded-3xl w-12/12`}
      >
        <Text style={tw`text-xs text-white`}>
          {toHHMMSS(playbackInstanceInfo.position / 1000)}
        </Text>
        <Slider.Slider
          thumbTintColor={"#fff"}
          thumbStyle={{
            height: 17,
            width: 17,
            borderRadius: 100,
          }}
          minimumTrackTintColor={"red"}
          maximumTrackTintColor="#8E9092"
          trackClickable
          containerStyle={{ width: w * wm, marginLeft: 10 }}
          maximumValue={w * wm}
          value={
            playbackInstanceInfo.duration
              ? w *
                wm *
                (playbackInstanceInfo.position / playbackInstanceInfo.duration)
              : 0
          }
          onSlidingStart={() => {
            if (playbackInstanceInfo.state === "Playing") {
              togglePlay();
              setPlaybackInstanceInfo({
                ...playbackInstanceInfo,
                state: "Paused",
              });
            }
          }}
          onSlidingComplete={async (e) => {
            const position =
              (e[e.length - 1] / (w * wm)) * playbackInstanceInfo.duration;
            if (playbackInstance) {
              await playbackInstance.setStatusAsync({
                positionMillis:
                  position > playbackInstanceInfo.duration ? 0 : position,
                shouldPlay: true,
              });
            }
            setPlaybackInstanceInfo({
              ...playbackInstanceInfo,
              position,
            });
          }}
        />
        <Pressable onPress={toggleFullScreen}>
          <ExpoIcon
            name="maximize"
            iconName="feather"
            size={25}
            color="white"
          />
        </Pressable>
      </View>
    </View>
  );
};
