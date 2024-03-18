import React from 'react'
import { Text, View } from '../../components/base/Themed'
import tw from 'twrnc'
import { useNavigation } from '@react-navigation/native'
import { getMatchingNavigationScreen } from '../../data'
import { SearchDao } from '../../types/SearchDao'
import SearchScreen from '../../components/screens/SearchScreen'
import SearchResult from '../../components/base/SearchResult'
import { Tables } from '../../supabase/dao'
import { supabase } from '../../supabase'
import { useSelector } from '../../redux/store'

export interface ListWorkoutSearchResultsType {
  name: string;
  id: string;
  img: string;
  author: string;
  favorited: boolean;
  userID: string;
  numberOfExercises: number;
  premium?: boolean | null | undefined;
}


interface ListWorkoutProps {
  exerciseId?: string;
  userId?: string;
  fromExerciseId?: number;
  planId?: string;
  dow?: number
  task_id?: string;
}
export default function ListWorkout(props: ListWorkoutProps) {
  console.log(props)
  const { profile } = useSelector(x => x.auth)
  const navigator = useNavigation()
  let dao = SearchDao()
  const searchOptions = ['All Workouts', 'My Workouts', 'Favorites']
  const fetchWorkouts = async (keyword: string, option: string) => {
    if (!props.fromExerciseId) {
      let res = await dao.search('workout', {
        keyword, keywordColumn: 'name', selectString: `
          *, author: user_id(username)`,
        belongsTo: option === 'My Workouts' ? profile?.id : props.userId,
        favorited: option === 'Favorites', user_id: profile?.id
      })
      return res;
    } else {
      let res = await supabase.from('workout').select('*, author:user_id(username), workout_details!inner(*)').filter('workout_details.exercise_id', 'eq', props.fromExerciseId)
      return res.data
    }
  }
  return <SearchScreen name='Workouts' onSearch={fetchWorkouts} searchOptions={searchOptions} excludeOptions={props.fromExerciseId ? searchOptions : [props.userId ? "My Workouts" : 'null']} table='workout' Item={p => {
    return <WorkoutSearchResult item={p.item} idx={p.index} onPress={(id) => {
      let screen = getMatchingNavigationScreen('WorkoutDetail', navigator)
      if (!screen) return; //@ts-ignore
      navigator.navigate(screen, { id, dow: props.dow, planId: props.planId, task_id: props.task_id, fromList: true })
    }} />
  }} />
}

const WorkoutSearchResult = (props: { idx: number, item: Tables['workout']['Row'], onPress: (id: number) => void; }) => {
  const { idx, item: r, onPress } = props;
  return <SearchResult name={r.name || ''} img={r.image} onPress={() => {
    if (onPress) onPress(r.id)
  }}>
    {/* @ts-ignore */}
    <Text style={tw`text-gray-500`}>@{r?.author?.username || 'rage'}</Text>
  </SearchResult>
}