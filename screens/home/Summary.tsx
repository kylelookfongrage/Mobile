import { ScrollView, TouchableOpacity, Animated, Easing } from "react-native";
import React from "react";
import { Text, View } from "../../components/base/Themed";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "twrnc";
import { ExpoIcon, Icon } from "../../components/base/ExpoIcon";
import useColorScheme from "../../hooks/useColorScheme";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { useNavigation } from "@react-navigation/native";
import {
  defaultImage,
  getMatchingNavigationScreen,
  titleCase,
} from "../../data";
import * as Haptics from "expo-haptics";
import RunListComponent from "../../components/features/RunListComponent";
import AnimatedLottieView from "lottie-react-native";
import drinkWater from "../../assets/animations/drinkwater.json";
import moment from "moment";
import ThisAdHelpsKeepFree from "../../components/features/ThisAdHelpsKeepFree";
import { useBadges } from "../../hooks/useBadges";
import { ProgressDao } from "../../types/ProgressDao";
import SupabaseImage from "../../components/base/SupabaseImage";
import SwipeWithDelete from "../../components/base/SwipeWithDelete";
import { useDispatch, useSelector } from "../../redux/store";
import { useSignOut } from "../../supabase/auth";
import { changeDate } from "../../redux/reducers/progress";
import TopBar from "../../components/base/TopBar";
import { _tokens } from "../../tamagui.config";
import Spacer from "../../components/base/Spacer";
import ManageButton from "../../components/features/ManageButton";
import { YStack } from "tamagui";
import SummaryListItem from "../../components/features/SummaryListItem";
import { MasonryFlashList } from "@shopify/flash-list";
import presetDashboardComponents, { UserInputs } from "../../components/features/PresetSummaryListItems";

