import { ScrollView, Image, TextInput, TouchableOpacity } from 'react-native'
import React from 'react'
import { Text, View } from '../../components/base/Themed'
import tw from 'twrnc'
import { ExpoIcon } from '../../components/base/ExpoIcon'
import useColorScheme from '../../hooks/useColorScheme'
import { useDebounce } from '../../hooks/useDebounce'
import { useNavigation } from '@react-navigation/native'
import { BackButton } from '../../components/base/BackButton'
import { defaultImage, getMatchingNavigationScreen, isStorageUri } from '../../data'
import { DataStore, Storage } from 'aws-amplify'
import { Exercise, User, Workout } from '../../aws/models'
import { useCommonAWSIds } from '../../hooks/useCommonContext'
import { WorkoutDetails } from '../../aws/models'
import { useExerciseAdditions } from '../../hooks/useExerciseAdditions'
import { ErrorMessage } from '../../components/base/ErrorMessage'
import { SearchDao } from '../../types/SearchDao'
import SearchScreen from '../../components/screens/SearchScreen'
import SearchResult from '../../components/base/SearchResult'
import { Tables } from '../../supabase/dao'

export interface ListWorkoutSearchResultsType {
  name: string;
  id: string;
  img: string;
  author: string;
  favorited: boolean;
  userID: string;
  numberOfExercises: number;
  premium?: boolean | null | undefined
}


interface ListWorkoutProps {
  exerciseId?: string;
  userId?: string;
}
export default function ListWorkout(props: ListWorkoutProps) {
  const { exerciseId } = props;
  const { profile } = useCommonAWSIds()
  const navigator = useNavigation()
  let dao = SearchDao()
  const searchOptions = ['All Workouts', 'My Workouts', 'Favorites']
  const fetchWorkouts = async (keyword: string, option: string) => {
    let res = await dao.search('workout', {
      keyword, keywordColumn: 'name', selectString: `
        *, author: user_id(username)`,
      belongsTo: option === 'My Workouts' ? profile?.id : props.userId,
      favorited: option === 'Favorites', user_id: profile?.id
    })
    return res;
  }
  return <SearchScreen name='Workouts' onSearch={fetchWorkouts} searchOptions={searchOptions} excludeOptions={[props.userId ? "My Workouts" : 'null']} table='workout' Item={p => {
    return <WorkoutSearchResult item={p.item} idx={p.index} onPress={(id) => {
      let screen = getMatchingNavigationScreen('WorkoutDetail', navigator)
      if (!screen) return; //@ts-ignore
      navigator.navigate(screen, { id })
    }} />
  }} />
}

const WorkoutSearchResult = (props: { idx: number, item: Tables['workout']['Row'], onPress: (id: number) => void; }) => {
  const { idx, item: r, onPress } = props;
  return <SearchResult name={r.name || ''} img={r.image} onPress={() => {
    if (onPress) onPress(r.id)
  }}>
    {/* @ts-ignore */}
    <Text style={tw`text-red-500 text-xs`}>@{r?.author?.username || 'rage'}</Text>
  </SearchResult>
}