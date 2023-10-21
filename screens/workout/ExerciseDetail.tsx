import { TouchableOpacity, Image, ScrollView, TextInput, Dimensions } from 'react-native'
import React, { useRef, useState } from 'react'
import { Text, View } from '../../components/base/Themed'
import useColorScheme from '../../hooks/useColorScheme';
import tw from 'twrnc'
import { ActivityIndicator } from 'react-native-paper';
import { ExpoIcon } from '../../components/base/ExpoIcon';
import { useNavigation } from '@react-navigation/native';
import { ImagePickerView } from '../../components/inputs/ImagePickerView';
import { ErrorMessage } from '../../components/base/ErrorMessage';
import { ChartMapping, MediaType, defaultImage, getFormattedDate, getMatchingNavigationScreen, isStorageUri, titleCase, toHHMMSS, uploadMedias } from '../../data';
import { DataStore, Storage } from 'aws-amplify';
import { Equiptment, Exercise, ExerciseEquiptmentDetail, Favorite, FavoriteType, User, Workout, WorkoutDetails, WorkoutPlayDetail } from '../../aws/models';
import { useCommonAWSIds } from '../../hooks/useCommonContext';
import { ZenObservable } from 'zen-observable-ts';
import { BackButton } from '../../components/base/BackButton';
import { useExerciseAdditions } from '../../hooks/useExerciseAdditions';
import { DeleteButton, EditModeButton, ShareButton, ShowMoreButton, ShowMoreDialogue, ShowUserButton } from '../home/ShowMore';
import Body from 'react-native-body-highlighter'
import TabSelector from '../../components/base/TabSelector';
import moment from 'moment';
import {
    LineChart
} from "react-native-chart-kit";
import { useSwipe } from '../../hooks/useSwipe';
import ScrollViewWithDrag from '../../components/screens/ScrollViewWithDrag';
import * as VT from 'expo-video-thumbnails'
import SaveButton from '../../components/base/SaveButton';
import { FormReducer, useForm } from '../../hooks/useForm';
import { Tables } from '../../supabase/dao';
import { SegmentedControl } from 'react-native-ui-lib';
import Spacer from '../../components/base/Spacer';
import Overlay from '../../components/screens/Overlay';
import EquiptmentSearch from './EquiptmentSearch';
import SearchEquiptment, { EquiptmentTile } from '../../components/features/SearchEquiptment';
import { ExerciseDao } from '../../types/ExerciseDao';
import { EquiptmentDao } from '../../types/EquiptmentDao';
import TitleInput from '../../components/inputs/TitleInput';
import UsernameDisplay from '../../components/features/UsernameDisplay';
import ManageButton from '../../components/features/ManageButton';
import { useMultiPartForm } from '../../hooks/useMultipartForm';
import ExerciseProgress from '../../components/features/ExerciseProgress';


export interface ExerciseDetailProps {
    id?: string;
    workoutId?: string;
    editable?: boolean
}

