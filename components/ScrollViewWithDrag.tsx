import { View, Text, ScrollView } from 'react-native'
import React, { useMemo, useRef } from 'react'
import Animated from 'react-native-reanimated'
import tw from 'twrnc'

type ScrollProps = ScrollView['props'] & {TopView: React.JSXElementConstructor<any>; rerenderTopView?: any[]}
export default function ScrollViewWithDrag(props: ScrollProps) {
    const scroll = useRef(new Animated.Value(0)).current
    const {TopView} = props;
    const MemoizedTopView = useMemo(() => TopView, props.rerenderTopView || [])
  return (
    <Animated.ScrollView scrollEventThrottle={5} {...props} onScroll={Animated.event([{nativeEvent: {contentOffset: {y: scroll}}}], {useNativeDriver: true})}>

        <Animated.View style={[{
            flex: 1,
            transform: [{translateY: Animated.multiply(scroll, 0.8)}]
        }]}>
        {props.TopView && <MemoizedTopView />}
        </Animated.View>
        <View>
        {props.children && props.children}
        </View>
    </Animated.ScrollView>
  )
}