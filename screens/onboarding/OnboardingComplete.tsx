import { View, Text, SafeAreaView } from '../../components/base/Themed'
import React, { useEffect, useRef, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import tw from 'twrnc'
import { sleep, titleCase } from '../../data'
import Animated from 'react-native-reanimated'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { useColorScheme, Easing } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { XStack, YStack } from 'tamagui'
import Spacer from '../../components/base/Spacer'
import { AnimatedCircularProgress } from 'react-native-circular-progress'
import { _tokens } from '../../tamagui.config'
import Button from '../../components/base/Button'
import { useSelector } from '../../redux/store'
import { ExpoIcon, Icon } from '../../components/base/ExpoIcon'

export default function OnboardingComplete() {
    const p = useSafeAreaInsets()
    const [loading, setLoading] = useState<boolean>(true)
    const navigator = useNavigation()
    const dm = useColorScheme() === 'dark'
    const cpRef = React.useRef<AnimatedCircularProgress | null>(null)
    let {profile} = useSelector(x => x.auth)
    let totalCalories = profile?.tdee || 200
    const totalProteinGrams = profile?.proteinLimit || (totalCalories * 0.4) / 4
    const totalFatGrams = profile?.fatLimit || (totalCalories * 0.3) / 9
    const totalCarbsGrams = profile?.carbLimit || (totalCalories * 0.3) / 4
    useEffect(() => {
      cpRef.current?.animate(100, 3000)
        sleep(3000).then(x => setLoading(false))
    }, [])
  return (
    <SafeAreaView includeBackground style={[{flex: 1, paddingTop: p.top}, tw`px-3 justify-between items-center`]}>
      <YStack alignItems='center'>
      <Text style={tw`text-center`} weight='bold' h3>{loading ? 'Creating Your Personalized Fitness Plan' : 'Your Fitness Plan Is Ready'}</Text>
      <Spacer />
      <Text xl style={tw`text-gray-500`}>{loading ? 'Please wait...' : 'This fitness plan takes into consideration your personal information, feel free to customize it!'}</Text>
      </YStack>
      {loading && <Spacer xl/>}
      {loading && <AnimatedCircularProgress ref={cpRef} size={280} fill={50} rotation={360} tintColor={_tokens.primary900} width={20} fillLineCap='round' backgroundColor={dm ? _tokens.dark2 : _tokens.gray200}>
        {fill => {
          return <Text style={{fontSize: 72}} weight='bold'>{fill.toFixed(0)}%</Text>
        }}
      </AnimatedCircularProgress>}
      {!loading && <YStack alignContent='flex-start' alignSelf='baseline'>
        <Spacer />
        <Text h4 weight='bold'>Body Profile</Text>
        <Spacer />
        <FitnessPlanListItem name='Caloric Goal' value={titleCase(profile?.goal || 'Maintenance')} />
        <FitnessPlanListItem name={`Weight ${(profile?.weight || 0) < (profile?.weightGoal || 0) ? 'Gain' : 'Loss'}`} suffix={profile?.metric ? 'kgs' : 'lbs'} value={Math.abs((profile?.weight || 0) - (profile?.weightGoal || 0)).toFixed(0)} />
        <FitnessPlanListItem name={`Fat ${(profile?.startFat || 0) < (profile?.fatGoal || 0) ? 'Gain' : 'Loss'}`} suffix={'%'} value={Math.abs((profile?.startFat || 0) - (profile?.fatGoal || 0)).toFixed(0)} />
        <Spacer />
        <Text h4 weight='bold'>Nutrition</Text>
        <Spacer />
        <FitnessPlanListItem name='Calories' suffix='kcal' emoji='🔥' value={totalCalories.toFixed(0)} />
        <FitnessPlanListItem name='Protein' suffix='g' emoji='🍖' value={totalProteinGrams.toFixed(0)} />
        <FitnessPlanListItem name='Carbs' suffix='g' emoji='🥦' value={totalCarbsGrams.toFixed(0)} />
        <FitnessPlanListItem name='Fat' suffix='g' emoji='🥓' value={totalFatGrams.toFixed(0)} />
        <Spacer />

        {/* <XStack justifyContent='space-between' w={'100%'}>
          <Text lg weight='bold'>Calories</Text>
          <Text lg>{totalCalories.toFixed(0)} kcal</Text>
        </XStack>
        <Spacer divider /> */}
        </YStack>}
      {loading && <Text xl style={tw`text-gray-500`}>This will take just a moment!</Text>}
      {!loading && <Button title='Finish' height={60} width={'50%'} pill  onPress={() => navigator.navigate('Root')}/>}
    </SafeAreaView>
  )
}


export const FitnessPlanListItem = (props: {name: string; emoji?: string; value: string, suffix?: string}) => {
  return <YStack w='100%'>
    <XStack justifyContent='space-between' alignItems='center' w={'100%'}>
    <Text lg weight='semibold'>{props.emoji} {props.name}</Text>
          <Text lg>{props.value} {props.suffix}</Text>
        </XStack>
        <Spacer divider />
  </YStack>
}