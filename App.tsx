import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import 'react-native-gesture-handler'
import 'expo-dev-client';
import Navigation from './navigation';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_200ExtraLight,
  Poppins_100Thin,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_900Black,
  Poppins_800ExtraBold
} from '@expo-google-fonts/poppins';
import React from 'react';
import { DateContext } from './screens/home/Calendar';
import { CommonContext } from './hooks/useCommonContext';
import { Amplify } from 'aws-amplify'
import { registerRootComponent } from 'expo';
import {Env} from './env'
import moment, { Moment } from 'moment';

//@ts-ignore

function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();
  const [date, setDate] = React.useState<Moment>(moment());
  const [sub, setSub] = React.useState<string>('')
  const [username, setUsername] = React.useState<string>('')
  const [progressId, setProgressId] = React.useState<string>('')
  const [userId, setUserId] = React.useState<string>('')
  const [hasSubscribedBefore, setHasSubscribedBefore] = React.useState<boolean>(false)
  const [status, setStatus] = React.useState<{fp: boolean; pt: boolean}>({fp: false, pt: false})
  const [workouts, setWorkouts] = React.useState<WorkoutAddition[]>([])


  React.useEffect(() => {
    if (!userId) return;
    Purchases.configure({apiKey: Platform.OS === 'ios' ? Env.REVENUE_CAT_APPLE_KEY : Env.REVENUE_CAT_ANDROID_KEY})
    Purchases.logIn(userId).then(x => {
      if (!x) return;
      Purchases.addCustomerInfoUpdateListener(info => {
        if (info?.entitlements?.active['pro']?.isActive) {
          setSubscribed(true)
        }
        if (Object.keys(info?.entitlements?.all).length > 0) {
          setHasSubscribedBefore(true)
        }
      })
    })
  }, [userId])
  const [signedInWithEmail, setSignedInWithEmail] = React.useState<boolean>(false);
  const [subscribed, setSubscribed] = React.useState<boolean>(false)

  const [aiResult, setAiResult] = React.useState<GenerateMealResult | null>(null)
  const [currentIngredietId, setCurrentIngredietId] = React.useState<string | null>(null)
  const formattedDate = date.format('dddd, MMMM Do')
  const AWSDate = date.format('YYYY-MM-DD')
  let [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_200ExtraLight,
    Poppins_100Thin,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_900Black,
    Poppins_800ExtraBold
  });

  if (!fontsLoaded || !isLoadingComplete) {
    return null
  } else {
    return (
        <SafeAreaProvider>
        <CommonContext.Provider value={{
            userId, setUserId, progressId, 
            setProgressId, sub, setSub, 
            username, setUsername, subscribed, 
            setSubscribed, aiResult, setAiResult,
            currentIngredietId, setCurrentIngredietId,
            signedInWithEmail, setSignedInWithEmail,
            hasSubscribedBefore, setHasSubscribedBefore,
            status, setStatus
         }}>
        <DateContext.Provider value={{date, setDate, formattedDate, AWSDate}}>
        <ExerciseAdditionsContext.Provider value={{workouts, setWorkouts}}>
          <Navigation colorScheme={colorScheme} />
          <StatusBar />
        </ExerciseAdditionsContext.Provider>
        </DateContext.Provider>
        </CommonContext.Provider>
      </SafeAreaProvider>
    );
  }
}
registerRootComponent(App);


import { GenerateMealResult } from './data';
import { Tier } from './aws/models';
import Purchases from 'react-native-purchases';
import { Platform } from 'react-native';
import { ExerciseAdditionsContext, WorkoutAddition } from './hooks/useExerciseAdditions';
export default App;
