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
import { Comments, Exercise, Favorite, Follower, Meal, Post, User, Workout } from '../../aws/models'
import { defaultImage, formatCash, getMatchingNavigationScreen, isStorageUri } from '../../data'
import { getCommonScreens } from '../../components/GetCommonScreens'
import { useDebounce } from '../../hooks/useDebounce'
import { useCommonAWSIds } from '../../hooks/useCommonContext'
import { MediaType } from '../../types/Media'
import moment from 'moment'
import { FavoriteType } from '../../aws/models'
import { ShowMoreButton } from '../home/ShowMore'
import { Colors, FAB } from 'react-native-paper'
import { PostMedia } from '../../components/PostMedia'
import ThisAdHelpsKeepFree from '../../components/ThisAdHelpsKeepFree'


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


interface PostDisplay extends Post {
  username: string;
  profileName?: string;
  likes: number;
  favorited: boolean;
  following: boolean;
  pfp: string;
  comments?: number;
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
    const fetched = await DataStore.query(Post, p => p.public.eq(true), {limit: 100, sort: x => x.createdAt('DESCENDING')})
    const postWithMedia = await Promise.all(fetched.map(async x => {
      let user = await DataStore.query(User, x.userID)
      if (!user) return;
      let pfp = user.picture || defaultImage
      if (isStorageUri(pfp)) pfp = await Storage.get(pfp)
      let username = user.username || 'rage'
      let likes = (await DataStore.query(Favorite, f => f.and(fav => [
        fav.potentialID.eq(x.id), fav.type.eq('POST')
      ]))).length
      let favorited = (await DataStore.query(Favorite, f => f.and(fav => [
        fav.potentialID.eq(x.id), fav.type.eq('POST'), fav.userID.eq(userId)
      ]))).length > 0
      let following = (await DataStore.query(Follower, f => f.and(foll => [
        //@ts-ignore
        foll.subscribedFrom.eq(userId), foll.userID.eq(user.id)
      ]))).length > 0
      let comments = (await x.Comments.toArray()).length
      return {...x, username, likes, favorited, following, comments, pfp, profileName: user.name }
    }))
    //@ts-ignore
    setPosts(postWithMedia)
  }

  const [showingModeIndex, setShowingMoreIndex] = React.useState<number | null>(null);

  return <View style={{ flex: 1 }} includeBackground>
    <SafeAreaView edges={['top']} style={tw`h-12/12`}>
      <View style={tw`px-6 pb-3 pt-2`}>
      <View style={tw`flex-row items-center justify-between`}>
      <Text style={tw`text-2xl max-w-7/12`} weight='bold'>For You</Text>
      <TouchableOpacity style={tw`pl-3`} onPress={() => navigator.navigate('Inbox')}>
        <ExpoIcon name='inbox' iconName='feather' size={28} color='gray' />
      </TouchableOpacity>
      </View>
      </View>
      <ScrollView contentContainerStyle={[tw`px-4 py-3`]} showsVerticalScrollIndicator={false} refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={fetchTabResults} />
      }>
        
          {posts.map((x, i) => {
            const shouldShow = showingModeIndex === i
            if (!x) return <View key={i} />
            return <View key={x.id}>
              {(i>0 && i % 5 === 0 && !subscribed) && <View style={tw`my-2 pb-4 border-b border-gray-${dm ? '700' : '300'}`}>
                <ThisAdHelpsKeepFree />
                </View>}
              <TouchableOpacity onPress={() => {
                const screen = getMatchingNavigationScreen('PostDetail', navigator)
                //@ts-ignore
                navigator.navigate(screen, {id: x.id})
              }}  style={tw`my-2 pb-3 border-b border-gray-${dm ? '700' : '300'}`}>
              <View style={tw`flex-row items-center justify-between`}>
                <View style={tw`flex-row items-center`}>
                  <Image style={tw`h-15 w-15 rounded-full`} source={{uri: x.pfp}} />
                  <View style={tw`ml-2 max-w-9/12`}>
                    <Text weight='semibold'>{x.profileName}</Text>
                    <Text style={tw`text-gray-500 text-xs`}>@{x.username}</Text>
                  </View>
                </View>
                <ShowMoreButton name={`A post by ${x.username}`} id={x.id} type={FavoriteType.POST} desc={x.description || ''} img={x.pfp} userId={x.userID}  />
                  
              </View>
              <Text style={tw`my-3`}>{shouldShow ? x.description : x.description?.substring(0, 100)} {(x?.description?.length || 100) >= 99 && <Text weight='semibold' style={tw`text-gray-500`} onPress={() => setShowingMoreIndex(shouldShow ? null : i)}>...{shouldShow ? 'Hide' : 'Show More'}</Text>}</Text>
              {/* @ts-ignore */}
              <PostMedia media={x.media} mealId={x.mealID} workoutId={x.workoutID} runProgressId={x.runProgressID} exerciseId={x.exerciseID} canNavigate />
              <View style={tw`flex-row items-center justify-between my-3`}>
                <View style={tw`flex-row items-center`}>
                <TouchableOpacity onPress={async () => {
                  if (x.favorited) {
                    const og = await DataStore.query(Favorite, f => f.and(fav => [
                      fav.userID.eq(userId), fav.potentialID.eq(x.id), fav.type.eq('POST')
                    ]))
                    if (og[0]) {
                      await DataStore.delete(og[0])
                      setPosts([...posts].map(post => {
                        if (post.id === x.id) {
                          return {...post, favorited: false, likes: post.likes -  1}
                        }
                        return post
                      }))
                    }
                  } else {
                    await DataStore.save(new Favorite({userID: userId, potentialID: x.id, type: FavoriteType.POST}))
                    setPosts([...posts].map(post => {
                      if (post.id === x.id) {
                        return {...post, favorited: true, likes: post.likes + 1}
                      }
                      return post
                    }))
                  }
                }} style={tw`flex-row items-center justify-center`}>
                  <ExpoIcon name={x.favorited ? 'heart' : 'heart-outline'} iconName='ion' size={25} color={x.favorited ? 'red' : 'gray'} />
                  <Text style={tw`text-gray-500 ml-2 text-xs`}>{x.likes} likes</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                  let screen = getMatchingNavigationScreen('PostDetail', navigator)
                  //@ts-ignore
                  navigator.navigate(screen, {id: x.id})
                }} style={tw`flex-row items-center justify-center ml-5`}>
                  <ExpoIcon name={'message-circle'} iconName='feather' size={25} color={'gray'} />
                  <Text style={tw`text-gray-500 ml-2 text-xs`}>{x.comments || 0} comments</Text>
                </TouchableOpacity>
                </View>
                <Text style={tw`text-xs text-gray-500`}>{moment(x.createdAt).fromNow()}</Text>
              </View>
            </TouchableOpacity>
            </View>
          })}
        <View style={tw`pb-40`} />
      </ScrollView>
      <FAB 
        icon="plus"
        style={[tw`bg-yellow-500`, {position: 'absolute', bottom: 20, right: 20}]}
        onPress={() => {
          //@ts-ignore
          navigator.navigate('MakePost')
        }}
        color={Colors.grey600}
        
      />
    </SafeAreaView>
  </View>
}


