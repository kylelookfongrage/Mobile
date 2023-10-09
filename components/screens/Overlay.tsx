import { View as DefaultView, useColorScheme } from 'react-native'
import React from 'react'
import { Incubator } from 'react-native-ui-lib'
import Colors from '../../constants/Colors';
import tw from 'twrnc'
import { View } from '../base/Themed';

export default function Overlay(props: {visible?: boolean; onDismiss?: () => void, excludeBanner?: boolean, dialogueHeight?: number, dynamicHeight?: boolean} & DefaultView['props']) {
    const dm = useColorScheme() === 'dark'
    const color = dm ? Colors.dark : Colors.light
    return (
        <Incubator.Dialog
            width={'100%'}
            height={`${props.dialogueHeight ? props.dialogueHeight : (props.dynamicHeight ? undefined : 60)}%`}
            bottom
            visible={props?.visible}
            containerStyle={{ bottom: 0, backgroundColor: color.background, marginBottom: -5, padding: 20 }}
            modalProps={{}}
            onDismiss={() => {
                if (props?.onDismiss) props.onDismiss()
            }}
        >
            <View style={props.style} >
                {!props.excludeBanner && <View style={tw`self-center h-1 w-15 rounded-xl bg-gray-${dm ? '700' : '300'} -mt-2 mb-4`} />}
                {props.children}
            </View>
        </Incubator.Dialog>
    )
}