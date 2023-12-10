import { View, Text } from '../../components/base/Themed'
import React, { useEffect, useRef, useState } from 'react'
import tw from 'twrnc'
import { TouchableOpacity, useColorScheme, KeyboardAvoidingView, Platform, Dimensions, ActivityIndicator } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ScrollView, TextInput } from 'react-native-gesture-handler'
import { ExpoIcon } from '../../components/base/ExpoIcon'
import { useCommonAWSIds } from '../../hooks/useCommonContext'
import { defaultImage, MediaType, PostMediaSearchDisplay, postMediaType, titleCase } from '../../data'
import * as ImagePicker from 'expo-image-picker'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useDebounce } from '../../hooks/useDebounce'
import RunListComponent from '../../components/features/RunListComponent'
import { ErrorMessage } from '../../components/base/ErrorMessage'
import { PostMedia } from '../../components/features/PostMedia'
import SupabaseImage from '../../components/base/SupabaseImage'
import { SearchDao } from '../../types/SearchDao'
import { Tables } from '../../supabase/dao'
import { PostDao } from '../../types/PostDao'
import { useSelector } from '../../redux/store'
const Stack = createNativeStackNavigator()

export default function MakePost(props: { id?: string, workoutId?: string; mealId?: string; exerciseId?: string; runProgressId?: string; description?: string; media?: string }) {
  const [newWorkoutId, setNewWorkoutId] = useState<number | null>(Number(props.workoutId) || null)
  const [newExerciseId, setNewExerciseId] = useState<number | null>(Number(props.exerciseId) || null)
  const [newMealId, setNewMealId] = useState<number | null>(Number(props.mealId) || null)
  const [newRunId, setNewRunId] = useState<number | null>(Number(props.runProgressId) || null)
  
  const height = Dimensions.get('screen').height
  const navigator = useNavigation()
  const reset = () => {
    setNewExerciseId(null)
    setNewRunId(null)
    setNewMealId(null)
    setNewWorkoutId(null)
  }
  return <Stack.Navigator>
    <Stack.Group>
      <Stack.Screen name='MakePostScreen' options={{ headerShown: false }}>
        {_ => <MakePostScreen
          newWorkoutId={newWorkoutId}
          newMealId={newMealId}
          newExerciseId={newExerciseId}
          newRunProgressId={newRunId}
          description={props.description}
          media={props.mealId}
          onDismissTap={reset}
        />}
      </Stack.Screen>
      <Stack.Screen name='PickPostMedia' options={{ presentation: 'transparentModal', headerShown: false }}>
        {x => {
          {/* @ts-ignore */ }
          let type: postMediaType = x.route?.params?.type || postMediaType.none
          return <View card style={[{ marginTop: height * 0.10, height: height * 0.90 }, tw`rounded-t-3xl p-6`]}>
            <View style={tw`flex-row items-center justify-between`}>
              <Text weight='semibold' style={tw`text-lg`}>Search {titleCase(postMediaType[type])}s</Text>
              <TouchableOpacity style={tw`p-2`} onPress={() => {
                //@ts-ignore
                navigator.navigate('MakePostScreen')
              }}>
                <ExpoIcon iconName='feather' name='x-circle' color='gray' size={25} />
              </TouchableOpacity>
            </View>
            <SearchForPostMedia onSelect={function (id: number, returnedType: postMediaType): void {
              if (returnedType === postMediaType.exercise) setNewExerciseId(id)
              if (returnedType === postMediaType.meal) setNewMealId(id)
              if (returnedType === postMediaType.workout) setNewWorkoutId(id)
              if (returnedType === postMediaType.run) setNewRunId(id)
            }} type={type} />
          </View>
        }}
      </Stack.Screen>
    </Stack.Group>
  </Stack.Navigator>
}

