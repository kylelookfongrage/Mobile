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
  let dispatch = useDispatch();
  let setDate = (_date: string) => dispatch(changeDate({ date: _date }));
  const totalCalories = profile?.tdee || 2000;
  const dm = useColorScheme() === "dark";
  const navigator = useNavigation();
  const { logProgress } = useBadges(false);
  const dao = ProgressDao(false);
  const [food_progress, meal_progress, workout_progress, runs] = [
    foodProgress,
    mealProgress,
    workoutProgress,
    runProgress,
  ];
  let weight = dao.today?.weight || profile?.weight || 100;
  let _ingredients = meal_progress.map((x) => ({
    ...x.meal,
    consumedWeight: x.consumed_weight,
    totalWeight: x.total_weight,
  }));
  let __ingredients = _ingredients.map((x) => {
    return {
      ...x,
      meal_ingredients: x.meal_ingredients.map((z) => ({
        ...z,
        consumed_weight: x.consumedWeight,
        total_weight: x.totalWeight,
      })),
    };
  });
  let ingredients = __ingredients.flatMap((x) => x.meal_ingredients);
  const caloriesFromFoodAndMeals =
    food_progress.reduce((prev, c) => prev + (c.calories || 0), 0) +
    ingredients.reduce(
      (prev, curr) =>
        prev +
        (curr.calories || 0) *
          ((curr.consumed_weight || 1) / (curr.total_weight || 1)),
      0
    );
  const proteinFromFoodAndMeals =
    food_progress.reduce((prev, c) => prev + (c.protein || 0), 0) +
    ingredients.reduce(
      (prev, curr) =>
        prev +
        (curr.protein || 0) *
          ((curr.consumed_weight || 1) / (curr.total_weight || 1)),
      0
    );
  const carbsFromFoodAndMeals =
    food_progress.reduce((prev, c) => prev + (c.carbs || 0), 0) +
    ingredients.reduce(
      (prev, curr) =>
        prev +
        (curr.carbs || 0) *
          ((curr.consumed_weight || 1) / (curr.total_weight || 1)),
      0
    );

  React.useEffect(() => {
    if (totalCalories) {
      cpRef.current?.animate(
        (caloriesFromFoodAndMeals / totalCalories) * 100,
        800
      );
    }
  }, [caloriesFromFoodAndMeals, totalCalories]);

  const cpRef = React.useRef<AnimatedCircularProgress | null>(null);
  const waterRef = React.useRef(new Animated.Value(0));
  const waterGoal = Number(weight * 0.5);
  let a = useSignOut();

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

  const lastRun = runs[runs.length - 1];
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
        <ScrollView
          style={[tw`px-2 h-12/12`]}
          showsVerticalScrollIndicator={false}
        >
          <ManageButton title={"Daily Metrics"} buttonText=" " />
          <Spacer />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{}}
          >
            <SummaryListItem onPress={() => {
              const screen = getMatchingNavigationScreen(
                "SummaryFoodList",
                navigator
              );
              //@ts-ignore
              navigator.navigate(screen);
            }} title="Calories">
              <AnimatedCircularProgress
                size={100}
                width={6}
                rotation={270}
                fill={0}
                style={tw`self-center items-center justify-center`}
                lineCap="round"
                tintColor="#D22B2B"
                backgroundColor={dm ? _tokens.dark2 : _tokens.gray100}
                ref={cpRef}
              >
                {(fill) => (
                  <View style={tw`items-center self-center`}>
                    <Text h4 weight="semibold">
                      {totalCalories <= caloriesFromFoodAndMeals
                        ? 0
                        : Math.round(
                            totalCalories - caloriesFromFoodAndMeals
                          ).toFixed()}
                    </Text>
                    <Text weight="semibold">kcal</Text>
                  </View>
                )}
              </AnimatedCircularProgress>
              <Spacer sm />
              <Text sm style={tw`text-center`}>
                remaining
              </Text>
            </SummaryListItem>
            <Spacer horizontal />
            <SummaryListItem title="Workouts">
              <Spacer />
              <YStack
                alignItems="center"
                justifyContent="space-between"
                flex={1}
              >
                <Text h1 style={tw`text-center`} weight="bold">
                  {workout_progress.length}
                </Text>
                <Text sm style={{ ...tw`text-center mb-1` }}>
                  completed
                </Text>
              </YStack>
            </SummaryListItem>
            <Spacer horizontal />
            <SummaryListItem title="Water" onPress={() => {
              const screen = getMatchingNavigationScreen(
                "LogWater",
                navigator
              );
              //@ts-ignore
              navigator.navigate(screen);
            }}>
              <Spacer />
              <YStack
                flex={1}
                style={tw`items-center self-center`}
              >
                <Text h1 style={tw`text-center`} weight="bold">
                  {dao.today?.water?.toFixed(0) || 0}
                </Text>
                <Text sm style={{ ...tw`text-center mb-1` }}>
                  fl oz
                </Text>
              </YStack>
              <Text sm style={{ ...tw`text-center mb-1` }}>{waterGoal.toFixed(0)} goal</Text>
            </SummaryListItem>
          </ScrollView>
          <Spacer />
         
          
          <View card style={tw`w-12/12 rounded-lg p-4 mt-4 mb-6`}>
            <Text style={tw`text-lg text-center`} weight="semibold">
              Personal Information
            </Text>
            <View style={tw`mt-4 flex-row items-center justify-around`}>
              {/* @ts-ignore */}
              <TouchableOpacity
                onPress={() =>
                  navigator.navigate("SummaryMetric", { weight: true })
                }
              >
                <Text style={tw`text-xs text-gray-500`}>Weight</Text>
                <Text style={tw`text-lg`} weight="semibold">
                  {dao.today?.weight || "-"}{" "}
                  {<Text style={tw`text-red-500 text-sm`}>lbs</Text>}
                </Text>
              </TouchableOpacity>
              <View
                style={[tw`h-15 bg-gray-${dm ? "600" : "400"}`, { width: 1 }]}
              />
              {/* @ts-ignore */}
              <TouchableOpacity
                onPress={() =>
                  navigator.navigate("SummaryMetric", { weight: false })
                }
              >
                <Text style={tw`text-xs text-gray-500`}>Body Fat</Text>
                <Text style={tw`text-lg`} weight="semibold">
                  {dao.today?.fat || "-"}{" "}
                  {<Text style={tw`text-red-500 text-sm`}>%</Text>}
                </Text>
              </TouchableOpacity>
              <View
                style={[tw`h-15 bg-gray-${dm ? "600" : "400"}`, { width: 1 }]}
              />
              <View style={tw`bg-transparent`}>
                <Text style={tw`text-xs text-gray-500`}>Goal</Text>
                <Text style={tw`text-lg text-center`} weight="semibold">
                  {titleCase(profile?.goal || "-")}
                </Text>
              </View>
            </View>
          </View>
          <View style={tw`flex-row items-center justify-between w-12/12 mt-2`}>
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
          </View>
          {runs.length === 0 && (
            <Text style={tw`text-center my-6`}>No runs to display</Text>
          )}
          {lastRun && (
            <RunListComponent
              canScroll={false}
              run={lastRun}
              onPress={() => {
                const screen = getMatchingNavigationScreen(
                  "ListRun",
                  navigator
                );
                //@ts-ignore
                navigator.navigate(screen);
              }}
            />
          )}
          <View style={tw`flex-row items-center justify-between w-12/12 mt-6`}>
            <Text style={tw`text-lg`} weight="semibold">
              Workouts
            </Text>
            <TouchableOpacity
              style={tw`p-3`}
              onPress={() => {
                const screen = getMatchingNavigationScreen(
                  "ListWorkout",
                  navigator
                );
                //@ts-ignore
                navigator.navigate(screen, { progressId: progressId });
              }}
            >
              <Text style={tw`text-red-500`} weight="semibold">
                Search Workouts
              </Text>
            </TouchableOpacity>
          </View>
          {workout_progress.length === 0 && (
            <Text style={tw`text-center my-6`}>
              There are no workouts to display
            </Text>
          )}
          {workout_progress.map((w, i) => {
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
                    card
                    style={tw`w-12/12 flex-row items-center p-4 mb-2 items-center rounded-xl`}
                  >
                    <SupabaseImage
                      uri={w.workout?.image || defaultImage}
                      style={`h-12 w-12 rounded-lg`}
                    />
                    <View style={tw`ml-2`}>
                      <Text style={tw``} weight="semibold">
                        {w.workout?.name || "Workout"}
                      </Text>
                      <Text style={tw`text-gray-400 text-xs`}>
                        by{" "}
                        {
                          <Text style={tw`text-xs text-red-500`}>
                            @{w.workout?.user?.username}
                          </Text>
                        }
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

let SummaryListItem = (props: {
  children: any;
  title: string;
  onPress?: () => void;
}) => {
  return (
    <TouchableOpacity disabled={!props.onPress} onPress={props.onPress}>
      <View card style={{ height: 160, width: 150, borderRadius: 10 }}>
        <Text weight="semibold" style={tw`text-center pt-2`}>
          {props.title}
        </Text>
        <Spacer sm />
        {props.children}
      </View>
    </TouchableOpacity>
  );
};
