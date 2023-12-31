import SaveButton from '../../components/base/SaveButton'
import { View, Text } from '../../components/base/Themed'
import React, { useState } from 'react'
import { FormReducer, useForm } from '../../hooks/useForm'
import { Tables } from '../../supabase/dao'
import { supabase } from '../../supabase'
import ScrollViewWithDrag from '../../components/screens/ScrollViewWithDrag'
import { BackButton } from '../../components/base/BackButton'
import { DeleteButton, EditModeButton, ShareButton, ShowMoreDialogue, ShowUserButton } from '../home/ShowMore'
import { ImagePickerView } from '../../components/inputs/ImagePickerView'
import { useCommonAWSIds } from '../../hooks/useCommonContext'
import { defaultImage, getMatchingNavigationScreen, validate } from '../../data'
import TitleInput from '../../components/inputs/TitleInput'
import Spacer from '../../components/base/Spacer'
import UsernameDisplay from '../../components/features/UsernameDisplay'
import tw from 'twrnc'
import { Platform, Pressable, TextInput, useColorScheme } from 'react-native'
import { ExpoIcon } from '../../components/base/ExpoIcon'
import moment from 'moment'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { ActionSheet } from 'react-native-ui-lib'
import { useNavigation } from '@react-navigation/native'
//@ts-ignore
import { v4 as uuidv4 } from 'uuid';
import useOnLeaveScreen from '../../hooks/useOnLeaveScreen'
import SupabaseImage from '../../components/base/SupabaseImage'
import SwipeWithDelete from '../../components/base/SwipeWithDelete'
import { ErrorMessage } from '../../components/base/ErrorMessage'
import { PlanDao } from '../../types/PlanDao'
import ManageButton from '../../components/features/ManageButton'
import { useSelector } from '../../redux/store'
import { useMultiPartForm } from '../../redux/api/mpf'