export const SummaryScreen = () => {
  let { profile } = useSelector((x) => x.auth);
  let {
    formattedDate,
    today,
    foodProgress,
    mealProgress,
    workoutProgress,
    runProgress,
  } = useSelector((x) => x.progress);
  let progressId = today?.id;
  let weight = today?.weight || profile?.weight || 100
  let tdee = profile?.tdee || 2000
  const totalProteinGrams = profile?.proteinLimit || (tdee * 0.4) / 4
  const totalFatGrams = profile?.fatLimit || (tdee * 0.3) / 9
  const totalCarbsGrams = profile?.carbLimit || (tdee * 0.3) / 4
  let waterGoal = Number(weight * 0.5);
  let dispatch = useDispatch();
  let setDate = (_date: string) => dispatch(changeDate({ date: _date }));
  const dm = useColorScheme() === "dark";
  const navigator = useNavigation();
  const { logProgress } = useBadges(false);
  const dao = ProgressDao(false);
  let obj = {
    water: today?.water || 0,
    waterGoal: waterGoal,
    tdee: tdee,
    proteinGoal: totalProteinGrams,
    carbGoal: totalCarbsGrams,
    fatGoal: totalFatGrams,
    navigator: navigator,
    foodProgress: foodProgress,
    mealProgress: mealProgress,
    workoutProgress: workoutProgress,
    runProgress: runProgress
  }
  let a = useSignOut();
  const daysToDisplay = [0, 1, 2, 3, 4, 5, 6].map((x) =>
    moment(formattedDate).startOf("week").add(x, "days")
  );
  return (
    <View style={{ flex: 1 }} includeBackground>
      <SafeAreaView edges={["top"]} style={[{ flex: 1 }, tw`h-12/12`]}>
        <Spacer />
        <TopBar
          iconLeft="Home"
          title="Summary"
          Right={() => {
            return (
              <TouchableOpacity
                style={tw`p-.5`}
                onPress={() => navigator.navigate("Calendar")}
              >
                <Icon
                  name="Calendar"
                  size={26}
                  color={dm ? _tokens.white : _tokens.black}
                />
              </TouchableOpacity>
            );
          }}
        />
        <Spacer sm />
        <View
          style={[tw`flex-row items-center justify-between w-12/12 px-2 mb-3`]}
        >
          {daysToDisplay.map((day) => {
            const isSelected = day.isSame(moment(formattedDate), "date");
            let selectedColorTint = "800";
            if (!isSelected && !dm) selectedColorTint = "300";
            if (isSelected) selectedColorTint = "600";
            return (
              <TouchableOpacity
                key={day.format("LL")}
                onPress={() => setDate(day.format("YYYY-MM-DD"))}
              >
                <View
                  card={!isSelected}
                  style={{
                    ...tw`h-20 w-12 rounded-full items-center justify-center`,
                    backgroundColor: isSelected
                      ? _tokens.primary900
                      : dm
                        ? _tokens.dark1
                        : _tokens.gray200,
                  }}
                >
                  <Text
                    weight="bold"
                    h5
                    style={tw`${dm || isSelected ? "text-white" : ""}`}
                  >
                    {day.format("DD")}
                  </Text>
                  <Text
                    weight="semibold"
                    lg
                    style={tw`text-xs ${dm || isSelected ? "text-white" : ""}`}
                  >
                    {day.format("dd")}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
        <ManageButton viewStyle={tw`px-2`} title={"Daily Summary"} buttonText=" " 
        // onPress={() => navigator.navigate('EditDashboard')} 
        />
        <Spacer />

        <ScrollView
          style={[tw`px-2`]}
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
        >
          <MasonryFlashList style={{alignItems: 'center', justifyContent: 'center', columnGap: 5}} numColumns={2} estimatedItemSize={158} data={[
            {name: 'Workouts', type: 'Workout Amount', index: 0},
            {name: 'Nutrition', type: 'Macros List', index: 1},
            {name: 'Tasks', type: 'Tasks Preview', index: 2},
            {name: 'Activity', type: 'Activity Preview', index: 3},
            {name: 'Water', type: 'Intake Progress Bar', index: 4},
          ]} renderItem={({item, index}) => {
            //@ts-ignore
            return presetDashboardComponents[item.name][item.type](obj, {index: item.index, color: item.backgroundColor, progressColor1: item.progressColor1, progressColor2: item.progressColor2  })
          }} />
          
          <Spacer />
          {/* <View style={tw`flex-row items-center justify-between w-12/12 mt-2`}>
            <Text style={tw`text-lg`} weight="semibold">
              Latest {lastRun?.type || "Run"} Activity
            </Text>
            <TouchableOpacity
              style={tw`p-3`}
              onPress={() => {
                //@ts-ignore
                navigator.navigate("Run", { progressId: progressId });
              }}
            >
              <Text style={tw`text-red-500`} weight="semibold">
                Start a Run
              </Text>
            </TouchableOpacity>
          </View> */}
          <ManageButton title="Today's Workouts" buttonText="Search" onPress={() => {
                const screen = getMatchingNavigationScreen(
                  "ListWorkout",
                  navigator
                );
                //@ts-ignore
                navigator.navigate(screen, { progressId: progressId });
              }} />
          <Spacer sm/>
          {workoutProgress.length === 0 && (
            <Text style={tw`text-center my-6`}>
              There are no workouts to display
            </Text>
          )}
          {workoutProgress.map((w, i) => {
            return (
              <SwipeWithDelete
                onDelete={async () => {
                  await dao.deleteProgress(w.id, "workout_play");
                }}
                key={`workout ${w.id} at i ${i}`}
              >
                <TouchableOpacity
                  onPress={() => {
                    const screen = getMatchingNavigationScreen(
                      "CompletedExerciseDetails",
                      navigator
                    );
                    //@ts-ignore
                    navigator.navigate(screen, { workoutPlayId: w.id });
                  }}
                >
                  <View
                    style={tw`w-12/12 flex-row items-center p-4 mb-2 items-center rounded-xl`}
                  >
                    <SupabaseImage
                      uri={w.workout?.image || defaultImage}
                      style={`h-12 w-12 rounded-lg`}
                    />
                    <View style={tw`ml-2`}>
                      <Text lg weight="bold">
                        {w.workout?.name || "Workout"}
                      </Text>
                      <Text style={tw`text-red-500`}>
                            @{w.workout?.user?.username}
                          </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </SwipeWithDelete>
            );
          })}
          <View style={tw`pb-10`} />
          <ThisAdHelpsKeepFree />
          <View style={tw`pb-40`} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