const SearchForPostMedia = (props: { onSelect: (id: number, type: postMediaType) => void, type: postMediaType }) => {
  const [searchKey, setSearchKey] = useState<string>('')
  const debouncedSearchKey = useDebounce(searchKey, 500)
  const [results, setResults] = useState<PostMediaSearchDisplay[]>([])
  let {profile} = useSelector(x => x.auth)
  let dao = SearchDao()
  useEffect(() => {
    const prepare = async () => {
      let table: keyof Tables = 'meal'
      if (props.type === postMediaType.exercise) table = 'exercise'
      if (props.type === postMediaType.workout) table = 'workout'
      if (props.type === postMediaType.run) table = 'run_progress'
      let res = await dao.search(table, {
        keyword: debouncedSearchKey,  //@ts-ignore
        keywordColumn: props.type === postMediaType.run ? undefined : "name",
        belongsTo: table === 'run_progress' ? profile?.id : undefined,
        selectString: '*, author: user_id(username)'
      })
      if (!res) return;
      //@ts-ignore
      setResults(res?.map(x => ({
        id: x.id, //@ts-ignore
        name: x.name, //@ts-ignore
        img: x.preview || x.image, //@ts-ignore
        author: x?.author?.username || '', //@ts-ignore
        coordinates: x?.coordinates, //@ts-ignore
        time: x?.time,
      })))
    }
    prepare()
  }, [debouncedSearchKey])
  const dm = useColorScheme() === 'dark'
  const navigator = useNavigation()
  return <ScrollView showsVerticalScrollIndicator={false}>
    {props.type !== postMediaType.run && <View style={tw`w-12/12 bg-gray-600/20 p-3 px-6 rounded-xl mt-2 flex-row items-center justify-between`}>
      <View style={tw`flex-row items-center`}>
        <ExpoIcon iconName='feather' name='search' size={25} color='gray' />
        <TextInput style={tw`text-${dm ? 'white' : 'black'} w-10/12 ml-1`} placeholder='Search...' onChangeText={setSearchKey} />
      </View>
      <TouchableOpacity style={tw``} onPress={() => {
        setSearchKey('')
      }}>
        <ExpoIcon name='x' iconName='feather' size={20} color='gray' />
      </TouchableOpacity>
    </View>}
    {props.type !== postMediaType.run && <View style={tw`mt-4`}>
      {results.length === 0 && <Text style={tw`text-center mt-9 text-gray-500`}>No results to display</Text>}
      {results.map(x => {
        return <TouchableOpacity onPress={() => {
          //@ts-ignore
          navigator.pop()
          props.onSelect && props.onSelect(x.id, props.type)
        }} key={x.id} style={tw`flex-row items-center justify-between my-4`}>
          <View style={tw`flex-row items-center max-w-10/12`}>
            <SupabaseImage uri={x.img || defaultImage} style={tw`h-10 w-10 rounded-lg`} />
            <View style={tw`ml-2`}>
              <Text weight='semibold' style={tw``}>{x.name}</Text>
              <Text style={tw`text-gray-500`}>@{x.author}</Text>
            </View>
          </View>
          <ExpoIcon name='chevron-right' iconName='feather' size={25} color='gray' />
        </TouchableOpacity>
      })}
    </View>}
    {props.type === postMediaType.run && <View>
      {results.map(result => {
        // @ts-ignore 
        return <View key={result.id} style={tw`my-2`}>
          {/* @ts-ignore */}
          <RunListComponent run={result} onPress={(run) => {
            //@ts-ignore
            navigator.pop()
            props.onSelect && props.onSelect(result.id, props.type)
          }} />
        </View>
      })}
    </View>}
  </ScrollView>
}


