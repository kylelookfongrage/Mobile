import { useColorScheme, Image, Dimensions, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Pressable, KeyboardAvoidingView, Platform, Keyboard } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import tw from 'twrnc'
import { View, Text } from './Themed'
import { defaultImage, ExerciseDisplay, isStorageUri, toHHMMSS, WorkoutPlayDisplayProps } from '../data'
import { ImagePickerView } from './ImagePickerView'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { ExpoIcon } from './ExpoIcon'
import AnimatedLottieView from 'lottie-react-native'
import { useNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { MediaType } from '../types/Media'
import { DataStore, Storage } from 'aws-amplify'
import { ResizeMode, Video } from 'expo-av'
import * as VideoThumbnails from 'expo-video-thumbnails';
import { Equiptment, Exercise, Workout, WorkoutDetails, WorkoutPlayDetail } from '../aws/models'
import Body from 'react-native-body-highlighter'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'


const Stack = createNativeStackNavigator()
export default function WorkoutPlayMusic(props: WorkoutPlayDisplayProps) {
    const dm = useColorScheme() === 'dark'
    const {
        currentExercise,
        exercises,
        shouldShowMore,
        setShouldShowMore,
        selectedWorkoutDetail,
        setSelectedWorkoutDetail,
        paused,
        setPaused,
        totalTime,
        onResetPress,
        workoutPlayDetails,
        onNewSetPress,
        onFinishPress,
        selectedWorkoutPlayDetail,
        setSelectedWorkoutPlayDetail,
        animation,
        workoutDetails,
        forwardBackwardPress
    } = props;
    const navigator = useNavigation();
    if (!selectedWorkoutPlayDetail) {
        return <View includeBackground style={{ flex: 1 }}>
            <SafeAreaView>
                <Text>Loading...</Text>
                <ActivityIndicator />
            </SafeAreaView>
        </View>
    }
    return <Stack.Navigator>
        <Stack.Screen name='MediaForWorkout' options={{ headerShown: false }}>
            {_ => <MediaForWorkout
                paused={paused}
                animation={animation}
                totalTime={totalTime}
                onResetPress={onResetPress}
                remaining={selectedWorkoutDetail.sets || 0}
                selectedWorkoutPlayDetail={selectedWorkoutPlayDetail}
                setSelectedWorkoutPlayDetail={setSelectedWorkoutPlayDetail}
                resting={
                    selectedWorkoutPlayDetail.completed ? (
                        (selectedWorkoutPlayDetail.rest || 0) < (selectedWorkoutDetail.rest || 0)
                    ) : false
                }
                restTime={selectedWorkoutPlayDetail.rest || 0}
                forwardBackwardPress={forwardBackwardPress}
                time={selectedWorkoutPlayDetail.secs || 0}
                setNumber={workoutPlayDetails.filter(x => x.exerciseID === selectedWorkoutDetail.exerciseID && x.completed).length}
                setPaused={setPaused}
                media={exercises.filter(e => e.id === selectedWorkoutDetail.exerciseID)[0]?.media || [{ type: 'image', uri: defaultImage }]} />}
        </Stack.Screen>
        <Stack.Screen name='InformationWPlay' options={{ headerShown: false, presentation: 'transparentModal' }}>
            {_ => <InformationWPlay exerciseId={selectedWorkoutDetail.exerciseID} workoutId={selectedWorkoutDetail.workoutID} workoutDetails={selectedWorkoutDetail} />}
        </Stack.Screen>
        <Stack.Screen name='RemainingToDo' options={{ headerShown: false, presentation: 'transparentModal' }}>
            {_ => <RemainingToDo onFinishPress={onFinishPress} workoutDetails={workoutDetails} exercises={exercises} onExercisePress={(wd) => {
                setSelectedWorkoutDetail(wd)
                setSelectedWorkoutPlayDetail(workoutPlayDetails.filter(x => x.workoutdetailsID === wd.id)[0])
            }} selectedExercise={selectedWorkoutDetail.exerciseID} />}
        </Stack.Screen>
    </Stack.Navigator>
}

function InformationWPlay(props: { exerciseId: string; workoutId: string, workoutDetails: WorkoutDetails; }) {
    const navigator = useNavigation()
    const dm = useColorScheme() === 'dark'
    const [workoutImg, setWorkoutImg] = useState<string>('')
    const [exerciseImg, setExerciseImg] = useState<string>('')
    const [exercise, setExercise] = useState<Exercise | null>(null)
    const [workout, setWorkout] = useState<Workout | null>(null)
    const [equiptment, setEquiptment] = useState<Equiptment[]>([])
    const [showMoreWorkout, setShowMoreWorkout] = useState<boolean>(false)
    const [showMoreExercise, setShowMoreExericse] = useState<boolean>(false)
    useEffect(() => {
        (async () => {
            try {
                const wo = await DataStore.query(Workout, props.workoutId)
                if (!wo) return;
                setWorkout(wo)
                let woImg = wo.img || defaultImage
                if (isStorageUri(woImg)) woImg = await Storage.get(woImg)
                setWorkoutImg(woImg)
                const ex = await DataStore.query(Exercise, props.exerciseId)
                if (!ex) return;
                setExercise(ex)
                let preview = ex.preview || defaultImage
                if (isStorageUri(preview)) preview = await Storage.get(preview)
                setExerciseImg(preview)
                const eq = await DataStore.query(Equiptment, e => e.ExerciseEquiptmentDetails.exerciseID.eq(props.exerciseId))
                const eqWithMedia = await Promise.all(eq.map(async equ => {
                    return { ...equ, img: isStorageUri(equ.img) ? await Storage.get(equ.img) : equ.img }
                }))
                setEquiptment(eqWithMedia)

            } catch (error) {
                console.log(error)
            }
        })()
    }, [])
    return <View style={[tw`bg-gray-${dm ? '700' : '400'}/90 px-4`, { flex: 1 }]}>
        <SafeAreaView style={[{ flex: 1 }]}>
            <ScrollView showsVerticalScrollIndicator={false} style={[{ flex: 1 }, tw`pt-4`]}>
                <Text style={tw`mb-1`} weight='regular'>Workout</Text>
                <Text style={tw`text-lg`} weight='semibold'>{workout?.name}</Text>
                <View style={tw`flex-row items-start mt-2 justify-between`}>
                    {workoutImg && <Image source={{ uri: workoutImg }} style={tw`h-30 w-30 rounded-xl`} />}
                    <Text style={tw`text-left max-w-7/12`}>{showMoreWorkout ? workout?.description : (workout?.description || '').substring(0, 100)} {<Text onPress={() => setShowMoreWorkout(!showMoreWorkout)} style={tw`text-red-500`} weight='semibold'>{(workout?.description || '').length > 99 ? (showMoreWorkout ? '... Hide' : '... Show More') : ''}</Text>}</Text>
                </View>
                <Text style={tw`mb-1 mt-9`} weight='regular'>Exercise</Text>
                <Text style={tw`text-lg`} weight='semibold'>{exercise?.title}</Text>
                <View style={tw`flex-row items-center justify-evenly mb-4 mt-2`}>
                    <View style={tw`items-center justify-center`}>
                        <Text weight='semibold'>{props.workoutDetails.reps}</Text>
                        <Text style={tw`text-xs`} weight='semibold'>Reps</Text>
                    </View>
                    <View style={tw`items-center justify-center`}>
                        <Text weight='semibold'>{toHHMMSS(props.workoutDetails.secs || 0)}</Text>
                        <Text style={tw`text-xs`} weight='semibold'>Time</Text>
                    </View>
                    <View style={tw`items-center justify-center`}>
                        <Text weight='semibold'>{toHHMMSS(props.workoutDetails.rest || 0)}</Text>
                        <Text style={tw`text-xs`} weight='semibold'>Rest</Text>
                    </View>
                </View>
                <View style={tw`flex-row items-start mt-2 justify-between`}>
                    {exerciseImg && <Image source={{ uri: exerciseImg }} style={tw`h-30 w-30 rounded-xl`} />}
                    <Text style={tw`text-left max-w-7/12`}>{showMoreExercise ? exercise?.description : (exercise?.description || '').substring(0, 100)} {<Text onPress={() => setShowMoreExericse(!showMoreExercise)} style={tw`text-red-500`} weight='semibold'>{(exercise?.description || '').length > 99 ? (showMoreExercise ? '... Hide' : '... Show More') : ''}</Text>}</Text>
                </View>
               
                <Text style={tw`mb-1 mt-9`} weight='regular'>Muslce Profile</Text>
                <View style={tw`items-center justify-center`}>
                    <Body scale={0.8} colors={['#FF0000']} data={(exercise?.bodyParts || []).map(x => ({ slug: x || '', color: '', intensity: 1 }))} />
                </View>
                <Text style={tw`mb-2 mt-9`} weight='regular'>Equiptment</Text>
                {equiptment.map(eq => {
                    return <View key={eq.id} style={tw`flex-row items-center mb-2 px-4`}>
                        <Image source={{ uri: eq.img }} style={tw`h-12 w-12 rounded`} />
                        <Text style={tw`ml-2`} weight='semibold'>{eq.name}</Text>
                    </View>
                })}
                <View style={tw`h-20`} />
            </ScrollView>
            <TouchableOpacity onPress={() => {
                //@ts-ignore
                navigator.pop()
            }} style={tw`items-center justify-center p-3`}>
                <Text style={tw`text-center text-lg`} weight='semibold'>Close</Text>
            </TouchableOpacity>
        </SafeAreaView>
    </View>
}

function MediaForWorkout(props: { media: MediaType[], paused: boolean; setPaused: (b: boolean) => void; totalTime: number; onResetPress: () => void; remaining: number; resting: boolean; animation: any; time: number; setNumber: number; restTime: number; selectedWorkoutPlayDetail: WorkoutPlayDetail; setSelectedWorkoutPlayDetail: (w: WorkoutPlayDetail) => void; forwardBackwardPress: (b?: boolean) => void; }) {
    const { media } = props;
    const [selectedMedia, setSelectedMedia] = useState<MediaType | undefined>(undefined)
    interface MediaTypeWithPreview extends MediaType { preview?: string }
    const [thisMedia, setThisMedia] = useState<MediaTypeWithPreview[]>(props.media)
    const navigator = useNavigation()
    useEffect(() => {
        (async () => {
            const fetchedMedia = await Promise.all(props.media.map(async m => {
                let z = m.uri
                if (isStorageUri(z)) z = await Storage.get(z)
                let p = m.uri
                if (m.type === 'video') p = (await VideoThumbnails.getThumbnailAsync(z, { time: 0, quality: 0.3 })).uri
                return { ...m, uri: z, preview: p }
            }))
            setThisMedia(fetchedMedia)
            setSelectedMedia(fetchedMedia[0])
        })()
    }, [props.media])
    useEffect(() => {
        (async () => {
            if (videoRef.current) {
                if (props.paused) await videoRef.current.pauseAsync()
                if (!props.paused) await videoRef.current.playAsync()
            }
        })()
    }, [props.paused, props.selectedWorkoutPlayDetail])
    const videoRef = useRef<Video | null>(null);
    const p = useSafeAreaInsets()
    const dm = useColorScheme() === 'dark'
    const s = Dimensions.get('screen')
    const [shouldShowMenu, setShouldShowMenu] = useState<boolean>(true)
    const c = dm ? 'white' : 'black'
    const [showSetInfo, setShowSetInfo] = useState<boolean>(false)
    if (!selectedMedia) return <View includeBackground style={{ flex: 1 }}>
        <SafeAreaView>
            <Text style={tw`text-center text-gray-500 py-6 px-6`}>Loading</Text>
            <ActivityIndicator />
        </SafeAreaView>
    </View>;

    return (
        <View includeBackground style={{ flex: 1 }}>
            <Pressable style={{ flex: 1 }} onPress={() => {
                if (showSetInfo) {
                    setShowSetInfo(false)
                } else {
                    setShouldShowMenu(!shouldShowMenu)
                }
            }}>
                {(selectedMedia.type === 'video' && !props.resting) && <Video isLooping ref={videoRef} useNativeControls={false} resizeMode={ResizeMode.CONTAIN} source={{ uri: selectedMedia.uri }} style={{
                    width: s.width, height: s.height - 50
                }} />}
                {(selectedMedia.type === 'image' && !props.resting) && <Image resizeMode={ResizeMode.CONTAIN} source={{ uri: selectedMedia.uri }} style={{
                    width: s.width, height: s.height - 50
                }} />}
                {props.resting && <TouchableOpacity onLongPress={() => {
                    navigator.navigate('SelectSprite')
                }} style={[tw`items-center justify-center`, {
                    width: s.width, height: s.height - 50
                }]}>
                    <AnimatedLottieView autoPlay loop source={props.animation} style={tw`h-50`} />
                    <Text style={tw`text-xs text-gray-500`}>This is your rest time, please take a break!</Text>
                </TouchableOpacity>}
            </Pressable>
            {/* MENU BUTTONS  */}
            {shouldShowMenu && <Animated.View entering={FadeIn} exiting={FadeOut} style={[{ position: 'absolute', top: 0, paddingTop: p.top + 2, zIndex: 1 }, tw`items-center flex-row justify-between pb-3 px-6 w-12/12 bg-gray-${dm ? '800' : '300'}`]}>
                <TouchableOpacity onPress={props.onResetPress}>
                    <ExpoIcon name='refresh-ccw' iconName='feather' size={20} color='gray' />
                </TouchableOpacity>
                <View>
                    <Text style={tw`text-center text-lg`} weight='semibold'>{toHHMMSS(props.totalTime)}</Text>
                    <Text style={tw`text-center text-xs text-gray-500`}>Total Time</Text>
                </View>
                <TouchableOpacity style={tw`items-center justify-center`}>
                    <Text style={tw`text-center text-lg`} weight='semibold'>{props.remaining}</Text>
                    <Text style={tw`text-xs text-gray-500`}>Sets</Text>
                </TouchableOpacity>
            </Animated.View>}
            {(shouldShowMenu && !props.resting && !showSetInfo) && <Animated.View entering={FadeIn} exiting={FadeOut} style={[{ zIndex: 1 }, tw`mb-4 bg-transparent px-9 flex-row items-center`]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {thisMedia.map(m => {
                        const selected = m.uri === selectedMedia.uri
                        if (!m.preview) return <View key={m.uri + 'media'} />
                        return <TouchableOpacity onPress={() => {
                            if (!selected) {
                                setSelectedMedia(m)
                            }
                        }} key={m.uri + 'media'} style={tw`mr-2 rounded-lg ${selected ? 'p-.5 bg-' + c : ''}`}>
                            <Image source={{ uri: m.preview }} style={tw`h-15 w-15 rounded-lg`} />
                        </TouchableOpacity>
                    })}
                </ScrollView>
            </Animated.View>}
            {(shouldShowMenu && !showSetInfo) && <Animated.View entering={FadeIn} exiting={FadeOut} style={[{ zIndex: 1 }, tw`mb-4 bg-transparent px-9 flex-row justify-between items-center`]}>
                <View style={tw`items-center`}>
                    <Text weight='semibold'>{props.resting ? toHHMMSS(props.restTime) : toHHMMSS(props.time)}</Text>
                    <Text style={tw`text-xs text-gray-500`}>{props.resting ? 'Rest' : 'Set'} Time</Text>
                </View>
                <View style={tw`items-center`}>
                    <Text weight='semibold'>{props.setNumber}/{props.remaining}</Text>
                    <Text style={tw`text-xs text-gray-500`}>Sets Completed</Text>
                </View>
                <TouchableOpacity onPress={() => {
                    setShowSetInfo(true)
                }} style={tw`items-center`}>
                    <ExpoIcon name='bar-chart-2' iconName='feather' size={20} color='gray' />
                    <Text style={tw`text-xs text-gray-500`}>Log Set</Text>
                </TouchableOpacity>
            </Animated.View>}
            {(shouldShowMenu && !showSetInfo) && <Animated.View entering={FadeIn} exiting={FadeOut} style={[tw`px-4 mx-9 items-center flex-row justify-evenly py-4 rounded-2xl bg-gray-${dm ? '800' : '300'}`, { zIndex: 1, marginBottom: p.bottom + 15 }]}>
                <TouchableOpacity onPress={() => {
                    //@ts-ignore
                    navigator.navigate('InformationWPlay')
                }}>
                    <ExpoIcon name='info' iconName='feather' size={20} color='gray' />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                    props.forwardBackwardPress(false)
                }} style={tw``}>
                    <ExpoIcon name='skip-back' iconName='feather' size={20} color='gray' />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                    if (props.setPaused) props.setPaused(!props.paused)
                }} style={tw`${props.paused ? 'bg-red-500' : 'bg-gray-500'} p-2 rounded-full items-center`}>
                    <ExpoIcon name={props.paused ? 'play' : 'pause'} iconName='feather' size={20} color='white' />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                    //@ts-ignore
                    props.forwardBackwardPress(true, true)
                }} style={tw``}>
                    <ExpoIcon name='skip-forward' iconName='feather' size={20} color='gray' />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                    //@ts-ignore
                    navigator.navigate('RemainingToDo')
                }}>
                    <ExpoIcon name='align-justify' iconName='feather' size={20} color='gray' />
                </TouchableOpacity>
            </Animated.View>}
            {(shouldShowMenu && showSetInfo) && <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} enabled>
                <Pressable onPress={() => Keyboard.dismiss()} style={[tw`px-4 pt-6 rounded-lg bg-gray-${dm ? '800' : '300'}`, { zIndex: 1, paddingBottom: p.bottom + 10 }]}>
                <View style={tw`flex-row items-center justify-between`}>
                    <Text style={tw`text-lg`} weight='semibold'>Set Log</Text>
                    <TouchableOpacity onPress={() => setShowSetInfo(!showSetInfo)}>
                    <ExpoIcon name='x-circle' iconName='feather' size={25} color='gray' />
                    </TouchableOpacity>
                    </View>
                    <View style={tw`flex-row items-start mt-3 justify-around`}>
                        <View style={tw`flex-row items-center`}>
                        <View style={tw`items-center mr-4`}>
                            <TextInput keyboardType='number-pad' placeholder='sets' style={tw`py-5 px-9 rounded-xl text-${dm ? 'white' : 'black'} bg-gray-${dm ? '700' : '300'}`} value={props.selectedWorkoutPlayDetail.reps?.toString() || ''} onChangeText={(v) => {
                                const newValue = v.replace(/[^0-9]/g, '')
                                props.setSelectedWorkoutPlayDetail({ ...props.selectedWorkoutPlayDetail, reps: Number(newValue) || null })

                            }} />
                            <Text style={tw`mt-2`} weight='semibold'>Reps</Text>
                        </View>
                        <View style={tw`items-center`}>
                            <TextInput keyboardType='number-pad' placeholder='lbs' style={tw`py-5 px-9 rounded-xl text-${dm ? 'white' : 'black'} bg-gray-${dm ? '700' : '300'}`} value={props.selectedWorkoutPlayDetail.weight?.toString() || ''} onChangeText={(v) => {
                                const newValue = v.replace(/[^0-9]/g, '')
                                props.setSelectedWorkoutPlayDetail({ ...props.selectedWorkoutPlayDetail, weight: Number(newValue) || null })

                            }} />
                            <Text style={tw`mt-2`} weight='semibold'>Weight</Text>
                        </View>
                        </View>
                        <View>
                            <Text style={tw`text-gray-500 text-center mb-1`}>Time: {toHHMMSS(props.time)}</Text>
                            <TouchableOpacity onPress={() => {
                                props.setSelectedWorkoutPlayDetail({ ...props.selectedWorkoutPlayDetail, completed: !props.selectedWorkoutPlayDetail.completed, rest: 0 })
                            }} style={tw`mx-4 bg-red-500 p-3 rounded-2xl`}>
                                <Text>{props.selectedWorkoutPlayDetail.completed ? 'Reset' : 'Complete'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                
            </Pressable>
                </KeyboardAvoidingView>}
        </View>
    )
}


