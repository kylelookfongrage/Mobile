import React from 'react'
import { Text } from '../../components/base/Themed'
import tw from 'twrnc'
import { useNavigation } from '@react-navigation/native'
import { getMatchingNavigationScreen } from '../../data'
import { Tables } from '../../supabase/dao'
import SearchScreen from '../../components/screens/SearchScreen'
import { SearchDao } from '../../types/SearchDao'
import SearchResult from '../../components/base/SearchResult'
import { useSelector } from '../../redux/store'


export default function ListExercise() {
    const { profile } = useSelector(x => x.auth)
    const searchOptions = ['All Plans', 'My Plans', 'Favorites']
    let dao = SearchDao()
    let navigator = useNavigation()
    const fetchPlans = async (keyword: string, option: string) => {
        let res = await dao.search('fitness_plan', {
            keyword, keywordColumn: 'name', selectString: `
            *, author: user_id(username)
        `, belongsTo: option === 'My Plans' ? profile?.id : undefined, favorited: option === 'Favorites', user_id: profile?.id
        })
        return res;
    }
    return <SearchScreen name='Fitness Plans' onSearch={fetchPlans} searchOptions={searchOptions} table='fitness_plan' Item={p => {
        return <PlanSearchResult item={p.item} idx={p.index} onPress={(id) => {
            let screen = getMatchingNavigationScreen('FitnessPlan', navigator)
            if (!screen) return; //@ts-ignore
            navigator.navigate(screen, { id })
        }} />
    }} />
}


const PlanSearchResult = (props: { idx: number, item: Tables['fitness_plan']['Row'], onPress: (id: number) => void; }) => {
    const { idx, item: r, onPress } = props;
    return <SearchResult name={r.name || ''} img={r.image} onPress={() => {
        if (onPress) onPress(r.id)
    }}>
        {/* @ts-ignore */}
        <Text style={tw`text-gray-500 text-xs`}>@{r?.author?.username || 'rage'}</Text>
    </SearchResult>
}