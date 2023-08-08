import { SafeAreaView, ScrollView, TextInput, TouchableOpacity, Image, ActivityIndicator, Switch, Alert } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { Text, View } from '../../components/Themed'
import tw from 'twrnc'
import useColorScheme from '../../hooks/useColorScheme'
import { ExpoIcon } from '../../components/ExpoIcon'
import { Video } from '../../components/Video'
import { useNavigation } from '@react-navigation/native'
import { Picker } from '../diet/FoodDetail'
import { Category, MediaType } from '../../types/Media'
import { ImagePickerView } from '../../components/ImagePickerView'
import { useCommonAWSIds } from '../../hooks/useCommonContext'
import { Equiptment, Exercise, Favorite, FavoriteType, LazyWorkoutDetails, User, Workout, WorkoutDetails } from '../../aws/models'
import { DataStore, Storage } from 'aws-amplify'
import { defaultImage, getMatchingNavigationScreen, isStorageUri, titleCase, toHHMMSS, uploadImageAndGetID } from '../../data'
import { ErrorMessage } from '../../components/ErrorMessage'
import { BackButton } from '../../components/BackButton'
import { ShowMoreButton } from '../home/ShowMore'
import TabSelector from '../../components/TabSelector'
import Body from 'react-native-body-highlighter'
import { Swipeable } from 'react-native-gesture-handler'


export const workoutCategories: Category[] = [
  { name: 'N/A', emoji: '🚫' },
  { name: 'Yoga', emoji: '🧘‍♀️' },
  { name: 'Stretches', emoji: '🙆‍♀️' },
  { name: 'Weights', emoji: '🏋️‍♀️' },
  { name: 'Boxing', emoji: '🥊' },
  { name: 'Cardio', emoji: '👟' },
  { name: 'Recreation', emoji: '⛹️‍♀️' },
  { name: 'Crossfit', emoji: '🏆' },
  { name: 'Gymnastics', emoji: '🤸‍♂️' },
]


interface WorkoutDetailProps {
  id?: string;
  editable?: boolean
}

