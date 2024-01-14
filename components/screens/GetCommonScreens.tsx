import ListFood from "../../screens/diet/ListFood"
import ListMeals from "../../screens/diet/ListMeals"
import MealDetail from "../../screens/diet/MealDetail"
import FoodDetail from "../../screens/diet/FoodDetail"
import ListWorkout from "../../screens/workout/ListWorkout"
import ListExercise from "../../screens/workout/ListExercise"
import EquiptmentSearch from "../../screens/workout/EquiptmentSearch"
import ExerciseDetail from "../../screens/workout/ExerciseDetail"
import WorkoutDetail from "../../screens/workout/WorkoutDetail"
import Profile from "../../screens/home/Profile"
import Subscribees from "../../screens/home/Subscribees"
import GroceryList from "../../screens/diet/GroceryList"
import Pantry from '../../screens/diet/Pantry'
import SummaryFoodList from "../../screens/home/SummaryFoodList"
import ListRuns from "../../screens/home/ListRuns"
import AddExerciseToWorkout from "../../screens/workout/AddExerciseToWorkout"
import Allergens from "../../screens/home/Allergens"
import PostComments from "../../screens/workout/PostComments"
import PostDetails from "../../screens/workout/PostDetails"
import CompletedExerciseDetails from "../../screens/workout/CompletedExerciseDetails"
import Plan from "../../screens/other/Plan"
import ListPlans from "../../screens/other/ListPlans"
import React from 'react'
import LogWater from "../../screens/home/LogWater"
import TaskAgenda from "../../screens/other/TaskAgenda"
import FoodDetail2 from "../../screens/diet/FoodDetail2"

