import { TouchableOpacity } from 'react-native'
import React, { ForwardedRef, forwardRef, useImperativeHandle, useRef } from 'react'
import { Swipeable } from 'react-native-gesture-handler'
import { ExpoIcon } from './ExpoIcon'
import tw from 'twrnc'
import { View } from './Themed'

export type TSwipeableWithDeleteRef = {
  close(): void;
}

export default forwardRef(function SwipeWithDelete(props: Swipeable['props'] & {onDelete?: () => void; disabled?: boolean, card?: boolean; includeBackground?: boolean}, ref: ForwardedRef<TSwipeableWithDeleteRef>) {
  let r = useRef<null | Swipeable>(null)
  useImperativeHandle(ref, () => {
    return {
      close(){
        r.current?.close()
      }
    }
  }, [])
  return (
    <Swipeable ref={r} renderRightActions={props.renderRightActions ? props.renderRightActions : () => {
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
})