export default function ExerciseDetail(props: ExerciseDetailProps) {
    const { id, workoutId } = props;
    const { sub, userId, username, profile } = useCommonAWSIds()
    const { setWorkouts } = useExerciseAdditions()
    const ExerciseForm = useForm<Tables['exercise']['Insert']>({
        description: '',
        video: '',
        muscles: [],
        name: '',
        preview: '',
        tags: [],
        user_id: profile?.id,
    }, async () => {
        if (!props.id) return null;
        let res = await dao.find(props.id)
        if (res) {
            setVideo(res.video ? [{type: 'video', uri: res.video, supabaseID: res.video}] : [{type: 'image', uri: res.preview || defaultImage, supabaseID: res.preview || undefined}])
            let eq = await equiptmentDao.byExercise(res.id)
            setEquiptment(eq?.map(x => x.equiptment) || [])
            return res;
        }
        return null;
    })
    let form = ExerciseForm.state
    let setForm = ExerciseForm.setForm
    let ScreenState = useForm({
        editMode: !props.id,
        uploading: false,
        showEquiptment: false,
    })
    const screenForm = ScreenState.state
    const setScreen = ScreenState.setForm
    const dao = ExerciseDao()
    const equiptmentDao = EquiptmentDao()
    const [equiptment, setEquiptment] = useState<Tables['equiptment']['Row'][]>([])
    const [exerciseId, setExerciseId] = React.useState<string>(id || '')
    const [exerciseName, setExerciseName] = React.useState<string>('')
    const [author, setAuthor] = React.useState<string>('')
    const [editMode, setEditMode] = React.useState<boolean>(props.editable === true)
    const dm = useColorScheme() === 'dark'
    const [video, setVideo] = React.useState<MediaType[]>([])
    const [errors, setErrors] = React.useState<string[]>([])
    const [authorId, setAuthorId] = React.useState<string>('')
    let multiPartForm = useMultiPartForm()

    const navigator = useNavigation()

    const [hasChangedPhoto, setHasChangedPhoto] = useState<boolean>(false)

    const saveExercise = async () => {
        setScreen('uploading', true)
        if (screenForm.editMode) {
            setErrors([])
            if (!form.name!! || !form.description!!) {
                setErrors(['Your exercise must have a name and description'])
                setScreen('uploading', false)
                return;
            }
            let copiedForm = {...form}
            let media = video?.[0]
            if (media) {
                if (media.type === 'video') {
                    copiedForm['video'] = media.uri
                } else { copiedForm['preview'] = media.uri }
            }
            let newExercise = await dao.save(copiedForm, form.video || undefined, form.preview || undefined)
            ExerciseForm.dispatch({type: FormReducer.Set, payload: newExercise})
            if (!newExercise) return;
            await dao.saveEquiptment(newExercise, equiptment)
            setScreen('uploading', false)     
            setScreen('editMode', false)      
        } else if (props.workoutId) {
            let potentialWorkout = [...(multiPartForm.data.workouts[props.workoutId] || [])] 
            potentialWorkout.push({reps: 0, rest: 0, time: 0, index: potentialWorkout.length, tempId: props.id, equiptment, name: form.name || '', img: form.preview || defaultImage, sets: 1 })
            multiPartForm.upsert('workouts', props.workoutId, potentialWorkout) //@ts-ignore
            navigator.pop()
        } else {
            setWorkouts([])
            const screen = getMatchingNavigationScreen('AddExerciseToWorkout', navigator)
            //@ts-ignore
            navigator.navigate(screen, { exerciseId: exerciseId })
        }
        // 

    }

    const [favorite, setFavorite] = React.useState<boolean>(false);
    const firstImage = video.filter(x => x.type === 'image')

    const data: { slug: string; intensity: number; color: string }[] = (form.muscles || []).map(x => ({
        slug: x, intensity: 1, color: ''
    }))

    const [exerciseProgress, setExerciseProgress] = useState<{ [k: string]: ChartMapping }>({})
    const [chartTitle, setChartTitle] = useState<string>('')
    const [chartSuffix, setChartSuffix] = useState<string>('')
    React.useEffect(() => {
        (async () => {
            if (['', null, undefined].includes(props.id)) return;
            let now = moment().utc()
            let dateStart = now.subtract(60, 'days')
            //@ts-ignore
            const sets = await DataStore.query(WorkoutPlayDetail, wo => wo.and(x => [x.exerciseID.eq(props.id), x.secs.gt(0), x.createdAt.gt(dateStart.format()), x.userID.eq(userId)]), {
                sort: x => x.createdAt('ASCENDING')
            })
            // get top 8 or less days, whether that be sets, seconds, or weight
            let dateMapping: { [k: string]: ChartMapping } = {}
            let nWeight = 0
            let nReps = 0
            let nSecs = 0
            let shouldBeSeconds = true
            for (var wo of sets) {
                if (wo.secs && wo.secs > 60) shouldBeSeconds = true;
                let woDate = moment(wo.createdAt).utc().format('L')
                let data = dateMapping[woDate]
                dateMapping[woDate] = {
                    secs: Math.max((data?.secs || 0), (wo.secs || 0)),
                    weight: Math.max((data?.weight || 0), (wo.weight || 0)),
                    reps: Math.max((data?.reps || 0), (wo.reps || 0)),
                    date: woDate
                }
            }
            for (var d of Object.values(dateMapping)) {
                if (d.reps > 0) nReps += 1
                if (d.weight > 0) nWeight += 1
                if (d.secs > 0) nSecs += 1
            }

            if (nWeight > 0) {
                setChartTitle('Weight')
                setChartSuffix('lbs')
            } else if (nReps > 0) {
                setChartTitle('Reps')
                setChartSuffix('')
            } else if (nSecs > 0) {
                setChartTitle('Time')
                setChartSuffix(shouldBeSeconds ? 's' : 'm')
            }
            setExerciseProgress(dateMapping)
        })
    }, [])
    const chartConfig = {
        backgroundGradientFrom: tw`bg-gray-800`.backgroundColor,
        backgroundGradientFromOpacity: 0,
        backgroundGradientTo: tw`bg-gray-800`.backgroundColor,
        backgroundGradientToOpacity: 0,
        color: (opacity = 1) => `rgba(240, 43, 43, ${opacity})`,
        strokeWidth: 2, // optional, default 3
        decimalPlaces: 0,
        propsForLabels: {
            stroke: tw`text-gray-500`.color,
            scale: 0.7,
        },
    };
    const sortedChart = Object.values(exerciseProgress).sort((a, b) => {
        var c = new Date(a.date);
        var d = new Date(b.date);
        //@ts-ignore
        return c - d;
    })

    const sortedChartLabels = sortedChart.filter((x, i) => i < 8).map(x => getFormattedDate(new Date(x.date)))
    const deleteExercise = async () => {

    }
    return (
        <View style={{ flex: 1 }} includeBackground>
            <ScrollViewWithDrag rerenderTopView={[video, screenForm.editMode]} TopView={() => {
                return <View>
                    <BackButton inplace Right={() => {
                        if (screenForm.editMode || !id || !Number(id)) return <View />
                        return <ShowMoreDialogue exercise_id={Number(id)} options={[
                            EditModeButton(screenForm.editMode, () => setScreen('editMode', !screenForm.editMode)),
                            DeleteButton('Exercise', deleteExercise),
                            ShowUserButton(form.user_id, navigator),
                            ShareButton({exercise_id: Number(id)})
                        ]} />
                        if (!screenForm.editMode) return <ShowMoreButton name={exerciseName} desc={'@' + author} img={firstImage.length === 0 ? defaultImage : firstImage[0].uri} id={exerciseId} type={FavoriteType.EXERCISE} userId={authorId} />
                        return <View />
                        }} />
                    <ImagePickerView type='all' editable={screenForm.editMode} srcs={video} onChange={x => {
                        setVideo(x)
                        setHasChangedPhoto(true)
                    }} />
                </View>
            }} showsVerticalScrollIndicator={false}>
                <View style={{ ...tw`rounded-3xl py-2 px-4`, flex: 1 }}>
                    {errors.length > 0 && <View style={tw`px-4 py-4`}>
                        <ErrorMessage errors={errors} onDismissTap={() => setErrors([])} />
                    </View>}
                    <View style={tw`w-12/12`}>
                        <TitleInput
                            value={form.name || ''}
                            editable={screenForm.editMode}
                            placeholder={'Exercise Name'}
                            onChangeText={x => setForm('name', x)}
                        />
                        <Spacer sm />
                        <UsernameDisplay disabled={(!screenForm.editMode || screenForm.uploading)} id={form.user_id} username={form.id ? null : profile?.username} />
                    </View>
                    <Spacer />
                    <TextInput
                        value={form.description || ''}
                        multiline
                        numberOfLines={20}
                        scrollEnabled={false}
                        onChangeText={x => setForm('description', x)}
                        editable={editMode === true}
                        placeholder='Please describe how to perform the exercise'
                        placeholderTextColor={'gray'}
                        style={tw`py-1 text-${dm ? 'white' : 'black'}`}
                    />
                    <Spacer lg divider />
                    <Text style={tw`text-lg`} weight='bold'>Muscular Profile</Text>
                    <Spacer sm />
                    <View style={tw`items-center justify-center`}>
                        <Body colors={['#FF0000']} data={data} scale={1.2} onMusclePress={(m) => {
                            let originalBodyParts = form.muscles || []
                            if (editMode) {
                                const isSelected = originalBodyParts.includes(m.slug)
                                if (isSelected) {
                                    setForm('muscles', [...originalBodyParts].filter(x => x !== m.slug))
                                } else {
                                    setForm('muscles', [...originalBodyParts, m.slug])
                                }

                            }
                        }} />
                    </View>
                    <Spacer />
                    <View style={tw`flex-row items-center justify-center flex-wrap`}>
                        {form.muscles?.map(x => {
                            return <Text key={`Muscle Selected=`+x} style={tw`mx-2 my-1`}>{titleCase(x)}</Text>
                        })}
                    </View>
                    <Spacer lg divider />
                    <ManageButton title='Equipment' onPress={() => setScreen('showEquiptment', true)} hidden={!props.editable} />
                    <Overlay dialogueHeight={90} style={{ ...tw``, flex: 1 }} visible={screenForm.showEquiptment} onDismiss={() => setScreen('showEquiptment', false)}>
                        <Text h3>Add Equipment</Text>
                        <Spacer />
                        <SearchEquiptment selected={equiptment.map(x => x.id)} onSelect={(item, s) => {
                            if (s) {
                                setEquiptment([...equiptment].filter(z => z.id !== item.id))
                            } else {
                                setEquiptment([...equiptment, item])
                            }
                        }} />
                    </Overlay>
                    <Spacer />
                    {equiptment.length === 0 && <Text style={tw`my-3 text-gray-500 text-center`} weight='semibold'>No equiptment to display</Text>}
                    {equiptment.map(equ => {
                        return <EquiptmentTile item={equ} key={`equiptment: ${equ.id}`} />
                    })}
                    <Spacer divider lg />
                    {!screenForm.editMode && <ExerciseProgress exerciseId={Number(props.id)} />}
                </View>
                <View style={tw`h-40`} />
            </ScrollViewWithDrag>
            <SaveButton title={props.workoutId ? 'Add to Workout' : 'Save Exercise'} uploading={screenForm.uploading} onSave={saveExercise} favoriteId={form.id} favoriteType='exercise' />
        </View>
    )
}