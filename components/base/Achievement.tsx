import { View, Text } from './Themed'
import React from 'react'
import tw from 'twrnc'
import { Text as DText } from 'react-native'

export default function Achievement(props: {color?: string} & DText['props']) {
    return (
        <View style={tw`p-.5 border border-${props.color || 'red'}-500 rounded`}>
            <Text {...props} style={{ ...tw`text-${props.color || 'red'}-500 text-center`, fontSize: 8 }}>{props.children}</Text>
        </View>
    )
}