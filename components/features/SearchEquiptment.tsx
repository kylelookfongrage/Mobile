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
import SupabaseImage from '../base/SupabaseImage'
import Overlay from '../screens/Overlay'
import { defaultImage } from '../../data'


export default function SearchEquiptment(props: {onSelect?: (item: Tables['equiptment']['Row'], selected?: boolean) => void; selected?: number[]}) {
    const dm = useColorScheme() === 'dark'
    const dao = EquiptmentDao()
    let g = useGet()
    const [equiptment, setEquiptment] = useState<Tables['equiptment']['Row'][]>([])
    const [selectedEquipment, setSelectedEquipment] = useState<Tables['equiptment']['Row'] | null>(null)
    return (
        <View style={{flex: 1}}>
            <SearchBar bg={dm ? _tokens.dark2 : _tokens.gray300} full height={'$5'} onSearch={async k => {
                let res = await dao.search(k)
                if (!res) return;
                setEquiptment(res as Tables['equiptment']['Row'][])
            }} />
            <Spacer />
            <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false}>
                {equiptment.length === 0 && <Text>No equipment found</Text>}
            {equiptment.map(item => {
                const selected = (props.selected || []).includes(item.id)
                return <TouchableOpacity onLongPress={() => setSelectedEquipment(item)} style={{flex: 1, width: g.s.width * 0.95}} onPress={() => {
                    if (props.onSelect) {
                        props.onSelect(item, selected)
                    }
                }} key={`Equiptment Search=` + item.id}>
                    <EquiptmentTile item={item} selected={selected} />
                </TouchableOpacity>
            })}
                </ScrollView>
                <EquipmentDetailsOverlay selectedEquipment={selectedEquipment} onDismiss={() => setSelectedEquipment(null)} />
        </View>
    )
}


export const EquipmentDetailsOverlay = (props: {selectedEquipment: Tables['equiptment']['Row'] | null, onDismiss: () => void}) => {
    let {selectedEquipment} = props;
    let g = useGet()
    return <Overlay whiteBanner ignoreBackdrop bg={_tokens.primary900} dialogueHeight={60} visible={selectedEquipment ? true : false} onDismiss={props.onDismiss}>
    <View style={tw`flex-row items-start justify-around`}>
        <View style={tw`max-w-8/12`}>
        <Text white h3 bold>{selectedEquipment?.name}</Text>
        <Spacer sm/>
        <Text white>{selectedEquipment?.description}</Text>
        </View>
        {selectedEquipment?.image && <SupabaseImage uri={selectedEquipment?.image || defaultImage} style={{width: g.s.width * 0.27, height: g.s.width * 0.27, borderRadius: 3}} />}
    </View>
    {selectedEquipment?.suggested_use && <View>
        <Spacer />
            <Text white bold h5>Suggested Use</Text>
            <Spacer sm />
            <Text white>{selectedEquipment?.suggested_use}</Text>
        </View>}
</Overlay>
}


export const EquiptmentTile = (props: {item: Tables['equiptment']['Row'], selected?: boolean }) => {
    const {item, selected} = props;
    return <View key={`Equiptment Search=` + item.id} style={tw`mb-3 flex-row items-center justify-between`}>
        <View style={tw`flex-row items-center`}>
        <SupabaseImage uri={item.image} style={tw`h-12 w-12 rounded mr-2`} />
        <View>
        <Text lg>{item.name}</Text>
        {item.gym && <GymIcon />}
        </View>
        </View>
        {selected && <View>
            <ExpoIcon name='checkbox' iconName='ion' size={23} color={_tokens.primary900} />
            </View>}
    </View>
}


export const GymIcon = () => {
    return <View style={{...tw`p-.5 mt-1 border rounded w-8`, borderColor: _tokens.primary900, backgroundColor: _tokens.primary900+'80'}}>
            <Text weight='semibold' style={{...tw`text-center`, fontSize: 10, color: _tokens.white}}>GYM</Text>
        </View>
}