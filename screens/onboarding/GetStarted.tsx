import { Dimensions, Platform } from 'react-native'
import { View } from '../../components/base/Themed'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import * as SplashScreen from 'expo-splash-screen';
import { useCommonAWSIds } from '../../hooks/useCommonContext';
import tw from 'twrnc'
import { AdsConsent, AdsConsentStatus } from 'react-native-google-mobile-ads';
import { getTrackingPermissionsAsync, requestTrackingPermissionsAsync } from 'expo-tracking-transparency'
import {Image, YStack} from 'tamagui'
import { Text } from '../../components/base/Themed';
let img = require('../../assets/images/Groupmockup.png')

export default function GetStarted() {
  const [isReady, setIsReady] = React.useState<boolean>(false)
  let state = useSelector(x => x.auth)
  let dispatch = useDispatch()
  console.log(state)
  const { setSub, setUserId, setUsername, setUser, setProfile, setStatus, setSignedInWithEmail, setSubscribed, setHasSubscribedBefore, profile, userId } = useCommonAWSIds()
  const dao = UserQueries(false)  
  const [f, setF] = useState<boolean>(false)

  useOnLeaveScreen(() => setF(true))

  useEffect(() => {
    if (true) return;
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


  // useLayoutEffect(() => {
  //   (async () => {
  //     try {
  //       dispatch(fetchUser())
  //       if (Platform.OS === 'ios') {
  //         const { granted } = await getTrackingPermissionsAsync();
  //         if (!granted) {
  //           await requestTrackingPermissionsAsync()
  //         }
  //       }
  //       const consentInfo = await AdsConsent.requestInfoUpdate();
  //       if (consentInfo.isConsentFormAvailable && consentInfo.status === AdsConsentStatus.REQUIRED) {
  //         const { status } = await AdsConsent.showForm();
  //       }
  //       await SplashScreen.hideAsync();
  //     } catch (error) {
  //       await SplashScreen.hideAsync()
  //     }
  //   })()
  // }, [])

  return (
    <View includeBackground safeAreaTop style={[tw``, { flex: 1, backgroundColor: _tokens.primary900 }]}>
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
          return <View style={[{ width: width, flex: 1 }, tw`items-center`]} key={screen.name}>
            <Image source={img} w={345} h={700} />
            <View includeBackground style={{zIndex: 1, marginTop: -300, height: 500, width: '100%'}}>
            <Text style={tw`mb-2 mt-6 px-6 text-center`} h3 weight='bold'>{screen.name}</Text>
            <Spacer />
            <Text style={tw`px-6 text-center`} xl weight='thin'>{screen.description}</Text>
            </View>
            
            {/* <PageControl currentPage={i} numOfPages={onboardingScreens.length - 1} /> */}
            <XStack zIndex={2} position='absolute' bottom={40} alignSelf='center' w={'100%'} alignItems='center' justifyContent='space-evenly' gap={'$4'}>
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
import { UserQueries } from '../../types/UserDao';
import { supabase } from '../../supabase';
import useOnLeaveScreen from '../../hooks/useOnLeaveScreen';
import Button from '../../components/base/Button';
import { XStack } from 'tamagui';
import Spacer from '../../components/base/Spacer';
import { _tokens } from '../../tamagui.config';
import { useDispatch, useSelector } from '../../redux/store';
import { fetchProfile, fetchUser } from '../../redux/api/auth';

const onboardingScreens: { name: string, description: string, animation: any }[] = [
  { name: 'Your Health Journey Starts Here', description: 'Log your workouts with ease! Rage make it very easy to create and keep track of your daily exercise routine', animation: crunches },
  { name: 'Tailored Fitness Plans for your needs', description: 'With Rage, you are able to subscribe to any fitness plan, customizing it to fit your needs', animation: book },
  { name: 'Stay Informed About Your Fitness Progress', description: 'Track your fitness journey with ease! With Rage it is possible to achieve the results you have always wanted!', animation: equiptment },
  { name: 'Earn Money with Rage', description: 'Rage will always be a free application! Approved Personal Trainers or Food Professionals can make their meals or workouts premium and earn money made from subscribed users!', animation: equiptment }
]