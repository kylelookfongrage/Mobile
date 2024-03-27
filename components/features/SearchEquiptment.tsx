import { View, Text } from '../base/Themed'
import React, { useState } from 'react'
import tw from 'twrnc'
import { Image, useColorScheme } from 'react-native'
import SearchBar from '../inputs/SearchBar'
import { EquiptmentDao } from '../../types/EquiptmentDao'
import { Tables } from '../../supabase/dao'
import { FlatList, ScrollView } from 'react-native-gesture-handler'
import { Card, TouchableOpacity } from 'react-native-ui-lib'
import Spacer from '../base/Spacer'
import { ExpoIcon } from '../base/ExpoIcon'
import { _tokens } from '../../tamagui.config'
import { useGet } from '../../hooks/useGet'


export default function SearchEquiptment(props: {onSelect?: (item: Tables['equiptment']['Row'], selected?: boolean) => void; selected?: number[]}) {
    const dm = useColorScheme() === 'dark'
    const dao = EquiptmentDao()
    let g = useGet()
    const [equiptment, setEquiptment] = useState<Tables['equiptment']['Row'][]>([])
    return (
        <View style={{flex: 1}}>
            <SearchBar bg={dm ? _tokens.dark2 : _tokens.gray300} hideSearch hideClear height={'$5'} onSearch={async k => {
                let res = await dao.search(k)
                if (!res) return;
                setEquiptment(res as Tables['equiptment']['Row'][])
            }} />
            <Spacer />
            {equiptment.length === 0 && <Text>No equipment found</Text>}
           <ScrollView horizontal>
           <FlatList data={equiptment} renderItem={({item, index}) => {
                const selected = (props.selected || []).includes(item.id)
                return <TouchableOpacity style={{flex: 1, width: g.s.width * 0.95}} onPress={() => {
                    if (props.onSelect) {
                        props.onSelect(item, selected)
                    }
                }} key={`Equiptment Search=` + item.id}>
                    <EquiptmentTile item={item} selected={selected} />
                </TouchableOpacity>
            }} />
           </ScrollView>
        </View>
    )
}


export const EquiptmentTile = (props: {item: Tables['equiptment']['Row'], selected?: boolean }) => {
    const {item, selected} = props;
    return <View key={`Equiptment Search=` + item.id} style={tw`mb-3 flex-row items-center justify-between`}>
        <View style={tw`flex-row items-center`}>
        <Image source={{uri: item.image}} style={tw`h-12 w-12 rounded mr-2`} />
        <Text weight='bold' lg>{item.name}</Text>
        {item.gym && <View style={tw`p-.5 border border-red-500 rounded ml-2`}>
            <Text style={{...tw`text-red-500`, fontSize: 8}}>GYM</Text>
        </View>}
        </View>
        {selected && <View>
            <ExpoIcon name='checkmark-circle' iconName='ion' size={23} color='red' />
            </View>}
    </View>
}