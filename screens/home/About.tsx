import React from 'react'
import { Text, View } from '../../components/base/Themed'
import { BackButton } from '../../components/base/BackButton'
import tw from 'twrnc'
import { SafeAreaView } from 'react-native-safe-area-context'
import Spacer from '../../components/base/Spacer'

export default function About() {
  return (
    <View includeBackground style={{ flex: 1 }}>
      <BackButton name='About' />
      <SafeAreaView edges={['bottom']} style={tw`mt-2 h-9/12 px-4 justify-between`}>
        <View>
          <Text h5 weight='bold'>Rage Mobile</Text>
          <Spacer sm />
          <Text style={tw`text-gray-500`} weight='regular'>Rage is a workout and diet application whose core functionality is
            {<Text style={tw`text-gray-500`} weight='bold'> free</Text>}. This allows anyone to be able to have healthier eating and exercise
            habits without the hassle of worrying about paying for the application. This app also allows approved Food Professionals and Personal
            Trainers to be able to monetize their industry knowledge of diets and exercises, to be able to give this information at a premium!
          </Text>
          <Text style={tw`mt-6`} h5 weight='bold'>Attributions</Text>
          <Spacer sm />
          <Text style={tw`text-gray-500`}>{`Animations powered by LottieFiles\nTrophy by Mahendra Bhunwal\nRunning Dog by Hiren Patel\nYoga by Muhammad Ali\nBook Search by Priyanshu Rijhwani\nPreparing for Workout by Addy Martínez\nTeamwork by Jordi Martinez\nDrink Water by Suresh\nCooking by Rohani Tripathi\nRest Sloth by Mikalai Fedarovich\nWaiting Pigeon by Анна Ярмоленко\nMeditation Wait Please by Mikhail Voloshin\nSleeping Sloth by Tarryn Myburgh\nSleeping Polar Bear by Motionstk.studio\nSleepy Sleep by Blagoj Cilakov\nSquirrel Sleeping by jonathan ferreira\nLoading screen by Ajay Avinash\n`}</Text>
          <Text style={tw`text-gray-500`}>Food database powered by Edamam API</Text>
          <Text style={tw`text-gray-500`}>Meal generation by prompt powered by OpenAI</Text>
          <Text style={tw`text-gray-500`}>UI/UX Inspired by Sobakhul Munir Siroj (ZenFit)</Text>
        </View>
        <Spacer xl />
        <Text style={tw`text-gray-500 text-center`} sm>Version 1.0.0</Text>
      </SafeAreaView>
    </View>
  )
}