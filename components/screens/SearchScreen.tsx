import { View, Text } from '../base/Themed'
import React, { useState } from 'react'
import { useCommonAWSIds } from '../../hooks/useCommonContext'
import useAsync from '../../hooks/useAsync';
import { Tables } from '../../supabase/dao';
import { BackButton } from '../base/BackButton';
import SearchBar from '../inputs/SearchBar';
import Spacer from '../base/Spacer';
import { ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import tw from 'twrnc'

export type TSearch = keyof Tables;
export default function SearchScreen<T extends string[]>(
    props: {
        onSearch?: (keyword: string | null | undefined, options: T[number]) => Promise<Tables[TSearch]['Row'][] | null>;
        searchOptions: T;
        excludeOptions: T;
        table: TSearch;
        name?: string;
        Item: ((props: {
            item: Tables[TSearch]['Row'], index: number;
        }) => React.ReactElement<any>)
    }) {
    const { Item } = props
    const [searchKey, setSearchKey] = React.useState<string>('')
    const searchOptions = props.searchOptions || [] as const
    const dm = useColorScheme() === 'dark'
    const color = dm ? 'white' : 'black'
    const [selectedOption, setSelectedOption] = useState<typeof searchOptions[number]>(props.searchOptions[0])
    let [results, setResults] = useState<Tables[TSearch]['Row'][]>([])
    useAsync(async () => {
        if (props.onSearch) {
            let res = await props.onSearch(searchKey, selectedOption)
            if (res && res.length > 0) {
                setResults(res)
            }
        }
    }, [selectedOption, searchKey])
    return <View style={{ flex: 1 }} includeBackground>
        <BackButton name='Exercises' />
        <SearchBar onSearch={x => setSearchKey(x)} />
        <Spacer />
        <View style={tw`flex-row justify-around`}>
            {searchOptions.map((o, i) => {
                if (props.excludeOptions && props.excludeOptions.includes(o)) return <View key={`Search option ${o} at idx ${i}`} />;
                const selected = selectedOption === o
                return <TouchableOpacity
                    key={`Search option ${o} at idx ${i}`}
                    style={tw`items-center py-2 px-5 ${selected ? 'border-b border-' + color : ''}`}
                    onPress={() => setSelectedOption(o)}>
                    <Text
                        weight={selected ? 'semibold' : 'regular'}>{o}</Text>
                </TouchableOpacity>
            })}
        </View>
        <Spacer />
        <ScrollView
            keyboardDismissMode='interactive'
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[tw`px-3 pb-20`]}>
            {results.length === 0 && <View style={tw`w-12/12 justify-center items-center mt-9`}><Text>No results to display</Text></View>}
            {results.map((r, idx) => {
                return <Item index={idx} item={r} />
            })}
        </ScrollView>
    </View>
}