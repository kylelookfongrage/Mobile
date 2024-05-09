import { Text, ScrollView, useColorScheme } from 'react-native'
import React, { useMemo, useRef } from 'react'
// import Animated from 'react-native-reanimated'
import tw from 'twrnc'
import LinearGradient from 'react-native-linear-gradient'
import Colors from '../../constants/Colors'
import BackgroundGradient from './BackgroundGradient'
import { View } from '../base/Themed'
import { Animated } from 'react-native'

type ScrollProps = ScrollView['props'] & {TopView: React.JSXElementConstructor<any>; rerenderTopView?: any[], gradient?: boolean, disableRounding?: boolean;}
export default function ScrollViewWithDrag(props: ScrollProps) {
    const scroll = useRef(new Animated.Value(0)).current
    const {TopView} = props;
    const dm = useColorScheme()
    const MemoizedTopView = useMemo(() => TopView, props.rerenderTopView || [])
    let colors = dm ? Colors.dark : Colors.light

  return (
    <Animated.ScrollView scrollEventThrottle={5} {...props} onScroll={Animated.event([{nativeEvent: {contentOffset: {y: scroll}}}], {useNativeDriver: true})}>

        <Animated.View style={[{
            flex: 1,
            transform: [{translateY: Animated.multiply(scroll, 0.8)}]
        }]}>
        {props.TopView && <MemoizedTopView />}
        </Animated.View>
        {!props.gradient && <View includeBackground style={tw`-mt-28 ${props.disableRounding ? '' : 'rounded-3xl'} h-12/12 w-12/12`}>
        {props.children && props.children}
        </View>}
        {props.gradient && <BackgroundGradient style={[tw`-mt-28`]}>
       <View style={props.style || {flex: 1, zIndex: 1}}>
       {props.children && props.children}
       </View>
          </BackgroundGradient>}
    </Animated.ScrollView>
  )
}