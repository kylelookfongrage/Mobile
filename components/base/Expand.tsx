import { TouchableOpacity, useColorScheme, View } from 'react-native'
import React from 'react'
import { Text } from './Themed'
import tw from 'twrnc'
import { ExpoIcon } from './ExpoIcon'
import Animated, { BounceInDown, FadeOut } from 'react-native-reanimated'

export function Expand(props: {header: string, body?: string, Component?: React.JSXElementConstructor<any>;}) {
    const {body, header, Component} = props;
    const dm = useColorScheme() === 'dark'
    const [showResult, setShowResult] = React.useState<boolean>(false);
    return (
        <View style={tw`w-12/12 mt-6 mb-4 border border-2 border-${dm ? "white" : "black"}`}>
            <TouchableOpacity style={tw`flex-row justify-between items-center px-7`} onPress={() => setShowResult(!showResult)}>
                <Text style={tw`py-2`} weight='semibold'>{header}</Text>
                <ExpoIcon name={`${showResult ? 'chevron-up' : 'chevron-down'}`} iconName='feather' size={25} color={`${dm ? 'white' : 'black'}`} />
            </TouchableOpacity>
            {showResult && <Animated.View entering={BounceInDown} exiting={FadeOut} style={tw`w-12/12 flex-row flex-wrap px-7 py-2`}>
               <View>
               {(body && !Component) && <Text>{body}</Text>}
                {Component && <Component />}
               </View>
            </Animated.View>}
        </View>
    )
}