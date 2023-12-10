import { View, Text } from '../base/Themed'
import React, { useState } from 'react'
import tw from 'twrnc'
import { Image, useColorScheme } from 'react-native'
import SearchBar from '../inputs/SearchBar'
import { EquiptmentDao } from '../../types/EquiptmentDao'
import { Tables } from '../../supabase/dao'
import { FlatList } from 'react-native-gesture-handler'
import { Card, TouchableOpacity } from 'react-native-ui-lib'
import Spacer from '../base/Spacer'
import { ExpoIcon } from '../base/ExpoIcon'

const testEquiptment: Tables['equiptment']['Row'][] = [
    {name: 'Barbell', created_at: '', id: 123, description: '', gym: true, image: 'https://yorkbarbell.com/wp-content/uploads/2017/01/2021_100LBContourCastIronSpinlockSet.jpg', user_id: null},
    {name: 'Dumbbell', created_at: '', id: 345, description: '', gym: false, image: 'https://yorkbarbell.com/wp-content/uploads/2017/01/2021_100LBContourCastIronSpinlockSet.jpg', user_id: null},
    {name: 'Row Machine', created_at: '', id: 567, description: '', gym: true, image: 'https://yorkbarbell.com/wp-content/uploads/2017/01/55018_55019_low-row-machine2_low.jpg', user_id: null},
]
export default function SearchEquiptment(props: {onSelect?: (item: Tables['equiptment']['Row'], selected?: boolean) => void; selected?: number[]}) {
    const dm = useColorScheme() === 'dark'
    const dao = EquiptmentDao()
    const [equiptment, setEquiptment] = useState<Tables['equiptment']['Row'][]>([])
    return (
        <View style={{flex: 1}}>
            <SearchBar onSearch={async k => {
                let res = await dao.search(k)
                if (!res) return;
                setEquiptment(res as Tables['equiptment']['Row'][])
            }} />
            <Spacer />
            {equiptment.length === 0 && <Text>No equipment found</Text>}
            <FlatList data={equiptment} renderItem={({item, index}) => {
                const selected = (props.selected || []).includes(item.id)
                return <TouchableOpacity onPress={() => {
                    if (props.onSelect) {
                        props.onSelect(item, selected)
                    }
                }} key={`Equiptment Search=` + item.id}>
                    <EquiptmentTile item={item} selected={selected} />
                </TouchableOpacity>
                
                // <Card key={`Equiptment Search=` + item.id}>
                //     <Card.Image source={{uri: item.image}} />
                //     <Card.Section>
                //         <Text>{item.name}</Text>
                //     </Card.Section>
                // </Card>
            }} />
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