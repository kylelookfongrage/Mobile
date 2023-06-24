import { ScrollView, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator, Dimensions } from 'react-native'
import React from 'react'
import { Text, View } from '../../components/Themed'
import { SafeAreaView } from 'react-native-safe-area-context'
import tw from 'twrnc'
import useColorScheme from '../../hooks/useColorScheme'
import { ResizeMode, Video } from 'expo-av'
import { useNavigation } from '@react-navigation/native'
import { ExpoIcon } from '../../components/ExpoIcon'
import { Workout, WorkoutPlayDetail, WorkoutDetails, WorkoutPlay, Exercise } from '../../aws/models'
import { DataStore, Storage } from 'aws-amplify'
import { MediaType } from '../../types/Media'
import { defaultImage, isStorageUri, toHHMMSS } from '../../data'
import { useCommonAWSIds } from '../../hooks/useCommonContext'
import { ImagePickerView } from '../../components/ImagePickerView'
import AnimatedLottieView from 'lottie-react-native'
import timer from '../../assets/animations/timer.json'
import { useDateContext } from '../home/Calendar'

interface WorkoutPlayProps {
    id?: string;
    workoutId?: string;
}

interface ExerciseDisplay {
    media: MediaType[];
    name: string;
    id: string;
    description: string;
}

// export interface WorkoutPlayExercise {
//     workoutId: string;
//     exerciseId: string, name: string;
//     secs: string; video: string;
//     sets: { reps: string, rest: string, weight: string, secs: string, completed: boolean }[];
// }

