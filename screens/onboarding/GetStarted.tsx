import { Dimensions, Platform } from 'react-native'
import { View } from '../../components/base/Themed'
import React, { useEffect, useRef, useState } from 'react'
import * as SplashScreen from 'expo-splash-screen';
import { useCommonAWSIds } from '../../hooks/useCommonContext';
import tw from 'twrnc'
import { AdsConsent, AdsConsentStatus } from 'react-native-google-mobile-ads';
import { getTrackingPermissionsAsync, requestTrackingPermissionsAsync } from 'expo-tracking-transparency'
import {Text} from 'tamagui'

SplashScreen.preventAutoHideAsync();

export default function GetStarted() {
  const [isReady, setIsReady] = React.useState<boolean>(false)
  const { setSub, setUserId, setUsername, setUser, setProfile, setStatus, setSignedInWithEmail, setSubscribed, setHasSubscribedBefore, profile, userId } = useCommonAWSIds()
  const dao = UserQueries(false)  
  const [f, setF] = useState<boolean>(false)

  useOnLeaveScreen(() => setF(true))

  useEffect(() => {
    if (f) return;
    let sub = supabase.auth.onAuthStateChange((e, s) => {
      if(f)return;
      if (s?.user) {
        let u = s.user
        if (!u) return;
        if (profile || userId) return;
        setSignedInWithEmail(u?.app_metadata?.provider === 'email')
        console.log('Fetching profile from auth listener in getting started')
        dao.fetchProfile(u.id).then(x => {
          if (x?.id) {
            setUserId(x.id)
            setProfile(x)
            setF(true)
          } else {
            setF(true)
            navigator.navigate('Registration')
          }
        })
        setSub(u.id)
        setUser(u)
      }
    })
    return () => {
      sub.data?.subscription?.unsubscribe()
    }
  }, [])

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
    await SplashScreen.hideAsync();
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
          return <View style={[{ width: width, flex: 1 }, tw`items-center mt-30`]} key={screen.name}>
            <AnimatedLottieView
              autoPlay
              style={[{
                width: width * 0.80,
                height: width * 0.60,

              }, tw`rounded-xl`]}
              // Find more Lottie files at https://lottiefiles.com/featured
              source={screen.animation}
            />
            <Text style={tw`mb-2 mt-6 px-6`} fontSize='$h3' fontWeight='600' textAlign='center'>{screen.name}</Text>
            <Spacer />
            <Text textAlign='center' style={tw`px-12`}>{screen.description}</Text>
            <PageControl currentPage={i} numOfPages={onboardingScreens.length - 1} />
            <XStack zIndex={1} position='absolute' bottom={40} alignSelf='center' w={'100%'} alignItems='center' justifyContent='space-evenly' gap={'$4'}>
            <Button title='Skip' width={'$12'} height='$5' pill type='dark' onPress={() => {
              navigator.navigate('Login')
            }} />
            <Button title={i === onboardingScreens.length - 1 ? 'Get Started' : 'Next'} width={'$12'} height='$5' pill onPress={() => {
              if (i !== onboardingScreens.length - 1) {
                if (scrollRef.current) {
                  //@ts-ignore
                  scrollRef.current.scrollToIndex({ index: i + 1 })
                }
              } else {
                navigator.navigate('Login')
              }
            }} />
            </XStack>
            {/* <SaveButton safeArea title={i === onboardingScreens.length - 1 ? 'Get Started' : 'Next'} onSave={() => {
              if (i !== onboardingScreens.length - 1) {
                if (scrollRef.current) {
                  //@ts-ignore
                  scrollRef.current.scrollToIndex({ index: i + 1 })
                }
              } else {
                navigator.navigate('Login')
              }
            }} /> */}
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
import { useAuthListener, useSignOut } from '../../supabase/auth';
import { UserQueries } from '../../types/UserDao';
import SaveButton from '../../components/base/SaveButton';
import useAsync from '../../hooks/useAsync';
import { supabase } from '../../supabase';
import useOnLeaveScreen from '../../hooks/useOnLeaveScreen';
import Button from '../../components/base/Button';
import { XStack } from 'tamagui';
import Spacer from '../../components/base/Spacer';
import { PageControl } from 'react-native-ui-lib';

const onboardingScreens: { name: string, description: string, animation: any }[] = [
  { name: 'Your Health Journey Starts Here', description: 'Log your workouts with ease! Rage make it very easy to create and keep track of your daily exercise routine', animation: crunches },
  { name: 'Tailored Fitness Plans for your needs', description: 'With Rage, you are able to subscribe to any fitness plan, customizing it to fit your needs', animation: book },
  { name: 'Stay Informed About Your Fitness Progress', description: 'Track your fitness journey with ease! With Rage it is possible to achieve the results you have always wanted!', animation: equiptment },
  { name: 'Earn Money with Rage', description: 'Rage will always be a free application! Approved Personal Trainers or Food Professionals can make their meals or workouts premium and earn money made from subscribed users!', animation: equiptment }
]