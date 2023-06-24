import { ScrollView, TouchableOpacity, Image, ImageBackground, RefreshControl, TextInput, ActivityIndicator } from 'react-native'
import React from 'react'
import { Text, View } from '../../components/Themed'
import useColorScheme from '../../hooks/useColorScheme'
import { SafeAreaView } from 'react-native-safe-area-context'
import tw from 'twrnc'
import { ExpoIcon } from '../../components/ExpoIcon'
import { FloatingActionButton } from '../../components/FAB'
import { useNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { DataStore, Storage } from 'aws-amplify'
import { Comments, Exercise, Favorite, Follower, Meal, User, Workout } from '../../aws/models'
import { defaultImage, formatCash, getMatchingNavigationScreen, isStorageUri } from '../../data'
import { getCommonScreens } from '../../components/GetCommonScreens'
import { useDebounce } from '../../hooks/useDebounce'
import { useCommonAWSIds } from '../../hooks/useCommonContext'
import { MediaType } from '../../types/Media'
import moment from 'moment'
import { FavoriteType } from '../../aws/models'


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


interface PostDisplay {
  username: string;
  likes: number;
  type: 'workout' | 'meal';
  description: string;
  id: string;
  premium: boolean;
  img: string;
  favorited: boolean;
  createdAt: string | null | undefined;
  pfp: string;
  title: string;
  comments?: number;
  userID?: string;
}

export const WorkoutAndExercises = () => {
  const dm = useColorScheme() === 'dark'
  const navigator = useNavigation()
  const { userId, subscribed } = useCommonAWSIds()
  const [refreshing, setRefreshing] = React.useState<boolean>(false);
  const [posts, setPosts] = React.useState<PostDisplay[]>([])

  React.useEffect(() => {
    fetchTabResults()
  }, [])

  const fetchTabResults = async () => {
    const usersFollowed = await DataStore.query(User, u => u.and(x => [x.Followers.subscribedFrom.eq(userId)]))
    let workoutLimit = 16
    let workoutsFromFollowing: Workout[] = []
    if (usersFollowed.length > 0) {
      workoutsFromFollowing = await DataStore.query(Workout, x => x.and(wo => [
        ...usersFollowed.map(z => wo.userID.eq(z.id)),
        wo.img.ne(null), wo.name.ne('')
      ]), { limit: 16 })
      workoutLimit = 0
    }
    const workoutsWithoutImages = await DataStore.query(Workout, x => x.and(wo => [
      ...workoutsFromFollowing.map(z => wo.id.ne(z.id)),
      wo.img.ne(null), wo.name.ne('')
    ]), { limit: 14 + workoutLimit })
    const workouts = [...workoutsFromFollowing, ...workoutsWithoutImages]
    const workoutsWithImages: PostDisplay[] = await Promise.all(workouts.map(async wo => {
      let img: string = wo.img || defaultImage
      const user = await DataStore.query(User, wo.userID)
      const username = user?.username || 'rage'
      let profileImage = user?.picture || defaultImage
      let pfp = profileImage
      if (isStorageUri(pfp)) {
        pfp = await Storage.get(pfp)
      }
      const likes = await DataStore.query(Favorite, x => x.and(f => [
        f.type.eq('WORKOUT'), f.potentialID.eq(wo.id)
      ]))
      let comments = (await DataStore.query(Comments, x => x.and(c => [
        c.type.eq('WORKOUT'), c.potentialID.eq(wo.id)
      ]))).length
      const userDidLike = (await DataStore.query(Favorite, x => x.and(f => [
        f.potentialID.eq(wo.id), f.type.eq('WORKOUT'), f.userID.eq(userId)
      ]))).length > 0
      if (isStorageUri(img)) {
        img = await Storage.get(img)
      }

      return { username, comments, userID: user?.id, likes: likes.length, type: 'workout', title: wo.name, id: wo.id, pfp, premium: wo.premium || false, img, description: wo.description || '', favorited: userDidLike, createdAt: wo.createdAt }
    }))

    const mealsFromFollowing = await DataStore.query(Meal, x => x.and(m => [
      ...(usersFollowed.length > 0 ? usersFollowed.map(z => m.userID.eq(z.id)) : []),
      m.name.ne(''), m.public.ne(true)
    ]), { limit: 16 })

    const mealsWithoutImages = await DataStore.query(Meal, x => x.and(m => [
      ...mealsFromFollowing.map(z => m.id.ne(z.id)),
      m.name.ne(''), m.public.ne(true)
    ]), { limit: 14 })
    const meals = [...mealsFromFollowing, ...mealsWithoutImages]
    const mealsWithImages = await Promise.all(meals.map(async meal => {
      const user = await DataStore.query(User, meal.userID)
      const username = user?.username || 'rage'
      const likes = (await DataStore.query(Favorite, x => x.and(z => [z.potentialID.eq(meal.id), z.type.eq('MEAL')]))).length
      const comments = (await DataStore.query(Comments, x => x.and(z => [z.potentialID.eq(meal.id), z.type.eq('MEAL')]))).length
      const userDidLike = (await DataStore.query(Favorite, x => x.and(f => [
        f.potentialID.eq(meal.id), f.type.eq('MEAL'), f.userID.eq(userId)
      ]))).length > 0
      let profileImage = user?.picture || defaultImage
      let pfp = profileImage
      if (isStorageUri(pfp)) {
        pfp = await Storage.get(pfp)
      }
      const firstImage = meal.media?.filter(x => x?.type === 'image')?.[0]?.uri || defaultImage
      let img = firstImage
      if (isStorageUri(firstImage)) {
        img = await Storage.get(img)
      }
      return { username, comments, likes: likes, userID: user?.id, type: 'meal', id: meal.id, title: meal.name, pfp, premium: meal.premium || false, img, description: meal.description || '', favorited: userDidLike, createdAt: meal.createdAt }
    }))
    //@ts-ignore
    let sortedPosts: PostDisplay[] = [...workoutsWithImages, ...mealsWithImages].sort((a, b) => {
      let date1 = moment(a.createdAt || '2022-02-01')
      let date2 = moment(b.createdAt || '2022-02-01')
      let diff = date2.diff(date1)
      return diff
    })
    setPosts(sortedPosts)
  }
  const [showingModeIndex, setShowingMoreIndex] = React.useState<number | null>(null);

  return <View style={{ flex: 1 }} includeBackground>
    <SafeAreaView edges={['top']} style={tw`h-12/12`}>
      <ScrollView contentContainerStyle={[tw`px-4 py-3`]} showsVerticalScrollIndicator={false} refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={fetchTabResults} />
      }>
        <Text style={tw`text-2xl max-w-7/12 mb-4`} weight='bold'>For You</Text>
        {posts.map((x, index) => {
          return <View key={x.id} style={tw`w-12/12 border-t border-b border-${dm ? 'gray-700/40' : 'gray-300/40'} pt-5`}>
            <View>
              <View style={tw`flex-row items-center justify-between`}>
                <View style={tw`text-center flex-row items-center max-w-10/12`}>
                  <Image source={{ uri: x.pfp }} style={tw`w-10 h-10 rounded-full`} />
                  <View style={tw`px-2`}>
                    <Text weight='semibold'>{x.title}</Text>
                    <TouchableOpacity onPress={() => {
                      const screen = getMatchingNavigationScreen('User', navigator)
                      if (x.userID) {
                        //@ts-ignore
                        navigator.navigate(screen, { id: x.userID })
                      }
                    }}>
                      <Text style={tw`text-xs text-red-500`}>@{x.username}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                {(x.premium && !subscribed) && <ExpoIcon style={tw`px-4`} name='shopping-bag' iconName='feather' size={20} color='gray' />}
              </View>
              <Text style={tw`mt-2`}>
                {showingModeIndex === index ? x.description : x.description.substring(0, 50)}
                <Text style={tw`text-gray-500`} weight='semibold' onPress={() => {
                  if (showingModeIndex === index) {
                    setShowingMoreIndex(null)
                  } else {
                    setShowingMoreIndex(index)
                  }
                }}>{x.description.length > 50 ? (showingModeIndex === index ? ' Hide' : '...Show More') : ''}</Text>
              </Text>
              <TouchableOpacity onPress={() => {
                const screen = getMatchingNavigationScreen(x.type === 'meal' ? 'MealDetail' : 'WorkoutDetail', navigator)
                //@ts-ignore
                navigator.navigate(screen, { id: x.id })
              }} style={tw`w-12/12 items-center justify-center mb-3`}>
                <Image source={{ uri: x.img }} style={tw`w-12/12 h-60 mt-2`} resizeMethod='scale' />
              </TouchableOpacity>
            </View>
            <View style={tw`flex-row items-center justify-between mb-2`}>
              <View style={tw`flex-row items-center pl-2`}>
                <TouchableOpacity onPress={async () => {
                  if (x.favorited) {
                    await DataStore.delete(Favorite, f => f.and(fav => [
                      fav.userID.eq(userId), fav.potentialID.eq(x.id),
                      fav.type.eq(x.type === 'meal' ? 'MEAL' : 'WORKOUT')
                    ]))
                  } else {
                    await DataStore.save(new Favorite({
                      userID: userId, potentialID: x.id,
                      type: x.type === 'meal' ? 'MEAL' : 'WORKOUT'
                    }))
                  }
                  setPosts([...posts].map(post => {
                    if (x.id === post.id) {
                      return { ...post, favorited: !post.favorited, likes: post.favorited ? post.likes - 1 : post.likes + 1 }
                    }
                    return post
                  }))
                }}>
                  <View style={tw`items-center justify-center flex-row`}>
                    <ExpoIcon name={x.favorited ? 'heart' : 'heart-outline'} iconName='ion' color={x.favorited ? 'red' : 'gray'} size={27} />
                    <Text style={tw`text-xs text-gray-500 text-center`}> {formatCash(x.likes)}</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={tw`ml-6 flex-row items-center`} onPress={() => {
                  const screen = getMatchingNavigationScreen('PostComments', navigator)
                  let postType = FavoriteType.WORKOUT
                  if (x.type === 'meal') postType = FavoriteType.MEAL
                  //@ts-ignore
                  navigator.navigate(screen, {postId: x.id, postType })
                }}>
                  <ExpoIcon name='message-circle' iconName='feather' size={27} color='gray' />
                  <Text style={tw`text-xs text-gray-500 text-center`}> {formatCash(x.comments || 0)}</Text>
                </TouchableOpacity>
              </View>

              <Text style={tw`text-xs text-gray-500`}>{moment(x.createdAt).fromNow()}</Text>
            </View>
          </View>
        })}
        <View style={tw`pb-40`} />
      </ScrollView>
    </SafeAreaView>
  </View>
}


