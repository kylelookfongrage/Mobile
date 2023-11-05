import { SafeAreaView, ScrollView, TextInput, TouchableOpacity, Image, ActivityIndicator, Switch, Alert, Dimensions, KeyboardAvoidingView, Platform } from 'react-native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Text, View } from '../../components/base/Themed'
import tw from 'twrnc'
import useColorScheme from '../../hooks/useColorScheme'
import { useNavigation } from '@react-navigation/native'
import { ImagePickerView } from '../../components/inputs/ImagePickerView'
import { useCommonAWSIds } from '../../hooks/useCommonContext'
import { defaultImage, getMatchingNavigationScreen, toHHMMSS, validate, MediaType, sleep } from '../../data'
import { ErrorMessage } from '../../components/base/ErrorMessage'
import { BackButton } from '../../components/base/BackButton'
import { DeleteButton, EditModeButton, ShareButton, ShowMoreButton, ShowMoreDialogue, ShowUserButton } from '../home/ShowMore'
//@ts-ignore
import { v4 as uuidv4 } from 'uuid';
import ScrollViewWithDrag from '../../components/screens/ScrollViewWithDrag'
import { FormReducer, useForm } from '../../hooks/useForm'
import { Tables } from '../../supabase/dao'
import TitleInput from '../../components/inputs/TitleInput'
import Spacer from '../../components/base/Spacer'
import UsernameDisplay from '../../components/features/UsernameDisplay'
import SaveButton from '../../components/base/SaveButton'
import ManageButton from '../../components/features/ManageButton'
import { PlanAdditions, WorkoutAdditions, useMultiPartForm } from '../../hooks/useMultipartForm'
import useOnLeaveScreen from '../../hooks/useOnLeaveScreen'
import { SortableList } from 'react-native-ui-lib'
import useHaptics from '../../hooks/useHaptics'
import SupabaseImage from '../../components/base/SupabaseImage'
import { EquiptmentTile } from '../../components/features/SearchEquiptment'
import Overlay from '../../components/screens/Overlay'
import StepperInput from '../../components/inputs/StepperInput'
import TimeInput, { valueToSeconds } from '../../components/inputs/TimeInput'
import { WorkoutDao } from '../../types/WorkoutDao'
import SwipeWithDelete from '../../components/base/SwipeWithDelete'
import Colors from '../../constants/Colors'





interface WorkoutDetailProps {
  id?: string;
  editable?: boolean;
  planId?: string;
  dow?: number;
}

