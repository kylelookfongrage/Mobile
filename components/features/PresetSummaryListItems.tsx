import React from "react";
import { TFoodProgress, TMealProgress, TWorkoutPlay, aggregateFoodAndMeals } from "../../redux/reducers/progress";
import { Tables } from "../../supabase/dao";
import SummaryListItem from "./SummaryListItem";
import { View, Text } from "../base/Themed";
import tw from 'twrnc'
import { TouchableOpacity } from "react-native-gesture-handler";
import { defaultImage, getMatchingNavigationScreen, substringForLists, toHHMMSS } from "../../data";
import SupabaseImage from "../base/SupabaseImage";
import { _tokens } from "../../tamagui.config";
import { XStack, YStack } from "tamagui";
import { MacronutrientCircleProgress } from "./MacronutrientBar";
import Spacer from "../base/Spacer";

export interface UserInputs {
    backgroundColor?: string;
    progressColor1?: string;
    progressColor2?: string;
    index: number
}

export interface DashboardInputs {
    water?: number;
    waterGoal?: number;
    tdee?: number;
    proteinGoal?: number;
    carbGoal?: number;
    fatGoal?: number;
    navigator?: any;
    foodProgress?: TFoodProgress[],
    mealProgress?: TMealProgress[],
    workoutProgress?: TWorkoutPlay[],
    runProgress?: Tables['run_progress']['Row'][]
    tasksCompleted?: number;
    tasksTotal?: number;
}

