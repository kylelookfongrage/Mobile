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
import WorkoutPlayStatic from '../../components/screens/WorkoutPlayStatic'
import WorkoutPlayMusic from '../../components/screens/WorkoutPlayMusic'
import { Tables } from '../../supabase/dao'
import { WorkoutDao, WorkoutPlayDisplayProps } from '../../types/WorkoutDao'
import { ProgressDao } from '../../types/ProgressDao'
import WorkoutPlayTrainer from '../../components/screens/WorkoutPlayTrainer'
import { useSelector } from '../../redux/store'
import moment from 'moment'
import useAsync from '../../hooks/useAsync'

interface WorkoutPlayProps {
    id?: string;
    workoutId?: string;
}




export default function WorkoutPlayScreen(props: WorkoutPlayProps) {
    const dm = useColorScheme() === 'dark'
    let {profile} = useSelector(x => x.auth)
    const [selectedAnimation, selectedWorkoutMode] = [profile?.sprite, profile?.workoutMode]
    let {formattedDate} = useSelector(x => x.progress)
    let AWSDate = moment(formattedDate).format()
    const { id, workoutId } = props;
    const navigator = useNavigation()

    // The exercises that will be displayed for each workout detail
    const [exercises, setExercises] = React.useState<Tables['exercise']['Row'][]>([])

    // All of the sets of the workout and the selected set
    const [thisWorkout, setThisWorkout] = React.useState<Tables['workout_play']['Insert'] | null>(null)
    const [workoutPlayDetails, setWorkoutPlayDetails] = React.useState<Tables['workout_play_details']['Insert'][]>([])
    const [selected, setSelected] = React.useState<number>(0)
    let selectedWorkoutPlayDetail = workoutPlayDetails[selected]
    let next = workoutPlayDetails[selected + 1]

    // All of the exercises of the workout that are to be done
    const [workoutDetails, setWorkoutDetails] = React.useState<Tables['workout_details']['Row'][]>([])
    let selectedWorkoutDetail = selectedWorkoutPlayDetail ? workoutDetails.find(x => x.id === selectedWorkoutPlayDetail.workout_detail_id) : undefined
    const [paused, setPaused] = React.useState<boolean>(true)
    let resting = (selectedWorkoutDetail && selectedWorkoutPlayDetail && selectedWorkoutPlayDetail.completed) ? (
        (selectedWorkoutPlayDetail.rest || 0) < (selectedWorkoutDetail.rest || 0)
    ) : false
    const [originalDetails, setOriginalDetails] = React.useState<Tables['workout_play_details']['Row'][]>([])
    const [shouldShowMore, setShouldShowMore] = React.useState<boolean>(false)
    let dao = WorkoutDao()
    let pdao = ProgressDao(false)
    useAsync(async () => {
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
                            num: i + 1,
                            id: -(fetchedPlayDetails.length+1),
                            workout_id: detail.workout_id,
                            workout_play_id: null,
                            workout_detail_id: detail.id,
                            metric: profile?.metric
                        }
                        fetchedPlayDetails.push(newDetail)
                    }
                }
            }
            setWorkoutPlayDetails(fetchedPlayDetails)
            //@ts-ignore
            setOriginalDetails(fetchedPlayDetails)
            setWorkoutDetails(details)
            setExercises(exercisesWithMedia)
    }, [])

    const onWorkoutDetailPress = (wd: Tables['workout_details']['Row']) => {
        let idx = workoutPlayDetails.findIndex(x => x.workout_detail_id === wd.id)
        if (idx !== -1) {
            setSelected(idx)
        }
    }


    const deleteSet = (wpd: Tables['workout_play_details']['Insert']) => {
        setWorkoutPlayDetails(prev => {
            return prev.filter(x => x.id !== wpd.id).map((x, i) => {
                if (x.workout_detail_id === wpd.workout_detail_id) {
                    if ((x.num || 0) > (wpd.num || 0)) {
                        return {...x, num: (x.num || 0) - 1}
                    }
                    if (wpd.id === selectedWorkoutPlayDetail.id && (x.num || 0) === (wpd.num || 0) - 1) {
                        setSelected(i)
                    }
                }
                return x
            })
        })
    }
    

    const perSecondFunc = () => {
        if (paused || !selectedWorkoutPlayDetail) return;
        setTotalTime(totalTime + 1)
        // set the selected workout play details time + 1 if they are not completed, else add to the rest
        const timeToRest = selectedWorkoutPlayDetail.completed ? selectedWorkoutDetail?.rest || 0 : 0
        onSetUpdate({
            ...selectedWorkoutPlayDetail, 
            time: !selectedWorkoutPlayDetail.completed ? (selectedWorkoutPlayDetail.time || 0) + 1 : selectedWorkoutPlayDetail.time,
            rest: timeToRest && (selectedWorkoutPlayDetail.rest || 0) < timeToRest ? (selectedWorkoutPlayDetail.rest || 0) + 1 : selectedWorkoutPlayDetail.rest,
            completed: selectedWorkoutPlayDetail.completed ? selectedWorkoutPlayDetail.completed : (selectedWorkoutDetail?.time && selectedWorkoutPlayDetail.time === selectedWorkoutDetail.time ? true : false) 
        })
        if (selectedWorkoutPlayDetail.completed){
            if (timeToRest && (selectedWorkoutPlayDetail.rest || 0) < timeToRest) {
                return;
            }
            forwardBackwardPress()
        }
        
    }


    const forwardBackwardPress = (forward: boolean = true, shouldFinish=false) => {
        if (!selectedWorkoutDetail || !selectedWorkoutPlayDetail) return;
        if (selected === workoutPlayDetails.length - 1 && forward) {
            onFinishPress();
            return;
        }
        let hasToRest = false;
        if (forward && !resting) {
            hasToRest = ((selectedWorkoutDetail.rest || 0) > 0 && (selectedWorkoutPlayDetail.rest || 0) < (selectedWorkoutDetail.rest || 0))
        }// } else if (!resting) {
        //     if (selected !== 0) {
        //         let prevWpd = workoutPlayDetails[selected - 1]
        //         let prevWd = workoutDetails.find(x => x.id === prevWpd?.workout_detail_id)
        //         if (prevWd && prevWpd) {
        //             hasToRest = ((prevWd.rest || 0) > 0 && (prevWpd.rest || 0) < (prevWd.rest || 0))
        //         }
                
        //     }
        // }
        
        onSetUpdate({...selectedWorkoutPlayDetail, completed: forward ? true : false, rest: forward ? selectedWorkoutPlayDetail.rest : 0})
        setSelected(idx => {
            if (forward) {
                if (idx < workoutPlayDetails.length && !hasToRest ) return idx + 1
                return idx
            } else {
                if (idx > 0) return idx - 1
                return idx
            }
        })
    }

    React.useEffect(() => {
        const interval = setInterval(perSecondFunc, 1000)
        return () => clearInterval(interval)
    })

    const [totalTime, setTotalTime] = React.useState<number>(0)

    const saveWorkoutDetails = async () => {
        let time = totalTime;
        if (totalTime === 0) {
            navigator.navigate('FinishedExercise')
            return;
        }
        let newWorkout: Tables['workout_play']['Insert'] = {}
        if (thisWorkout) {
            newWorkout={...thisWorkout, time: time}
        } else {
            newWorkout={user_id: profile?.id, workout_id: Number(props.workoutId) || null, date: AWSDate, time: time }
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
        let index = workoutPlayDetails.findLastIndex(x => x.workout_detail_id === selectedWorkoutPlayDetail.workout_detail_id)
        if (typeof index !== 'number' || index === -1) return;
        const newSet: Tables['workout_play_details']['Insert'] = {
            workout_id: selectedWorkoutPlayDetail.workout_id,
            exercise_id: selectedWorkoutPlayDetail.exercise_id,
            workout_detail_id: selectedWorkoutPlayDetail.workout_detail_id,
            user_id: selectedWorkoutPlayDetail.user_id,
            workout_play_id: selectedWorkoutPlayDetail.workout_play_id,
            id: -workoutPlayDetails.length - 1,
            num: (workoutPlayDetails[index].num || 1) + 1,
            metric: profile?.metric
        }
        setWorkoutPlayDetails(prev => {
            let res = prev
            res.splice(index + 1, 0, newSet)
            console.log(res)
            return res
        })
    }

    const onSetUpdate = (x: Tables['workout_play_details']['Insert']) => {
        setWorkoutPlayDetails(prev => prev.map(z => {
            if (z.id === x.id) {
                return x
            }
            return z
        }))
    }

    const onResetPress = () => {
        Alert.alert("Are you sure you want to restart your time?", 'This will restart all of your progress.', [
            { text: 'Cancel' }, {
                text: 'Yes', onPress: async () => {
                    setTotalTime(0)
                    setWorkoutPlayDetails(originalDetails)
                    setSelected(0)
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
    const currentExercise = exercises.filter(x => x.id === selectedWorkoutPlayDetail?.exercise_id)[0]
    const p: WorkoutPlayDisplayProps = {
        currentExercise, exercises, shouldShowMore, setShouldShowMore, selectedWorkoutDetail, onWorkoutDetailPress,
        paused, setPaused, totalTime, onResetPress, workoutPlayDetails, onNewSetPress, onFinishPress, animation: animationMapping.filter(x => x.name === selectedAnimation)?.[0]?.animation || timer,
        selectedWorkoutPlayDetail, workoutDetails, forwardBackwardPress, onSetUpdate, resting, next, deleteSet
    }
    // return <WorkoutPlayTrainer {...p}/>
    // if (selectedWorkoutMode == WorkoutMode.player) {
    //     return <WorkoutPlayMusic {...p} />
    // }
    return <WorkoutPlayStatic {...p} />
}