export default function Plan(props: { id: Tables['fitness_plan']['Row']['id'] }) {
    let { profile } = useSelector(x => x.auth);
    let PlanForm = useForm<Tables['fitness_plan']['Insert']>({
        name: '', description: '', image: null, user_id: profile?.id
    }, async () => {
        if (props.id) {
            let res = await supabase.from('fitness_plan').select('*').filter('id', 'eq', props.id).maybeSingle()
            let d = await dao.getDetails(props.id)
            if (d) {
                mpf.upsert(d)
            }
            if (res.data) {
                return res.data
            }
        }
        return null;
    })
    let [f, setForm] = [PlanForm.state, PlanForm.setForm]
    let ScreenForm = useForm({ editMode: !props.id, uploading: false, errors: [] as string[] })
    let [s, setScreen] = [ScreenForm.state, ScreenForm.setForm]
    let saveTitle = s.editMode ? 'Save Plan' : 'Subscribe to Plan'
    const deletePlan = async () => {

    }
    let canViewDetails = true;
    let [uuid] = useState<string>(uuidv4())
    let mpf = useMultiPartForm('plans', uuid)
    useOnLeaveScreen(() => mpf.remove())
    let details = mpf.data || []
    let dm = useColorScheme() === 'dark'
    const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<number | null>(null)
    let [dow, setDow] = useState<number>(0)
    let dao = PlanDao()
    let navigator = useNavigation();
    let [showSubscription, setShowSubscription] = useState<boolean>(false)
    return (
        <View style={{ flex: 1 }} includeBackground>
            <ScrollViewWithDrag rerenderTopView={[s.editMode, f.image]} disableRounding TopView={() => <View>
                <BackButton inplace Right={() => {
                    if (s.editMode || !props.id || !Number(props.id)) return <View />
                    return <ShowMoreDialogue plan_id={Number(props.id)} options={[
                        EditModeButton(s.editMode, () => setScreen('editMode', !s.editMode), f.user_id, profile?.id),
                        DeleteButton('Meal', deletePlan, f.user_id, profile?.id),
                        // ShowUserButton(f.user_id, navigator),
                        ShareButton({ meal_id: Number(props.id) })
                    ]} />
                }} />
                <ImagePickerView editable={s.editMode} srcs={s.editMode ? (f.image ? [{ type: 'image', uri: f.image }] : []) : [{ type: 'image', uri: f.image || defaultImage }]} onChange={x => {
                    setForm('image', x?.[0]?.uri)
                }} type='image' />
            </View>} style={{ flex: 1, }} showsVerticalScrollIndicator={false}>
                <View style={tw`pt-4 px-6 pb-60 -mt-10`} includeBackground>
                <ErrorMessage errors={s.errors} onDismissTap={() => setScreen('errors', [])} />
                    <TitleInput
                        value={f.name || ''}
                        editable={s.editMode}
                        onChangeText={x => setForm('name', x)}
                        placeholder='New Fitness Plan'
                    />
                    <Spacer lg />
                    {/* @ts-ignore */}
                    <UsernameDisplay image disabled={(s.editMode || s.uploading)} id={f.user_id} username={f.id ? null : profile?.username} />
                    <Spacer lg />
                    <TextInput
                        value={f.description || ''}
                        multiline
                        numberOfLines={4}
                        onChangeText={x => setForm('description', x)}
                        editable={s.editMode}
                        placeholder='The description of your fitness plan, both from a macronutrient and workout perspective'
                        placeholderTextColor={'gray'}
                        style={tw`max-w-11/12 text-${dm ? 'white' : 'black'}`}
                    />
                    <Spacer divider lg />
                    <Text h5 weight='bold'>Nutrition Goals</Text>
                    <Spacer sm />
                    <View style={tw`flex-row items-center justify-around flex-wrap rounded-lg`} card translucent>
                        <MacroInput name='Protein' editable={s.editMode} percent={f.protein_percent} limit={f.protein_limit} onChange={(x, y) => {
                            setForm(y ? 'protein_percent' : 'protein_limit', x)
                        }} />
                        <MacroInput name='Carbs' editable={s.editMode} percent={f.carb_percent} limit={f.carb_limit} onChange={(x, y) => {
                            setForm(y ? 'carb_percent' : 'carb_limit', x)
                        }} />
                        <MacroInput name='Fat' editable={s.editMode} percent={f.fat_percent} limit={f.fat_limit} onChange={(x, y) => {
                            setForm(y ? 'fat_percent' : 'fat_limit', x)
                        }} />
                        <MacroInput name='Calories' hideUnits editable={s.editMode} limit={f.calories} onChange={(x, y) => {
                            setForm('calories', x)
                        }} />
                    </View>
                    <Spacer divider lg />
                    <Text h5 weight='bold'>Daily Breakdown</Text>
                    <Spacer />
                    <View style={tw`flex-row items-center justify-between`}>
                    {[0,1,2,3,4,5,6].map((x) => {
                        let selected = dow == x
                        return <TouchableOpacity onPress={() => setDow(x)} key={`Day of week ${x}`}>
                           <View card={!selected} style={tw`rounded-full h-10 w-10 items-center justify-center ${selected ? 'bg-red-600' : ''}`}>
                           <Text weight={'bold'} lg style={tw`text-center ${selected ? 'text-white' : ''}`}>{moment().local().weekday(x).format('dd')}</Text>
                           </View>
                        </TouchableOpacity>
                    })}
                    </View>
                    <Spacer lg/>
                    <ManageButton title='Workouts' hidden={!s.editMode} buttonText='Add' onPress={() => {
                        let s = getMatchingNavigationScreen('ListWorkout', navigator)
                        //@ts-ignore
                        navigator.navigate(s, {planId: uuid, dow})
                    }}/>
                    <Spacer sm/>
                    {details.filter(z => z.day_of_week===dow && z.workout_id).length === 0 && <Text style={tw`my-3 text-center text-gray-500`}>No workouts to display</Text>}
                    {details.filter(z => z.day_of_week===dow && z.workout_id).map((d, i) => {
                        return <SwipeWithDelete disabled={!s.editMode} onDelete={() => {
                            mpf.upsert([...details].filter(deet => deet.id !== d.id))
                        }} key={`Plan detail for ${dow} - ${d.workout_id || d.meal_id} - ${i}`}>
                            <TouchableOpacity onPress={() => {
                                let sc = d.workout_id ? 'WorkoutDetail' : 'MealDetail'
                                let screen = getMatchingNavigationScreen(sc, navigator)
                                //@ts-ignore
                                navigator.navigate(screen, {id: d.meal_id || d.workout_id})
                            }}>
                            <View style={tw`flex-row items-center mb-2 justify-between`}>
                            <Text xs style={tw`text-gray-500`}>{d.workout_id ? 'WORKOUT' : (d.meal_id ? 'MEAL' : '')}</Text>
                            <Spacer horizontal sm />
                            <View card style={tw`flex-row items-center w-9/12 py-2 px-3 rounded-lg`}>
                                <SupabaseImage uri={d.image} style={`h-10 w-10 rounded-full`} />
                                <Spacer horizontal sm />
                                <Text weight='semibold'>{d.name}</Text>
                            </View>
                        </View>
                            </TouchableOpacity>
                        </SwipeWithDelete>
                    })}
                    <Spacer lg/>
                    <ManageButton title='Meals' hidden={!s.editMode} buttonText='Add' onPress={() => {
                        let s = getMatchingNavigationScreen('ListMeal', navigator)
                        //@ts-ignore
                        navigator.navigate(s, {planId: uuid, dow})
                    }}/>
                    <Spacer sm/>
                    {details.filter(z => z.day_of_week===dow && z.meal_id).length === 0 && <Text style={tw`my-3 text-center text-gray-500`}>No meals to display</Text>}
                    {details.filter(z => z.day_of_week===dow && z.meal_id).map((d, i) => {
                        return <SwipeWithDelete disabled={!s.editMode} onDelete={() => {
                            mpf.upsert([...details].filter(deet => deet.id !== d.id))
                        }} key={`Plan detail for ${dow} - ${d.workout_id || d.meal_id} - ${i}`}>
                            <TouchableOpacity onPress={() => {
                                let sc = d.workout_id ? 'WorkoutDetail' : 'MealDetail'
                                let screen = getMatchingNavigationScreen(sc, navigator)
                                //@ts-ignore
                                navigator.navigate(screen, {id: d.meal_id || d.workout_id})
                            }}>
                            <View style={tw`flex-row items-center mb-2 justify-between`}>
                            <Text xs style={tw`text-gray-500`}>{d.workout_id ? 'WORKOUT' : (d.meal_id ? 'MEAL' : '')}</Text>
                            <Spacer horizontal sm />
                            <View card style={tw`flex-row items-center w-9/12 py-2 px-3 rounded-lg`}>
                                <SupabaseImage uri={d.image} style={`h-10 w-10 rounded-full`} />
                                <Spacer horizontal sm />
                                <Text weight='semibold'>{d.name}</Text>
                            </View>
                        </View>
                            </TouchableOpacity>
                        </SwipeWithDelete>
                    })}
                   
                </View>
                <ActionSheet
                    visible={selectedDayOfWeek !== null}
                    cancelButtonIndex={2}
                    destructiveButtonIndex={2}
                    useNativeIOS={Platform.OS === 'ios'}
                    options={[
                        { label: 'Add Meal', onPress: async () => {
                            let s = getMatchingNavigationScreen('ListMeal', navigator)
                            //@ts-ignore
                            navigator.navigate(s, {planId: uuid, dow: selectedDayOfWeek})
                            setSelectedDayOfWeek(null)
                        }},
                        { label: 'Add Workout', onPress: async () => {
                            let s = getMatchingNavigationScreen('ListWorkout', navigator)
                            //@ts-ignore
                            navigator.navigate(s, {planId: uuid, dow: selectedDayOfWeek})
                            setSelectedDayOfWeek(null)
                        }},
                        { label: 'Cancel', onPress: () => {
                            setSelectedDayOfWeek(null)
                        }}
                    ]}
                />
            </ScrollViewWithDrag>
            <SaveButton discludeBackground uploading={s.uploading} title={saveTitle} favoriteId={f.id} favoriteType='plan' onSave={async () => {
                setScreen('uploading', true)
                try {
                    if (s.editMode) {
                        let e = validate([
                            { name: "Your plan's name", value: f.name, options: { required: true } },
                            { name: "Your plan's description", value: f.description, options: { required: true } },
                            { name: "Details", value: details.length, options: { validate: (v) => v > 0, errorMessage: 'You must have at least one detail' } },
                        ])
                        if (e !== true && e.length > 0) throw Error(e[0])
                        let res = await dao.save({...f, user_id: props.id ? f.user_id : profile?.id})
                        if (res?.id || props.id) {
                            //@ts-ignore
                            await dao.saveDetails((props.id || res.id), details)
                            PlanForm.dispatch({type: FormReducer.Set, payload: res})
                            setScreen('editMode', false)
                        }
                    } else if (f.id) {
                        // check if subscribed

                    }
                } catch (error) {
                    //@ts-ignore
                    setScreen('errors', [error.toString()])
                }
                setScreen('uploading', false)

            }} />
        </View>
    )
}


