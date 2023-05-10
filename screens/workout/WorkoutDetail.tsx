import { View, SafeAreaView, ScrollView, TextInput, TouchableOpacity, Image, Dimensions, Switch, Alert } from 'react-native'
import React from 'react'
import { Text } from '../../components/Themed'
import tw from 'twrnc'
import useColorScheme from '../../hooks/useColorScheme'
import { ExpoIcon } from '../../components/ExpoIcon'
import { Video } from '../../components/Video'
import { useNavigation } from '@react-navigation/native'
import { Picker } from '../diet/FoodDetail'
import { Category, MediaType } from '../../types/Media'
import { ImagePickerView } from '../../components/ImagePickerView'
import { useCommonAWSIds } from '../../hooks/useCommonContext'
import { Equiptment, Exercise, Favorite, User, Workout, WorkoutDetails } from '../../aws/models'
import { DataStore, Storage } from 'aws-amplify'
import { defaultImage, getMatchingNavigationScreen, isStorageUri, toHHMMSS, uploadImageAndGetID } from '../../data'
import { ErrorMessage } from '../../components/ErrorMessage'
import { ActivityIndicator } from 'react-native-paper'
import { BackButton } from '../../components/BackButton'

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
  const [originalPremium, setOriginalPremium] = React.useState<boolean>(false)
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
      setAuthor(username)
      DataStore.save(new Workout({ name: '', description: '', sub: sub, premium: false, img: '', userID: userId })).then(w => {
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
        if (isStorageUri(wo.img)) {
          Storage.get(wo.img).then(url => {
            setImg([{ uri: url, type: 'image' }])
          })
        } else {
          setImg([{ uri: wo.img || '', type: 'image' }])
        }
      }
      setName(wo.name)
      setDescription(wo.description)
      setPremium(wo.premium || false)
      if (wo.userID === userId) {

        setCanViewDetails(true)
      }
      setOriginalPremium(wo.premium || false)
      const canBeCategory = workoutCategories.filter(x => x.name === wo.category)
      setWorkoutCategory(canBeCategory.length > 0 ? canBeCategory[0] : workoutCategories[0])
      setUpdating(false)

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
    if (originalPremium === premium) return;
    if (editMode === true) return;
    setPremium(originalPremium)
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
    let mediaToUpload = img.length === 0 ? defaultImage : img[0].uri
    if (img.length === 0) {
      setImg([{ uri: defaultImage, type: 'image' }])
    }
    setUpdating(true)
    const original = await DataStore.query(Workout, workoutId)
    if (original) {
      let uploadImg = defaultImage
      if (mediaToUpload !== defaultImage && !isStorageUri(mediaToUpload)) {
        const uri = await uploadImageAndGetID(img[0])
        if (uri) {
          uploadImg = uri
        }
        console.log(uri)

      }
      setOriginalPremium(premium)
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

  return (
    <View style={tw`h-12/12`}>
      <BackButton Right={() => {
        if (!editMode || !id) {
          return null;
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
      <ScrollView showsVerticalScrollIndicator={false}>
        <ImagePickerView editable={editMode === true} srcs={(canViewDetails || editMode) ? img : [{ type: 'image', uri: defaultImage }]} onChange={setImg} type='image' />
        {errors.length > 0 && <View style={tw`px-4 py-3`}>
          <ErrorMessage errors={errors} onDismissTap={() => setErrors([])} /></View>}
        <SafeAreaView>
          <View style={tw`flex-row items-center justify-between px-5 w-12/12`}>
            <View style={tw`w-8/12 max-w-8/12`}>
              <TextInput
                value={name}
                onChangeText={setName}
                editable={editMode}
                placeholder='Workout Name'
                numberOfLines={2}
                placeholderTextColor={'gray'}
                style={tw`text-2xl mb-2 py-2 ${borderStyle} 
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
            {props.editable && <TouchableOpacity onPress={() => setEditMode(!editMode)}>
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
          {(editMode) && <View style={tw`py-5 px-5 flex-row items-center`}>
            <Text style={tw`text-xl mr-4`} weight='semibold'>Premium</Text>
            <Switch value={premium} onValueChange={setPremium} disabled={!editMode} />
          </View>}
          <View style={tw`py-5 px-5`}>
            <Text style={tw`text-2xl`} weight='bold'>Description</Text>
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
            <Text style={tw`text-2xl mb-2`} weight='bold'>Category</Text>
            <Picker width='12/12' data={workoutCategories.map((w, i) => ({ label: `${w.name} ${w.emoji}`, value: i }))} onChange={function (d): void {
              setWorkoutCategory(workoutCategories[d.value])
            }} defaultIndex={workoutCategories.indexOf(workoutCategory)} editable={editMode} />
          </View>

          <View key={'EXERCISES FOR WORKOUT'} style={tw`px-4 w-12/12`}>
            <View style={tw`flex-row w-12/12 justify-between items-center`}>
              <Text style={tw`text-2xl`} weight='bold'>Exercises</Text>
              {editMode && <TouchableOpacity onPress={() => {
                const screen = getMatchingNavigationScreen('ListExercise', navigator)
                //@ts-ignore
                navigator.navigate(screen, { workoutId: workoutId })
              }}>
                <Text>Add New</Text>
              </TouchableOpacity>
              }
            </View>
            {(exercises.length === 0 || !exercises) && <Text style={tw`text-center mt-4`} weight='semibold'>Add exercises to your workout</Text>}
            {exercises.length > 0 && <Text style={tw`text-center mt-4`}>Please note that if the exercise has a video, it will be present while performing the exercise</Text>}
            {(canViewDetails || editable) && exerciseDetails.map((e, edIndex) => {
              let exerciseSelected = exercises.filter(x => x.id === e.exerciseID)
              if (!exerciseSelected[0]) return
              const ex = exerciseSelected[0]
              // @ts-ignore
              const imgs: MediaType[] = ex.media ? ex.media : []
              const images = imgs.filter(x => x.type === 'image')
              return <TouchableOpacity onPress={() => {
                const screen = getMatchingNavigationScreen('ExerciseDetail', navigator)
                //@ts-ignore
                navigator.navigate(screen, { id: ex.id })
              }} disabled={editMode} style={tw`py-3 px-4 bg-gray-${dm ? '700' : '300'} my-4 rounded-xl`} key={e.id + `at index ${edIndex}`}>
                <View style={tw`flex-row justify-between items-center`}>
                  <Text style={tw`text-lg mb-3`} weight='semibold'>{ex.title}</Text>
                  <TouchableOpacity
                    onPress={async () => {
                      if (editMode && e) {
                        await DataStore.delete(WorkoutDetails, e.id)
                      } else {
                        const screen = getMatchingNavigationScreen('ExerciseDetail', navigator)
                        //@ts-ignore
                        navigator.navigate(screen, { id: ex.id })
                      }
                    }}
                    style={[tw`items-center justify-center px-2`]}>
                    <ExpoIcon name={editMode ? 'trash' : 'chevron-right'} iconName='feather' color={dm ? 'white' : 'black'} size={20} />
                  </TouchableOpacity>
                </View>
                <View style={tw`flex-row items-center`}>
                  {(images.length > 0) && <Image source={{ uri: images[0].uri }} style={[tw`rounded-xl w-15 h-15`]} />}
                  <View style={tw`flex-row items-center w-10/12 max-w-10/12 justify-between pl-2`}>
                    <View style={tw`items-center justify-center`}>
                      <TextInput
                        placeholder='x'
                        placeholderTextColor={'gray'}
                        value={e.sets?.toString() || ''}
                        keyboardType='number-pad'
                        onChangeText={v => {
                          const newValue = v.replace(/[^0-9]/g, '')
                          const idx = exerciseDetails.map((x => x.id)).indexOf(e?.id || '')
                          if (idx !== -1) {
                            var exerciseCopy = [...exerciseDetails]
                            exerciseCopy[idx] = { ...exerciseCopy[idx], sets: Number(newValue) || null }
                            setExerciseDetails(exerciseCopy)
                          }
                        }}
                        style={tw`p-3 text-center font-bold text-${dm ? 'white' : 'black'}`}
                        editable={editMode}
                      />
                      <Text weight='semibold'>Sets</Text>
                    </View>
                    <View style={tw`items-center justify-center`}>
                      <TextInput
                        placeholder='x'
                        placeholderTextColor={'gray'}
                        style={tw`p-3 text-center font-bold text-${dm ? 'white' : 'black'}`}
                        editable={editMode}
                        value={e.reps?.toString() || ''}
                        keyboardType='number-pad'
                        onChangeText={v => {
                          const newValue = v.replace(/[^0-9]/g, '')
                          const idx = exerciseDetails.map((x => x.id)).indexOf(e?.id || '')
                          if (idx !== -1) {
                            var exerciseCopy = [...exerciseDetails]
                            exerciseCopy[idx] = { ...exerciseCopy[idx], reps: Number(newValue) || null }
                            setExerciseDetails(exerciseCopy)
                          }
                        }}
                      />
                      <Text weight='semibold'>Reps</Text>
                    </View>
                    <View style={tw`items-center justify-center`}>
                      <TextInput
                        placeholder='x'
                        placeholderTextColor={'gray'}
                        style={tw`p-3 text-center font-bold text-${dm ? 'white' : 'black'}`}
                        editable={editMode}
                        value={(editMode ? e.secs?.toString() : toHHMMSS(e.secs || 0)) || ''}
                        keyboardType='number-pad'
                        onChangeText={v => {
                          const newValue = v.replace(/[^0-9]/g, '')
                          const idx = exerciseDetails.map((x => x.id)).indexOf(e?.id || '')
                          if (idx !== -1) {
                            var exerciseCopy = [...exerciseDetails]
                            exerciseCopy[idx] = { ...exerciseCopy[idx], secs: Number(newValue) || null }
                            setExerciseDetails(exerciseCopy)
                          }
                        }}
                      />
                      <Text weight='semibold'>Time {editMode ? '(s)' : ''}</Text>
                    </View>
                    <View style={tw`items-center justify-center`}>
                      <TextInput
                        placeholder='x'
                        placeholderTextColor={'gray'}
                        style={tw`p-3 text-center font-bold text-${dm ? 'white' : 'black'}`}
                        editable={editMode}
                        value={(editMode ? e.rest?.toString() : toHHMMSS(e.rest || 0)) || ''}
                        keyboardType='number-pad'
                        onChangeText={v => {
                          const newValue = v.replace(/[^0-9]/g, '')
                          const idx = exerciseDetails.map((x => x.id)).indexOf(e?.id || '')
                          if (idx !== -1) {
                            var exerciseCopy = [...exerciseDetails]
                            exerciseCopy[idx] = { ...exerciseCopy[idx], rest: Number(newValue) || null }
                            setExerciseDetails(exerciseCopy)
                          }
                        }}
                      />
                      <Text weight='semibold'>Rest {editMode ? '(s)' : ''}</Text>
                    </View>
                  </View>
                </View>
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
            })}
          </View>

          {(editable || canViewDetails) && <View key={'EQUIPTMENT FOR WORKOUT'} style={tw`px-4 pt-3 mt-6`}>
            <Text style={tw`text-2xl`} weight='bold'>Equiptment</Text>
            {(equiptment?.length === 0 || !equiptment) && <View style={tw`flex items-center`}>
              <Text style={tw`text-center my-4 max-w-11/12`} weight='semibold'>Add exercises with equiptment to see them here</Text>
            </View>}
            {equs.map((e, i) => {
              return <View style={tw`flex-row items-center py-2`} key={`equiptment at index ${i}`}>
                <Image source={{ uri: e.img }} style={{
                  width: 60,
                  height: 60,
                  resizeMode: 'contain',
                  borderRadius: 60 / 2
                }} />
                <Text style={tw`text-lg ml-4`} weight='bold'>{e.name}</Text>
              </View>
            })}
          </View>}
        </SafeAreaView>
        <View style={tw`pb-40`}></View>
      </ScrollView>
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