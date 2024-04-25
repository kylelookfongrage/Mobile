import React, { useState } from 'react'
import { Text, View } from '../../components/base/Themed'
import useColorScheme from '../../hooks/useColorScheme';
import tw from 'twrnc'
import { useNavigation } from '@react-navigation/native';
import { ImagePickerView } from '../../components/inputs/ImagePickerView';
import { ErrorMessage } from '../../components/base/ErrorMessage';
import { MediaType, defaultImage, getMatchingNavigationScreen, titleCase } from '../../data';
import { BackButton } from '../../components/base/BackButton';
import { DeleteButton, EditModeButton, ShareButton, ShowMoreDialogue, ShowUserButton } from '../home/ShowMore';
import Body from 'react-native-body-highlighter'
import ScrollViewWithDrag from '../../components/screens/ScrollViewWithDrag';
import SaveButton from '../../components/base/SaveButton';
import { FormReducer, useForm } from '../../hooks/useForm';
import { Tables } from '../../supabase/dao';
import Spacer from '../../components/base/Spacer';
import Overlay from '../../components/screens/Overlay';
import SearchEquiptment, { EquipmentDetailsOverlay, EquiptmentTile } from '../../components/features/SearchEquiptment';
import { ExerciseDao } from '../../types/ExerciseDao';
import { EquiptmentDao } from '../../types/EquiptmentDao';
import TitleInput from '../../components/inputs/TitleInput';
import UsernameDisplay from '../../components/features/UsernameDisplay';
import ManageButton from '../../components/features/ManageButton';
import ExerciseProgress from '../../components/features/ExerciseProgress';
import { useMultiPartForm } from '../../redux/api/mpf';
import Description from '../../components/base/Description';
import { useSelector } from '../../redux/store';
import { useGet } from '../../hooks/useGet';
import { _tokens } from '../../tamagui.config';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { NothingToDisplay } from '../../components/base/Toast';
import MuscleOverlay, { MuscleTile } from '../../components/screens/MuscleOverlay';


export interface ExerciseDetailProps {
    id?: string;
    workoutId?: string;
    editable?: boolean
}

