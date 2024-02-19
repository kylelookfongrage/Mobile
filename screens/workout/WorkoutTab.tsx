import { ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import React from 'react'
import { Text, View } from '../../components/base/Themed'
import useColorScheme from '../../hooks/useColorScheme'
import { SafeAreaView } from 'react-native-safe-area-context'
import tw from 'twrnc'
import { ExpoIcon, Icon } from '../../components/base/ExpoIcon'
import { useNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { defaultImage, getMatchingNavigationScreen } from '../../data'
import { getCommonScreens } from '../../components/screens/GetCommonScreens'
import moment from 'moment'
import { ShowMoreDialogue } from '../home/ShowMore'
import { Colors, FAB } from 'react-native-paper'
import { PostMedia } from '../../components/features/PostMedia'
import ThisAdHelpsKeepFree from '../../components/features/ThisAdHelpsKeepFree'
import { PostDao, TFeed } from '../../types/PostDao'
import SupabaseImage from '../../components/base/SupabaseImage'
import Spacer from '../../components/base/Spacer'
import useHaptics from '../../hooks/useHaptics'
import { useSelector } from '../../redux/store'
import TopBar from '../../components/base/TopBar'
import { _tokens } from '../../tamagui.config'


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

export const WorkoutAndExercises = () => {
  const dm = useColorScheme() === 'dark'
  const navigator = useNavigation()
  let {profile, subscribed} = useSelector(x => x.auth)
  const [refreshing, setRefreshing] = React.useState<boolean>(false);
  const [posts, setPosts] = React.useState<TFeed[]>([])
  let dao = PostDao()
  let h = useHaptics()

  React.useEffect(() => {
    fetchTabResults()
  }, [])

  const fetchTabResults = async () => {
    if (!profile) return;
    let res = await dao.get_feed(profile.id)
    if (!res) return;
    setPosts(res)
  }

  const [showingModeIndex, setShowingMoreIndex] = React.useState<number | null>(null);

  return <View style={{ flex: 1 }} includeBackground>
    <SafeAreaView edges={['top']} style={tw`h-12/12`}>
      <Spacer />
      <TopBar title='Discover' iconLeft='Discovery' Right={() => {
        return <TouchableOpacity style={tw`p-.5`} onPress={() => navigator.navigate('Inbox')}>
        <Icon name='Send' size={26} color={dm ? _tokens.white : _tokens.black} />
      </TouchableOpacity>
      }} />
      <Spacer />
      <ScrollView contentContainerStyle={[tw`px-4 py-3`]} showsVerticalScrollIndicator={false} refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={fetchTabResults} />
      }>
        <Spacer />

        {posts.map((x, i) => {
          const shouldShow = showingModeIndex === i
          if (!x) return <View key={i} />
          return <View key={x.post_id}>
            {(i > 0 && i % 5 === 0 && !subscribed) && <View style={tw`my-2 pb-4 border-b border-gray-${dm ? '700' : '300'}`}>
              <ThisAdHelpsKeepFree />
            </View>}
            <View style={tw`my-2 pb-3 border-b border-gray-${dm ? '700' : '300'}`}>
              <View style={tw`flex-row items-center justify-between`}>
                <View style={tw`flex-row items-center`}>
                  <SupabaseImage style={tw`h-15 w-15 rounded-full`} uri={x.pfp || defaultImage} />
                  <View style={tw`ml-2 max-w-9/12`}>
                    <Text weight='semibold'>{x.name}</Text>
                    <Text style={tw`text-gray-500 text-xs`}>@{x.username}</Text>
                  </View>
                </View>
                <ShowMoreDialogue post_id={x.post_id} />
                {/* <ShowMoreButton name={`A post by ${x.username}`} id={x.id} type={FavoriteType.POST} desc={x.description || ''} img={x.pfp} userId={x.userID} /> */}

              </View>
              <TouchableOpacity onPress={() => {
                const screen = getMatchingNavigationScreen('PostDetail', navigator)
                //@ts-ignore
                navigator.navigate(screen, {id: x.post_id})
                }}>
              <Text style={tw`my-3`}>{shouldShow ? x.description : x.description?.substring(0, 100)} {(x?.description?.length || 100) >= 99 && <Text weight='semibold' style={tw`text-gray-500`} onPress={() => setShowingMoreIndex(shouldShow ? null : i)}>...{shouldShow ? 'Hide' : 'Show More'}</Text>}</Text>
                {/* @ts-ignore */}
              <PostMedia media={x.media} mealId={x.meal_id} workoutId={x.workout_id} runProgressId={x.run_id} exerciseId={x.exercise_id} canNavigate />
              <View style={tw`flex-row items-center justify-between my-3`}>
                <View style={tw`flex-row items-center`}>
                  <TouchableOpacity onPress={async () => {
                    await dao.on_like_press(x.post_id, x.liked)
                    h.press()
                    setPosts([...posts].map(p => {
                      if (p.post_id===x.post_id) {
                        return {...p, likes: x.liked ? p.likes-1 : p.likes + 1, liked: !x.liked}
                      }
                      return p
                    }))
                  }} style={tw`flex-row items-center justify-center`}>
                    <ExpoIcon name={x.liked ? 'heart' : 'heart-outline'} iconName='ion' size={25} color={x.liked ? 'red' : 'gray'} />
                    <Spacer xs horizontal />
                    <Text style={tw`text-gray-500`}>{x.likes}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => {
                    let screen = getMatchingNavigationScreen('PostDetail', navigator)
                    //@ts-ignore
                    navigator.navigate(screen, { id: x.post_id })
                  }} style={tw`flex-row items-center justify-center ml-5`}>
                    <ExpoIcon name={'message-circle'} iconName='feather' size={25} color={'gray'} />
                  </TouchableOpacity>
                </View>
                <Text style={tw`text-xs text-gray-500`}>{moment(x.created_at).fromNow()}</Text>
              </View>
              </TouchableOpacity>
              
            </View>
          </View>
        })}
        <View style={tw`pb-40`} />
      </ScrollView>
      <FAB
        icon={() => <ExpoIcon name='plus' iconName='feather' size={23} color='white' />}
        
        style={[tw`bg-red-600`, { position: 'absolute', bottom: 20, right: 20 }]}
        onPress={() => {
          //@ts-ignore
          navigator.navigate('MakePost')
        }}
        color={Colors.grey600}

      />
    </SafeAreaView>
  </View>
}


