import tw from 'twrnc'
import React from 'react'
import { TextInput, useColorScheme } from 'react-native'

export default function NumberInput(props: TextInput['props'] & {places?: number; onNumberChange?: (num: number | null) => void; number?: number}) {
    const dm = useColorScheme() === 'dark'
  return (
    <TextInput value={props.number?.toFixed(props.places||0) || ''} keyboardType={props.places ? 'decimal-pad' : 'number-pad'} {...props}  onChangeText={(v) => {
        const newValue = v.replace(/[^0-9]/g, '')
        if (props.onNumberChange) {
            props.onNumberChange(Number(newValue) || null)
        }

    }} />
  )
}
