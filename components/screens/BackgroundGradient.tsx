import { View as OriginalView, useColorScheme } from 'react-native'
import React from 'react'
import { View, Text } from '../base/Themed'
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../../constants/Colors';
import { easeGradient } from 'react-native-easing-gradient'



type BackgroundGradientProps = OriginalView['props'] & {bottom?: boolean;}
export default function BackgroundGradient(props: BackgroundGradientProps) {
    const dm = useColorScheme() === 'dark'
    let color = dm ? Colors.dark : Colors.light
    const { colors, locations } = easeGradient({
      colorStops: {
        0: {
          color: 'transparent',
        },
        1: {
          color: color.background,
        },
      },
    })
  return (
    <LinearGradient 
    locations={locations}
    colors={colors} {...props}>
        {props.children && props.children}
    </LinearGradient>
  )
}