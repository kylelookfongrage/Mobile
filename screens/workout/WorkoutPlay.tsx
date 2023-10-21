import { ScrollView, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator, Dimensions } from 'react-native'
import React from 'react'
import { Text, View } from '../../components/base/Themed'
import { SafeAreaView } from 'react-native-safe-area-context'
import useColorScheme from '../../hooks/useColorScheme'
import { useNavigation } from '@react-navigation/native'
import { Workout, WorkoutPlayDetail, WorkoutDetails, WorkoutPlay, Exercise } from '../../aws/models'
import { DataStore, Storage } from 'aws-amplify'
import { MediaType } from '../../types/Media'
import { defaultImage, isStorageUri, toHHMMSS, animationMapping, WorkoutMode } from '../../data'
import { useCommonAWSIds } from '../../hooks/useCommonContext'
import timer from '../../assets/animations/timer.json'
import { useDateContext } from '../home/Calendar'
import { useProgressValues } from '../../hooks/useProgressValues'
import WorkoutPlayStatic from '../../components/screens/WorkoutPlayStatic'
import WorkoutPlayMusic from '../../components/screens/WorkoutPlayMusic'
import { Tables } from '../../supabase/dao'
import { WorkoutDao, WorkoutPlayDisplayProps } from '../../types/WorkoutDao'
import { ProgressDao } from '../../types/ProgressDao'

interface WorkoutPlayProps {
    id?: string;
    workoutId?: string;
}