export default function ExerciseDetail(props: ExerciseDetailProps) {
    const { id, workoutId } = props;
    let { profile } = useSelector(x => x.auth)
    const ExerciseForm = useForm<Tables['exercise']['Insert']>({
        description: '',
        video: '',
        muscles: [],
        name: '',
        preview: '',
        tags: [],
        user_id: null,
    }, async () => {
        if (!props.id) return null;
        try {
            // g.set('loading', true)
            let res = await dao.find(props.id)
            if (res) {
                setVideo(res.video ? [{ type: 'video', uri: res.video, supabaseID: res.video }] : [{ type: 'image', uri: res.preview || defaultImage, supabaseID: res.preview || undefined }])
                let eq = await equiptmentDao.byExercise(res.id)
                setEquiptment(eq?.map(x => x.equiptment) || [])
                // g.set('loading', false)
                return res;
            }
        } catch (error) {
            g.set('error', error.toString())
        } finally {
            // g.set('loading', false)
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
    const dm = useColorScheme() === 'dark'
    const [video, setVideo] = React.useState<MediaType[]>([])
    const [errors, setErrors] = React.useState<string[]>([])
    let multiPartForm = useMultiPartForm('workouts', props.workoutId || '')
    let g = useGet()
    const navigator = useNavigation()
    const saveExercise = async () => {
        setScreen('uploading', true)
        g.set('loading', true)
        if (screenForm.editMode) {
            console.log('editing')
            setErrors([])
            if (!form.name!! || !form.description!!) {
                setErrors(['Your exercise must have a name and description'])
                setScreen('uploading', false)
                g.set('loading', false)
                return;
            }
            let copiedForm = { ...form, user_id: profile?.id }
            let media = video?.[0]
            if (media) {
                if (media.type === 'video') {
                    copiedForm['video'] = media.uri
                } else { copiedForm['preview'] = media.uri }
            }
            try {
                let newExercise = await dao.save(copiedForm, form.video || undefined, form.preview || undefined)
                console.log(newExercise)
                if (!newExercise) {
                    g.set('loading', false);
                    return;
                }
                ExerciseForm.dispatch({ type: FormReducer.Set, payload: newExercise })
                await dao.saveEquiptment(newExercise, equiptment)
            } catch (error) {
                setScreen('uploading', false)
                g.set('error', error.toString())
            } finally {
                setScreen('uploading', false)
                setScreen('editMode', false)
                g.set('loading', false)
            }

        } else if (props.workoutId) {
            let potentialWorkout = [...(multiPartForm.data || [])]
            potentialWorkout.push({ reps: 0, rest: 0, time: 0, index: potentialWorkout.length, tempId: props.id, equiptment, name: form.name || '', img: form.preview || defaultImage, sets: 1 })
            multiPartForm.upsert(potentialWorkout) //@ts-ignore
            g.set('loading', false)
            navigator.pop()
        } else {
            setScreen('uploading', false)
            g.set('loading', false)
            setScreen('editMode', false)
            const screen = getMatchingNavigationScreen('ListWorkout', navigator)
            //@ts-ignore
            navigator.navigate(screen, { fromExerciseId: props.id || form.id })
        }
        // 

    }
    const data: { slug: string; intensity: number; color: string }[] = (form.muscles || []).map(x => ({
        slug: x, intensity: 1, color: ''
    }))
    const deleteExercise = async () => {
        try {
            if (!props.id) return;
            g.set('loading', true)
            await dao.remove(Number(props.id))
            g.set('loading', false)
            //@ts-ignore
            navigator.pop()
        } catch (error) {
            g.setFn(p => {
                let og = {...p}
                return {...og, loading: false, error: error?.toString() || 'there was an issue'}
            })
        } 
    }

    let [selectedEquipment, setSelectedEquipment] = useState<Tables['equiptment']['Row'] | null>(null)
    let [showMuscles, setShowMuscles] = useState(false)


    return (
        <View style={{ flex: 1 }} includeBackground>
            <ScrollViewWithDrag disableRounding rerenderTopView={[video, screenForm.editMode, form.user_id]} TopView={() => {
                return <View>
                    <BackButton inplace Right={() => {
                        if (screenForm.editMode || !id || !Number(id)) return <View />
                        return <ShowMoreDialogue exercise_id={Number(id)} options={[
                            EditModeButton(screenForm.editMode, () => setScreen('editMode', !screenForm.editMode), form.user_id, profile?.id),
                            DeleteButton('Exercise', deleteExercise, form.user_id, profile?.id),
                            // ShowUserButton(form.user_id, navigator),
                            ShareButton({ exercise_id: Number(id) }),
                            // { title: 'Preview AI Camera', icon: 'Video', onPress: () => navigator.navigate('Video', { uri: video?.[0]?.uri }) }
                        ]} />

                    }} />
                    <ImagePickerView type='all' editable={screenForm.editMode} srcs={video} onChange={x => {
                        setVideo(x)
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
                        <Spacer />
                        <UsernameDisplay image disabled={(screenForm.editMode || screenForm.uploading)} id={form.user_id} username={form.id ? null : profile?.username} />
                    </View>
                    <Spacer />
                    <Description value={form.description} editable={screenForm.editMode === true} placeholder='Please describe how to perform this exercise' onChangeText={x => setForm('description', x)} />
                    <Spacer lg divider />
                    <ManageButton title='Muscular Profile' buttonText='Manage' onPress={() => setShowMuscles(true)} hidden={!screenForm.editMode} />
                    <Spacer  />
                    {(!form.muscles?.length) && <NothingToDisplay text='No Associated Muscles' />}
                    <View style={{...tw`flex-row flex-wrap items-center -mx-1 self-center`}}>
            {(form.muscles || []).map(item => {
                return <TouchableOpacity style={tw`mr-1`} key={`Equiptment Search=` + item}>
                    <MuscleTile item={item} selected={false} />
                </TouchableOpacity>
            })}
            </View>
                    <Spacer lg divider />
                    <ManageButton title='Equipment' onPress={() => setScreen('showEquiptment', true)} hidden={!screenForm.editMode} />
                    <Spacer />
                    {equiptment.length === 0 && <NothingToDisplay text='No Related Equipment' />}
                    {equiptment.map(equ => {
                        return <TouchableOpacity key={`equiptment: ${equ.id}`} onPress={() => setSelectedEquipment(equ)}>
                            <EquiptmentTile item={equ} />
                        </TouchableOpacity>
                    })}
                    <Spacer divider />
                    <Spacer />
                    {!screenForm.editMode && <ExerciseProgress exerciseId={Number(props.id)} />}
                </View>
                <View style={tw`h-40`} />
            </ScrollViewWithDrag>
            <Overlay clearBackground disableScroll dialogueHeight={90} bg={dm ? _tokens.dark1 : _tokens.gray50} style={{ ...tw``, flex: 1 }} visible={screenForm.showEquiptment} onDismiss={() => setScreen('showEquiptment', false)}>
                <Spacer xs />
                <SearchEquiptment selected={equiptment.map(x => x.id)} onSelect={(item, s) => {
                    if (s) {
                        setEquiptment([...equiptment].filter(z => z.id !== item.id))
                    } else {
                        setEquiptment([...equiptment, item])
                    }
                }} />
            </Overlay>
            <MuscleOverlay selected={(form.muscles || [])} onSelect={i => setForm('muscles', i)} visible={showMuscles} onDismiss={() => setShowMuscles(false)} />
            <EquipmentDetailsOverlay selectedEquipment={selectedEquipment} onDismiss={() => setSelectedEquipment(null)} />
            <SaveButton discludeBackground title={props.workoutId ? 'Add to Workout' : screenForm.editMode ? 'Save Exercise' : 'See Workouts'} uploading={screenForm.uploading} onSave={saveExercise} favoriteId={form.id} favoriteType='exercise' />
        </View>
    )
}