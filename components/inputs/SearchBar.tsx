import { View, Text } from '../base/Themed'
import React, { useEffect, useState } from 'react'
import tw from 'twrnc'
import { ExpoIcon } from '../base/ExpoIcon'
import { TextInput, TouchableOpacity, useColorScheme } from 'react-native'
import { useDebounce } from '../../hooks/useDebounce'
import Input from '../base/Input'
//@ts-ignore
import { randomUUID as uuidv4 } from 'expo-crypto'

export default function SearchBar(props: {onSearch?: (v: string) => void; full?: boolean, bg?: string, height?: string | number, iconSize?: number; hideClear?: boolean; hideSearch?: boolean}) {
    const dm = useColorScheme() === 'dark'
    const [keyword, setKeyword] = useState<string>('')
    let [uuid] = useState(uuidv4())
    const debouncedKeyword = useDebounce(keyword, 800)
    useEffect(() => {
        if (props.onSearch) {
            props.onSearch(debouncedKeyword)
        }
    }, [debouncedKeyword])
    console.log(keyword)
    return <Input id={uuid} bg={props.bg} iconSize={props.iconSize} height={props.height} width={props.full ? '100%' : '95%'} placeholder='search...' iconLeft={props.hideSearch ? undefined : 'Search'} canClear={!props.hideClear} value={keyword} textChange={setKeyword} />
}