import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import useCachedResources from "./hooks/useCachedResources";
import useColorScheme from "./hooks/useColorScheme";
import "react-native-gesture-handler";
import "expo-dev-client";
import Navigation from "./navigation";
import Purchases from "react-native-purchases";
import { Platform } from "react-native";
import { User } from "@supabase/supabase-js";
import { useFonts } from "expo-font";
import { store } from "./redux/store";
import {
  Ionicons,
  Feather,
  Octicons,
  FontAwesome5,
  SimpleLineIcons,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
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
import React, { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { AdsConsent, AdsConsentStatus } from 'react-native-google-mobile-ads';
import { Provider as ReduxProvider } from "react-redux";
import { registerRootComponent } from "expo";
import { Env } from "./env";
import moment, { Moment } from "moment";
import { Colors } from "react-native-ui-lib";
import tw from "twrnc";
import { getTrackingPermissionsAsync, requestTrackingPermissionsAsync } from "expo-tracking-transparency";
//@ts-ignore
Colors.loadDesignTokens({ primaryColor: tw`bg-red-600`.backgroundColor });
import * as SplashScreen from 'expo-splash-screen';
import { fetchUser } from "./redux/api/auth";
import KeyboardRegistry from "react-native-ui-lib/lib/components/Keyboard/KeyboardInput/KeyboardRegistry";
import { KeyboardView } from "./components/features/Keyboard";

SplashScreen.preventAutoHideAsync()
function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();
  let [appIsReady, setAppIsReady] = useState<boolean>(false);
  let dm = useColorScheme() === 'dark'

  useEffect(() => {
    (async () => {
      try {
        KeyboardRegistry.registerKeyboard('KeyboardView', () => KeyboardView);
        await store.dispatch(fetchUser())
        if (Platform.OS === 'ios') {
          const { granted } = await getTrackingPermissionsAsync();
          if (!granted) {
            await requestTrackingPermissionsAsync()
          }
        }
        const consentInfo = await AdsConsent.requestInfoUpdate();
        if (consentInfo.isConsentFormAvailable && consentInfo.status === AdsConsentStatus.REQUIRED) {
          const { status } = await AdsConsent.showForm();
        }
      } catch (error) {

      } finally {
        setAppIsReady(true)
      }
    })()
  }, [])

  let onLayout = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync()
    }
  }, [appIsReady])

  let [fontsLoaded] = useFonts({
    ...Ionicons.font,
    ...Feather.font,
    ...Octicons.font,
    ...FontAwesome5.font,
    ...SimpleLineIcons.font,
    ...MaterialIcons.font,
    ...MaterialCommunityIcons.font,
    Urbanist_400Regular,
    Urbanist_400Regular_Italic,
    Urbanist_500Medium,
    Urbanist_500Medium_Italic,
    Urbanist_600SemiBold,
    Urbanist_600SemiBold_Italic,
    Urbanist_700Bold,
    Urbanist_700Bold_Italic,

    Iconly: require('./assets/fonts/Iconly.ttf'),
  });

  if (!fontsLoaded || !isLoadingComplete) {
    return null;
  } else {
    return (
      <SafeAreaProvider onLayout={onLayout}>
        <ReduxProvider store={store}>
          <TamaguiProvider config={config}>
            <Theme name={dm ? 'dark' : 'light'}>
              <Navigation colorScheme={colorScheme} />
              <StatusBar />
            </Theme>
          </TamaguiProvider>
        </ReduxProvider>
      </SafeAreaProvider>
    );
  }
}
registerRootComponent(App);

export default App;
