import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Profile from "./Profile";
import { getCommonScreens } from "../../components/GetCommonScreens";


interface ProfileTabProps {
    PListFood: {defaultSearch?: string; progressId?: string, mealId?: string;}
    ProfileScreen: { personal: boolean; id: string; }
    PListMeals: undefined;
    PMealDetail: { id: string, editable: boolean };
    PFoodDetail: {
        id: string;
        editable: boolean;
        img: string;
        progressId: string;
        name: string;
        mealId: string;
        src: 'new' | 'api' | 'backend'
        category: string;
        measures: any;
        edamamId: string;
        foodContentsLabel: string;
    }
    PListWorkout: undefined;
    PListExercise: {workoutId?: string, editable?: boolean}
    PEquiptmentSearch: {exerciseId?: string}
    PExerciseDetail: {id: string, workoutId: string, editable: boolean;};
    PWorkoutDetail: {id: string;};
    PUser: {id: string;};
    PSubscribees: {to: string; from: string;}
}

//@ts-ignore
const Stack = createNativeStackNavigator<ProfileTabProps>();
export default function ProfileScreen() {
    return (
        <Stack.Navigator initialRouteName='ProfileScreen'>
            <Stack.Screen name='ProfileScreen' options={{ headerShown: false }}>
                {props => <Profile personal={props.route?.params?.personal} id={props.route?.params?.id} />}
            </Stack.Screen>
            {getCommonScreens('P', Stack)}
        </Stack.Navigator>
    )
}