import { TouchableOpacity } from 'react-native';
import { View, Text } from '../base/Themed'
import React from 'react'
import tw from 'twrnc'

export default function ManageButton(props: { vertical?: boolean, title?: string, buttonText?: string, onPress?: () => void; hidden?: boolean}) {
    return <View style={tw`${props.vertical ? 'items-start' : "flex-row items-center justify-between w-12/12"}`}>
        <Text h3>{props.title || 'Manage'}</Text>
        {!props.hidden && <TouchableOpacity onPress={() => {
            props.onPress && props.onPress()
        }}>
            <Text style={tw`text-red-600`}>{props.buttonText || 'Manage'}</Text>
        </TouchableOpacity>}
    </View>
}