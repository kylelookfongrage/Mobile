import { WorkoutPlayDisplayProps } from '../../types/WorkoutDao'
import { View, Text } from '../base/Themed'
import React from 'react'
import AICamera from '../features/AICamera'

export default function WorkoutPlayTrainer(props: WorkoutPlayDisplayProps) {
  return (
    <View>
      <AICamera widthMultiplier={0.5} />
    </View>
  )
}