const MacroInput = (props: { limit?: number | null | undefined, percent?: number | null | undefined; name: string; editable?: boolean, onChange?: (v: number | null | undefined, percent: boolean) => void; hideUnits?: boolean }) => {
    let dm = useColorScheme() === 'dark'
    const [showPercent, setShowPercent] = useState(props.percent ? true : false)
    return <View style={tw`w-5.5/12 py-5`}>
        <View style={tw`flex-row items-end justify-center`}>
            <TextInput
                value={props.limit?.toString() || props.percent?.toString() || ''}
                placeholder='0'
                editable={props.editable}
                keyboardType='numeric'
                onChangeText={v => {
                    const newValue = v.replace(/[^0-9]/g, '')
                    props.onChange && props.onChange(Number(newValue) || null, showPercent)
                }}
                style={tw`text-center text-${dm ? 'white' : 'black'} font-semibold text-3xl`}
            />
            {!props.hideUnits && <Pressable disabled={!props.editable} onPress={() => {
                if (props.onChange) {
                    props.onChange(null, showPercent)
                }
                setShowPercent(!showPercent)
            }} style={tw`${props.editable ? 'ml-4 items-center' : 'ml-.5 items-end'} self-center flex-row`}>
                <Text style={tw`${props.editable ? '' : 'text-lg'}`} weight='semibold'>{(showPercent) ? '%' : 'g'}</Text>
                {props.editable && <ExpoIcon name='chevron-down' iconName='ion' size={12} color='gray' style={tw`ml-.5`} />}
            </Pressable>}
        </View>
        <Text style={tw`text-center text-gray-500`}>{props.name}</Text>
    </View>
}