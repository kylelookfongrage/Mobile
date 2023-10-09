import { TextInput, useColorScheme } from 'react-native'
import React from 'react'
import tw from 'twrnc'

export default function TitleInput(props: TextInput['props']) {
    const dm = useColorScheme() === 'dark'
    return (
        <TextInput
            {...props}
            style={tw`text-2xl text-center font-bold text-${dm ? 'white' : "black"}`}
            multiline
            numberOfLines={2}
            placeholderTextColor={'gray'}
        />
    )
}