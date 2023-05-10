import { ScrollView, TouchableOpacity, View, Image, ImageBackground, RefreshControl, TextInput, ActivityIndicator } from 'react-native'
import React from 'react'
import { Text } from '../../components/Themed'
import useColorScheme from '../../hooks/useColorScheme'
import { SafeAreaView } from 'react-native-safe-area-context'
import tw from 'twrnc'
import { ExpoIcon } from '../../components/ExpoIcon'
import { FloatingActionButton } from '../../components/FAB'
import { useNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { DataStore, Storage } from 'aws-amplify'
import { Exercise, Follower, User, Workout } from '../../aws/models'
import { defaultImage, getMatchingNavigationScreen, isStorageUri } from '../../data'
import { getCommonScreens } from '../../components/GetCommonScreens'
import { useDebounce } from '../../hooks/useDebounce'
import { useCommonAWSIds } from '../../hooks/useCommonContext'
import { MediaType } from '../../types/Media'


export interface UserSearch {
  name: string;
  id: string;
  img: string;
  following: boolean;
  subscribers: number;
}


const Stack = createNativeStackNavigator();
export default function WorkoutTab() {
  return <Stack.Navigator initialRouteName='WorkoutAndExercises'>
    <Stack.Screen name='WorkoutAndExercises' component={WorkoutAndExercises} options={{ headerShown: false }} />
    {getCommonScreens('WT', Stack)}
  </Stack.Navigator>
}


interface UserDisplay {
  id: string;
  username: string;
  subCount: number;
  following: boolean;
  picture: string;
}

interface ExerciseOrWorkoutDisplay {
  id: string;
  author: string;
  img: string;
  name: string;
  useCount?: number;
  exerciseCount?: number;
}

export const WorkoutAndExercises = () => {
  const dm = useColorScheme() === 'dark'
  const navigator = useNavigation()
  const {userId} = useCommonAWSIds()
  const [users, setUsers] = React.useState<UserDisplay[]>([])

  const [workouts, setWorkouts] = React.useState<ExerciseOrWorkoutDisplay[]>([])
  const [exercises, setExercises] = React.useState<ExerciseOrWorkoutDisplay[]>([])
  const [keyword, setKeyword] = React.useState<string>('')
  const debouncedKeyword: string = useDebounce(keyword, 500)
  const [loading, setLoading] = React.useState<boolean>(false)
  const [refreshing, setRefreshing] = React.useState<boolean>(false)

  React.useEffect(() => {
    fetchTabResults()
  }, [debouncedKeyword])

  const fetchTabResults = async () => {
    const fetchedUsers = await DataStore.query(User, u => u.and(x => [debouncedKeyword ? x.username.contains(debouncedKeyword.toLowerCase()) : x.username.ne(''), x.personalTrainer.eq(true)]) , { sort: x => x.numFollowers('DESCENDING'), limit: 10 })
    const fetchedUsersWithImages: UserDisplay[] = await Promise.all(fetchedUsers.map(async us => {
      const following = (await DataStore.query(Follower, x => x.and(y => [y.subscribedFrom.eq(userId), y.userID.eq(us.id)]))).length > 0
      const subCount = (await us.Followers.toArray()).length
      if (!us.picture) {
        return {id: us.id, username: us.username, picture: defaultImage, following, subCount}
      } else if (isStorageUri(us.picture)) {
        return {id: us.id, username: us.username, picture: await Storage.get(us.picture), following, subCount}
      } else {
        return {id: us.id, username: us.username, picture: defaultImage, following, subCount}
      }
    }))
    //@ts-ignore
    setUsers(fetchedUsersWithImages)
    //const ids = fetchedUsers.map(x => x.id) //x.or(w => ids.map(id => w.userID.eq(id)))
    const ws = await DataStore.query(Workout, wo => wo.and(x => [debouncedKeyword ? x.name.contains(debouncedKeyword) : x.name.ne(''), x.WorkoutDetails.sets.gt(1)]), {
      sort: x => x.createdAt('DESCENDING'), limit: 100
    })
    // graphqlOperation()
    const wsWithImages: ExerciseOrWorkoutDisplay[] = await Promise.all(ws.map(async wo => {
      const user = await DataStore.query(User, wo.userID)
      const username = user?.username
      const exerciseCount = (await wo.WorkoutDetails.toArray()).length
      const useCount = (await wo.WorkoutPlayDetails.toArray()).length
      if (!wo.img) {
        return { id: wo.id, exerciseCount, name: wo.name, useCount, img: defaultImage, author: username || '' }
      }
      if (isStorageUri(wo.img)) {
        const img = await Storage.get(wo.img)
        return { id: wo.id, exerciseCount, name: wo.name, useCount, img: img, author: username || '' }
      } else {
        return { id: wo.id, exerciseCount, name: wo.name, useCount, img: defaultImage, author: username || '' }
      }
    }))
    setWorkouts(wsWithImages.sort((a, b) => (b.useCount || 1) - (a.useCount || 0)))

    const exercisesWithoutImages = await DataStore.query(Exercise, e => e.and(ex => [debouncedKeyword ? ex.title.contains(debouncedKeyword) : ex.title.ne('')]), {
      limit: 10,
      sort: y => y.createdAt('DESCENDING').WorkoutPlayDetails('DESCENDING')
    })
    const exercisesWithImages: ExerciseOrWorkoutDisplay[] = await Promise.all(exercisesWithoutImages.map(async ex => {
      const user = await DataStore.query(User, ex.userID)
      const username = user?.username
      //@ts-ignore
      const media: MediaType[] = ex.media || []
      const images = media.filter(x => x.type == 'image')
      if (images.length === 0 || (images.length > 0 && !isStorageUri(images[0].uri))) {
        return { id: ex.id, name: ex.title, img: defaultImage, author: username || ''}
      } else {
        return { id: ex.id, name: ex.title, img: await Storage.get(images[0].uri), author: username || '' }
      }
    }))
    setExercises(exercisesWithImages)
    setRefreshing(false)
  }

  return (
    <SafeAreaView edges={['top']} style={tw`h-12/12`}>
      <ScrollView contentContainerStyle={[tw`px-4 py-3`]} showsVerticalScrollIndicator={false} refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={fetchTabResults} />
      }>
        <Text style={tw`text-2xl max-w-7/12`} weight='bold'>Workouts and Exercises</Text>
        <View style={tw`w-12/12 mt-6 flex-row items-center py-3 px-4 justify-between bg-gray-${dm ? '700' : '300'} rounded-lg`}>
          <TextInput value={keyword} onChangeText={setKeyword} placeholder='search...' style={tw`w-11/12 text-${dm ? 'white' : 'black'}`} />
          <ExpoIcon name='search' iconName='feather' color={dm ? 'white' : 'gray'} size={25} />
        </View>
        {loading && <ActivityIndicator />}
        <View style={tw`flex-row items-center justify-between mt-9`}>
          <Text style={tw`text-lg`} weight='semibold'>Trainers</Text>
          {/* TODO: add personal trainers  */}
          <TouchableOpacity onPress={() => {
            const screen = getMatchingNavigationScreen('ListUser', navigator)
            //@ts-ignore
            navigator.navigate(screen, {trainers: true})
          }}>
            <Text>See All</Text>
          </TouchableOpacity>
        </View>
        {users.length === 0 && <Text style={tw`text-center my-5`}>No users to display</Text>}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tw`pt-4`}>
          {users.map((u) => {
            return <TouchableOpacity key={u.id} style={tw`mx-2`} onPress={() => {
              const screen = getMatchingNavigationScreen('User', navigator)
              //@ts-ignore
              navigator.navigate(screen, { id: u.id })
            }}>
              <ImageBackground source={{ uri: u.picture || defaultImage }} style={tw`w-40 h-50 flex-col justify-end`}>
                {u.following && <View style={tw`bg-white rounded-xl p-1 w-20 my-2 mx-1 items-center`}>
                  <Text style={tw`text-black text-xs`}>Following</Text>
                </View>}
                <View style={tw`w-12/12 h-15 bg-gray-${dm ? '700' : '300'}/70 px-2 py-3`}>
                  <Text style={tw`max-w-35`} weight='semibold'>{u.username}</Text>
                  <Text style={tw`max-w-35`}>{u.subCount} subscribers</Text>
                </View>
              </ImageBackground>

            </TouchableOpacity>
          })}
        </ScrollView>
        <View style={tw`flex-row items-center justify-between mt-9`}>
          <Text style={tw`text-lg`} weight='semibold'>Workouts</Text>
          <TouchableOpacity onPress={() => {
            const screen = getMatchingNavigationScreen('ListWorkout', navigator)
            //@ts-ignore
            navigator.navigate(screen)
          }}>
            <Text>See All</Text>
          </TouchableOpacity>
        </View>
        {workouts.length === 0 && <Text style={tw`text-center my-5`}>No workouts to display</Text>}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tw`pt-4`}>
          {workouts.map((w, i) => {
            return <TouchableOpacity
              onPress={() => {
                const screen = getMatchingNavigationScreen('WorkoutDetail', navigator)
                //@ts-ignore
                navigator.navigate(screen, { id: w.id })
              }}
              style={tw`mx-2`} key={`workout ${w.id} at index ${i}`}>
              <Image style={tw`h-30 w-30`} source={{ uri: w.img }} />
              <View style={tw``}>
                <Text style={tw``} weight='semibold'>{w.name.length > 15 ? w.name.substring(0, 15) + '...' : w.name}</Text>
                {w.exerciseCount && <Text style={tw`text-xs`}>{w.exerciseCount} exercises</Text>}
                <Text style={tw`max-w-30 text-xs`}>by {<Text style={tw`text-red-500 text-xs`}>{w.author}</Text>}</Text>
              </View>
            </TouchableOpacity>
          })}
        </ScrollView>
        <View style={tw`flex-row items-center justify-between mt-9`}>
          <Text style={tw`text-lg`} weight='semibold'>Exercises</Text>
          <TouchableOpacity onPress={() => {
            const screen = getMatchingNavigationScreen('ListExercise', navigator)
            //@ts-ignore
            navigator.navigate(screen)
          }}>
            <Text>See All</Text>
          </TouchableOpacity>
        </View>
        {exercises.length === 0 && <Text style={tw`text-center my-5`}>No exercises to display</Text>}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tw`pt-4`}>
          {exercises.map((e, i) => {
            return <TouchableOpacity
              onPress={() => {
                const screen = getMatchingNavigationScreen('ExerciseDetail', navigator)
                //@ts-ignore
                navigator.navigate(screen, { id: e.id })
              }}
              key={`exercise ${e.id} at index ${i}`} style={tw`mx-2 items-start justify-start`}>
              <Image style={tw`h-30 w-30`} source={{ uri: e.img || defaultImage}} />
              <View style={tw`flex-col justify-between items-start overflow-hidden`}>
                <Text weight='semibold'>{e.name.length > 15 ? e.name.substring(0, 15) + '...' : e.name}</Text>
                <Text style={tw`max-w-30 text-xs`}>by {<Text style={tw`text-red-500 text-xs`}>{e.author}</Text>}</Text>
              </View>
            </TouchableOpacity>
          })}
        </ScrollView>
        <View style={tw`pb-40`} />
      </ScrollView>
      <FloatingActionButton options={[
        {
          name: 'New Exercise', icon: () => (<Text style={{ fontSize: 15 }}>👟</Text>), onPress: () => {
            //@ts-ignore
            navigator.navigate('WTExerciseDetail', { id: null, editable: true })
          }
        },
        {
          name: 'New Workout', icon: () => (<Text style={{ fontSize: 15 }}>🏋️‍♀️</Text>), onPress: () => {
            //@ts-ignore
            navigator.navigate('WTWorkoutDetail', { id: null, editable: true })
          }
        },
        //TODO: add workout plan
        // {
        //   name: 'New Workout Plan', icon: () => (<Text style={{ fontSize: 15 }}>📓</Text>), onPress: () => {
        //     //@ts-ignore
        //     navigator.navigate('WTListWorkout')
        //   }
        // }
      ]} initialIcon={'plus'} bgColor='yellow-400' openIcon={() => {
        return <ExpoIcon name='close' iconName='ion' color='black' size={23} />
      }} />
    </SafeAreaView>
  )
}


