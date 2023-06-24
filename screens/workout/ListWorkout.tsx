import { ScrollView, Image, TextInput, TouchableOpacity } from 'react-native'
import React from 'react'
import { Text, View } from '../../components/Themed'
import tw from 'twrnc'
import { ExpoIcon } from '../../components/ExpoIcon'
import useColorScheme from '../../hooks/useColorScheme'
import { useDebounce } from '../../hooks/useDebounce'
import { useNavigation } from '@react-navigation/native'
import { BackButton } from '../../components/BackButton'
import { defaultImage, getMatchingNavigationScreen, isStorageUri } from '../../data'
import { DataStore, Storage } from 'aws-amplify'
import { Exercise, User, Workout } from '../../aws/models'
import { useCommonAWSIds } from '../../hooks/useCommonContext'
import { WorkoutDetails } from '../../aws/models'
import { useExerciseAdditions } from '../../hooks/useExerciseAdditions'
import { ErrorMessage } from '../../components/ErrorMessage'

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
}
export default function ListWorkout(props: ListWorkoutProps) {
  const {exerciseId} = props;
  const {userId} = useCommonAWSIds()
  const navigator = useNavigation()
  const dm = useColorScheme() === 'dark'
  const color = dm ? 'white' : 'black'
  const [searchKey, setSearchKey] = React.useState<string>()
  const debouncedSearchTerm = useDebounce(searchKey, 500);
  const searchOptions = ['All', 'My Workouts'] as const 
  const [selectedOption, setSelectedOption] = React.useState<typeof searchOptions[number]>(searchOptions[0])
  const [results, setResults] = React.useState<ListWorkoutSearchResultsType[]>([])
  const [errors, setErrors] = React.useState<string[]>([])

  React.useEffect(() => {
    if (exerciseId) setSelectedOption('My Workouts')
  }, [exerciseId])

  const fetchWorkoutResults = async () => {
    const workoutsWithoutImages = await DataStore.query(Workout, x => x.and(wo => [
      debouncedSearchTerm ? wo.name.contains(debouncedSearchTerm) : wo.name.ne(''),
      wo.img.ne(''), selectedOption === 'My Workouts' ? wo.userID.eq(userId) : wo.userID.ne(''),
    ]),  { limit: 40 })
    const workoutsWithImages: ListWorkoutSearchResultsType[] = await Promise.all(workoutsWithoutImages.map(async wo => {
      const user = await DataStore.query(User, wo.userID)
      const author = user?.username || ''
      let img = wo.img || defaultImage
      if (wo.img && isStorageUri(wo.img)) {
        img = await Storage.get(wo.img)
      } 
      return {name: wo.name, userID: wo.userID, id: wo.id, author, img, favorited: false, premium:wo.premium, numberOfExercises: (await wo.WorkoutDetails.toArray()).length}
    }))
    setResults(workoutsWithImages)
  }
  React.useEffect(() => {
    fetchWorkoutResults()
  }, [debouncedSearchTerm, selectedOption])

  React.useEffect(() => {}, [selectedOption])
  const {setWorkouts, workouts} = useExerciseAdditions()
  return (
    <View style={{flex: 1}} includeBackground>
    <BackButton name='Workouts' />
    <ScrollView contentContainerStyle={[tw`px-4 pb-20`]} showsVerticalScrollIndicator={false}>
        {errors.length > 0 && <View style={tw`mt-6`}>
          <ErrorMessage errors={errors} onDismissTap={() => setErrors([])} />
          </View>}
        <View style={tw`flex flex-row items-center py-3 px-5 mt-6 w-12/12 bg-${dm ? 'gray-600' : 'gray-300'} rounded-xl`}>
          <ExpoIcon name='search' iconName='feather' color='gray' size={25} />
          <TextInput
            placeholder='Name'
            placeholderTextColor={dm ? 'white' : 'gray'}
            style={tw`w-9/12 py-2 px-3 text-${dm ? 'white' : 'black'}`}
            value={searchKey} onChangeText={setSearchKey}
          />
        </View>
        <View style={tw`flex-row justify-around py-4 px-5`}>
            {searchOptions.map((o, i) => {
              const selected = selectedOption === o
              if (exerciseId && o !== 'My Workouts') return;
              return <TouchableOpacity 
                      key={`Search option ${o} at idx ${i}`} 
                      style={tw`items-center py-2 px-5 ${selected ? 'border-b border-' + color : ''}`}
                      onPress={() => setSelectedOption(o)}>
                <Text 
                  weight={selected ? 'semibold' : 'regular'}>{o}</Text>
              </TouchableOpacity>
            })}
          </View>
          {results.length === 0 && <View style={tw`w-12/12 justify-center items-center my-9`}><Text>No results to display</Text></View>}
          {results.map((r, idx) => {
            return <TouchableOpacity onPress={async () => {
              if (exerciseId) {
                const exercise = await DataStore.query(Exercise, exerciseId)
                if (!exercise) {
                  setErrors(['There was a problem, please try again'])
                  return;
                }
                if (r.premium === true && exercise.userID !== userId) {
                  console.log('setting workouts')
                  setErrors(['You cannot add this exercise to a premium workout, because you did not make this exercise'])
                } else {
                  const potentialWorkouts = await DataStore.query(WorkoutDetails, w=> w.and( x => [
                    x.workoutID.eq(r.id), x.exerciseID.eq(exerciseId)
                  ]) )
                  const newWorkouts = [...workouts]
                  newWorkouts.push({id: r.id, name: r.name, img: r.img, addedAlready: potentialWorkouts.length > 0})
                  setWorkouts(newWorkouts)
                  //@ts-ignore
                  navigator.pop()
                }
              }else {
                const screen = getMatchingNavigationScreen('WorkoutDetail', navigator)
                //@ts-ignore
                navigator.navigate(screen, {id: r.id, editable: false})
              }
            }} key={`search result at index ${idx}`} 
            style={tw`my-2 flex-row items-center justify-between shadow rounded-lg py-4 px-6 bg-${dm ? 'gray-700' : 'gray-400/20'}`}>    
                <View style={tw`flex items-start max-w-8/12 justify-around`}>
                    <Text style={tw``} weight='semibold'>{r.name}</Text>
                    <Text style={tw`text-xs text-red-500`}>@{r.author}</Text>
                    <Text style={tw`text-xs text-gray-500`}>{r.numberOfExercises} exercises</Text>
                </View>
                <Image source={{uri: r.img}} style={tw`w-15 h-15 rounded`} />
            </TouchableOpacity>
          })}
    </ScrollView>
    </View>
  )
}