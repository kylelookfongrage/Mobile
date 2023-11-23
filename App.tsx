import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import useCachedResources from "./hooks/useCachedResources";
import useColorScheme from "./hooks/useColorScheme";
import "react-native-gesture-handler";
import "expo-dev-client";
import Navigation from "./navigation";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_200ExtraLight,
  Poppins_100Thin,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_900Black,
  Poppins_800ExtraBold,
} from "@expo-google-fonts/poppins";

import {
  Urbanist_400Regular,
  Urbanist_400Regular_Italic,
  Urbanist_500Medium,
  Urbanist_500Medium_Italic,
  Urbanist_600SemiBold,
  Urbanist_600SemiBold_Italic,
  Urbanist_700Bold,
  Urbanist_700Bold_Italic,
} from "@expo-google-fonts/urbanist";

import { TamaguiProvider, Theme } from 'tamagui'

import config, { _tokens } from './tamagui.config'

import React, { useEffect, useState } from "react";
import { DateContext } from "./screens/home/Calendar";
import { CommonContext } from "./hooks/useCommonContext";
import { Provider as MultiPartFormProvider } from "./hooks/useMultipartForm";
import { registerRootComponent } from "expo";
import { Env } from "./env";
import moment, { Moment } from "moment";
import { Colors } from "react-native-ui-lib";
import tw from "twrnc";
//@ts-ignore
Colors.loadDesignTokens({ primaryColor: tw`bg-red-600`.backgroundColor });

//@ts-ignore

function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();
  const [date, setDate] = React.useState<Moment>(moment());
  const [sub, setSub] = React.useState<string>("");
  const [username, setUsername] = React.useState<string>("");
  const [progressId, setProgressId] = React.useState<string>("");
  const [userId, setUserId] = React.useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Tables["user"]["Row"] | null>(null);
  const [hasSubscribedBefore, setHasSubscribedBefore] =
    React.useState<boolean>(false);
  const [status, setStatus] = React.useState<{ fp: boolean; pt: boolean }>({
    fp: false,
    pt: false,
  });
  const [workouts, setWorkouts] = React.useState<WorkoutAddition[]>([]);
  let dm = useColorScheme() === 'dark'

  // useEffect(() => {
  //     if (!user) return;
  //     console.log('Making Subscription for User table with ID: ' + user.id)
  //     let subscription = supabase.channel('userDao').on('postgres_changes', {
  //       table: 'user',
  //       event: 'UPDATE',
  //       schema: 'public',
  //       filter: `id=eq.${user.id}`}, (x) => {
  //         if (x['new']) { //@ts-ignore
  //           setProfile(x['new'])
  //         }
  //     }).subscribe(c => {
  //       console.log(c + ': User table with ID: ' + user.id)
  //   })
  //     return () => {
  //       if (subscription) {
  //         console.log('UNSUBSCRIBING FOR USER')
  //         subscription.unsubscribe()
  //       }
  //     }
  // }, [user])

  React.useEffect(() => {
    if (!user?.id) return;
    Purchases.configure({
      apiKey:
        Platform.OS === "ios"
          ? Env.REVENUE_CAT_APPLE_KEY
          : Env.REVENUE_CAT_ANDROID_KEY,
    });
    Purchases.logIn(user.id).then((x) => {
      if (!x) return;
      Purchases.addCustomerInfoUpdateListener((info) => {
        if (info?.entitlements?.active["pro"]?.isActive) {
          setSubscribed(true);
        }
        if (Object.keys(info?.entitlements?.all).length > 0) {
          setHasSubscribedBefore(true);
        }
      });
    });
  }, [user]);
  const [signedInWithEmail, setSignedInWithEmail] =
    React.useState<boolean>(false);
  const [subscribed, setSubscribed] = React.useState<boolean>(false);

  const [aiResult, setAiResult] = React.useState<GenerateMealResult | null>(
    null
  );
  const [currentIngredietId, setCurrentIngredietId] = React.useState<
    string | null
  >(null);
  const formattedDate = date.format("dddd, MMMM Do");
  const AWSDate = date.format("YYYY-MM-DD");
  let [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_200ExtraLight,
    Poppins_100Thin,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_900Black,
    Poppins_800ExtraBold,
    Urbanist_400Regular,
    Urbanist_400Regular_Italic,
    Urbanist_500Medium,
    Urbanist_500Medium_Italic,
    Urbanist_600SemiBold,
    Urbanist_600SemiBold_Italic,
    Urbanist_700Bold,
    Urbanist_700Bold_Italic,
  });

  if (!fontsLoaded || !isLoadingComplete) {
    return null;
  } else {
    return (
      <SafeAreaProvider>
        <CommonContext.Provider
          value={{
            userId,
            setUserId,
            progressId,
            setProgressId,
            sub,
            setSub,
            username,
            setUsername,
            subscribed,
            setSubscribed,
            aiResult,
            setAiResult,
            currentIngredietId,
            setCurrentIngredietId,
            signedInWithEmail,
            setSignedInWithEmail,
            hasSubscribedBefore,
            setHasSubscribedBefore,
            status,
            setStatus,
            user,
            setUser,
            profile,
            setProfile,
          }}
        >
          <DateContext.Provider
            value={{ date, setDate, formattedDate, AWSDate }}
          >
            <ExerciseAdditionsContext.Provider
              value={{ workouts, setWorkouts }}
            >
              <MultiPartFormProvider>
                <TamaguiProvider config={config}>
                  <Theme name={dm ? 'dark' : 'light'}>
                  <Navigation colorScheme={colorScheme} />
                <StatusBar />
                  </Theme>
                </TamaguiProvider>
              </MultiPartFormProvider>
            </ExerciseAdditionsContext.Provider>
          </DateContext.Provider>
        </CommonContext.Provider>
      </SafeAreaProvider>
    );
  }
}
registerRootComponent(App);

import { GenerateMealResult } from "./data";
import Purchases from "react-native-purchases";
import { Platform } from "react-native";
import {
  ExerciseAdditionsContext,
  WorkoutAddition,
} from "./hooks/useExerciseAdditions";
import { User } from "@supabase/supabase-js";
import { Tables } from "./supabase/dao";
import { supabase } from "./supabase";
export default App;
