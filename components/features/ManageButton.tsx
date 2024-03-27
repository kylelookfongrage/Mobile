import { TouchableOpacity } from 'react-native';
import { View, Text } from '../base/Themed'
import React from 'react'
import tw from 'twrnc'
import { _tokens } from '../../tamagui.config';

export default function ManageButton(props: { vertical?: boolean, disabled?: boolean, title?: string, buttonText?: string, onPress?: () => void; hidden?: boolean; style?: any; viewStyle?: any}) {
    return <View style={[tw`${props.vertical ? 'items-start' : "flex-row items-center justify-between w-12/12"}`, props.viewStyle]}>
        <Text h5={!props.style} weight='bold' style={props.style}>{props.title || 'Manage'}</Text>
        {!props.hidden && <TouchableOpacity disabled={props.disabled} onPress={() => {
            props.onPress && props.onPress()
        }}>
            <Text style={{color: _tokens.primary900}} weight='semibold' lg>{props.buttonText || 'Manage'}</Text>
        </TouchableOpacity>}
    </View>
}