export default function WorkoutPlayScreen(props: WorkoutPlayProps) {
    const dm = useColorScheme() === 'dark'
    const { sub, userId } = useCommonAWSIds()
    const {AWSDate} = useDateContext()
    const { id, workoutId } = props;
    const navigator = useNavigation()

    // The exercises that will be displayed for each workout detail
    const [exercises, setExercises] = React.useState<ExerciseDisplay[]>([])

    // All of the sets of the workout and the selected set
    const [thisWorkout, setThisWorkout] = React.useState<WorkoutPlay | null>(null)
    const [workoutPlayDetails, setWorkoutPlayDetails] = React.useState<WorkoutPlayDetail[]>([])
    const [selectedWorkoutPlayDetail, setSelectedWorkoutPlayDetail] = React.useState<WorkoutPlayDetail | undefined>(undefined)

    // All of the exercises of the workout that are to be done
    const [workoutDetails, setWorkoutDetails] = React.useState<WorkoutDetails[]>([])
    const [selectedWorkoutDetail, setSelectedWorkoutDetail] = React.useState<WorkoutDetails | undefined>(undefined)
    const [paused, setPaused] = React.useState<boolean>(true)
    const [originalDetails, setOriginalDetails] = React.useState<WorkoutPlayDetail[]>([])
    const [shouldShowMore, setShouldShowMore] = React.useState<boolean>(false)
    React.useEffect(() => {
        const fetchDetails = async () => {
            let fetchedPlayDetails: WorkoutPlayDetail[] = []
            let details: WorkoutDetails[] = []
            if (id) {
                const currentWorkoutPlay = await DataStore.query(WorkoutPlay, id)
                if (currentWorkoutPlay) {
                    setThisWorkout(currentWorkoutPlay)
                    setTotalTime(currentWorkoutPlay.totalTime || 0)
                    fetchedPlayDetails = await DataStore.query(WorkoutPlayDetail, wpd => wpd.workoutplayID.eq(currentWorkoutPlay.id), {sort: x => x.createdAt("ASCENDING")})
                    if (fetchedPlayDetails[0] && fetchedPlayDetails[0].workoutID) {
                        const workoutIdToFetch = fetchedPlayDetails[0].workoutID
                        const wo = await DataStore.query(Workout, workoutIdToFetch)
                        if (wo) {
                            details = await DataStore.query(WorkoutDetails, wd => wd.workoutID.eq(wo.id), {sort: x => x.createdAt('ASCENDING')})
                        }
                    }

                }
            }
            if (!id && workoutId) {
                const newWorkoutPlay = await DataStore.save(new WorkoutPlay({ userID: userId, sub: sub, totalTime: 0, date: AWSDate, workoutID: workoutId }))
                setThisWorkout(newWorkoutPlay)
                const workout = await DataStore.query(Workout, workoutId)
                if (!workout) return;
                const workoutDetails = await DataStore.query(WorkoutDetails, x => x.workoutID.eq(workoutId), { sort: x => x.createdAt('ASCENDING') })
                details = workoutDetails
                for (var detail of workoutDetails) {
                    for (let i = 0; i < (detail.sets || 0); i++) {
                        const newDetail = new WorkoutPlayDetail({ workoutID: workoutId, exerciseID: detail.exerciseID, workoutdetailsID: detail.id, userID: userId, workoutplayID: newWorkoutPlay.id })
                        fetchedPlayDetails.push(newDetail)
                    }
                }
            }
            setWorkoutPlayDetails(fetchedPlayDetails)
            setOriginalDetails(fetchedPlayDetails)
            setWorkoutDetails(details)
            setSelectedWorkoutPlayDetail(fetchedPlayDetails[0])
            setSelectedWorkoutDetail(details[0])
            // get all of the exercise ID's fo the wplay details
            const exercisesToFetch = [...new Set(details.map(x => ({ id: x.exerciseID, note: x.note })))]
            const exercisesWithMedia: ExerciseDisplay[] = await Promise.all(exercisesToFetch.map(async x => {
                const exerciseWithoutMedia = await DataStore.query(Exercise, x.id)
                let defaultExercise: ExerciseDisplay = {
                    media: [{ type: 'image', uri: isStorageUri(defaultImage) ? await Storage.get(defaultImage) : defaultImage }],
                    name: exerciseWithoutMedia?.title || 'Exercise',
                    description: exerciseWithoutMedia?.description || '',
                    id: exerciseWithoutMedia?.id || x.id,
                }
                //TODO: Remove media filter so it can be fetched
                if (exerciseWithoutMedia && exerciseWithoutMedia?.media) {
                    //@ts-ignore
                    const media: MediaType[] = await Promise.all((exerciseWithoutMedia.media || defaultExercise.media).map(async x => {
                        //@ts-ignore
                        if (isStorageUri(x?.uri)) {
                            //@ts-ignore
                            return {...x, uri: await Storage.get(x?.uri)}
                        } 
                        return x
                    }))
                    defaultExercise['media'] = media
                }
                return defaultExercise
            }))
            setExercises(exercisesWithMedia)
        }
        fetchDetails()
    }, [])

    React.useEffect(() => {
        if (!selectedWorkoutPlayDetail) return;
        const newWorkoutPlays = [...workoutPlayDetails].map(x => {
            //@ts-ignore
            if (x.id === selectedWorkoutPlayDetail.id) {
                return selectedWorkoutPlayDetail
            } else return x
        })
        //@ts-ignore
        setWorkoutPlayDetails(newWorkoutPlays)
    }, [selectedWorkoutPlayDetail])

    const perSecondFunc = () => {
        if (paused || !selectedWorkoutPlayDetail) return;
        setTotalTime(totalTime + 1)
        // set the selected workout play details time + 1 if they are not completed, else add to the rest
        const timeToRest = selectedWorkoutDetail?.rest || 0
        let selectedSetToChange: WorkoutPlayDetail | null = null
        if (!selectedWorkoutPlayDetail.completed) {
            const newSetTime = (selectedWorkoutPlayDetail.secs || 0) + 1
            selectedSetToChange = { ...selectedWorkoutPlayDetail, secs: newSetTime }
        } else if (timeToRest && selectedWorkoutPlayDetail.completed) {
            if ((selectedWorkoutPlayDetail.rest || 0) < timeToRest) {
                const newRestTime = (selectedWorkoutPlayDetail.rest || 0) + 1
                selectedSetToChange = { ...selectedWorkoutPlayDetail, rest: newRestTime }
            }
        }
        if (!selectedSetToChange) return;
        setSelectedWorkoutPlayDetail(selectedSetToChange)
    }

    React.useEffect(() => {
        const interval = setInterval(perSecondFunc, 1000)
        return () => clearInterval(interval)
    })

    const [totalTime, setTotalTime] = React.useState<number>(0)

    const saveWorkoutDetails = async () => {
        setPaused(true)
        if (!thisWorkout) return;
        const originalWorkoutPlay = await DataStore.query(WorkoutPlay, thisWorkout.id)
        if (originalWorkoutPlay) {
            await DataStore.save(WorkoutPlay.copyOf(originalWorkoutPlay, x => {
                x.totalTime = (x.totalTime || 0) > totalTime ? x.totalTime : totalTime;
            }))
        } 
        for (var detail of workoutPlayDetails) {
            const potentialOriginal = await DataStore.query(WorkoutPlayDetail, detail.id)
            if (potentialOriginal) {
                await DataStore.save(WorkoutPlayDetail.copyOf(potentialOriginal, x => {
                    x.completed = detail.completed;
                    x.secs=detail.secs;
                    x.reps=detail.reps;
                    x.reps = detail.reps;
                    x.weight = detail.weight
                }))
            } else {
                const properties = {
                    reps: detail.reps,
                    rest: detail.rest,
                    weight: detail.weight,
                    secs: detail.secs,
                    completed: detail.completed,
                    workoutplayID: detail.workoutplayID,
                    workoutID: detail.workoutID,
                    exerciseID: detail.exerciseID,
                    userID: detail.userID,
                    workoutdetailsID: detail.workoutdetailsID
                }
                await DataStore.save(new WorkoutPlayDetail({...properties}))
            }
        }
        navigator.navigate('FinishedExercise')
    }

    if (!workoutDetails.length || !exercises.filter(x => x.id === selectedWorkoutDetail?.exerciseID).length || !selectedWorkoutDetail || !selectedWorkoutPlayDetail) {
        return <SafeAreaView>
            <Text>Loading...</Text>
            <ActivityIndicator />
        </SafeAreaView>
    }
    const currentExercise = exercises.filter(x => x.id === selectedWorkoutDetail?.exerciseID)[0]
    return (
        <View style={[{ flex: 1 }]} includeBackground>
            <SafeAreaView edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <ImagePickerView height={Dimensions.get('screen').height * 0.45} srcs={currentExercise.media} editable={false} />
                <View style={tw`px-4 pt-2`}>
                    <Text style={tw`text-xl max-w-9/12`} weight='bold'>{currentExercise.name}</Text>
                    <Text style={tw``}>{currentExercise.description.length > 100 ? (shouldShowMore ? currentExercise.description : currentExercise.description.substring(0, 100)) : currentExercise.description} 
                    <Text style={tw`ml-4 text-gray-500`} weight='semibold' onPress={() => setShouldShowMore(!shouldShowMore)}>  {(currentExercise.description.length > 100) ? (shouldShowMore ? 'Hide' : 'Show More') : ''}</Text>
                    </Text>
                    {selectedWorkoutDetail.note && <Text>Note: {selectedWorkoutDetail.note}</Text>}

                    <View style={tw`items-center w-12/12 items-center justify-center`}>
                        <Text style={tw`text-3xl my-4`} weight='regular'>{toHHMMSS(totalTime)}</Text>
                        <View style={tw`flex flex-row items-center justify-center`}>
                            <TouchableOpacity onPress={() => {
                                setPaused(!paused)
                            }} style={tw`bg-gray-${dm ? '700' : '300'}/60 items-end justify-center p-2.5 rounded-xl`}>
                                <ExpoIcon iconName='feather' name={totalTime === 0 ? 'play' : (paused ? 'play' : 'pause')} size={25} color='gray' />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                Alert.alert("Are you sure you want to restart your time?", 'This will restart all of your progress.', [
                                    { text: 'Cancel' }, {
                                        text: 'Yes', onPress: async () => {
                                            setTotalTime(0)
                                            setWorkoutPlayDetails(originalDetails)
                                            setSelectedWorkoutPlayDetail(originalDetails[0])

                                        }
                                    }
                                ])
                            }} style={tw`ml-2 bg-gray-${dm ? '700' : '300'}/60 items-end justify-center p-2.5 rounded-xl`}>
                                <ExpoIcon iconName='feather' name={'rotate-ccw'} size={25} color='gray' />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={tw`border border-${dm ? 'white' : 'black'} rounded-xl p-3 mt-4`}>
                        {workoutPlayDetails.filter(x => x.workoutdetailsID === selectedWorkoutDetail.id).map((set, i) => {
                            const selected = selectedWorkoutPlayDetail.id === set.id
                            return <View key={`set: ${set.id} at ${i}`} >
                                <TouchableOpacity onPress={() => {
                                    if (!selected) {
                                        setSelectedWorkoutPlayDetail(set)
                                    }
                                }} style={tw`p-2 items-start justify-center`}>
                                    <View style={tw`flex-row items-center`}>
                                        <ExpoIcon name='check-circle' iconName='feather' size={20} color={set.completed ? 'green' : 'gray'} />
                                        <Text style={tw`ml-2 ${set.completed ? 'line-through text-gray-500' : ''}`} weight={selected ? 'bold' : 'regular'}>Set {i + 1}: {toHHMMSS(set.secs || 0)} {selectedWorkoutDetail.secs ? 'of ' + toHHMMSS(selectedWorkoutDetail.secs) : ''}</Text>
                                    </View>
                                </TouchableOpacity>
                                {selected && <View>
                                    <View style={tw`flex-row items-center mt-3 justify-around`}>
                                        <View style={tw`items-center`}>
                                            <TextInput keyboardType='number-pad' placeholder='sets' style={tw`py-2 px-6 rounded-xl text-${dm ? 'white' : 'black'} bg-gray-${dm ? '700' : '300'}`} value={set.reps?.toString() || ''} onChangeText={(v) => {
                                                const newValue = v.replace(/[^0-9]/g, '')
                                                setSelectedWorkoutPlayDetail({...set, reps: Number(newValue) || null})

                                            }} />
                                        <Text style={tw`mt-2`} weight='semibold'>Reps</Text>   
                                        </View>
                                        <View style={tw`items-center`}>
                                            <TextInput keyboardType='number-pad' placeholder='lbs' style={tw`py-2 px-6 rounded-xl text-${dm ? 'white' : 'black'} bg-gray-${dm ? '700' : '300'}`} value={set.weight?.toString() || ''} onChangeText={(v) => {
                                                const newValue = v.replace(/[^0-9]/g, '')
                                                setSelectedWorkoutPlayDetail({...set, weight: Number(newValue) || null})

                                            }} />
                                        <Text style={tw`mt-2`} weight='semibold'>Weight</Text>   
                                        </View>
                                    </View>
                                    {(set.completed && (set.rest !== selectedWorkoutDetail.rest)) && <View style={tw`flex-row items-center justify-center`}>
                                        <AnimatedLottieView autoPlay
                                            style={tw`h-15 w-15`}
                                            // Find more Lottie files at https://lottiefiles.com/featured
                                            source={timer} />
                                        <Text>Resting: {toHHMMSS(set.rest || 0)}</Text>
                                    </View>}
                                    <TouchableOpacity onPress={() => {
                                        setSelectedWorkoutPlayDetail({ ...selectedWorkoutPlayDetail, completed: !selectedWorkoutPlayDetail.completed, rest: 0 })
                                    }} style={tw`mx-4 items-center justify-center p-2 bg-red-500 my-3 rounded-xl`}>
                                        <Text>{set.completed ? 'Restart' : 'Complete'}</Text>
                                    </TouchableOpacity>
                                </View>}
                            </View>
                        })}
                        <TouchableOpacity onPress={() => {
                            const newSet = new WorkoutPlayDetail({
                                workoutID: selectedWorkoutPlayDetail.workoutID,
                                exerciseID: selectedWorkoutPlayDetail.exerciseID,
                                workoutdetailsID: selectedWorkoutPlayDetail.workoutdetailsID,
                                userID: selectedWorkoutPlayDetail.userID,
                                workoutplayID: selectedWorkoutPlayDetail.workoutplayID,
                            })
                            setWorkoutPlayDetails([...workoutPlayDetails, newSet])
                            setSelectedWorkoutPlayDetail(newSet)
                        }} style={tw`flex-row items-center p-2 mt-4`}>
                            <ExpoIcon name='plus' iconName='feather' size={20} color={'gray'} />
                            <Text>New Set</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={tw`mt-6 text-lg`} weight='semibold'>Exercises Remaining</Text>
                    {workoutDetails.map((wd, idx) => {
                        if (selectedWorkoutDetail.id === wd.id) return <View key={wd.id} />;
                        const currentExerciseForWD = exercises.filter(x => x.id === wd.exerciseID)[0]
                        if (!currentExerciseForWD) return
                        let image = currentExerciseForWD.media.filter(x => x.type === 'image')[0]
                        return <TouchableOpacity
                            key={wd.id + `${idx}`}
                            style={tw`px-4 py-3 my-2 bg-gray-${dm ? '700' : '300'} w-12/12 rounded-xl flex-row justify-between`}
                            onPress={() => {
                                setSelectedWorkoutDetail(wd)
                                setSelectedWorkoutPlayDetail(workoutPlayDetails.filter(x => x.workoutdetailsID === wd.id)[0])
                            }}>
                            <View style={tw`flex-row`}>
                                <Image source={{ uri: image.uri || defaultImage }} style={tw`h-15 w-15 rounded-lg`} />
                                <View style={tw`justify-evenly ml-2 items-start max-w-11/12`}>
                                    <Text style={tw``} weight='semibold'>{currentExerciseForWD.name}</Text>
                                    <Text>{wd.sets} sets</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    })}
                </View>
                {/* Finish Workout Button */}
                <View style={tw`h-40`} />
            </ScrollView>
            </SafeAreaView>
            <View style={[
                {
                    position: 'absolute',
                    bottom: 10,
                    flex: 1
                },
                tw`w-12/12`
            ]}>
                {/* Add Food Button */}
                <View style={tw`py-5 items-center flex-row justify-center`}>
                    <TouchableOpacity onPress={() => {
                        Alert.alert('Are you sure you are finished?', 'You can resume this workout later IF you have started the clock!', [
                            {
                                text: 'Yes', onPress: () => {
                                    // save workout
                                    saveWorkoutDetails()
                                }
                            },
                            { text: 'Cancel', onPress: () => { } }
                        ])

                    }} style={tw`bg-${dm ? 'red-600' : "red-500"} px-5 h-12 justify-center rounded-full`}>
                        <Text numberOfLines={1} style={tw`text-center text-white`} weight='semibold'>Finish Workout</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}


