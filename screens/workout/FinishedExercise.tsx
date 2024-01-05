import { ActivityIndicator, Dimensions, TouchableOpacity, useColorScheme } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View } from "../../components/base/Themed";
import tw from "twrnc";
import AnimatedLottieView from "lottie-react-native";
import trophy from "../../assets/animations/trophy.json";
import { useNavigation } from "@react-navigation/native";
import ThisAdHelpsKeepFree from "../../components/features/ThisAdHelpsKeepFree";
import { useCommonAWSIds } from "../../hooks/useCommonContext";
import { defaultImage, sleep, toHHMMSS } from "../../data";
import SaveButton from "../../components/base/SaveButton";
import { useSelector } from "../../redux/store";
import Spacer from "../../components/base/Spacer";
import { XStack } from "tamagui";
import { ExerciseTile } from "./WorkoutDetail";
import Overlay from "../../components/screens/Overlay";
import SupabaseImage from "../../components/base/SupabaseImage";
import Button from "../../components/base/Button";
import {
  InterstitialAd,
  TestIds,
  AdEventType,
} from "react-native-google-mobile-ads";

const adUnitId = TestIds.INTERSTITIAL; // (Platform.OS === 'android' ? Env.GOOGLE_AD_UNIT : Env.APPLE_AD_UNIT) || TestIds.BANNER

const interstitial = InterstitialAd.createForAdRequest(adUnitId);

export default function FinishedExercise(props: {
  exercises: number;
  time: number;
  weight: number;
  metric: boolean;
}) {
  const dm = useColorScheme() === "dark";
  const navigator = useNavigation();
  let { subscribed } = useSelector((x) => x.auth);
  const [canMove, setCanMove] = useState<boolean>(false);
  let s = Dimensions.get("screen");
  let [time, setTime] = useState<number>(0);
  let waitTime = 5;
  React.useEffect(() => {
    if (subscribed) {
      setCanMove(true);
    }
  }, [subscribed]);
  React.useEffect(() => {
    setTimeout(() => {
      if (time < waitTime) {
        setTime(time + 1);
      } else {
        setCanMove(true);
      }
    }, 1000);
  });
  let buttonColor = canMove
    ? dm
      ? "red-600"
      : "red-500"
    : dm
    ? "red-600/40"
    : "red-500/40";
  let [show, setShow] = useState(false);
  let [hasSeen, setHasSeen] = useState(false);
  let save = () => {
    if (subscribed || show || hasSeen) {
        if (!subscribed) {
            try {
                interstitial.show()
            } catch (error) {
                
            }
        } else {
            navigator.navigate("Root");
        }
    } else {
      setShow(true);
      setHasSeen(true);
    }
  };

  const [loaded, setLoaded] = useState(!subscribed);

  useEffect(() => {
    if (subscribed) {
        setLoaded(true)
        return;
    }

    let unsubscribe = interstitial.addAdEventsListener((info) => {
        if (info.type === AdEventType.LOADED) {
            setLoaded(true)
        }
        if (info.type === AdEventType.CLOSED) {
            navigator.navigate('Root')
        }
    })

    // Start loading the interstitial straight away
    interstitial.load();

    // Unsubscribe from events on unmount
    return unsubscribe;
  }, []);

  // No advert ready to show yet
  if (!loaded) {
    return <View includeBackground style={[{flex: 1, alignItems: 'center', justifyContent: 'center'}]}>
        <ActivityIndicator size={'large'} />
    </View>;
  }

  return (
    <View style={[tw`px-4`, { flex: 1 }]} includeBackground>
      <SafeAreaView style={tw`h-12/12 flex`}>
        <View>
          <View style={tw`items-center justify-center w-12/12`}>
            <AnimatedLottieView
              autoPlay
              style={{ height: s.height * 0.4 }}
              // Find more Lottie files at https://lottiefiles.com/featured
              source={trophy}
            />
          </View>
          <Text style={tw`mt-4 text-center`} h3 weight="bold">
            Congratulations!
          </Text>
          <Spacer sm />
          <Text style={tw`text-center px-2`} xl>
            You have successfully completed a workout or run!
          </Text>
        </View>
        <Spacer lg />
        <XStack justifyContent="space-between" w={"100%"} alignItems="center">
          <ExerciseTile
            iconName="fa5"
            icon="running"
            iconSize={20}
            title={(props.exercises || 0).toFixed(0)}
            desc="exercises"
          />
          <ExerciseTile
            iconName="ion"
            icon="time-outline"
            iconSize={20}
            title={toHHMMSS(props.time || 0)}
            desc="time"
          />
          <ExerciseTile
            iconName="matc"
            icon="weight"
            iconSize={20}
            title={(props.weight || 0).toFixed()}
            desc={props.metric ? "kgs" : "lbs"}
          />
        </XStack>
        <SaveButton safeArea onSave={save} title={`Finish`} />
        <SubscriptionOverlay onNotNowPress={save} visible={show} onDismiss={() => setShow(false)} />
        <Spacer lg />
      </SafeAreaView>
     
    </View>
  );
}



export const SubscriptionOverlay = (props: {
  visible: boolean;
  onDismiss: () => void;
  onNotNowPress: () => void;
}) => {
  let navigator = useNavigation()
  return  <Overlay
  visible={props.visible}
  onDismiss={props.onDismiss}
  dialogueHeight={45}
>
  <Spacer sm />
  <SupabaseImage
    uri={defaultImage}
    style={tw`h-20 w-20 rounded-full self-center`}
  />
  <Spacer />
  <Text h4 weight="bold" style={tw`text-center`}>
    Unlock Premium Benefits
  </Text>
  <Spacer sm />
  <Text xl style={tw`text-center px-2`}>
    Upgrade to Rage Premium to unlock more benefits and remove ads
  </Text>
  <Spacer lg divider />
  <XStack alignItems="center" justifyContent="center">
    <Button
      onPress={props.onNotNowPress}
      type="dark"
      height={"$5"}
      width={"45%"}
      title="Not Now"
      pill
    />
    <Spacer horizontal lg />
    <Button
      onPress={() => {
        props.onDismiss && props.onDismiss()
        navigator.navigate("Subscription")
      }}
      type="primary"
      height={"$5"}
      width={"45%"}
      title="Upgrade"
      pill
    />
  </XStack>
</Overlay>
}