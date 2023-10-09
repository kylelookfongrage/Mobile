import React from 'react'
import { Text, View } from '../../components/base/Themed'
import { BackButton } from '../../components/base/BackButton'
import tw from 'twrnc'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function About() {
  return (
    <View includeBackground style={{flex: 1}}>
      <BackButton />
      <SafeAreaView edges={['bottom']} style={tw`mt-9 h-9/12 px-4 justify-between`}>
      <View>
        <Text style={tw`text-lg`} weight='semibold'>About</Text>
        <Text style={tw`text-gray-400 mt-4`} weight='regular'>Rage is a workout and diet application whose core functionality is 
        {<Text style={tw`text-gray-400 text-xs`} weight='bold'> free</Text>}. This allows anyone to be able to have healthier eating and exercise 
        habits without the hassle of worrying about paying for the application. This app also allows approved Food Professionals and Personal 
        Trainers to be able to monetize their industry knowledge of diets and exercises, to be able to give this information at a premium!
        </Text>
        <Text style={tw`text-lg mt-6`} weight='semibold'>Attributions</Text>
        <Text style={tw`text-gray-400 text-xs`}>Animations powered by LottieFiles. Trophy by Mahendra Bhunwal, Running Dog by Hiren Patel, Yoga by Muhammad Ali, Book Search by Priyanshu Rijhwani Preparing for Workout by Addy Martínez, Teamwork by Jordi Martinez, Drink Water by Suresh, Cooking by Rohani Tripathi, Rest Sloth by Mikalai Fedarovich, Waiting Pigeon by Анна Ярмоленко, Meditation Wait Please by Mikhail Voloshin, Sleeping Sloth by Tarryn Myburgh, Sleeping Polar Bear by Motionstk.studio, Sleepy Sleep by Blagoj Cilakov, Squirrel Sleeping by jonathan ferreira, Loading screen by Ajay Avinash</Text>
        <Text style={tw`text-gray-400 text-xs`}>Food database powered by Edamam API</Text>
        <Text style={tw`text-gray-400 text-xs`}>Meal generation by prompt powered by OpenAI</Text>
      </View>
      <Text style={tw`text-gray-400 text-center`}>Version 1.0.0</Text>
      </SafeAreaView>
    </View>
  )
}