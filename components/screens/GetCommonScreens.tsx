import ListFood from "../../screens/diet/ListFood"
import ListMeals from "../../screens/diet/ListMeals"
import MealDetail from "../../screens/diet/MealDetail"
import ListWorkout from "../../screens/workout/ListWorkout"
import ListExercise from "../../screens/workout/ListExercise"
import ExerciseDetail from "../../screens/workout/ExerciseDetail"
import WorkoutDetail from "../../screens/workout/WorkoutDetail"
import Profile from "../../screens/home/Profile"
import Subscribees from "../../screens/home/Subscribees"
import SummaryFoodList from "../../screens/home/SummaryFoodList"
import ListRuns from "../../screens/home/ListRuns"
import Allergens from "../../screens/home/Allergens"
import CompletedExerciseDetails from "../../screens/workout/CompletedExerciseDetails"
import Plan from "../../screens/other/Plan"
import ListPlans from "../../screens/other/ListPlans"
import React from 'react'
import LogWater from "../../screens/home/LogWater"
import TaskAgenda from "../../screens/other/TaskAgenda"
import FoodDetail2 from "../../screens/diet/FoodDetail2"
import ListProfile from "../../screens/other/UserSearch"

export const getCommonScreens = (prefix: string, Stack: any) => {
    return <Stack.Group>
        <Stack.Screen name={prefix + 'ListFood'} options={{ headerShown: false }}>
            {/* @ts-ignore */}
            {props => <ListFood defaultSearch={props.route?.params?.defaultSearch} grocery={props.route?.params?.grocery} progressId={props.route?.params?.progressId} mealId={props.route?.params?.mealId} />}
            </Stack.Screen>
            <Stack.Screen name={prefix + 'ListMeals'} options={{ headerShown: false }}>
            {/* @ts-ignore */}
            {props => <ListMeals {...props} {...props.route?.params} grocery={props.route?.params?.grocery} progressId={props.route?.params?.progressId} userId={props.route?.params?.userId} dow={props.route?.params?.dow} planId={props.route?.params?.planId}/>}
            </Stack.Screen>
            <Stack.Screen name={prefix + 'MealDetail'} options={{ headerShown: false }}>
                {/* @ts-ignore */}
                {props => <MealDetail {...props} {...props.route?.params}  grocery={props.route?.params?.grocery} progressId={props.route?.params?.progressId} idFromProgress={props.route?.params?.idFromProgress} id={props.route?.params?.id} editable={props.route?.params?.editable} dow={props.route?.params?.dow} planId={props.route?.params?.planId} />}
            </Stack.Screen>
            <Stack.Screen name={prefix + 'FoodDetail'} options={{ headerShown: false }}>
                {/* @ts-ignore */}
                {props => <FoodDetail2 {...props?.route?.params} />}
            </Stack.Screen>
            <Stack.Screen name={prefix + 'Allergens'} component={Allergens} options={{ headerShown: false, presentation: 'transparentModal' }} />
            <Stack.Screen name={prefix + 'ListWorkout'} options={{ headerShown: false }}>
                {/* @ts-ignore */}
                {props => <ListWorkout {...props} {...props.route?.params}  fromExerciseId={props?.route?.params?.fromExerciseId} exerciseId={props.route?.params?.exerciseId} userId={props.route?.params?.userId} dow={props.route?.params?.dow} planId={props.route?.params?.planId} />}
            </Stack.Screen>
            <Stack.Screen name={prefix + 'ListExercise'} options={{ headerShown: false }} >
            {/* @ts-ignore */}
            {props => <ListExercise {...props} workoutId={props.route?.params?.workoutId} editable={props.route?.params?.editable} userId={props.route?.params?.userId} />}
            </Stack.Screen>
            <Stack.Screen name={prefix + 'ExerciseDetail'} options={{ headerShown: false }}>
                {/* @ts-ignore */}
                {props => <ExerciseDetail {...props} id={props.route?.params?.id} editable={props.route?.params?.editable} workoutId={props.route?.params?.workoutId} />}
            </Stack.Screen>
            <Stack.Screen name={prefix + 'WorkoutDetail'} options={{ headerShown: false }}>
                {/* @ts-ignore */}
                {props => <WorkoutDetail {...props} {...props.route?.params}  progressId={props.route?.params?.progressId} id={props.route?.params?.id} editable={props.route?.params?.editable} dow={props.route?.params?.dow} planId={props.route?.params?.planId} />}
            </Stack.Screen>
            <Stack.Screen name={prefix + 'User'} options={{ headerShown: false }}>
                {/* @ts-ignore */}
                {props => <Profile {...props} id={props.route?.params?.id} personal={false} registration={false} />}
            </Stack.Screen>
            <Stack.Screen name={prefix + 'Subscribees'} options={{ headerShown: false }}>
                {/* @ts-ignore */}
                {props => <Subscribees {...props} to={props.route?.params?.to} from={props.route?.params?.from} />}
            </Stack.Screen>
            <Stack.Screen name={prefix + 'CompletedExerciseDetails'} options={{ headerShown: false }}>
                {/* @ts-ignore */}
                {props => <CompletedExerciseDetails {...props} workoutPlayId={props?.route?.params?.workoutPlayId} />}
            </Stack.Screen>
            <Stack.Screen name={prefix + 'SummaryFoodList'} options={{ headerShown: false }}>
                {/* @ts-ignore */}
                {props => <SummaryFoodList {...props} />}
            </Stack.Screen>
            <Stack.Screen name={prefix + 'FitnessPlan'} options={{ headerShown: false }}>
                {/* @ts-ignore */}
                {props => <Plan {...props} id={props.route?.params?.id} />}
            </Stack.Screen>
            <Stack.Screen name={prefix + 'ListRun'} component={ListRuns} options={{ headerShown: false }} />
            <Stack.Screen name={prefix + 'ListPlan'} component={ListPlans} options={{ headerShown: false }} />
            <Stack.Screen name={prefix + 'ListProfile'} component={ListProfile} options={{ headerShown: false }} />
            <Stack.Screen name={prefix + 'LogWater'} component={LogWater} options={{ headerShown: false }} />
            <Stack.Screen name={prefix + 'TaskAgenda'} component={TaskAgenda} options={{ headerShown: false }} />
    </Stack.Group>
}