const RemainingToDo = (props: { exercises: ExerciseDisplay[], workoutDetails: WorkoutDetails[]; onExercisePress: (wd: WorkoutDetails) => void; selectedExercise: string; onFinishPress: () => void; }) => {
    const dm = useColorScheme() === 'dark'
    const navigator = useNavigation()
    return <View style={[tw`bg-gray-${dm ? '800' : '400'}/80 px-4`, { flex: 1 }]}>
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView>
                <Text style={tw`text-xl py-4`} weight='bold'>Exercises to Complete</Text>
                {props.workoutDetails.map((wd, i) => {
                    const selected = props.selectedExercise === wd.exerciseID
                    const e = props.exercises.filter(x => x.id === wd.exerciseID)[0]
                    if (!e) return
                    let image = e.preview
                    return <View key={wd.id} style={tw`my-2`}>
                        <TouchableOpacity onPress={() => {
                            if (!selected) {
                                props.onExercisePress(wd)
                            }
                            //@ts-ignore
                            navigator.pop()
                        }} style={tw`flex-row items-center`}>
                            <ImagePreview media={{type: 'image', uri: image}} style={tw`h-15 w-15 rounded-2xl`} />
                            <Text style={tw`ml-2`}>{e.name}</Text>
                        </TouchableOpacity>
                        {selected && i < props.exercises.length - 1 && <Text style={tw`pt-2 text-lg`} weight='semibold'>Remaining</Text>}
                    </View>
                })}
                <TouchableOpacity onPress={() => {
                    props.onFinishPress()
                    //@ts-ignore
                    navigator.pop()
                }} style={tw`mx-12 my-6 rounded-2xl p-3 bg-red-500`}>
                    <Text style={tw`text-center text-white `} weight='semibold'>Finish Workout</Text>
                </TouchableOpacity>
            </ScrollView>
            <TouchableOpacity onPress={() => {
                //@ts-ignore
                navigator.pop()
            }} style={tw`items-center justify-center p-3`}>
                <Text style={tw`text-center text-lg`} weight='semibold'>Close</Text>
            </TouchableOpacity>
        </SafeAreaView>
    </View>
}

const ImagePreview = (props: { media: MediaType; style?: any }) => {
    const [img, setImg] = useState<string | null>(null)
    useEffect(() => {
        (async () => {
            try {
                let uri = props.media.uri || defaultImage
                if (isStorageUri(uri)) uri = await Storage.get(uri)
                if (props.media.type === 'video') {
                    uri = (await VideoThumbnails.getThumbnailAsync(uri)).uri
                }
                setImg(uri)
            } catch (error) {

            }
        })()
    }, [props.media])
    if (!img) return <View />
    return <Image source={{ uri: img }} style={props.style ? props.style : tw``} />
}