export const getCommonScreens = (prefix: string, Stack: any) => {
    return <Stack.Group>
        <Stack.Screen name={prefix + 'ListFood'} options={{ headerShown: false }}>
            {/* @ts-ignore */}
            {props => <ListFood defaultSearch={props.route?.params?.defaultSearch} grocery={props.route?.params?.grocery} progressId={props.route?.params?.progressId} mealId={props.route?.params?.mealId} />}
            </Stack.Screen>
            <Stack.Screen name={prefix + 'ListMeals'} options={{ headerShown: false }}>
            {/* @ts-ignore */}
            {props => <ListMeals {...props} grocery={props.route?.params?.grocery} progressId={props.route?.params?.progressId} userId={props.route?.params?.userId} dow={props.route?.params?.dow} planId={props.route?.params?.planId}/>}
            </Stack.Screen>
            <Stack.Screen name={prefix + 'MealDetail'} options={{ headerShown: false }}>
                {/* @ts-ignore */}
                {props => <MealDetail {...props} grocery={props.route?.params?.grocery} progressId={props.route?.params?.progressId} idFromProgress={props.route?.params?.idFromProgress} id={props.route?.params?.id} editable={props.route?.params?.editable} dow={props.route?.params?.dow} planId={props.route?.params?.planId} />}
            </Stack.Screen>
            <Stack.Screen name={prefix + 'PostComments'} options={{ headerShown: false, presentation: 'transparentModal' }}>
                {/* @ts-ignore */}
                {props => <PostComments {...props} postId={props.route?.params?.postId} postType={props.route?.params?.postType} />}
            </Stack.Screen>
            <Stack.Screen name={prefix + 'FoodDetail'} options={{ headerShown: false, presentation: 'modal' }}>
                {/* @ts-ignore */}
                {/* {props => <FoodDetail
                    {...props}
                    id={props.route?.params?.id}
                    editable={props.route?.params?.editable}
                    img={props.route?.params?.img}
                    progressId={props.route?.params?.progressId}
                    name={props.route?.params?.name}
                    mealId={props.route?.params?.mealId}
                    src={props.route?.params?.src}
                    category={props.route?.params?.category}
                    measures={props.route?.params?.measures}
                    foodContentsLabel={props.route?.params?.foodContentsLabel}
                    grocery={props.route?.params?.grocery}
                />} */}
                {/* @ts-ignore */}
                {props => <FoodDetail2 {...props?.route?.params} />}
            </Stack.Screen>
            <Stack.Screen name={prefix + 'Allergens'} component={Allergens} options={{ headerShown: false, presentation: 'transparentModal' }} />
            <Stack.Screen name={prefix + 'ListWorkout'} options={{ headerShown: false }}>
                {/* @ts-ignore */}
                {props => <ListWorkout {...props} fromExerciseId={props?.route?.params?.fromExerciseId} exerciseId={props.route?.params?.exerciseId} userId={props.route?.params?.userId} dow={props.route?.params?.dow} planId={props.route?.params?.planId} />}
            </Stack.Screen>
            <Stack.Screen name={prefix + 'ListExercise'} options={{ headerShown: false }} >
            {/* @ts-ignore */}
            {props => <ListExercise {...props} workoutId={props.route?.params?.workoutId} editable={props.route?.params?.editable} userId={props.route?.params?.userId} />}
            </Stack.Screen>
            <Stack.Screen name={prefix + 'EquiptmentSearch'} options={{ headerShown: false }}>
            {/* @ts-ignore */}
            {props => <EquiptmentSearch {...props} exerciseId={props.route?.params?.exerciseId || ''} />}
            </Stack.Screen>
            <Stack.Screen name={prefix + 'ExerciseDetail'} options={{ headerShown: false }}>
                {/* @ts-ignore */}
                {props => <ExerciseDetail {...props} id={props.route?.params?.id} editable={props.route?.params?.editable} workoutId={props.route?.params?.workoutId} />}
            </Stack.Screen>
            <Stack.Screen name={prefix + 'AddExerciseToWorkout'} options={{headerShown: false}}>
                {/* @ts-ignore */}
                {props => <AddExerciseToWorkout {...props} exerciseId={props.route?.params?.exerciseId}/>}
            </Stack.Screen>
            <Stack.Screen name={prefix + 'WorkoutDetail'} options={{ headerShown: false }}>
                {/* @ts-ignore */}
                {props => <WorkoutDetail {...props} progressId={props.route?.params?.progressId} id={props.route?.params?.id} editable={props.route?.params?.editable} dow={props.route?.params?.dow} planId={props.route?.params?.planId} />}
            </Stack.Screen>
            <Stack.Screen name={prefix + 'User'} options={{ headerShown: false }}>
                {/* @ts-ignore */}
                {props => <Profile {...props} id={props.route?.params?.id} personal={false} registration={false} />}
            </Stack.Screen>
            <Stack.Screen name={prefix + 'Subscribees'} options={{ headerShown: false }}>
                {/* @ts-ignore */}
                {props => <Subscribees {...props} to={props.route?.params?.to} from={props.route?.params?.from} />}
            </Stack.Screen>
            <Stack.Screen name={prefix + 'GroceryList'} options={{ headerShown: false }}>
                {/* @ts-ignore */}
                {props => <GroceryList {...props}/>}
            </Stack.Screen>
            <Stack.Screen name={prefix + 'Pantry'} options={{ headerShown: false }}>
                {/* @ts-ignore */}
                {props => <Pantry {...props} />}
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
            <Stack.Screen name={prefix + 'PostDetails'} options={{ headerShown: false }}>
                {/* @ts-ignore */}
                {props => <PostDetails {...props} id={props.route?.params?.id} />}
            </Stack.Screen>
            <Stack.Screen name={prefix + 'ListRun'} component={ListRuns} options={{ headerShown: false }} />
            <Stack.Screen name={prefix + 'ListPlan'} component={ListPlans} options={{ headerShown: false }} />
            <Stack.Screen name={prefix + 'LogWater'} component={LogWater} options={{ headerShown: false }} />
            <Stack.Screen name={prefix + 'TaskAgenda'} component={TaskAgenda} options={{ headerShown: false }} />
    </Stack.Group>
}