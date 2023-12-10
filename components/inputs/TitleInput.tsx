import { TextInput, useColorScheme } from 'react-native'
import React from 'react'
import tw from 'twrnc'

export default function TitleInput(props: TextInput['props']) {
    const dm = useColorScheme() === 'dark'
    return (
        <TextInput
            {...props}
            style={{...tw`text-${dm ? 'white' : "black"}`, fontSize: 32, fontFamily: 'Urbanist_700Bold'}}
            multiline
            numberOfLines={2}
            placeholderTextColor={'gray'}
        />
    )
}