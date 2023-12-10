import { TextInput } from 'react-native'
import React, { useState } from 'react'
import { Text, View } from '../../components/base/Themed'
import useColorScheme from '../../hooks/useColorScheme';
import tw from 'twrnc'
import { useNavigation } from '@react-navigation/native';
import { ImagePickerView } from '../../components/inputs/ImagePickerView';
import { ErrorMessage } from '../../components/base/ErrorMessage';
import { MediaType, defaultImage, getMatchingNavigationScreen, titleCase } from '../../data';
import { useCommonAWSIds } from '../../hooks/useCommonContext';
import { BackButton } from '../../components/base/BackButton';
import { useExerciseAdditions } from '../../hooks/useExerciseAdditions';
import { DeleteButton, EditModeButton, ShareButton, ShowMoreDialogue, ShowUserButton } from '../home/ShowMore';
import Body from 'react-native-body-highlighter'
import ScrollViewWithDrag from '../../components/screens/ScrollViewWithDrag';
import SaveButton from '../../components/base/SaveButton';
import { FormReducer, useForm } from '../../hooks/useForm';
import { Tables } from '../../supabase/dao';
import Spacer from '../../components/base/Spacer';
import Overlay from '../../components/screens/Overlay';
import SearchEquiptment, { EquiptmentTile } from '../../components/features/SearchEquiptment';
import { ExerciseDao } from '../../types/ExerciseDao';
import { EquiptmentDao } from '../../types/EquiptmentDao';
import TitleInput from '../../components/inputs/TitleInput';
import UsernameDisplay from '../../components/features/UsernameDisplay';
import ManageButton from '../../components/features/ManageButton';
import ExerciseProgress from '../../components/features/ExerciseProgress';
import { useMultiPartForm } from '../../redux/api/mpf';
import Description from '../../components/base/Description';
import { useSelector } from '../../redux/store';


export interface ExerciseDetailProps {
    id?: string;
    workoutId?: string;
    editable?: boolean
}

export default function ExerciseDetail(props: ExerciseDetailProps) {
    const { id, workoutId } = props;
    let {profile} = useSelector(x => x.auth)
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
        let res = await dao.find(props.id)
        if (res) {
            setVideo(res.video ? [{ type: 'video', uri: res.video, supabaseID: res.video }] : [{ type: 'image', uri: res.preview || defaultImage, supabaseID: res.preview || undefined }])
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
    const dm = useColorScheme() === 'dark'
    const [video, setVideo] = React.useState<MediaType[]>([])
    const [errors, setErrors] = React.useState<string[]>([])
    let multiPartForm = useMultiPartForm('workouts', props.workoutId || '')
    const navigator = useNavigation()
    const saveExercise = async () => {
        setScreen('uploading', true)
        if (screenForm.editMode) {
            console.log('editing')
            setErrors([])
            if (!form.name!! || !form.description!!) {
                setErrors(['Your exercise must have a name and description'])
                setScreen('uploading', false)
                return;
            }
            let copiedForm = { ...form }
            let media = video?.[0]
            if (media) {
                if (media.type === 'video') {
                    copiedForm['video'] = media.uri
                } else { copiedForm['preview'] = media.uri }
            }
            try {
                let newExercise = await dao.save(copiedForm, form.video || undefined, form.preview || undefined)
                console.log(newExercise)
            if (!newExercise) return;
            ExerciseForm.dispatch({ type: FormReducer.Set, payload: newExercise })
            await dao.saveEquiptment(newExercise, equiptment)
            } catch (error) {
                setScreen('uploading', false)
                setErrors([error.toString()])
            }
            setScreen('uploading', false)
            setScreen('editMode', false)
        } else if (props.workoutId) {
            let potentialWorkout = [...(multiPartForm.data || [])]
            potentialWorkout.push({ reps: 0, rest: 0, time: 0, index: potentialWorkout.length, tempId: props.id, equiptment, name: form.name || '', img: form.preview || defaultImage, sets: 1 })
            multiPartForm.upsert(potentialWorkout) //@ts-ignore
            navigator.pop()
        } else {
            setScreen('uploading', false)
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
        if (!props.id) return;
        await dao.remove(Number(props.id))
        //@ts-ignore
        navigator.pop()
    }

    console.log(form)

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
                            {title: 'Preview AI Camera', icon: 'camera', onPress: () => navigator.navigate('Video', {uri: video?.[0]?.uri})}
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
                    <Text style={tw`text-lg`} weight='bold'>Muscular Profile</Text>
                    <Spacer sm />
                    <View style={tw`items-center justify-center`}>
                        <Body colors={['#FF0000']} data={data} scale={1.2} onMusclePress={(m) => {
                            let originalBodyParts = form.muscles || []
                            if (screenForm.editMode) {
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
                            return <Text key={`Muscle Selected=` + x} style={tw`mx-2 my-1`}>{titleCase(x)}</Text>
                        })}
                    </View>
                    <Spacer lg divider />
                    <ManageButton title='Equipment' onPress={() => setScreen('showEquiptment', true)} hidden={!screenForm.editMode} />
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
            <SaveButton title={props.workoutId ? 'Add to Workout' : screenForm.editMode ? 'Save Exercise' : 'See Workouts'} uploading={screenForm.uploading} onSave={saveExercise} favoriteId={form.id} favoriteType='exercise' />
        </View>
    )
}