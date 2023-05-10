import { SafeAreaView, View } from 'react-native'
import React from 'react'
import { Text } from '../../components/Themed'
import tw from 'twrnc'

export default function UserSettings() {
  return (
    <SafeAreaView>
      <View style={tw`px-4`}>
      <Text weight='bold' style={tw`text-2xl`}>Settings</Text>
      </View>
    </SafeAreaView>
  )
}