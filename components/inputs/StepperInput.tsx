import { View, Text } from '../base/Themed'
import React from 'react'
import tw from 'twrnc'
import Spacer from '../base/Spacer'
import { Stepper } from 'react-native-ui-lib'

export default function StepperInput(props: {onChange?: (v: number) => void; title?: string; min?: number; max?: number; value?: number | undefined | null; left?: boolean; right?: boolean; bottom?: boolean; editable?: boolean}) {
  console.log(props.editable)
  return (
    <View style={tw`${props.left ? 'flex-row' : (props.right ? 'flex-row-reverse' : (props.bottom ? 'flex-col-reverse' : ''))} items-center`}>
      <Text gray center semibold>{props.title || ''}</Text>
      <Spacer sm horizontal={props.left || props.right}/>
      {props.editable !== false && <Stepper accessibilityLabel='Amount of Repititions or Sets'  onValueChange={props.onChange} value={props.value || 0} minValue={props.min || 0} maxValue={props.max || 50} />}
      {!props.editable && <Text weight='semibold'>{props.value || 0}</Text>}
    </View>
  )
}