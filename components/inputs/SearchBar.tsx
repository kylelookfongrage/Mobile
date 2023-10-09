import { View, Text } from '../base/Themed'
import React, { useEffect, useState } from 'react'
import tw from 'twrnc'
import { ExpoIcon } from '../base/ExpoIcon'
import { TextInput, TouchableOpacity, useColorScheme } from 'react-native'
import { useDebounce } from '../../hooks/useDebounce'

export default function SearchBar(props: {onSearch?: (v: string) => void; full?: boolean}) {
    const dm = useColorScheme() === 'dark'
    const [keyword, setKeyword] = useState<string>('')
    const debouncedKeyword = useDebounce(keyword, 800)
    useEffect(() => {
        if (props.onSearch) {
            props.onSearch(debouncedKeyword)
        }
    }, [debouncedKeyword])
    return (
        <View style={tw`${props.full ? 'w-12/12' : 'w-11/12'} self-center mx-2 flex-row items-center py-2 px-4 justify-between bg-gray-${dm ? '800' : '300'} rounded-3xl`}>
            <View style={tw`flex flex-row items-center`}>
                <ExpoIcon name='search' iconName='feather' color={'gray'} style={tw`pr-2`} size={25} />
                <TextInput value={keyword} onChangeText={setKeyword} placeholder='search...' style={tw`w-9/12 text-${dm ? 'white' : 'black'}`} />
            </View>
            <TouchableOpacity style={tw`p-2`} onPress={() => { setKeyword('') }}>
                <ExpoIcon name='x' iconName='feather' color={'gray'} style={tw``} size={20} />
            </TouchableOpacity>
        </View>
    )
}