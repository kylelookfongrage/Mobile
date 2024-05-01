import { useColorScheme } from 'react-native'
import React, { useState } from 'react'
import { Text, View } from '../../components/base/Themed'
import tw from 'twrnc'
import { useNavigation } from '@react-navigation/native';
import { defaultImage, getMatchingNavigationScreen } from '../../data';
import { SearchDao } from '../../types/SearchDao';
import { Tables } from '../../supabase/dao';
import SearchScreen from '../../components/screens/SearchScreen';
import SearchResult from '../../components/base/SearchResult';
import { useSelector } from '../../redux/store';
import { useGet } from '../../hooks/useGet';

interface ListUserProps {

}

export default function ListProfile(props: ListUserProps) {
    let g = useGet()
    const {dm} = g;
    const navigator = useNavigation()
    let dao = SearchDao()


    async function fetchUsers(keyword: string, option: string) {
        let users: Tables['user']['Row'][] = [];
        let res = await dao.search('user', {
            keyword, keywordColumn: 'name', selectString: `*`
        })
        if (res) {
            users=res;
        }
        return users
    }

    return <SearchScreen name='Profiles' table='user' onSearch={fetchUsers} searchOptions={[]} Item={p => {
        return <UserSearchResult item={p.item} idx={p.index} onPress={(id) => {
            const screen = getMatchingNavigationScreen('User', navigator)
            //@ts-ignore
            navigator.navigate(screen, { id: id })
        }} />
    }}>

    </SearchScreen>
}


const UserSearchResult = (props: { idx: number, item: Tables['user']['Row'], onPress: (id: Tables['user']['Row']['id']) => void; }) => {
    const { idx, item: r, onPress } = props;
    return <SearchResult sm name={r.name || ''} img={r.pfp || defaultImage} onPress={() => {
        if (onPress) onPress(r.id)
    }}>
        {/* @ts-ignore */}
        <View>
            <Text gray sm>@{r?.username || 'rage'}</Text>
        </View>
    </SearchResult>
}
