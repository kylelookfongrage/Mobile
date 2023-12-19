import { View, Text } from "../../components/base/Themed";
import React from "react";
import { BackButton } from "../../components/base/BackButton";
import { ProgressDao } from "../../types/ProgressDao";
import { useSelector } from "../../redux/store";
import useHaptics from "../../hooks/useHaptics";
import AnimatedLottieView from "lottie-react-native";
import { Animated, Easing, TouchableOpacity } from "react-native";
import tw from "twrnc";
import drinkWater from "../../assets/animations/water.json";
import { XStack, YStack } from "tamagui";
import Button from "../../components/base/Button";
import Spacer from "../../components/base/Spacer";

export default function LogWater() {
  const dao = ProgressDao(false);
  const waterRef = React.useRef(new Animated.Value(0));
  let { profile } = useSelector((x) => x.auth);
  let weight = dao.today?.weight || profile?.weight || 100;
  const waterGoal = Number(weight * 0.5);
  React.useEffect(() => {
    if (weight) {
      const progress =
        (dao.today?.water || 0) > waterGoal
          ? 1
          : (dao.today?.water || 0) / waterGoal;
      Animated.timing(waterRef.current, {
        toValue: progress,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();
    }
  }, [dao.today?.water || 0, weight]);
  let { today } = useSelector((x) => x.progress);
  let h = useHaptics();
  let onPress = async (pos: boolean = true) => {
    h.press();
    let value = pos
      ? (dao.today?.water || 0) + 5
      : (dao.today?.water || 0) > 4
      ? (dao.today?.water || 0) - 5
      : 0;
    await dao.updateProgress("water", value);
  };
  return (
    <View includeBackground style={{ flex: 1 }}>
      <BackButton name="Water Log" />
      <YStack flex={1} justifyContent='space-between' paddingBottom='$6'>
        <View>
            <AnimatedLottieView
        progress={waterRef.current}
        autoPlay={false}
        style={tw`h-100 self-center`}
        source={drinkWater}
      />
      <Spacer />
      <XStack justifyContent="space-around">
        <YStack alignItems="center">
          <Text h2 weight="bold">
            {dao?.today?.water?.toFixed() || 0} {<Text>fl oz</Text>}
          </Text>
          <Text sm>Total</Text>
        </YStack>
        <YStack alignItems="center">
          <Text h2 weight="bold">
            {waterGoal.toFixed()} {<Text>fl oz</Text>}
          </Text>
          <Text sm>Goal</Text>
        </YStack>
      </XStack>      
        </View>
        <XStack alignItems="center" justifyContent="center">
        <Button
          onPress={() => onPress(false)}
          type="dark"
          height={"$5"}
          width={"45%"}
          title="- 5 floz"
          pill
        />
        <Spacer horizontal lg />
        <Button
          onPress={onPress}
          type="primary"
          height={"$5"}
          width={"45%"}
          title="+ 5 floz"
          pill
        />
      </XStack>
      </YStack>
    </View>
  );
}
