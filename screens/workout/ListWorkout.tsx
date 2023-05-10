import { ScrollView, View, Image, TextInput, TouchableOpacity } from 'react-native'
import React from 'react'
import { Text } from '../../components/Themed'
import { SafeAreaView } from 'react-native-safe-area-context'
import tw from 'twrnc'
import { ExpoIcon } from '../../components/ExpoIcon'
import useColorScheme from '../../hooks/useColorScheme'
import { useDebounce } from '../../hooks/useDebounce'
import { useNavigation } from '@react-navigation/native'
import { BackButton } from '../../components/BackButton'
import { defaultImage, getMatchingNavigationScreen, isStorageUri } from '../../data'
import { DataStore, Storage } from 'aws-amplify'
import { User, Workout } from '../../aws/models'
import { useCommonAWSIds } from '../../hooks/useCommonContext'

export interface ListWorkoutSearchResultsType {
  name: string; 
  id: string;
  img: string;
  author: string;
  favorited: boolean;
  numberOfExercises: number
}



export default function ListWorkout() {
  const {userId} = useCommonAWSIds()
  const navigator = useNavigation()
  const dm = useColorScheme() === 'dark'
  const color = dm ? 'white' : 'black'
  const [searchKey, setSearchKey] = React.useState<string>()
  const debouncedSearchTerm = useDebounce(searchKey, 500);
  const searchOptions = ['All', 'My Workouts'] as const 
  const [selectedOption, setSelectedOption] = React.useState<typeof searchOptions[number]>(searchOptions[0])
  const [results, setResults] = React.useState<ListWorkoutSearchResultsType[]>([])
  const fetchWorkoutResults = async () => {
    const workoutsWithoutImages = await DataStore.query(Workout, x => x.and(wo => [
      debouncedSearchTerm ? wo.name.contains(debouncedSearchTerm) : wo.name.ne(''),
      wo.img.ne(''), selectedOption === 'My Workouts' ? wo.userID.eq(userId) : wo.userID.ne(''),
    ]), {sort: wo => wo.WorkoutPlayDetails('DESCENDING'), limit: 20})
    const workoutsWithImages: ListWorkoutSearchResultsType[] = await Promise.all(workoutsWithoutImages.map(async wo => {
      const user = await DataStore.query(User, wo.userID)
      const author = user?.username || ''
      let img = wo.img || defaultImage
      if (wo.img && isStorageUri(wo.img)) {
        img = await Storage.get(wo.img)
      } 
      return {name: wo.name, id: wo.id, author, img, favorited: false, numberOfExercises: (await wo.WorkoutDetails.toArray()).length}
    }))
    setResults(workoutsWithImages)
  }
  React.useEffect(() => {
    fetchWorkoutResults()
  }, [debouncedSearchTerm, selectedOption])

  React.useEffect(() => {}, [selectedOption])
  return (
    <View style={{flex: 1}}>
    <BackButton name='Workouts' />
    <ScrollView contentContainerStyle={[tw`px-4 pb-20`]} showsVerticalScrollIndicator={false}>
        <View style={tw`flex flex-row items-center py-3 px-5 mt-6 w-12/12 bg-${dm ? 'gray-600' : 'gray-300'} rounded-xl`}>
          <ExpoIcon name='search' iconName='feather' color='gray' size={25} />
          <TextInput
            placeholder='Name'
            placeholderTextColor={dm ? 'white' : 'gray'}
            style={tw`w-9/12 py-2 px-3 text-${dm ? 'white' : 'black'}`}
            value={searchKey} onChangeText={setSearchKey}
          />
        </View>
        <View style={tw`flex-row justify-between py-4 px-5`}>
            {searchOptions.map((o, i) => {
              const selected = selectedOption === o
              return <TouchableOpacity 
                      key={`Search option ${o} at idx ${i}`} 
                      style={tw`items-center py-2 px-5 ${selected ? 'border-b border-' + color : ''}`}
                      onPress={() => setSelectedOption(o)}>
                <Text 
                  weight={selected ? 'semibold' : 'regular'}>{o}</Text>
              </TouchableOpacity>
            })}
          </View>
          {results.length === 0 && <View style={tw`w-12/12 justify-center items-center mt-15`}><Text style={tw`text-xl`} weight='bold'>No results to display</Text></View>}
          {results.map((r, idx) => {
            return <TouchableOpacity onPress={() => {
              const screen = getMatchingNavigationScreen('WorkoutDetail', navigator)
              //@ts-ignore
              navigator.navigate(screen, {id: r.id, editable: false})
            }} key={`search result at index ${idx}`} 
            style={tw`my-2 flex-row items-center justify-between shadow rounded-lg py-4 px-6 bg-${dm ? 'gray-700' : 'gray-300'}`}>    
                <View style={tw`flex items-start max-w-8/12 justify-around`}>
                    <Text style={tw`text-xl`} weight='bold'>{r.name}</Text>
                    <Text style={tw`text-${dm ? 'red-300' : 'red-700'}`}>by {r.author}</Text>
                    <Text>{r.numberOfExercises} exercises</Text>
                </View>
                <Image source={{uri: r.img}} style={tw`w-25 h-25 rounded`} />
            </TouchableOpacity>
          })}
    </ScrollView>
    </View>
  )
}