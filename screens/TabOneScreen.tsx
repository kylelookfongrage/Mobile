import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getCommonScreens } from '../components/GetCommonScreens';
import { RootTabScreenProps } from '../types';
import Calendar from './home/Calendar';
import Notifications from './home/Notifications';
import { SummaryScreen } from './home/Summary';


const Stack = createNativeStackNavigator();

interface SummaryScreenProps {
  Summary: undefined;
  SListFood: { progressId?: string, mealId?: string }
  SListMeals: { progressId?: string };
  SMealDetail: { id: string, editable: boolean };
  SFoodDetail: {
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
  SExerciseDetail: { id: string, workoutId: string, editable: boolean; };
  SWorkoutDetail: { id: string; };
  SUser: { id: string; };
  SSubscribees: { to: string; from: string; };
  Notifications: undefined;
  Calendar: undefined;
}

//@ts-ignore
export default function TabOneScreen({ navigation }: RootTabScreenProps<SummaryScreenProps>) {
  return (
    <Stack.Navigator initialRouteName='Summary'>
      <Stack.Screen name='Summary' component={SummaryScreen} options={{ headerShown: false }} />
      <Stack.Screen name='Notifications' component={Notifications} options={{ headerShown: false }} />
      <Stack.Screen name='Calendar' component={Calendar} options={{ headerShown: false }} />
      {getCommonScreens('S', Stack)}
    </Stack.Navigator>
  );
}

