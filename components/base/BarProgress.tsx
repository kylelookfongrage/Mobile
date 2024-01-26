import { View, Text, Dimensions, useColorScheme } from 'react-native'
import React from 'react'
import { ProgressBar } from 'react-native-ui-lib'
import tw from 'twrnc'

export default function BarProgress(props: {widthOfScreen?: number, height?: number} & typeof ProgressBar['defaultProps'] ) {
  let s = Dimensions.get('screen')
  let dm = useColorScheme() === 'dark'
  let bgColor = dm ? 'gray-800' : 'gray-200'
  return (
    <ProgressBar {...props} style={props.style || {width: s.width * (props.widthOfScreen || 0.3), height: props.height || 5, ...tw`bg-${bgColor}`}} />
  )
}