import { View, Text } from '../base/Themed'
import React from 'react'
import tw from 'twrnc'
import Spacer from '../base/Spacer'
import { Stepper } from 'react-native-ui-lib'

export default function StepperInput(props: {onChange?: (v: number) => void; title?: string; min?: number; max?: number; value?: number | undefined | null; left?: boolean; right?: boolean; bottom?: boolean}) {
  return (
    <View style={tw`${props.left ? 'flex-row' : (props.right ? 'flex-row-reverse' : (props.bottom ? 'flex-col-reverse' : ''))} items-center`}>
      <Text style={tw`text-center text-gray-500`} weight='semibold'>{props.title || ''}</Text>
      <Spacer sm horizontal={props.left || props.right}/>
      <Stepper accessibilityLabel='Amount of Repititions' onValueChange={props.onChange} value={props.value || 0} minValue={props.min || 0} maxValue={props.max || 50} />
    </View>
  )
}