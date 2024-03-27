import React, { useEffect } from "react";
import { Text } from "../base/Themed";
import { View } from "../base/Themed";
import { ExpoIcon } from "../base/ExpoIcon";
import tw from 'twrnc'
import { Animated, Dimensions, ScrollView } from "react-native";
import * as Haptics from 'expo-haptics';
import useColorScheme from "../../hooks/useColorScheme";


interface RulerProps {
    onChange?: (v: number) => void;
    min?: number;
    max?: number;
    unit?: string;
    initial?: number;
    disabled?: boolean;
}
export const Ruler = (props: RulerProps) => {
    const { onChange, min, max, unit, initial, disabled } = props;
    const scrollx = React.useRef(new Animated.Value(min || 0)).current
    const scroll = React.useRef<ScrollView>();
    const [text, setText] = React.useState(0)
    const arrayLength = (max || 100) - (min || 0)
    const data = Array(arrayLength + 1).fill(0).map((_, i) => i + (min || 0))
    scrollx.addListener(({ value }) => {
        const textValue = Math.round(value / 23) + (min || 0)
        setText(textValue)
        onChange && onChange(textValue)
    })

    React.useEffect(() => {
        if (initial && scroll.current) {
            scroll.current.scrollTo({
                y: 0,
                x: (initial - (min || 0)) * 23,
                animated: true
            },)
            setText(initial)
        }
    }, [initial])

    React.useEffect(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }, [text])


    const dm = useColorScheme() === 'dark'
    return <View style={[{backgroundColor: 'transparent'}]}>
        <View style={tw`items-center justify-center mb-4`}>
            <Text style={tw`text-lg font-bold`}>{text}{' '}{unit}</Text>
            <ExpoIcon name='caret-down-outline' iconName='ion' size={25} color={dm ? 'white' : 'black'} />
        </View>
        <Animated.ScrollView
            horizontal
            ref={scroll}
            alwaysBounceHorizontal={false}
            onScroll={Animated.event(
                [{
                    nativeEvent: {
                        contentOffset: { x: scrollx }
                    }
                }], {
                useNativeDriver: false,
            })}
            scrollToOverflowEnabled
            scrollEnabled={!disabled === true}
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            snapToInterval={8}
            bounces={false}
        >
            <View style={[{
                width: (Dimensions.get('screen').width / 2) - 30
            }, tw``]} />
            {data.map((d, i) => {
                const tenth = d % 10 == 0
                return <View key={i} style={tw`items-center`} >
                    <View style={{
                        width: 3,
                        height: tenth ? 60 : 40,
                        backgroundColor: tenth ? '#333' : '#999',
                        marginHorizontal: 10
                    }} />
                    {tenth && <Text gray weight="bold" style={tw`mt-2`}>{d}</Text>}
                </View>

            })}
            <View style={{
                width: (Dimensions.get('screen').width / 2) - 30
            }} />
        </Animated.ScrollView>
    </View>
}
