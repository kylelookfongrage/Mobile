import { View as OriginalView, useColorScheme } from 'react-native'
import React from 'react'
import { View, Text } from './Themed'
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../constants/Colors';


type BackgroundGradientProps = OriginalView['props'] & {bottom?: boolean;}
export default function BackgroundGradient(props: BackgroundGradientProps) {
    const dm = useColorScheme() === 'dark'
    let colors = dm ? [Colors.dark.transparentBackground, Colors.dark.background] : [Colors.light.transparentBackground, Colors.light.background]
    if (props.bottom) colors = [colors[1], colors[0]]
  return (
    <LinearGradient 
    locations={[0,0.05]}
    colors={colors} {...props}>
        {props.children && props.children}
    </LinearGradient>
  )
}