import { TextInput, TouchableOpacity, useColorScheme, Image, RefreshControl } from 'react-native'
import React from 'react'
import { Text, View } from '../../components/base/Themed'
import { BackButton } from '../../components/base/BackButton'
import { ScrollView } from 'react-native-gesture-handler'
import tw from 'twrnc'
import { ExpoIcon } from '../../components/base/ExpoIcon'
import { useDebounce } from '../../hooks/useDebounce'
import { DataStore, Storage } from 'aws-amplify'
import { FavoriteType, Favorite, Exercise, User, Workout, Meal } from '../../aws/models'
import { useCommonAWSIds } from '../../hooks/useCommonContext'
import { defaultImage, getMatchingNavigationScreen, isStorageUri } from '../../data'
import { useNavigation } from '@react-navigation/native'

interface FavoriteResult {
  name: string;
  id: string;
  image: string;
  author: string;
}

export default function Favorites() {
  const searchOptions = ['Meals', 'Exercises', 'Workouts'] as const
  const [selectedOption, setSelectedOption] = React.useState<typeof searchOptions[number]>(searchOptions[0])
  const [searchKey, setSearchKey] = React.useState<string>('')
  const dm = useColorScheme() === 'dark'
  const color = dm ? 'white' : 'black'
  const debouncedSearchTerm = useDebounce(searchKey, 500)
  const [results, setResults] = React.useState<FavoriteResult[]>([])
  const { userId } = useCommonAWSIds()

  async function fetchResults() {
    const searchItem: FavoriteType = selectedOption === 'Meals' ? FavoriteType.MEAL : (selectedOption === 'Exercises' ? FavoriteType.EXERCISE : FavoriteType.WORKOUT)
    const items = await DataStore.query(Favorite, f => f.and(fav => [
      fav.userID.eq(userId), fav.type.eq(searchItem)
    ]), { limit: 50, sort: x => x.createdAt('DESCENDING') })
    if (items.length === 0) {
      setRefreshing(false)
      setResults([])
      return;
    }

    if (searchItem === FavoriteType.EXERCISE) {
      const exercises = await DataStore.query(Exercise, e => e.or(ex => items.map(i => ex.id.eq(i.potentialID))), { limit: 50 })
      const exercisesWithImages = await Promise.all(exercises.map(async exercise => {
        const user = await DataStore.query(User, exercise.userID)
        let defaultReturnItem = {
          name: exercise.title,
          id: exercise.id,
          image: defaultImage,
          author: user?.username || 'Rage'
        }
        const firstImage = exercise.preview || defaultImage
        defaultReturnItem['image'] = isStorageUri(firstImage) ? await Storage.get(firstImage) : firstImage

        return defaultReturnItem
      }))
      setResults(exercisesWithImages)
    }

    else if (searchItem === FavoriteType.WORKOUT) {
      const workouts = await DataStore.query(Workout, e => e.or(ex => items.map(i => ex.id.eq(i.potentialID))), { limit: 50 })
      const workoutsWithImages = await Promise.all(workouts.map(async workout => {
        const user = await DataStore.query(User, workout.userID)
        let defaultReturnItem = {
          name: workout.name,
          id: workout.id,
          image: defaultImage,
          author: user?.username || 'Rage'
        }
        const image = workout.img || defaultImage
        defaultReturnItem['image'] = isStorageUri(image) ? await Storage.get(image) : image
        return defaultReturnItem
      }))
      setResults(workoutsWithImages)
    }

    else if (searchItem === FavoriteType.MEAL) {
      const meals = await DataStore.query(Meal, e => e.or(ex => items.map(i => ex.id.eq(i.potentialID))), { limit: 50 })
      const mealsWIthImages = await Promise.all(meals.map(async meal => {
        const user = await DataStore.query(User, meal.userID)
        let defaultReturnItem = {
          name: meal.name,
          id: meal.id,
          image: defaultImage,
          author: user?.username || 'Rage'
        }
        const firstImage = meal.preview || defaultImage
        defaultReturnItem['image'] = isStorageUri(firstImage) ? await Storage.get(firstImage) : firstImage
        return defaultReturnItem
      }))
      setResults(mealsWIthImages)
      setRefreshing(false)
    }
  }

  React.useEffect(() => {
    fetchResults()
  }, [debouncedSearchTerm, selectedOption])
  const navigator = useNavigation()
  const [refreshing, setRefreshing] = React.useState<boolean>(false)
  return (
    <View style={{ flex: 1 }} includeBackground>
      <BackButton name='Favorites' />
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchResults} />} showsVerticalScrollIndicator={false} style={tw`mt-6 px-4`}>
        <View style={tw`flex flex-row items-center py-3 px-5 mt-6 w-12/12 bg-${dm ? 'gray-600' : 'gray-300'} rounded-xl`}>
          <ExpoIcon name='search' iconName='feather' color='gray' size={25} />
          <TextInput
            placeholder='Name'
            placeholderTextColor={'gray'}
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
        <View style={tw`pt-4`}>
          {results.length === 0 && <Text style={tw`text-center py-4`}>No favorites to display</Text>}
          {results.map((res, i) => {
            return <TouchableOpacity onPress={() => {
              let screenKey = 'MealDetail'
              if (selectedOption === 'Exercises') {
                screenKey = 'ExerciseDetail'
              } else if (selectedOption === 'Workouts') {
                screenKey = 'WorkoutDetail'
              }
              const screen = getMatchingNavigationScreen(screenKey, navigator)
              //@ts-ignore
              navigator.navigate(screen, { id: res.id, editable: false })
            }} key={res.id + `-${i}`} style={tw`flex-row items-center my-2 justify-between bg-gray-${dm ? '700' : '300'} p-3 rounded-xl`}>
              <View style={tw`flex-row items-center`}>
                <Image source={{ uri: res.image || defaultImage }} style={tw`h-15 w-15 rounded-xl`} />
                <View style={tw`ml-3 max-w-8.5/12`}>
                  <Text style={tw``}>{res.name}</Text>
                  <Text>By {<Text style={tw`text-red-500`}>{res.author}</Text>}</Text>
                </View>
              </View>
              <ExpoIcon name='chevron-right' color='gray' iconName='feather' size={20} />
            </TouchableOpacity>
          })}
        </View>
      </ScrollView>
    </View>
  )
}