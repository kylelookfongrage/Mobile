import { View } from './Themed'
import React from 'react'
import { useColorScheme } from 'react-native';
import { Divider } from 'react-native-paper';
import tw from 'twrnc'

export default function Spacer(props: {includeBackground?: boolean; horizontal?: boolean, xs?:boolean; sm?: boolean; lg?: boolean, xl?: boolean, divider?: boolean}) {
  let letter = 'h'
  if (props.horizontal) letter='w'
  let dm = useColorScheme() === 'dark'
  let size = 4
  if (props.sm) size = 2
  if (props.lg) size = 6 
  if (props.xl) size=8
  if (props.xs) size=1
  if (props.divider) {
    return <Divider style={tw`bg-gray-${dm ? '800' : '300'} m${props.horizontal ? 'x' : 'y'}-${size}`} />
  }
  return (
    <View style={tw`${letter}-${size}`} includeBackground={props.includeBackground} />
  )
}