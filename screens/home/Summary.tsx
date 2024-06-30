import { ScrollView, TouchableOpacity, Image } from "react-native";
import React, { useState } from "react";
import { Text, View } from "../../components/base/Themed";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "twrnc";
import { Icon } from "../../components/base/ExpoIcon";
import useColorScheme from "../../hooks/useColorScheme";
import { useNavigation } from "@react-navigation/native";
import {
  defaultImage,
  getMacroTargets,
  getMatchingNavigationScreen,
} from "../../data";
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
import presetDashboardComponents, { UserInputs } from "../../components/features/PresetSummaryListItems";
import { useGet } from "../../hooks/useGet";
import { MasonryFlashList } from '@shopify/flash-list'
import { Muscles } from "../../assets/muscles/muscles";
import { XStack, YStack } from "tamagui";
import { NothingToDisplay } from "../../components/base/Toast";
import Button from "../../components/base/Button";
import AIImage from "../../components/features/AIImage";
import { BlazePoseStandardResultObject, calculateEuclideanDistance, estimateBlazePoseBodyFat, skeleton_points } from "../../hooks/usePoses";

export const SummaryScreen = () => {
  let { profile } = useSelector((x) => x.auth);
  let {
    formattedDate,
    today,
    foodProgress,
    mealProgress,
    workoutProgress,
    runProgress,
    tasks,
    plans
  } = useSelector((x) => x.progress);
  let progressId = today?.id;
  let weight = today?.weight || profile?.weight || 100
  let { tdee, totalCarbsGrams, totalFatGrams, totalProteinGrams } = getMacroTargets(profile)
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
    runProgress: runProgress,
    tasksCompleted: 0,
    tasksTotal: tasks.length
  }
  let a = useSignOut();
  const daysToDisplay = [0, 1, 2, 3, 4, 5, 6].map((x) =>
    moment(formattedDate).startOf("week").add(x, "days")
  );
  let g = useGet()
  let weightDiff = (profile?.weight || 0) - (today?.weight || profile?.weight || 0) 
  let fatDiff = (profile?.startFat || 0) - (today?.fat || profile?.startFat || 0) 
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
                onPress={() => {
                  //@ts-ignore
                  navigator.navigate("Calendar")
                  // g.set('error', 'testing this')
                }}
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
        {/* <Button onPress={() => navigator.navigate('AICamera')} /> */}
        <ScrollView
          style={[tw``]}
          showsVerticalScrollIndicator={false}
        >
          <ThisAdHelpsKeepFree addedPb/>
          {presetDashboardComponents['Nutrition']['Macros Preview'](obj, { index: 1 })}
          <XStack style={{ flex: 1, width: g.s.width }}>
          <TouchableOpacity onPress={() => {
            let s = getMatchingNavigationScreen('TaskAgenda', navigator)
            //@ts-ignore
            navigator.navigate(s)
          }} style={{ width: g.s.width * 0.43, height: g.s.height * 0.17, marginLeft: 8, margin: 4, marginTop: 8 }}>
            <View card style={{flex: 1, ...tw`p-2 rounded-lg`}}>
              <Text bold lg>Progress Log</Text>
              <Spacer sm />
              <XStack alignItems="center" justifyContent="space-between">
                <YStack>
                  <Text blackWeight>Weight</Text>
                  <Text sm gray>{profile?.metric ? 'kgs' : 'lbg'}</Text>
                </YStack>
                <YStack>
                  <Text blackWeight right gray={!today?.weight}>{today?.weight || '--'}</Text>
                  <Text sm right gray={weightDiff === 0} style={{color: weightDiff > 0 ? _tokens.green : weightDiff < 0 ? _tokens.red : _tokens.gray500}}>{weightDiff > 0 ? '-' : '+'} {Math.abs(weightDiff)}</Text>
                </YStack>
              </XStack>
              <Spacer />
              <XStack alignItems="center" justifyContent="space-between">
                <YStack>
                  <Text blackWeight>Body Fat</Text>
                  <Text sm gray>%</Text>
                </YStack>
                <YStack>
                  <Text blackWeight right gray={!today?.fat}>{today?.fat || '--'}</Text>
                  <Text sm right gray={fatDiff === 0} style={{color: fatDiff > 0 ? _tokens.green : fatDiff < 0 ? _tokens.red : _tokens.gray500}}>{fatDiff > 0 ? '-' : '+'} {Math.abs(fatDiff)}</Text>
                </YStack>
              </XStack>
            </View>
          </TouchableOpacity>
            {presetDashboardComponents['Water']['Intake Progress'](obj, { index: 2 })}
            {presetDashboardComponents['Tasks']['Tasks Preview'](obj, { index: 3 })}
          </XStack>
          <Spacer />
          <View style={tw`px-3`}>
          <ManageButton  title="Today's Workouts" buttonText="Search" onPress={() => {
            const screen = getMatchingNavigationScreen(
              "ListWorkout",
              navigator
            );
            //@ts-ignore
            navigator.navigate(screen, { progressId: progressId });
          }} />
          </View>
          <Spacer sm />
          {workoutProgress.length === 0 && <NothingToDisplay  text="No Workouts Completed, yet!"/>}
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
          <View style={tw`pb-40`} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

