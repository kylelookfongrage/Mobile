import { View, Text } from '../base/Themed'
import React, { useEffect, useState } from 'react'
import tw from 'twrnc'
import { ExpoIcon } from '../base/ExpoIcon'
import { TextInput, TouchableOpacity, useColorScheme } from 'react-native'
import { useDebounce } from '../../hooks/useDebounce'
import Input from '../base/Input'
//@ts-ignore
import { v4 as uuidv4 } from 'uuid';

export default function SearchBar(props: {onSearch?: (v: string) => void; full?: boolean}) {
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
    return <Input id={uuid} width={props.full ? '100%' : '95%'} placeholder='search...' iconLeft='Search' canClear value={keyword} textChange={setKeyword} />
}