export default function WorkoutPlayScreen(props: WorkoutPlayProps) {
    const dm = useColorScheme() === 'dark'
    const { sub, userId, profile } = useCommonAWSIds()
    const [selectedAnimation, selectedWorkoutMode] = [profile?.sprite, profile?.workoutMode]
    const { AWSDate } = useDateContext()
    const { id, workoutId } = props;
    const navigator = useNavigation()

    // The exercises that will be displayed for each workout detail
    const [exercises, setExercises] = React.useState<Tables['exercise']['Row'][]>([])

    // All of the sets of the workout and the selected set
    const [thisWorkout, setThisWorkout] = React.useState<Tables['workout_play']['Insert'] | null>(null)
    const [workoutPlayDetails, setWorkoutPlayDetails] = React.useState<Tables['workout_play_details']['Insert'][]>([])
    const [selectedWorkoutPlayDetail, setSelectedWorkoutPlayDetail] = React.useState<Tables['workout_play_details']['Insert'] | undefined>(undefined)

    // All of the exercises of the workout that are to be done
    const [workoutDetails, setWorkoutDetails] = React.useState<Tables['workout_details']['Row'][]>([])
    const [selectedWorkoutDetail, setSelectedWorkoutDetail] = React.useState<Tables['workout_details']['Row'] | undefined>(undefined)
    const [paused, setPaused] = React.useState<boolean>(true)
    const [originalDetails, setOriginalDetails] = React.useState<Tables['workout_play_details']['Row'][]>([])
    const [shouldShowMore, setShouldShowMore] = React.useState<boolean>(false)
    let dao = WorkoutDao()
    let pdao = ProgressDao(false)
    React.useEffect(() => {
        const fetchDetails = async () => {
            let fetchedPlayDetails: Tables['workout_play_details']['Insert'][] = []
            let details: Tables['workout_details']['Row'][] = []
            let exercisesWithMedia: Tables['exercise']['Row'][] = []
            if (id && Number(id)) {
                const [currentWorkoutPlay, wpDetails] = await dao.find_workout_play(Number(id));
                if (currentWorkoutPlay && wpDetails) {
                    setThisWorkout(currentWorkoutPlay)
                    setTotalTime(currentWorkoutPlay.time || 0)
                    fetchedPlayDetails=wpDetails
                    let workoutId = currentWorkoutPlay.workout_id || wpDetails?.[0]?.workout_id
                    if (!workoutId) return;
                    let wDetails = await dao.find_workout_with_details(workoutId)
                    if (!wDetails) return;
                    details=wDetails.workout_details
                    //@ts-ignore
                    exercisesWithMedia = wDetails.workout_details.map(x => x.exercise)
                }
            }
            if (!id && workoutId && Number(workoutId) && profile?.id) {
                let workout = await dao.find_workout_with_details(Number(workoutId))
                if (!workout) return;
                details = workout.workout_details
                for (var detail of workout.workout_details) {
                    let n = detail.sets || 1
                    if (detail.exercise) {
                        exercisesWithMedia.push(detail.exercise)
                    }
                    for (let i = 0; i < n; i++) {
                        const newDetail: Tables['workout_play_details']['Insert'] = {
                            completed: false,
                            exercise_id: detail.exercise_id,
                            reps: null,
                            rest: 0,
                            time: 0,
                            user_id: profile.id,
                            weight: null,
                            id: -(fetchedPlayDetails.length+i+1),
                            workout_id: detail.workout_id,
                            workout_play_id: null,
                            workout_detail_id: detail.id
                        }
                        fetchedPlayDetails.push(newDetail)
                    }
                }
            }
            setWorkoutPlayDetails(fetchedPlayDetails)
            setOriginalDetails(fetchedPlayDetails)
            setWorkoutDetails(details)
            setSelectedWorkoutPlayDetail(fetchedPlayDetails[0])
            setSelectedWorkoutDetail(details[0])
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
        let selectedSetToChange: Tables['workout_play_details']['Insert'] | null = null
        if (!selectedWorkoutPlayDetail.completed) {
            const newSetTime = (selectedWorkoutPlayDetail.time || 0) + 1
            selectedSetToChange = { ...selectedWorkoutPlayDetail, time: newSetTime }
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
        if (!forward && (i === 0 || workoutPlayDetails[i-1]?.exercise_id === selectedWorkoutPlayDetail.id) && selectedWorkoutPlayDetail.completed) {
            setSelectedWorkoutPlayDetail({...selectedWorkoutPlayDetail, completed: false})
            return;
        }
        if (i === -1) return;
        let newSet = workoutPlayDetails[forward ? i + 1 : i - 1]
        if (newSet) {
            if (newSet.exercise_id !== selectedWorkoutDetail.exercise_id) {
                const i2 = workoutDetails.findIndex(x => x.exercise_id === newSet.exercise_id)
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
        if (totalTime === 0) {
            navigator.navigate('FinishedExercise')
            return;
        }
        let newWorkout: Tables['workout_play']['Insert'] = {}
        if (thisWorkout) {
            newWorkout={...thisWorkout, time: totalTime}
        } else {
            newWorkout={user_id: profile?.id, workout_id: Number(props.workoutId) || null, date: AWSDate, time: totalTime }
        }
        await dao.completeWorkout(newWorkout, workoutPlayDetails.map(x => {
            if (x['id'] && x['id'] < 0) {
                const copy = {...x}
                delete copy['id']
                return copy
            }
            return x
        }))
        await pdao.log()
        
        
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
        const newSet: Tables['workout_play_details']['Insert'] = {
            workout_id: selectedWorkoutPlayDetail.workout_id,
            exercise_id: selectedWorkoutPlayDetail.exercise_id,
            workout_detail_id: selectedWorkoutPlayDetail.workout_detail_id,
            user_id: selectedWorkoutPlayDetail.user_id,
            workout_play_id: selectedWorkoutPlayDetail.workout_play_id,
            id: -workoutPlayDetails.length - 1
        }
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
    if (!workoutDetails.length || !exercises.filter(x => x.id === selectedWorkoutDetail?.exercise_id).length || !selectedWorkoutDetail || !selectedWorkoutPlayDetail) {
        return <View includeBackground style={{ flex: 1 }}>
            <SafeAreaView>
                <Text>Loading...</Text>
                <ActivityIndicator />
            </SafeAreaView>
        </View>
    }
    const currentExercise = exercises.filter(x => x.id === selectedWorkoutDetail?.exercise_id)[0]
    const p: WorkoutPlayDisplayProps = {
        currentExercise, exercises, shouldShowMore, setShouldShowMore, selectedWorkoutDetail, setSelectedWorkoutDetail,
        paused, setPaused, totalTime, onResetPress, workoutPlayDetails, onNewSetPress, onFinishPress, animation: animationMapping.filter(x => x.name === selectedAnimation)?.[0]?.animation || timer,
        selectedWorkoutPlayDetail, setSelectedWorkoutPlayDetail, workoutDetails, forwardBackwardPress
    }
    console.log(selectedWorkoutMode)
    if (selectedWorkoutMode == WorkoutMode.player) {
        return <WorkoutPlayMusic {...p} />
    }
    return <WorkoutPlayStatic {...p} />
}


