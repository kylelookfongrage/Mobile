import { View, Text } from '../base/Themed'
import React, { useState } from 'react'
import useAsync from '../../hooks/useAsync';
import { Tables } from '../../supabase/dao';
import { BackButton } from '../base/BackButton';
import SearchBar from '../inputs/SearchBar';
import Spacer from '../base/Spacer';
import { ActivityIndicator, Dimensions, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import tw from 'twrnc'
import { XGroup } from 'tamagui';
import { _tokens } from '../../tamagui.config';
import Selector from '../base/Selector';

export default function SearchScreen<T extends string[], K extends keyof Tables>(
    props: {
        onSearch?: (keyword: string, options: T[number]) => Promise<Tables[K]['Row'][] | null>;
        searchOptions: T;
        excludeOptions?: T;
        table: K;
        name?: string;
        Item: ((props: {
            item: Tables[K]['Row'], index: number;
        }) => React.ReactElement<any>)
    }) {
    const { Item } = props
    const [searchKey, setSearchKey] = React.useState<string>('')
    const searchOptions = props.searchOptions || [] as const
    const dm = useColorScheme() === 'dark'
    let availableOptions = [...searchOptions.filter(x => {
        if (!props.excludeOptions) return true
        return !props.excludeOptions.includes(x)
    })]
    const [selectedOption, setSelectedOption] = useState<typeof searchOptions[number]>(props.searchOptions[0])
    let [results, setResults] = useState<Tables[K]['Row'][]>([])
    let [uploading, setUploading] = useState<boolean>(false)
    useAsync(async () => {
        if (props.onSearch) {
            setUploading(true)
            try {
                let res = await props.onSearch(searchKey, selectedOption)
                if (res) {
                    setResults(res)
                }
            } catch (error) {

            } finally {
                setUploading(false)
            }
        }
    }, [selectedOption, searchKey])
    return <View style={{ flex: 1 }} includeBackground>
        <BackButton name={props.name} />
        <Spacer />
        <SearchBar onSearch={x => setSearchKey(x)} />
        <Spacer />
        <Selector searchOptions={availableOptions} selectedOption={selectedOption} onPress={setSelectedOption} />
        <Spacer />
        <ScrollView
            keyboardDismissMode='interactive'
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[tw`px-2 pb-20`]}>
            {uploading && <ActivityIndicator style={tw`mt-9`} size={'large'} />}
            {(results.length === 0 && !uploading ) && <View style={tw`w-12/12 justify-center items-center mt-9`}><Text>No results to display</Text></View>}
            {!uploading && results.map((r, idx) => {
                return <Item key={`search result at index ${idx}`} index={idx} item={r} />
            })}
        </ScrollView>
    </View>
}