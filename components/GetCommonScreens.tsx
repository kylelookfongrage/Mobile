import ListFood from "../screens/diet/ListFood"
import ListMeals from "../screens/diet/ListMeals"
import MealDetail from "../screens/diet/MealDetail"
import ProgressMeal from "../screens/diet/ProgressMeal"
import FoodDetail from "../screens/diet/FoodDetail"
import ListWorkout from "../screens/workout/ListWorkout"
import ListExercise from "../screens/workout/ListExercise"
import EquiptmentSearch from "../screens/workout/EquiptmentSearch"
import ExerciseDetail from "../screens/workout/ExerciseDetail"
import WorkoutDetail from "../screens/workout/WorkoutDetail"
import Profile from "../screens/home/Profile"
import Subscribees from "../screens/home/Subscribees"
import ListUsers from "../screens/home/ListUsers"
import GroceryList from "../screens/diet/GroceryList"
import Pantry from '../screens/diet/Pantry'
import Favorites from "../screens/home/Favorites"
import SummaryFoodList from "../screens/home/SummaryFoodList"
import ListRuns from "../screens/home/ListRuns"
import AddExerciseToWorkout from "../screens/workout/AddExerciseToWorkout"
import Allergens from "../screens/home/Allergens"
import PostComments from "../screens/workout/PostComments"
import Bio from "../screens/home/Bio"

export const getCommonScreens = (prefix: string, Stack: any) => {
    return <Stack.Group>
        <Stack.Screen name={prefix + 'ListFood'} options={{ headerShown: false }}>
            {/* @ts-ignore */}
            {props => <ListFood defaultSearch={props.route?.params?.defaultSearch} grocery={props.route?.params?.grocery} progressId={props.route?.params?.progressId} mealId={props.route?.params?.mealId} />}
            </Stack.Screen>
            <Stack.Screen name={prefix + 'ListMeals'} options={{ headerShown: false }}>
            {/* @ts-ignore */}
            {props => <ListMeals {...props} grocery={props.route?.params?.grocery} progressId={props.route?.params?.progressId} />}
            </Stack.Screen>
            <Stack.Screen name={prefix + 'MealDetail'} options={{ headerShown: false }}>
                {/* @ts-ignore */}
                {props => <MealDetail {...props} grocery={props.route?.params?.grocery} progressId={props.route?.params?.progressId} idFromProgress={props.route?.params?.idFromProgress} id={props.route?.params?.id} editable={props.route?.params?.editable} />}
            </Stack.Screen>
            <Stack.Screen name={prefix + 'PostComments'} options={{ headerShown: false, presentation: 'transparentModal' }}>
                {/* @ts-ignore */}
                {props => <PostComments {...props} postId={props.route?.params?.postId} postType={props.route?.params?.postType} />}
            </Stack.Screen>
            <Stack.Screen name={prefix + 'ProgressMeal'} options={{presentation: 'transparentModal', headerShown: false}}>
                {/* @ts-ignore */}
                {props => <ProgressMeal id={props?.route?.params?.id} />}
            </Stack.Screen>
            <Stack.Screen name={prefix + 'FoodDetail'} options={{ headerShown: false }}>
                {/* @ts-ignore */}
                {props => <FoodDetail
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
                />}
            </Stack.Screen>
            <Stack.Screen name={prefix + 'Allergens'} component={Allergens} options={{ headerShown: false, presentation: 'transparentModal' }} />
            <Stack.Screen name={prefix + 'ListWorkout'} options={{ headerShown: false }}>
                {/* @ts-ignore */}
                {props => <ListWorkout {...props} exerciseId={props.route?.params?.exerciseId} />}
            </Stack.Screen>
            <Stack.Screen name={prefix + 'ListExercise'} options={{ headerShown: false }} >
            {/* @ts-ignore */}
            {props => <ListExercise {...props} workoutId={props.route?.params?.workoutId} editable={props.route?.params?.editable} />}
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
                {props => <WorkoutDetail {...props} progressId={props.route?.params?.progressId} id={props.route?.params?.id} editable={props.route?.params?.editable} />}
            </Stack.Screen>
            <Stack.Screen name={prefix + 'User'} options={{ headerShown: false }}>
                {/* @ts-ignore */}
                {props => <Profile {...props} id={props.route?.params?.id} personal={false} registration={false} />}
            </Stack.Screen>
            <Stack.Screen name={prefix + 'Subscribees'} options={{ headerShown: false }}>
                {/* @ts-ignore */}
                {props => <Subscribees {...props} to={props.route?.params?.to} from={props.route?.params?.from} />}
            </Stack.Screen>
            <Stack.Screen name={prefix + 'ListUser'} options={{ headerShown: false }}>
                {/* @ts-ignore */}
                {props => <ListUsers {...props} foodProfessionals={props.route?.params?.foodProfessionals} trainers={props.route?.params?.trainers} />}
            </Stack.Screen>
            <Stack.Screen name={prefix + 'GroceryList'} options={{ headerShown: false }}>
                {/* @ts-ignore */}
                {props => <GroceryList {...props}/>}
            </Stack.Screen>
            <Stack.Screen name={prefix + 'Pantry'} options={{ headerShown: false }}>
                {/* @ts-ignore */}
                {props => <Pantry {...props} />}
            </Stack.Screen>
            <Stack.Screen name={prefix + 'Favorites'} options={{ headerShown: false }}>
                {/* @ts-ignore */}
                {props => <Favorites {...props} />}
            </Stack.Screen>
            <Stack.Screen name={prefix + 'SummaryFoodList'} options={{ headerShown: false }}>
                {/* @ts-ignore */}
                {props => <SummaryFoodList {...props} />}
            </Stack.Screen>
            <Stack.Screen name={prefix + 'ListRun'} component={ListRuns} options={{ headerShown: false }} />
    </Stack.Group>
}