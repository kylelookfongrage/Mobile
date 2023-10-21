import { TouchableOpacity } from 'react-native'
import React from 'react'
import { Swipeable } from 'react-native-gesture-handler'
import { ExpoIcon } from './ExpoIcon'
import tw from 'twrnc'
import { View } from './Themed'

export default function SwipeWithDelete(props: Swipeable['props'] & {onDelete?: () => void; disabled?: boolean, card?: boolean; includeBackground?: boolean}) {
  return (
    <Swipeable renderRightActions={props.renderRightActions ? props.renderRightActions : () => {
      if (props.disabled) return undefined;
        return <TouchableOpacity onPress={() => {
            if (props.onDelete) props.onDelete()
        }}>
            <View card={props.card} includeBackground={props.includeBackground} style={{...tw`justify-center items-center px-2`, flex: 1}} >
            <ExpoIcon name='close-circle' iconName='ion' size={30} color={'red'} />
            </View>
        </TouchableOpacity>
    }}>
        {props.children}
    </Swipeable>
  )
}