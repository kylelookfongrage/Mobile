import { ScrollView, Dimensions, TouchableOpacity, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text, View } from '../../components/base/Themed'
import React, { useRef } from 'react'
import * as SplashScreen from 'expo-splash-screen';
import { Amplify, Auth, DataStore } from 'aws-amplify';
import { Tier, User } from '../../aws/models';
import { useCommonAWSIds } from '../../hooks/useCommonContext';
import tw from 'twrnc'
import { AdsConsent, AdsConsentStatus } from 'react-native-google-mobile-ads';
import {getTrackingPermissionsAsync, requestTrackingPermissionsAsync} from 'expo-tracking-transparency'
import { getAWSConfig } from '../../constants/getAWSConfig';


//@ts-ignore




SplashScreen.preventAutoHideAsync();

export default function GetStarted() {
  const [isReady, setIsReady] = React.useState<boolean>(false)
  const { setSub, setUserId, setUsername, setUser, setProfile, setStatus, setSignedInWithEmail } = useCommonAWSIds()
  const dao = UserQueries() 
  useAuthListener((e, u) => {
    if (!u) return;
    setSignedInWithEmail(['apple', 'google'].includes(u?.app_metadata?.provider || ''))
    dao.fetchProfile(u.id).then(x => {
      if (x?.id) {
        setUserId(x.id)
        setProfile(x)
      } else {
        navigator.navigate('Registration')
      }
    })
    setSub(u.id)
    setUser(u)
  })
  const width = Dimensions.get('screen').width
  const navigator = useNavigation()
  const x = useSharedValue(0)
  const scrollRef = useRef<Animated.ScrollView | null>(null)
  const onScroll = useAnimatedScrollHandler({
    onScroll: event => {
      x.value = event.contentOffset.x
    }
  })
  


  React.useCallback(async () => {
    await SplashScreen.hideAsync();
      if (Platform.OS === 'ios') {
        const { granted } = await getTrackingPermissionsAsync();
        console.log(granted === true)
        if (!granted) {
          await requestTrackingPermissionsAsync()
        }
      }
      const consentInfo = await AdsConsent.requestInfoUpdate();
      if (consentInfo.isConsentFormAvailable && consentInfo.status === AdsConsentStatus.REQUIRED) {
        const { status } = await AdsConsent.showForm();
        console.log(consentInfo)
      }
  }, [])

  return (
    <View includeBackground style={[tw``, { flex: 1 }]}>
      <Animated.FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        bounces={false} scrollEventThrottle={32}
        pagingEnabled={true} snapToAlignment='start'
        snapToInterval={width}
        //@ts-ignore
        ref={scrollRef}
        onScroll={onScroll}
        scrollEnabled={false}
        data={onboardingScreens}
        renderItem={({ item, index }) => {
          const screen = item
          const i = index
          return <View style={[{ width: width }, tw`items-center mt-30`]} key={screen.name}>
            <AnimatedLottieView
              autoPlay
              style={[{
                width: width * 0.80,
                height: width * 0.60,

              }, tw`rounded-xl`]}
              // Find more Lottie files at https://lottiefiles.com/featured
              source={screen.animation}
            />
            <Text style={tw`mb-2 mt-6 text-xl`} weight='bold'>{screen.name}</Text>
            <Text style={tw`max-w-10/12 text-center`}>{screen.description}</Text>
            <TouchableOpacity style={tw`mt-9 p-3 w-5/12 items-center rounded-xl bg-red-500`} onPress={() => {
              if (i !== onboardingScreens.length - 1) {
                if (scrollRef.current) {
                  //@ts-ignore
                  scrollRef.current.scrollToIndex({ index: i + 1 })
                }
              } else {
                navigator.navigate('Login')
              }
            }}>
              <Text style={tw`text-white`} weight='bold'>{i === onboardingScreens.length - 1 ? 'Get Started' : 'Next'}</Text>
            </TouchableOpacity>
          </View>
        }}
      />
    </View>
  )
}

import book from '../../assets/animations/book.json'
import crunches from '../../assets/animations/crunches.json'
import equiptment from '../../assets/animations/equiptment.json'
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import AnimatedLottieView from 'lottie-react-native';
import awsmobile from '../../constants/aws-config';
import { useAuthListener } from '../../supabase/auth';
import { UserQueries } from '../../types/UserDao';

const onboardingScreens: { name: string, description: string, animation: any }[] = [
  { name: 'Workout and Exercise', description: 'Log your workouts with ease! Rage make it very easy to create and keep track of your daily exercise routine', animation: crunches },
  { name: 'Food and Meals', description: 'Tracking your calories has never been easier, simply search or scan your barcode! Need a recipe but don\'t know where to start? Rage can generate a meal for you!', animation: book },
  { name: 'Make Money', description: 'Rage will always be a free application! Approved Personal Trainers or Food Professionals can make their meals or workouts premium and earn money made from subscribed users!', animation: equiptment }
]