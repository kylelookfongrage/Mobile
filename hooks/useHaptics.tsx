import { View, Text } from 'react-native'
import React from 'react'
import * as Haptics from 'expo-haptics'


export default function useHaptics() {
    const press = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }
  return {press}
}