const presetDashboardComponents = {
    'Water': {
        "Intake Preview": (props1: DashboardInputs, props: UserInputs) => {
            let { water, waterGoal } = props1;
            return <SummaryListItem title='Water' size={undefined} type='text' screen='LogWater' {...props} textValue={water?.toFixed()} suffix='fl oz' description={`Goal: ${waterGoal?.toFixed()} fl oz`} />
        },
        "Intake Progress": (props1: DashboardInputs, props: UserInputs) => {
            let { water, waterGoal } = props1;
            return <SummaryListItem title='Water' size="quarter" type='circle-progress' screen='LogWater' {...props} progressColor={_tokens.blue} progressValue={(water || 0)} progressTotal={(waterGoal || 1)} suffix='fl oz' description={`goal: ${waterGoal?.toFixed()} fl oz`} />
        },
        "Intake Progress Bar": (props1: DashboardInputs, props: UserInputs) => {
            let { water, waterGoal } = props1;
            return <SummaryListItem title='Water' type='progress' screen='LogWater' {...props} progressColor={_tokens.blue} progressValue={(water || 0)} progressTotal={(waterGoal || 1)} suffix='Total (fl oz)' description={`Goal: ${waterGoal?.toFixed()} fl oz`} />
        }
    },
    'Nutrition': {
        'Calorie Preview': (props1: DashboardInputs, props: UserInputs) => {
            let { tdee, foodProgress, mealProgress } = props1;
            let { calories } = aggregateFoodAndMeals(foodProgress, mealProgress)
            return <SummaryListItem title='Calories' type='text' useMatchingScreen screen='SummaryFoodList' {...props} textValue={calories?.toFixed()} suffix='kcal' description={`Calorie Limit: ${tdee?.toFixed()} kcal`} />
        },
        "Calorie Progress": (props1: DashboardInputs, props: UserInputs) => {
            let { tdee, foodProgress, mealProgress } = props1;
            let { calories } = aggregateFoodAndMeals(foodProgress, mealProgress)
            return <SummaryListItem title='Calories' type='circle-progress' useMatchingScreen screen='SummaryFoodList' {...props} progressValue={(calories || 0)} progressTotal={(tdee || 0)} suffix='kcal' description={`Calorie Limit: ${tdee?.toFixed()} kcal`} />
        },
        "Macros Preview": (props1: DashboardInputs, props: UserInputs) => {
            let { foodProgress, mealProgress } = props1;
            let { protein, carbs, fat, calories } = aggregateFoodAndMeals(foodProgress, mealProgress)
            return <SummaryListItem title='Macronutrient Overview' size="wide" useMatchingScreen screen='SummaryFoodList' {...props} >
                <Spacer sm />
                <XStack alignItems="center" justifyContent="space-around" px='$3'>
                    <MacronutrientCircleProgress disableMultiplier calories weight={calories} totalEnergy={calories} goal={props1.tdee || 1400} />
                    <MacronutrientCircleProgress protein weight={protein} totalEnergy={calories} goal={props1.proteinGoal || 100} />
                    <MacronutrientCircleProgress carbs weight={carbs} totalEnergy={calories} goal={props1.carbGoal || 100} />
                    <MacronutrientCircleProgress fat weight={fat} totalEnergy={calories} goal={props1.fatGoal || 1400} />
                </XStack>
            </SummaryListItem>
        },
        "Macros List": (props1: DashboardInputs, props: UserInputs) => {
            let { foodProgress, mealProgress, tdee, proteinGoal, carbGoal, fatGoal } = props1;
            let { protein, carbs, fat, calories } = aggregateFoodAndMeals(foodProgress, mealProgress)
            return <SummaryListItem title='Macronutritents' size='lg' type='list' useMatchingScreen screen='SummaryFoodList' {...props} listData={[
                { title: 'Calores', suffix: ' kcal', value: calories || 0, goal: tdee || 1400 },
                { title: 'Protein', suffix: 'g', value: protein || 0, goal: proteinGoal || 1400 },
                { title: 'Carbs', suffix: 'g', value: carbs || 0, goal: carbGoal || 1400 },
                { title: 'Fat', suffix: 'g', value: fat || 0, goal: fatGoal || 1400 },
            ]} listKeyExtractor={(i) => i.title} renderList={({ item, index }) => {
                return <View style={{ ...tw`my-2 px-2`, width: '100%' }}>
                    <View style={tw`flex-row items-start justify-between`}>
                        <Text lg weight='bold'>{item.title}:  </Text>
                        <Text h5 weight='semibold'>{item.value.toFixed()}<Text>{item.suffix}</Text></Text>
                    </View>
                    <Text weight='semibold'>{item.goal.toFixed()}<Text>{item.suffix} limit</Text></Text>
                </View>
            }} />
        },
    },
    'Workouts': {
        "Workout Amount": (props1: DashboardInputs, props: UserInputs) => {
            let { workoutProgress } = props1;
            return <SummaryListItem title='Workouts' type='text' {...props} textValue={workoutProgress?.length?.toFixed()} description={`Completed`} />
        },
        "Workout List": (props1: DashboardInputs, props: UserInputs) => {
            let { workoutProgress } = props1;
            return <SummaryListItem title='Workouts' type='list' {...props} listData={(workoutProgress || [])} listKeyExtractor={(i) => `${i.id}`} renderList={({ item, index }) => {
                return <TouchableOpacity onPress={() => {
                    let s = getMatchingNavigationScreen('CompletedExerciseDetails', props1.navigator)
                    props1.navigator.navigate(s, { 'workoutPlayId': item.id })
                }} style={{ ...tw`flex-row justify-between items-center my-2 px-1`, width: '100%' }}>
                    <View style={tw`flex-row items-center`}>
                        <SupabaseImage
                            uri={item.workout?.image || defaultImage}
                            style={`h-8 w-7 rounded-lg mr-2`}
                        />
                        <View>
                            <Text weight='bold'>{substringForLists(item.workout?.name || '', 18)}</Text>
                            <Text sm weight='semibold'>{toHHMMSS(item.time || 0)}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            }} />
        },
    },
    'Tasks' : {
        "Tasks Preview": (props1: DashboardInputs, props: UserInputs) => {
            let { tasksCompleted, tasksTotal } = props1;
            return <SummaryListItem title="Tasks" useMatchingScreen screen="TaskAgenda" size={'quarter'} type='text' {...props} textValue={(tasksCompleted || 0).toFixed()} description={`remaining`} />
        },
    },
    'Activity' : {
        "Activity Preview": (props1: DashboardInputs, props: UserInputs) => {
            let { runProgress } = props1;
            return <SummaryListItem title="Runs" useMatchingScreen screen="ListRun" size={undefined} type='text' {...props} textValue={(runProgress?.length || 0).toFixed()} description={`Completed`} />
        },
    }
}
export default presetDashboardComponents