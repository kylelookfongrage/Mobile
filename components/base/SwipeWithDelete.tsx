import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { Swipeable } from 'react-native-gesture-handler'
import { ExpoIcon } from './ExpoIcon'
import tw from 'twrnc'

export default function SwipeWithDelete(props: Swipeable['props'] & {onDelete?: () => void; disabled?: boolean}) {
  return (
    <Swipeable renderRightActions={props.renderRightActions ? props.renderRightActions : () => {
      if (props.disabled) return undefined;
        return <TouchableOpacity style={tw`justify-center items-center px-2`} onPress={() => {
            if (props.onDelete) props.onDelete()
        }}>
            <ExpoIcon name='close-circle' iconName='ion' size={30} color={'red'} />
        </TouchableOpacity>
    }}>
        {props.children}
    </Swipeable>
  )
}