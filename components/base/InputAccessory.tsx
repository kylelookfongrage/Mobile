import { View, Text } from './Themed'
import React from 'react'
import { Dimensions, InputAccessoryView, TextInput, TouchableOpacity, useColorScheme } from 'react-native'
import tw from 'twrnc'
import { ExpoIcon } from './ExpoIcon'

export default function InputAccessory(props: InputAccessoryView['props'] & {title?: string;}) {
    const dm = useColorScheme() === 'dark'
    const s = Dimensions.get('screen')
  return (
    <InputAccessoryView backgroundColor={tw`bg-gray-${dm ? '900':'200'}`.backgroundColor as string}>
    {props.title && <Text style={tw`text-center mt-2`} weight='semibold'>{props.title}</Text>}
    {props.children}
    </InputAccessoryView>
  )
}