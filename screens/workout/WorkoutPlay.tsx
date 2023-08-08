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
import { defaultImage, isStorageUri, toHHMMSS, animationMapping, ExerciseDisplay, WorkoutPlayDisplayProps, WorkoutMode } from '../../data'
import { useCommonAWSIds } from '../../hooks/useCommonContext'
import { ImagePickerView } from '../../components/ImagePickerView'
import AnimatedLottieView from 'lottie-react-native'
import timer from '../../assets/animations/timer.json'
import { useDateContext } from '../home/Calendar'
import { useProgressValues } from '../../hooks/useProgressValues'
import WorkoutPlayStatic from '../../components/WorkoutPlayStatic'
import WorkoutPlayMusic from '../../components/WorkoutPlayMusic'

interface WorkoutPlayProps {
    id?: string;
    workoutId?: string;
}




export default function WorkoutPlayScreen(props: WorkoutPlayProps) {
    const dm = useColorScheme() === 'dark'
    const { sub, userId } = useCommonAWSIds()
    const { selectedAnimation, selectedWorkoutMode } = useProgressValues({ metrics: true })
    const { AWSDate } = useDateContext()
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
                    fetchedPlayDetails = await DataStore.query(WorkoutPlayDetail, wpd => wpd.workoutplayID.eq(currentWorkoutPlay.id), { sort: x => x.createdAt("ASCENDING") })
                    if (fetchedPlayDetails[0] && fetchedPlayDetails[0].workoutID) {
                        const workoutIdToFetch = fetchedPlayDetails[0].workoutID
                        const wo = await DataStore.query(Workout, workoutIdToFetch)
                        if (wo) {
                            details = await DataStore.query(WorkoutDetails, wd => wd.workoutID.eq(wo.id), { sort: x => x.createdAt('ASCENDING') })
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
                    let n = detail.sets || 1
                    for (let i = 0; i < n; i++) {
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
            let exerciseIds = [...new Set(fetchedPlayDetails.map(x => ({id: x.exerciseID})))]
            exerciseIds = exerciseIds.map(x => {
                const potentialNote = details.find(x => x.exerciseID === x.exerciseID)?.note
                return {...x, note: potentialNote || ''}
            })
            
            // get all of the exercise ID's fo the wplay details
            const exercisesToFetch = exerciseIds
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
                            return { ...x, uri: await Storage.get(x?.uri) }
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
        } else if (selectedWorkoutPlayDetail.completed) {
            if (timeToRest && (selectedWorkoutPlayDetail.rest || 0) < timeToRest) {
                const newRestTime = (selectedWorkoutPlayDetail.rest || 0) + 1
                selectedSetToChange = { ...selectedWorkoutPlayDetail, rest: newRestTime }
            } else if (selectedWorkoutDetail) {
                // if mode is music player mode
                forwardBackwardPress()

            }
        }
        if (!selectedSetToChange) return;
        setSelectedWorkoutPlayDetail(selectedSetToChange)
    }


    const forwardBackwardPress = (forward: boolean = true, shouldFinish=false) => {
        if (!selectedWorkoutDetail || !selectedWorkoutPlayDetail) return;
        if (!selectedWorkoutPlayDetail.completed && forward) {
            setSelectedWorkoutPlayDetail({...selectedWorkoutPlayDetail, completed: true})
            return;
        }
        if (workoutPlayDetails.filter(x => !x.completed).length === 0 && forward && shouldFinish) {
            onFinishPress();
            return;
        }
        const i = workoutPlayDetails.findIndex(x => x.id === selectedWorkoutPlayDetail.id)
        if (!forward && (i === 0 || workoutPlayDetails[i-1]?.exerciseID === selectedWorkoutPlayDetail.id) && selectedWorkoutPlayDetail.completed) {
            setSelectedWorkoutPlayDetail({...selectedWorkoutPlayDetail, completed: false})
            return;
        }
        if (i === -1) return;
        let newSet = workoutPlayDetails[forward ? i + 1 : i - 1]
        if (newSet) {
            if (newSet.exerciseID !== selectedWorkoutDetail.exerciseID) {
                const i2 = workoutDetails.findIndex(x => x.exerciseID === newSet.exerciseID)
                if (i2 === -1) {
                    return;
                }
                setSelectedWorkoutDetail(workoutDetails[i2])
            } 
            setSelectedWorkoutPlayDetail({...newSet, completed: forward ? newSet.completed : false})
        }
       
    }

    React.useEffect(() => {
        const interval = setInterval(perSecondFunc, 1000)
        return () => clearInterval(interval)
    })

    const [totalTime, setTotalTime] = React.useState<number>(0)

    const saveWorkoutDetails = async () => {
        setPaused(true)
        if (!thisWorkout) return;
        if (totalTime === 0) {
            navigator.navigate('FinishedExercise')
            return;
        }
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
                    x.secs = detail.secs;
                    x.reps = detail.reps;
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
                await DataStore.save(new WorkoutPlayDetail({ ...properties }))
            }
        }
        navigator.navigate('FinishedExercise')
    }

    const onFinishPress = () => {
        Alert.alert('Are you sure you are finished?', 'You can resume this workout later if you have started the clock!', [
            {
                text: 'Yes', onPress: () => {
                    // save workout
                    saveWorkoutDetails()
                }
            },
            { text: 'Cancel', onPress: () => { } }
        ])
    }

    const onNewSetPress = () => {
        if (!selectedWorkoutPlayDetail) return;
        const newSet = new WorkoutPlayDetail({
            workoutID: selectedWorkoutPlayDetail.workoutID,
            exerciseID: selectedWorkoutPlayDetail.exerciseID,
            workoutdetailsID: selectedWorkoutPlayDetail.workoutdetailsID,
            userID: selectedWorkoutPlayDetail.userID,
            workoutplayID: selectedWorkoutPlayDetail.workoutplayID,
        })
        setWorkoutPlayDetails([...workoutPlayDetails, newSet])
        setSelectedWorkoutPlayDetail(newSet)
    }

    const onResetPress = () => {
        Alert.alert("Are you sure you want to restart your time?", 'This will restart all of your progress.', [
            { text: 'Cancel' }, {
                text: 'Yes', onPress: async () => {
                    setTotalTime(0)
                    setWorkoutPlayDetails(originalDetails)
                    setSelectedWorkoutPlayDetail(originalDetails[0])

                }
            }
        ])
    }

    if (!workoutDetails.length || !exercises.filter(x => x.id === selectedWorkoutDetail?.exerciseID).length || !selectedWorkoutDetail || !selectedWorkoutPlayDetail) {
        return <View includeBackground style={{ flex: 1 }}>
            <SafeAreaView>
                <Text>Loading...</Text>
                <ActivityIndicator />
            </SafeAreaView>
        </View>
    }
    const currentExercise = exercises.filter(x => x.id === selectedWorkoutDetail?.exerciseID)[0]
    const p: WorkoutPlayDisplayProps = {
        currentExercise, exercises, shouldShowMore, setShouldShowMore, selectedWorkoutDetail, setSelectedWorkoutDetail,
        paused, setPaused, totalTime, onResetPress, workoutPlayDetails, onNewSetPress, onFinishPress, animation: animationMapping.filter(x => x.name === selectedAnimation)?.[0]?.animation || timer,
        selectedWorkoutPlayDetail, setSelectedWorkoutPlayDetail, workoutDetails, forwardBackwardPress
    }
    if (selectedWorkoutMode == WorkoutMode.player) {
        return <WorkoutPlayMusic {...p} />
    }
    return <WorkoutPlayStatic {...p} />
}