export default function WorkoutDetail(props: WorkoutDetailProps) {
  const { subscribed, profile } = useCommonAWSIds()
  let WorkoutForm = useForm<Tables['workout']['Insert']>({
    name: '',
    description: '',
    image: null,
    price: null,
    tags: [],
    user_id: profile?.id
  }, async () => {
    if (props.id && Number(props.id)) {
      let res = await dao.find(Number(props.id))
      let exercisesFound = await dao.find_eqipment(Number(props.id))
      let ex: WorkoutAdditions[] = exercisesFound.map(x => {
        let copy = { ...x }
        delete copy['exercise'];
        return {
          name: x.exercise?.name || '',
          img: x.exercise?.preview || defaultImage,
          equiptment: x.exercise?.exercise_equiptment.flatMap(z => z.equiptment),
          tempId: x.exercise_id,
          ...copy
        }
      })
      multiPartForm.upsert('workouts', uuid, ex)
      return res;
    }
    return null;
  })
  let [form, setForm] = [WorkoutForm.state, WorkoutForm.setForm]
  let ScreenForm = useForm({
    uploading: false,
    editMode: !props.id,
    errors: [],
    s: Dimensions.get('screen'),
    selectedExercise: null as null | number,
    newSets: null as null | number,
    newReps: null as null | number,
    newTime: null as null | string,
    newRest: null as null | string,
    newNote: null as null | string,
    sorted: false
  })
  let [screen, setScreen] = [ScreenForm.state, ScreenForm.setForm]
  let multiPartForm = useMultiPartForm()
  let [uuid] = useState<string>(uuidv4())
  let associatedExercises = multiPartForm['data']['workouts'][uuid] || []
  let allEquipment = associatedExercises.flatMap(x => x.equiptment)
  let associatedEquiptment = [...new Map(allEquipment.map(item =>
    [item['id'], item])).values()];
  let [copiedExercises, setCopiedExercises] = useState<WorkoutAdditions[]>([])
  let aEx = useMemo(() => {
    return associatedExercises.map(x => ({ ...x, id: ((x.tempId || '') + x.index?.toString()) })).sort((a, b) => (a.index || 0) - (b.index || 0))
  }, [associatedExercises])
  let selectedExercise = screen.selectedExercise === null ? null : aEx[screen.selectedExercise];
  useOnLeaveScreen(() => {
    multiPartForm.remove('workouts', uuid)
  })
  const { id } = props;
  const navigator = useNavigation()
  let canViewDetails = props.editable || screen.editMode || form.user_id === profile?.id || subscribed || !form.price
  const dm = useColorScheme() === 'dark'
  let dao = WorkoutDao()
  const onWorkoutSave = async () => {
    try {
      setScreen('uploading', true)
      if (screen.editMode) {
        let e = validate([
          { name: "Your workout's name", value: form.name, options: { required: true } },
          { name: "Your workout's description", value: form.description, options: { required: true } },
          { name: "Exercises", value: associatedExercises.length, options: { validate: (v) => v > 0, errorMessage: 'You must have at least one exercise' } },
        ])
        if (e !== true) throw Error(e[0] || 'Ensure all values are filled out')
        let res = await dao.save({ ...form, image: form.image || defaultImage })
        if (res?.id) {
          await dao.saveWorkoutDetails(res.id, copiedExercises.length > 0 ? copiedExercises : associatedExercises)
          WorkoutForm.dispatch({ type: FormReducer.Set, payload: res })
          setScreen('uploading', false)
          setScreen('editMode', false)
        }
      }
    } catch (error) {
      setScreen('uploading', false)//@ts-ignore
      setScreen('errors', [error.toString()])
    }
  }

  let h = useHaptics()
  const onOrderChange = useCallback((items: WorkoutAdditions[]) => {
    h.press()
    setScreen('sorted', true)
    setCopiedExercises(items.map(((x, i) => ({ ...x, index: i }))))
  }, [])
  const deleteWorkout = async () => {
    if (!props.id) return;
    await dao.remove(Number(props.id))
    navigator.pop()
  }
  return (
    <View style={{ flex: 1 }} includeBackground>
      <BackButton inplace Right={() => {
        if (screen.editMode || !id || !Number(id) || props.planId) return <View />
        return <ShowMoreDialogue workout_id={Number(id)} options={[
          EditModeButton(screen.editMode, () => setScreen('editMode', !screen.editMode), form.user_id, profile?.id),
          DeleteButton('Workout', deleteWorkout, form.user_id, profile?.id),
          // ShowUserButton(form.user_id, navigator),
          ShareButton({ workout_id: Number(id) })
        ]} />
      }} />
      <ScrollViewWithDrag keyboardDismissMode='interactive' rerenderTopView={[screen.editMode, form.image]} showsVerticalScrollIndicator={false} TopView={() => <ImagePickerView editable={screen.editMode} srcs={form.image ? [{ type: 'image', uri: form.image }] : []} onChange={x => {
        if (x[0]) { setForm('image', x[0].uri) }
      }} type='image' />}>
        <View style={[tw`pt-4 px-6 pb-60`]}>
          <ErrorMessage errors={screen.errors} onDismissTap={() => setScreen('errors', [])} />
          <TitleInput value={form.name} onChangeText={x => setForm('name', x)} placeholder='Your workout' />
          <Spacer />
          <UsernameDisplay image disabled={(screen.editMode || screen.uploading)} id={form.user_id} username={form.id ? null : profile?.username} />
          <Spacer />
          <TextInput
            value={form.description || ''}
            multiline
            numberOfLines={4}
            onChangeText={x => setForm('description', x)}
            editable={screen.editMode}
            placeholder='The description of your workout'
            placeholderTextColor={'gray'}
            style={tw`max-w-10/12 text-${dm ? 'white' : 'black'}`}
          />
          <Spacer divider />
          <Text h3>Equipment</Text>
          <Spacer sm />
          {associatedEquiptment.map(equ => {
            return <EquiptmentTile item={equ} key={`equiptment: ${equ.id}`} />
          })}
          <Spacer divider />
          <ManageButton hidden={!screen.editMode} title='Exercises' buttonText='Add New' onPress={() => {
            setScreen('sorted', false)
            const s = getMatchingNavigationScreen('ListExercise', navigator)
            //@ts-ignore
            navigator.navigate(s, { workoutId: uuid })
          }} />
          <Spacer />
          <Overlay visible={screen.selectedExercise === null ? false : true} onDismiss={() => setScreen('selectedExercise', null)}>
            <ManageButton hidden={!screen.editMode} title={selectedExercise?.name} buttonText='Save' onPress={() => {
              const details = { sets: screen.newSets || 1, reps: screen.newReps || 0, time: valueToSeconds(screen.newTime || ''), rest: valueToSeconds(screen.newRest || ''), note: screen.newNote }
              let copy = [...associatedExercises].map((x, i) => {
                if (i === screen.selectedExercise) {
                  return { ...x, ...details }
                }
                return x
              })
              multiPartForm.upsert('workouts', uuid, copy)
              setScreen('newNote', null)
              setScreen('newReps', null)
              setScreen('newSets', null)
              setScreen('newTime', null)
              setScreen('newRest', null)
              setScreen('sorted', false)
              setScreen('selectedExercise', null)
            }} />
            <Spacer xs />
            <TouchableOpacity onPress={() => {
              const s = getMatchingNavigationScreen('ExerciseDetail', navigator)
              navigator.navigate(s, { id: selectedExercise?.tempId })
              setScreen('selectedExercise', null)
            }}>
              <Text xs style={tw`text-red-600`}>Details</Text>
            </TouchableOpacity>
            <Spacer />
            <TextInput editable={screen.editMode} value={screen.newNote || selectedExercise?.note || ''} placeholder='Any notes...' placeholderTextColor={'gray'} onChangeText={v => setScreen('newNote', v)} style={tw`text-${dm ? 'white' : 'black'}`} />
            <Spacer />
            <View style={tw`flex-row items-center justify-around w-12/12`}>
              <View>
                <Text style={tw`text-center text-gray-500`} weight='semibold'>Time</Text>
                <TimeInput editable={screen.editMode} value={screen.newTime || toHHMMSS(selectedExercise?.time || 0, '')} onChange={v => {
                  if (!screen.editMode) return;
                  setScreen('newTime', parseInt(v).toFixed(0) || '')
                }} />
              </View>
              <View>
                <Text style={tw`text-center text-gray-500`} weight='semibold'>Rest</Text>
                <TimeInput editable={screen.editMode} value={screen.newRest || toHHMMSS(selectedExercise?.rest || 0, '')} onChange={v => {
                  if (!screen.editMode) return;
                  setScreen('newRest', parseInt(v).toFixed(0) || '')
                }} />
              </View>
            </View>
            <Spacer xl />
            <View style={tw`flex-row items-center justify-around w-12/12`}>
              <StepperInput editable={screen.editMode} title='Reps' value={screen.newReps || selectedExercise?.reps} onChange={v => setScreen('newReps', v)} />
              <StepperInput editable={screen.editMode} title='Sets' min={1} value={screen.newSets || selectedExercise?.sets} onChange={v => setScreen('newSets', v)} />
            </View>
            <Spacer lg />
          </Overlay>
          <ScrollView horizontal contentContainerStyle={{ alignItems: 'center', justifyContent: 'center', }} style={{ flex: 1, width: screen.s.width, height: screen.s.height * 0.09 * (associatedExercises.length) }} scrollEnabled={false}>
            <SortableList contentContainerStyle={{ backgroundColor: dm ? Colors.dark.background : Colors.light.background }} scrollEnabled={screen.editMode} initialNumToRender={associatedExercises.length} scale={1.1} onOrderChange={onOrderChange} data={aEx} renderItem={(info) => {
              const { index } = info
              //@ts-ignore
              let item = info.item as WorkoutAdditions
              return <SwipeWithDelete includeBackground key={(item.tempId || '') + `3178${index}`} onDelete={() => {
                multiPartForm.upsert('workouts', uuid, associatedExercises.filter((x, i) => i !== index))
              }}>
                <View includeBackground style={{ ...tw`items-center self-center justify-center`, width: screen.s.width * 0.87, height: screen.s.height * 0.09 }}>
                  <TouchableOpacity onPress={() => {
                    if (screen.sorted) {
                      multiPartForm.upsert('workouts', uuid, copiedExercises)
                    }
                    setScreen('selectedExercise', index)
                    setScreen('newNote', item.note || null)
                    setScreen('newReps', item.reps || null)
                    setScreen('newSets', item.sets || null)
                    setScreen('newTime', toHHMMSS(item.time || 0, ''))
                    setScreen('newRest', toHHMMSS(item.rest || 0, ''))
                  }}>
                    <View card style={{ ...tw`px-4 py-1 rounded-lg flex-row items-center`, width: screen.s.width * 0.86, height: screen.s.height * 0.08 }}>
                      <SupabaseImage uri={item.img} style='h-10 w-10 rounded-lg' />
                      <Spacer horizontal sm />
                      <View>
                        <Text weight='semibold' style={tw`max-w-11/12`}>{item.name}</Text>
                        <Spacer xs />
                        <View style={{ ...tw`flex-row items-center justify-between w-10/12` }}>
                          <Text style={tw`text-gray-500`} xs>Sets: {item.reps || 0} x {item.sets || 1}</Text>
                          <Text style={tw`text-gray-500`} xs>Rest: {toHHMMSS(item.rest || 0)}</Text>
                          <Text style={tw`text-gray-500`} xs>Time: {toHHMMSS(item.time || 0)}</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              </SwipeWithDelete>
            }} />
          </ScrollView>
        </View>
      </ScrollViewWithDrag>
      <SaveButton uploading={screen.uploading} title={screen.editMode ? 'Save Workout' : (canViewDetails ? (props.planId ? 'Save to Plan' : 'Start Workout') : 'Purchase Workout')} favoriteId={form.originalWorkout || form.id} favoriteType='workout' onSave={async () => {
        if (screen.editMode) {
          await onWorkoutSave()
        } else if (canViewDetails && form.id) {
          if (props.planId) {
            setScreen('uploading', true)
            let c = multiPartForm.data['plans']?.[props.planId] || []
            let copy: PlanAdditions[] = [...c, { workout_id: form.id, name: form.name, image: form.image || defaultImage, day_of_week: props.dow || 0, id: -(c.length + 1) }]
            multiPartForm.upsert('plans', props.planId, copy)
            setScreen('uploading', false)
            navigator.pop()
          } else {
            //@ts-ignore
            navigator.navigate('WorkoutPlay', { workoutId: form.id })
          }

        } else {
          console.log('here')
          // navigator.navigate('Subscription')
        }
        setScreen('uploading', false)
      }} />
    </View>
  )
}

