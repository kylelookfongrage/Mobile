import { View, Text, useColorScheme } from 'react-native'
import React from 'react'
import { ExpoIcon } from '../base/ExpoIcon'

export default function AllergenAlert(props: {size?: number, style?: any}) {
    const dm = useColorScheme() === 'dark'
  return <ExpoIcon name='alert-circle' iconName='feather' size={props.size || 20} color={dm ? 'yellow' : '#d67022'} style={props.style || {}} />
}