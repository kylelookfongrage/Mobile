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

interface ListExerciseProps {
    workoutId?: string;
    editable?: boolean;
    userId?: string;
}
export default function ListExercise(props: ListExerciseProps) {
    const { profile } = useSelector(x => x.auth)
    const searchOptions = ['All Exercises', 'My Exercises', 'Favorites']
    let dao = SearchDao()
    let navigator = useNavigation()
    const fetchExerciseResults = async (keyword: string, option: string) => {
        let res = await dao.search('exercise', {
            keyword, keywordColumn: 'name', selectString: `
            *, author: user_id(username)
        `, belongsTo: option === 'My Exercises' ? profile?.id : props.userId, favorited: option === 'Favorites', user_id: profile?.id
        })
        return res;
    }
    return <SearchScreen name='Exercises' onSearch={fetchExerciseResults} searchOptions={searchOptions} excludeOptions={[props.userId ? "My Exercises" : 'null']} table='exercise' Item={p => {
        return <ExerciseSearchResult item={p.item} idx={p.index} onPress={(id) => {
            let screen = getMatchingNavigationScreen('ExerciseDetail', navigator)
            if (!screen) return; //@ts-ignore
            navigator.navigate(screen, { workoutId: props.workoutId, id })
        }} />
    }} />
}


const ExerciseSearchResult = (props: { idx: number, item: Tables['exercise']['Row'], onPress: (id: number) => void; }) => {
    const { idx, item: r, onPress } = props;
    return <SearchResult name={r.name || ''} img={r.preview} onPress={() => {
        if (onPress) onPress(r.id)
    }}>
        {/* @ts-ignore */}
        <Text style={tw`text-gray-500 text-xs`}>@{r?.author?.username || 'rage'}</Text>
    </SearchResult>
}