function MakePostScreen(props: { id?: string, newWorkoutId?: number | null; newMealId?: number | null; newExerciseId?: number | null; newRunProgressId?: number | null; description?: string; media?: string; onDismissTap: () => void }) {
  const dm = useColorScheme() === 'dark';
  const { profile } = useSelector(x => x.auth)
  const [newDescription, setNewDescription] = useState<string | null>(props.description || null)
  const [newMedia, setNewMedia] = useState<(MediaType | null | undefined)[]>([])
  let dao = PostDao()
  const [errors, setErrors] = useState<string[]>([])
  const [mediaProps, setMediaProps] = useState<{ mealId?: number | null; workoutId?: number | null; exerciseId?: number | null; runProgressId?: number | null; }>({})
  React.useEffect(() => {
    setMediaProps({ mealId: props.newMealId, workoutId: props.newWorkoutId, exerciseId: props.newExerciseId, runProgressId: props.newRunProgressId })
  }, [props])

  const descriptionRef = useRef<TextInput | null>(null)
  const navigator = useNavigation();
  const [uploading, setUploading] = useState<boolean>(false)
  useEffect(() => {
    const prepare = async () => {

    }
    prepare()
    if (descriptionRef.current) {
      descriptionRef.current.focus()
    }
  }, [])
  const padding = useSafeAreaInsets()

  return (
    <View includeBackground style={[{ flex: 1 }, tw`h-12/12`]}>
      <PostHeader uploading={uploading} navigator={navigator} onPressPost={async () => {
        setUploading(true)
        try {
          let form: Tables['post']['Insert'] = {
            description: newDescription,
            draft: false,
            exercise_id: mediaProps.exerciseId,
            meal_id: mediaProps.mealId, //@ts-ignore
            media: newMedia,
            plan_id: null,
            public: true,
            run_id: mediaProps.runProgressId,
            user_id: profile?.id,
            workout_id: mediaProps.workoutId
          }
          console.log(form)
          await dao.save(form)
          setUploading(false)
          //@ts-ignore
          navigator.pop()
        } catch (error) {
          console.log(error)
          //@ts-ignore
          setUploading(false)
          setErrors([error.toString()])
        }

      }} />
      {errors.length > 0 && <View style={tw`mx-6 my-3`}>
        <ErrorMessage errors={errors} onDismissTap={() => setErrors([])} />
      </View>}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} enabled style={[tw`flex`, { flex: 1, paddingBottom: -padding.top }]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={tw`px-6`}>
          <View style={tw`flex-row items-center mt-2`}>
            <SupabaseImage uri={profile?.pfp || defaultImage} style={tw`h-15 w-15 rounded-full`} />
            <View style={tw`ml-3 max-w-10/12`}>
              <Text weight='semibold'>{profile?.name}</Text>
              <Text style={tw`text-gray-500`}>@{profile?.username}</Text>
            </View>
          </View>
          <TextInput
            ref={descriptionRef}
            value={newDescription || ''}
            onChangeText={setNewDescription}
            placeholder="What's on your mind?"
            placeholderTextColor={'gray'}
            style={tw`text-${dm ? 'white' : 'black'} py-4 rounded-2xl mt-2 mb-1`}
            multiline
            numberOfLines={6} />
          {/* @ts-ignore */}
          <PostMedia editable onDismissTap={props.onDismissTap} media={newMedia.filter(x => (x && x.type && x.uri))} {...mediaProps} onDismissImagePress={(uri) => {
            setNewMedia(newMedia.filter(x => x?.uri !== uri))
          }} />
        </ScrollView>
        <View style={tw`flex-row w-12/12 items-center pb-6 border-t border-gray-500 px-4 pt-3`}>
          <TouchableOpacity style={tw`p-2`} onPress={async () => {
            props.onDismissTap()
            const imgs = await onImagePress()
            if (imgs) {
              setNewMedia(imgs)
            }
          }}>
            <ExpoIcon name='camera' iconName='feather' size={25} color='gray' />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            props.onDismissTap()
            //@ts-ignore
            navigator.navigate('PickPostMedia', { type: postMediaType.meal })
          }} style={tw`p-2`}>
            <Text style={tw`text-gray-500`}>Meals</Text>
          </TouchableOpacity>
          <TouchableOpacity style={tw`p-2`} onPress={() => {
            props.onDismissTap()
            //@ts-ignore
            navigator.navigate('PickPostMedia', { type: postMediaType.workout })
          }}>
            <Text style={tw`text-gray-500`}>Workouts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={tw`p-2`} onPress={() => {
            props.onDismissTap()
            //@ts-ignore
            navigator.navigate('PickPostMedia', { type: postMediaType.exercise })
          }}>
            <Text style={tw`text-gray-500`}>Exercises</Text>
          </TouchableOpacity>
          <TouchableOpacity style={tw`p-2`} onPress={() => {
            props.onDismissTap()
            //@ts-ignore
            navigator.navigate('PickPostMedia', { type: postMediaType.run })
          }}>
            <Text style={tw`text-gray-500`}>Runs</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}

const onImagePress = async (): Promise<MediaType[] | null> => {
  const permissions = await ImagePicker.getMediaLibraryPermissionsAsync()
  if (!permissions.granted) {
    try {
      const request = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (!request.granted) {
        alert('We need your permission to pick an image or video, please check your settings app.')
        return null;
      }
    } catch (error) {
      alert('There was a problem')
      return null;
    }
  }

  try {
    //TODO: allow videos
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [9, 16],
      quality: 1,
      allowsMultipleSelection: true,
      orderedSelection: true,
      selectionLimit: 4
    })
    if (res && res.assets && res.assets.length > 0) {
      return (res.assets.map(x => {
        return { uri: x.uri, type: x.type || 'image' }
      }))
    } else {
      return null
    }
  } catch (error) {
    alert('There was a problem')
    return null;
  }
}


const PostHeader = (props: { navigator: any; onPressPost: () => void; uploading: boolean; }) => {
  const { navigator, onPressPost, uploading } = props;
  const padding = useSafeAreaInsets();
  return <View style={[tw`flex-row items-center justify-between px-7`, { paddingTop: padding.top }]}>
    <TouchableOpacity disabled={uploading} style={tw`p-3`} onPress={() => {
      navigator.pop()
    }}>
      <ExpoIcon name='chevron-left' iconName='feather' size={25} color='gray' />
    </TouchableOpacity>
    <Text>Make a Post</Text>
    <TouchableOpacity disabled={uploading} style={tw`p-3`} onPress={onPressPost}>
      {!uploading && <Text style={tw`text-red-600`} weight='bold'>Post</Text>}
      {uploading && <ActivityIndicator />}
    </TouchableOpacity>
  </View>

}


