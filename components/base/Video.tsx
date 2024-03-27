import { AVPlaybackStatus, InterruptionModeAndroid, InterruptionModeIOS, ResizeMode } from "expo-av";
import VideoPlayer from "expo-video-player";
import React, { useRef, useState, useEffect } from "react";
import { Audio, Video as OriginalVideo } from "expo-av";
import { ActivityIndicator, Dimensions, Pressable } from "react-native";
import { ExpoIcon, Icon } from "./ExpoIcon";
import { View, Text } from "./Themed";
import tw from "twrnc";
import * as Slider from "@miblanchard/react-native-slider";
import { TouchableOpacity } from "react-native-gesture-handler";
import { toHHMMSS } from "../../data";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { _tokens } from "../../tamagui.config";
import useAsync from "../../hooks/useAsync";

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
  await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, interruptionModeIOS: InterruptionModeIOS.MixWithOthers, interruptionModeAndroid: InterruptionModeAndroid.DuckOthers});
  ref.current.playAsync();
  
};


type TVideoProps = OriginalVideo['props'] & {indicatorTopMargin?: number, defaultMuted?: boolean;}
export const Video = ({ ...props }) => {
  const ref = useRef<OriginalVideo | null>(null);
  const [status, setStatus] = useState({});
  const [muted, setMuted] = useState<boolean>(props.defaultMuted || false)
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

  useEffect(() => {
    if (props.autoPlay) {
      ref.current?.playAsync()
    }
  }, [])

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

  useAsync(async () => {
    if (!ref?.current) return;
    console.log('toggling muted')
    await ref.current.setIsMutedAsync(muted);
  }, [muted])

  const toggleMuted = async () => {
    setMuted(m => !m)
  }

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
              bottom: 0,
              zIndex: 1,
              flex: 1,
              height: '100%',
            }, tw`justify-between`
          ]}
        >
          <View>
          
          </View>
          <View style={tw`items-center mt-6 justify-center self-center mb-${props.indicatorMarginTop || '20'}`}>
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
            toggleMuted={toggleMuted}
            muted={muted}
            indicatorMarginBottom={props.indicatorMarginBottom}
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
  toggleMuted: () => void;
  indicatorMarginBottom?: any
  muted?: boolean
}) => {
  const {
    state,
    togglePlay,
    playbackInstanceInfo,
    setPlaybackInstanceInfo,
    playbackInstance,
    toggleFullScreen,
    muted, toggleMuted
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
        style={tw`flex-row items-center justify-between mb-${props.indicatorMarginBottom || '16'} rounded-3xl w-12/12`}
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
        <Pressable style={tw`self-end px-2 mb-2`} onPress={toggleMuted}>
              <Icon name={muted ? 'Volume-Off' : 'Volume-Up'} size={25} color={muted ? 'gray' : _tokens.primary900} weight="bold" />
            </Pressable>
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