export default function WorkoutDetail(props: WorkoutDetailProps) {
  const { subscribed, sub, userId, username } = useCommonAWSIds()
  const { id, editable } = props
  const [workoutId, setWorkoutId] = React.useState<string | undefined>(props.id)
  const navigator = useNavigation()
  const [name, setName] = React.useState<string>('')
  const [author, setAuthor] = React.useState<string>('')
  const [description, setDescription] = React.useState<string>()
  const [canViewDetails, setCanViewDetails] = React.useState<boolean>(props.editable === true)
  const [workoutCategory, setWorkoutCategory] = React.useState<Category>(workoutCategories[0])
  const [img, setImg] = React.useState<MediaType[]>([])
  const [exercises, setExercises] = React.useState<Exercise[]>([])
  const [exerciseDetails, setExerciseDetails] = React.useState<WorkoutDetails[]>([])
  const [equiptment, setEquiptment] = React.useState<Equiptment[]>([])
  const [originalPremium, setOriginalPremium] = React.useState<boolean | null | undefined>(null)
  const [originalName, setOriginalName] = React.useState<string>('')
  const [originalDescription, setOriginalDescription] = React.useState<string>('')
  const [originalImage, setOriginalImage] = React.useState<MediaType[]>([])
  const [originalCategory, setOrignalCategory] = React.useState<Category>(workoutCategories[0])
  const [orignalExercises, setOriginalExercises] = React.useState<WorkoutDetails[]>([])
  const dm = useColorScheme() === 'dark'
  const [authorId, setAuthorId] = React.useState<string>('')
  const [editMode, setEditMode] = React.useState<boolean>(false)
  const borderStyle = editMode ? `border-b border-gray-500` : ''
  React.useEffect(() => {
    if (subscribed) {
      setCanViewDetails(true)
    }
  }, [subscribed])

  React.useEffect(() => {
    if (!id && !workoutId) {
      setIsUsersWorkout(true)
      setAuthor(username)
      DataStore.save(new Workout({ name: '', description: '', sub: sub, img: '', userID: userId })).then(w => {
        setWorkoutId(w.id)
      })
    }
  }, [])

  React.useEffect(() => {
    if (!workoutId) return;
    DataStore.query(Workout, workoutId).then(wo => {
      if (!wo) return
      DataStore.query(User, wo.userID).then(u => {
        if (u) {
          setAuthor(u.username)
          setAuthorId(u.id)
          //TODO: make it also check if the user is subscribed

        }
      })
      if (wo.img) {
        setImg([{ type: 'image', uri: wo.img }])
        setOriginalImage([{ type: 'image', uri: wo.img }])
      }
      setOriginalDescription(wo.description)
      setOriginalName(wo.name)
      setName(wo.name)
      setIsUsersWorkout(wo.userID === userId)
      setDescription(wo.description)
      setPremium(wo.premium || false)
      if (wo.userID === userId) {

        setCanViewDetails(true)
      }
      setOriginalPremium(wo.premium)
      const canBeCategory = workoutCategories.filter(x => x.name === wo.category)
      setWorkoutCategory(canBeCategory.length > 0 ? canBeCategory[0] : workoutCategories[0])
      setOrignalCategory(canBeCategory.length > 0 ? canBeCategory[0] : workoutCategories[0])
      setUpdating(false)
      DataStore.query(WorkoutDetails, wd => wd.workoutID.eq(workoutId)).then(x => setOriginalExercises(x))

    })
    let subscription = DataStore.observeQuery(WorkoutDetails, wd => wd.workoutID.eq(workoutId), { sort: x => x.createdAt('ASCENDING') }).subscribe(async ss => {
      const { items } = ss
      setExerciseDetails(items)
      const exs = await Promise.all(items.map(async e => {
        const ex = await DataStore.query(Exercise, e.exerciseID)
        if (!ex) return
        //@ts-ignore
        const imgs: MediaType[] = ex.media || []
        const media = await Promise.all(imgs.map(async img => {
          if (isStorageUri(img.uri)) {
            const url = await Storage.get(img.uri)
            return { ...img, uri: url }
          } else {
            return img
          }
        }))
        return { ...ex, media: media }
      }))
      //@ts-ignore
      setExercises(exs)
    })


    return () => {
      subscription.unsubscribe()
    }
  }, [workoutId])

  React.useEffect(() => {
    const resetExercises = async () => {
      for (var ex of orignalExercises) {
        const potential = await DataStore.query(WorkoutDetails, ex.id)
        if (!potential) {
          await DataStore.save(new WorkoutDetails({
            userID: ex.userID, workoutID: ex.workoutID, exerciseID: ex.exerciseID,
            sets: ex.sets, secs: ex.secs, reps: ex.reps, rest: ex.rest, note: ex.note
          }))
        }
      }
      for (var exercise of exerciseDetails) {
        if (!orignalExercises.find(x => x.id === exercise.id)) {
          await DataStore.delete(WorkoutDetails, exercise.id)
        }
      }
    }
    if (editMode === false) {
      setName(originalName)
      setImg(originalImage)
      setDescription(originalDescription)
      setWorkoutCategory(originalCategory)
      setPremium(originalPremium || false)
      resetExercises()
    }
  }, [editMode])

  React.useEffect(() => {
    if (!exercises || exercises.length === 0) return;
    Promise.all(exercises.map(async ex => {
      const eeds = await DataStore.query(Equiptment, equ => equ.ExerciseEquiptmentDetails.exerciseID.eq(ex.id))
      const equWithImages = await Promise.all(eeds.map(async eq => {
        if (isStorageUri(eq.img)) {
          return { ...eq, img: await Storage.get(eq.img) }
        } else {
          return eq
        }
      }))
      return equWithImages
    })).then(x => setEquiptment(x ? x.flat() : []))
  }, [exercises])



  React.useEffect(() => {
    const routes = navigator.getState()
    const lastRoute = routes.routes[routes.routes.length - 1]
    //@ts-ignore
    if (lastRoute && lastRoute?.params['editable']) {
      setEditMode(true)
    } else {
      if (props.editable === true) {
        setEditMode(true)
      } else {
        setEditMode(false)
      }
    }


  }, [props.editable])

  const [premium, setPremium] = React.useState<boolean>(false)
  const [errors, setErrors] = React.useState<string[]>([])
  const [isUsersWorkouts, setIsUsersWorkout] = React.useState<boolean>(false)
  let bodyPartMapping: { [k: string]: number } = {}
  exercises.forEach((e) => {
    for (var part of (e.bodyParts || [])) {
      if (!part) continue
      bodyPartMapping[part] = (bodyPartMapping[part] || 0) + 1
    }
  })

  const equs: { img: string, name: string, id: string }[] = []
  equiptment.forEach(e => {
    if (equs.filter(x => x.id === e.id).length > 0) {
      return
    } else {
      equs.push({ name: e.name, img: e.img, id: e.id })
    }
  })

  const [updating, setUpdating] = React.useState<boolean>(false)

  const onWorkoutSave = async () => {
    setErrors([])
    if (!workoutId) {
      setErrors(['There was a problem'])
      return
    }
    if (!name) {
      setErrors(['Your workout must have a name'])
      return
    }
    if (exerciseDetails.length === 0) {
      setErrors(["You must have at least one workout"])
      return;
    }
    if (exerciseDetails.filter(x => !x.sets).length > 0) {
      setErrors(['Your workouts must have at least one set'])
      return;
    }

    if (premium === true) {
      let exercisesThatAreNotTheUsers = exercises.filter(x => x.userID !== userId)
      if (exercisesThatAreNotTheUsers.length > 0) {
        setErrors(['For a premium workout, all exercises must be your own']);
        return;
      }
    }
    let mediaToUpload = img.length === 0 ? defaultImage : img[0].uri
    if (img.length === 0) {
      setImg([{ uri: defaultImage, type: 'image' }])
    }
    setUpdating(true)
    const original = await DataStore.query(Workout, workoutId)
    if (original) {
      let uploadImg = defaultImage
      if ((mediaToUpload !== defaultImage) && !isStorageUri(mediaToUpload)) {
        const uri = await uploadImageAndGetID(img[0])
        if (uri) {
          uploadImg = uri
        }
        console.log(uri)

      }
      await DataStore.save(Workout.copyOf(original, og => {
        og.premium = premium;
        og.description = description || '';
        og.name = name;
        og.img = uploadImg
        og.category = workoutCategory.name
      }))
      await Promise.all(exerciseDetails.map(async (ed, i) => {
        const og = await DataStore.query(WorkoutDetails, ed.id)
        if (!og) return
        await DataStore.save(WorkoutDetails.copyOf(og, x => {
          x.reps = ed.reps;
          x.secs = ed.secs
          x.sets = ed.sets;
          x.rest = ed.rest;
          x.note = ed.note;
        }))
      }))
      setOriginalPremium(premium)
      setOrignalCategory(workoutCategory)
      setOriginalDescription(description || '')
      setOriginalName(name)
      setOriginalImage([{ type: 'image', uri: uploadImg }])
      setOriginalExercises(exerciseDetails)
      alert('Your workout has been saved!')
      setEditMode(false)
      setUpdating(false)
    }
  }

  const [favorite, setFavorite] = React.useState<boolean>(false);
  React.useEffect(() => {
    if (!workoutId) return;
    const subscription = DataStore.observeQuery(Favorite, f => f.and(fav => [
      fav.potentialID.eq(workoutId), fav.type.eq('WORKOUT'), fav.userID.eq(userId)
    ])).subscribe(ss => {
      const { items } = ss;
      if (items.length > 0) {
        setFavorite(true)
      } else {
        setFavorite(false)
      }
    })
    return () => subscription.unsubscribe()
  }, [])
  const firstImage = img.filter(x => x.type === 'image')
  const tabs = ['Muscles', 'Overview', 'Exercises', 'Equiptment'] as const
  const [selectedTab, setSelectedTab] = useState<typeof tabs[number]>(tabs[0])
  const pickerData = workoutCategories.map((w, i) => ({ label: `${w.name} ${w.emoji}`, value: i }))
  const changeTab = (forward: boolean=true) => {
    const currentTab = tabs.findIndex(x => x==selectedTab)
    if (currentTab === -1) {
      setSelectedTab(tabs[0])
    } else {
        let newTab = tabs[currentTab + (forward ? 1 : -1)]
        if (newTab) setSelectedTab(newTab)
    } 
}
const {onTouchStart, onTouchEnd} = useSwipe(changeTab, () => changeTab(false), 6)
  return (
    <View style={{ flex: 1 }} includeBackground>
      <BackButton Right={() => {
        if (!editMode || !id) {
          return <ShowMoreButton name={name} desc={'@' + author} id={workoutId || ''} img={firstImage.length === 0 ? defaultImage : firstImage[0].uri} type={FavoriteType.WORKOUT} userId={authorId} />
        }
        return <TouchableOpacity onPress={() => {
          Alert.alert("Are you sure you want to delete this workout?", "You cannot undo this action later, and all progress associated with this workout will be deleted.", [
            {
              text: 'Yes', onPress: async () => {
                if (!workoutId) return
                await DataStore.delete(Workout, workoutId)
                //@ts-ignore
                navigator.pop()
              }
            }, { text: 'Cancel' }
          ])
        }}>
          <Text style={tw`text-red-500`} weight='semibold'>Delete Workout</Text>
        </TouchableOpacity>
      }} />
      <ScrollViewWithDrag showsVerticalScrollIndicator={false} TopView={() => <ImagePickerView editable={editMode === true} srcs={(canViewDetails || editMode) ? img : [{ type: 'image', uri: defaultImage }]} onChange={setImg} type='image' />}>
        
        {errors.length > 0 && <View style={tw`px-4 py-3`}>
          <ErrorMessage errors={errors} onDismissTap={() => setErrors([])} /></View>}
        <View includeBackground style={[tw``, {zIndex: 1, flex: 1}]}>
          <View includeBackground style={[tw`flex-row items-center justify-between px-5 w-12/12 -mt-6 rounded-3xl`, {zIndex: 1}]}>
            <View style={tw`w-8/12 max-w-8/12`}>
              <TextInput
                value={name}
                onChangeText={setName}
                editable={editMode}
                placeholder='Workout Name'
                numberOfLines={2}
                placeholderTextColor={'gray'}
                style={tw`text-2xl font-bold mb-2 py-2 ${borderStyle} 
                              text-${dm ? 'white' : 'black'}`}
              />
              <TouchableOpacity onPress={() => {
                if (!editMode) {
                  const screen = getMatchingNavigationScreen('User', navigator)
                  //@ts-ignore
                  navigator.push(screen, { id: authorId })
                }
              }}>
                <Text>by {<Text style={tw`text-red-600`}>{author}</Text>}</Text>
              </TouchableOpacity>
            </View>
            {(props.editable || isUsersWorkouts) && <TouchableOpacity onPress={() => setEditMode(!editMode)}>
              <Text>{editMode ? 'Cancel' : "Edit"}</Text>
            </TouchableOpacity>}
            {!editMode && <TouchableOpacity style={tw`px-3`} onPress={async () => {
              if (!workoutId) return;
              const isFavorited = await DataStore.query(Favorite, f => f.and(fav => [
                fav.potentialID.eq(workoutId), fav.userID.eq(userId), fav.type.eq('WORKOUT')
              ]))
              if (isFavorited.length > 0) {
                await DataStore.delete(Favorite, isFavorited[0].id)
              } else {
                await DataStore.save(new Favorite({ userID: userId, potentialID: workoutId, type: 'WORKOUT' }))
              }
            }}>
              <ExpoIcon name={favorite ? 'heart' : 'heart-outline'} iconName='ion' color={'red'} size={25} />
            </TouchableOpacity>}
          </View>
          {(editMode) && <View style={tw`px-5 pt-4`}>
            <View style={tw`flex flex-row items-center`}>
              <Text style={tw`text-lg mr-4`} weight='semibold'>Premium</Text>
              <Switch value={premium} onValueChange={setPremium} disabled={(!editMode || originalPremium === true || originalPremium === false)} />
            </View>
            <Text style={tw`text-xs text-gray-500`}>Please note that you cannot change premium status once saved</Text>
          </View>}
          {/* @ts-ignore */}
          <TabSelector tabs={[...tabs]} selected={selectedTab} onTabChange={setSelectedTab} style={tw`mt-6`} />
         <View style={[{flex: 1}, tw`pb-40`]} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
         {selectedTab === 'Overview' && <View style={{ flex: 1 }}>
            <View style={tw`py-5 px-5`}>
              <Text style={tw`text-lg`} weight='semibold'>Overview</Text>
              <TextInput
                value={description}
                multiline
                numberOfLines={4}
                onChangeText={setDescription}
                editable={editMode}
                placeholder='The description of your workout'
                placeholderTextColor={'gray'}
                style={tw`max-w-10/12 py-1 text-${dm ? 'white' : 'black'} ${borderStyle}`}
              />
            </View>
            <View style={tw`py-5 px-5`}>
              <Text style={tw`text-lg mb-2`} weight='semibold'>Category</Text>
              <Picker width='12/12' data={pickerData} onChange={function (d): void {
                setWorkoutCategory(workoutCategories[d.value])
              }} defaultIndex={workoutCategories.indexOf(workoutCategory)} editable={editMode} />
            </View>
          </View>}
          {selectedTab === 'Exercises' && <View key={'EXERCISES FOR WORKOUT'} style={tw`px-4 pt-6 w-12/12`}>
            <View style={tw`flex-row w-12/12 justify-between items-center`}>
              <Text style={tw`text-lg`} weight='semibold'>Exercises</Text>
              {editMode && <TouchableOpacity onPress={() => {
                const screen = getMatchingNavigationScreen('ListExercise', navigator)
                //@ts-ignore
                navigator.navigate(screen, { workoutId: workoutId })
              }}>
                <Text>Add New</Text>
              </TouchableOpacity>
              }
            </View>
            {(exercises.length === 0 || !exercises) && <Text style={tw`text-center text-xs text-gray-500 mt-4`} weight='semibold'>Add exercises to your workout</Text>}
            {(canViewDetails || editable) && exerciseDetails.map((e, i) => {
              let exerciseSelected = exercises.filter(x => x.id === e.exerciseID)
              if (!exerciseSelected[0]) return
              const ex = exerciseSelected[0]
              return <ExerciseTile onDelete={async (uid) => {
                await DataStore.delete(WorkoutDetails, uid)
              }} id={e.id} key={e.id + `-${i}`} exercise={ex} exerciseDetails={exerciseDetails} setExerciseDetails={setExerciseDetails} e={e} editMode={editMode} />
            })}
          </View>}

          {((editable || canViewDetails) && selectedTab === 'Equiptment') && <View key={'EQUIPTMENT FOR WORKOUT'} style={tw`px-4 pt-3 mt-2`}>
            <Text style={tw`text-lg`} weight='semibold'>You'll Need</Text>
            {(equiptment?.length === 0 || !equiptment) && <View style={tw`flex items-center`}>
              <Text style={tw`text-center my-4 max-w-11/12`} weight='semibold'>Add exercises with equiptment to see them here</Text>
            </View>}
            {equs.map((e, i) => {
              return <View style={tw`flex-row items-center py-2`} key={`equiptment at index ${i}`}>
                <Image source={{ uri: e.img }} style={tw`w-15 h-15 rounded-lg`} />
                <Text style={tw`ml-2`} weight='regular'>{e.name}</Text>
              </View>
            })}
          </View>}
          {selectedTab === 'Muscles' && <View style={tw`pt-6 px-5`}>
            <View style={tw`items-center justify-center my-4`}>
              <Body colors={['#FAA0A0', '#FA5F55', '#FF0000']} data={Object.keys(bodyPartMapping).map(x => {
                let value = bodyPartMapping[x]
                if (value > 3) value = 3
                return { slug: x, intensity: value, color: '' }
              })} scale={1.5} />
            </View>
            <View>
              {Object.keys(bodyPartMapping).map(x => {
                return <Text style={tw`mb-2`} key={x}>• {titleCase(x.split('-').join(' '))} (x{bodyPartMapping[x]})</Text>
              })}
            </View>
          </View>}
         </View>
        </View>
      </ScrollViewWithDrag>
      <View style={[
        {
          position: 'absolute',
          bottom: 0,
          flex: 1
        },
        tw`w-12/12`
      ]}>
        {/* Add Food Button */}
        <View style={tw`py-5 w-12/12 items-center px-7 flex-row justify-center`}>
          <TouchableOpacity
            onPress={() => {
              if (editMode) {
                onWorkoutSave()
              } else if (canViewDetails) {
                //@ts-ignore
                navigator.navigate('WorkoutPlay', { workoutId: workoutId })
              } else {
                navigator.navigate('Subscription')
              }

            }}
            style={tw`bg-${dm ? 'red-600' : "red-500"} mr-2 px-5 h-12 justify-center rounded-full`}>
            {updating && <ActivityIndicator />}
            {!updating && <Text numberOfLines={1} style={tw`text-center text-white`} weight='semibold'>{props.id ? ((editMode) ? 'Save Workout' : canViewDetails ? 'Start Workout' : 'Purchase Workout') : 'Save Workout'}</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

import * as ImagePreview from 'expo-video-thumbnails'
import { useSwipe } from '../../hooks/useSwipe'
import ScrollViewWithDrag from '../../components/ScrollViewWithDrag'
import BackgroundGradient from '../../components/BackgroundGradient'
const ExerciseTile = (props: { id: string, exercise: Exercise; onDelete?: (e: string) => void; editMode: boolean; e: LazyWorkoutDetails; exerciseDetails: LazyWorkoutDetails[]; setExerciseDetails: (e: LazyWorkoutDetails[]) => void; }) => {
  const { e, exercise, editMode, exerciseDetails, setExerciseDetails } = props;
  const [image, setImage] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const settings = [{ name: 'Sets', k: 'sets' }, { name: 'Reps', k: 'reps' }, { name: 'Time', k: 'secs' }, { name: 'Rest', k: 'rest' }]
  const fetchMedia = (async () => {
    setLoading(true)
    let img = null;
    try {
      let media = (exercise.media || [{ type: 'image', uri: defaultImage }])?.[0]
      img = media?.uri || defaultImage
      if (isStorageUri(img)) img = await Storage.get(img)
      if (media?.type === 'video') {
        img = (await ImagePreview.getThumbnailAsync(img)).uri
      }
    } catch (error) {

    }
    setLoading(false)
    setImage(img)
  })

  useEffect(() => {
    fetchMedia()
  }, [props.exercise.media?.[0]?.uri])

  const dm = useColorScheme() === 'dark'
  const navigator = useNavigation()
  return <Swipeable renderRightActions={() => {
    if (editMode) return <TouchableOpacity onPress={() => {
      props.onDelete && props.onDelete(e.id)
    }} style={tw`flex items-center justify-center p-3`}>
      <ExpoIcon name='x' iconName='feather' size={20} color='gray' />
      <Text style={tw`text-xs text-gray-500`} weight='semibold'>Delete</Text>
    </TouchableOpacity>
  }}>
    <TouchableOpacity onPress={() => {
      const screen = getMatchingNavigationScreen('ExerciseDetail', navigator)
      //@ts-ignore
      navigator.navigate(screen, { id: exercise.id })
    }} disabled={editMode} style={tw`py-3`}>
      {loading && <ActivityIndicator />}
      {true && <View style={tw`flex-row items-start`}>
        {image && <Image source={{ uri: image }} style={tw`h-30 w-25 rounded`} />}
        <View style={tw`ml-2`}>
          <Text style={tw`ml-2`} weight='semibold'>{exercise.title}</Text>
          <View style={tw`flex-row max-w-10/12 items-center justify-evenly flex-wrap`}>
            {settings.map(s => {
              return <View key={`${e.id} - Setting ${s.name}`} style={tw`flex-row items-center justify-between pr-4 bg-gray-800 rounded-2xl my-2 w-5/12`}>
                <TextInput
                  placeholder='x'
                  placeholderTextColor={'gray'}
                  style={tw`mr-1 p-3 text-${dm ? 'white' : 'black'}`}
                  editable={editMode}
                  // @ts-ignore
                  value={(editMode ? (e[s.k]?.toString() || '') : (
                    // @ts-ignore 
                    ['secs', 'rest'].includes(s.k) ? (toHHMMSS(e[s.k] || 0) || '') : e[s.k]?.toString()
                  ))}
                  keyboardType='number-pad'
                  onChangeText={v => {
                    const newValue = v.replace(/[^0-9]/g, '')
                    const idx = exerciseDetails.map((x => x.id)).indexOf(e?.id || '')
                    if (idx !== -1) {
                      var exerciseCopy = [...exerciseDetails]
                      exerciseCopy[idx] = { ...exerciseCopy[idx] }
                      // @ts-ignore 
                      exerciseCopy[idx][s.k] = Number(newValue) || null
                      setExerciseDetails(exerciseCopy)
                    }
                  }}
                />
                <Text style={tw`text-gray-500 text-xs`} weight='semibold'>{s.name}</Text>
              </View>
            })}
          </View>
        </View>
      </View>}
      {(editMode || e.note) && <TextInput
        value={e.note || ''}
        placeholder='Notes would be here'
        placeholderTextColor={'gray'}
        style={tw`p-3 text-center font-bold text-${dm ? 'white' : 'black'}`}
        editable={editMode} onChangeText={(x) => {
          const idx = exerciseDetails.map((x => x.id)).indexOf(e?.id || '')
          if (idx !== -1) {
            var exerciseCopy = [...exerciseDetails]
            exerciseCopy[idx] = { ...exerciseCopy[idx], note: x }
            setExerciseDetails(exerciseCopy)
          }
        }} />}
    </TouchableOpacity>
  </Swipeable>
}