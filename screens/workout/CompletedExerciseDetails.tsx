import { View, Text } from '../../components/base/Themed'
import React, { useRef, useState } from 'react'
import { BackButton } from '../../components/base/BackButton'
import tw from 'twrnc';
import { ActivityIndicator, Dimensions, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { defaultImage, toHHMMSS } from '../../data';
import { ScrollView } from 'react-native-gesture-handler';
import TabSelector from '../../components/base/TabSelector';
import { ExpoIcon } from '../../components/base/ExpoIcon';
import Body from 'react-native-body-highlighter'
import moment from 'moment';
import ScrollViewWithDrag from '../../components/screens/ScrollViewWithDrag';
import { Tables } from '../../supabase/dao';
import ExerciseProgress from '../../components/features/ExerciseProgress';
import SupabaseImage from '../../components/base/SupabaseImage';
import useAsync from '../../hooks/useAsync';
import { WorkoutDao } from '../../types/WorkoutDao';
import Achievement from '../../components/base/Achievement';
import SaveButton from '../../components/base/SaveButton';
import { XStack, YStack } from 'tamagui';
import Description from '../../components/base/Description';
import Selector from '../../components/base/Selector';
import Spacer from '../../components/base/Spacer';
import { ExerciseTile } from './WorkoutDetail';

export default function CompletedExerciseDetails(props: { workoutPlayId: string; }) {
    const [workout, setWorkout] = useState<Tables['workout']['Row'] | null>(null);
    const [workoutPlay, setWorkoutPlay] = useState<Tables['workout_play']['Row'] | null>(null);
    const [workoutPlayDetails, setWorkoutPlayDetails] = useState<Tables['workout_play_details']['Row'][] | null>(null);
    interface LeaderboardItem {
        userId: string; username: string; name?: string; secs: number; weight: number; reps: number;
    }
    // const [leaderboard, setLoaderboard] = useState<LeaderboardItem[] | null>(null)
    const navigator = useNavigation()
    const [details, setDetails] = useState<{ [k: string]: Tables['workout_play_details']['Row'][] }>({})
    type ExerciseDis = Tables['exercise']['Row'] & { maxWeight: number; maxTime: number; maxReps: number; sets: Tables['workout_play_details'][] }
    const [exercises, setExercises] = useState<(ExerciseDis | null)[]>([])
    
    let dao = WorkoutDao()
    useAsync(async () => {
        if (!props.workoutPlayId || !Number(props.workoutPlayId)) return;
        let res = await dao.find_workout_play(Number(props.workoutPlayId))
        setWorkoutPlay(res[0])
        setWorkoutPlayDetails(res[1])
        if (!res?.[0] && res?.[0]?.workout_id) return;
        let w = await dao.find(res?.[0]?.workout_id || 1)
        if (!w) return;
        setWorkout(w)
        let exs = await dao.find_exercises(w.id)
        if (exs) {
            setExercises([...new Set(exs)])
        }
        if (!res[1]) return;
        let detailMapping: { [k: string]: Tables['workout_play_details']['Row'][] } = {}
        res[1].forEach((wpd) => {
            let detail2 = (detailMapping[wpd.workout_detail_id || 'null']) || []
            detail2.push(wpd)
            detailMapping[wpd.workout_detail_id || 'null'] = detail2
        })
        setDetails(detailMapping)
    }, [])
   
    const s = Dimensions.get('screen')
    const tabs = ['Summary', 'Workout Details', 'Progress'] as const
    const [tab, setTab] = useState<typeof tabs[number]>(tabs[0])
    
    let bodyPartMapping: { [k: string]: number } = {}
    exercises.forEach((e) => {
        if (!e) return;
        for (var part of (e.muscles || [])) {
            if (!part) continue
            bodyPartMapping[part] = (bodyPartMapping[part] || 0) + 1
        }
    })
   
    const progressRef = useRef<ScrollView | null>(null)
    const selectPage = (i: number) => {
        if (i < 0 || i > exercises.length - 1) return;
        if (!progressRef || !progressRef?.current) return;
        const w = Dimensions.get('screen').width
        progressRef.current.scrollTo({ x: i * w })
    }
    return (
        <View includeBackground style={[{ flex: 1 }]}>
            {(!workout || !workoutPlay || !workoutPlayDetails || (Object.keys(details).length === 0)) && <View style={[tw`flex items-center justify-center`, { flex: 1 }]}>
            <BackButton inplace />
                <ActivityIndicator />
                <Text style={tw`text-gray-500 mt-2`}>Loading...</Text>
            </View>}
            {(workout && workoutPlay && workoutPlayDetails && (Object.keys(details).length > 0)) && <ScrollViewWithDrag disableRounding rerenderTopView={[workout.image]} TopView={() => <View>
                <BackButton inplace />
                <SupabaseImage resizeMode='cover' style={[tw`w-12/12`, { height: s.height * 0.45 }]} uri={workout.image || defaultImage} />
            </View>} showsVerticalScrollIndicator={false}>
                <View style={[tw`pt-6 pb-60`, { zIndex: 1, flex: 1 }]}>
                    <YStack paddingHorizontal='$2'>
                    <Text h4 weight='bold'>{workout.name}</Text>
                    <Description value={moment(workoutPlay.created_at).format('LL • LT')} editable={false} />
                    </YStack>
                    <Spacer />
                    {/* @ts-ignore */}
                    <Selector searchOptions={tabs} onPress={setTab} selectedOption={tab} />
                    <Spacer lg/>
                    <View style={[tw``]}>
                        {tab === 'Summary' && <View style={tw`px-3`}>
                        <XStack justifyContent='space-between' w={'100%'} alignItems='center'>
            <ExerciseTile iconName='fa5' icon='running' iconSize={20} title={exercises.length.toString()} desc='exercises' />
            <ExerciseTile iconName='ion' icon='time-outline' iconSize={20} title={toHHMMSS(workoutPlay.time || 0)} desc='time' />
            <ExerciseTile iconName='matc' icon='weight' iconSize={20} title={workoutPlayDetails.reduce((prev, curr) => prev + ((curr.weight || 0) * (curr.reps || 1)), 0).toFixed(0)} desc={workoutPlayDetails[0].metric ? 'kgs' : 'lbs'} />
          </XStack>
                           <Spacer xl/>
                            {Object.keys(details).map(d => {
                                let deets = details[d].sort((a,b) => a.id-b.id)
                                let exerciseId = deets?.[0]?.exercise_id
                                if (!exerciseId) return <View key={d} />
                                let exercise = exercises.find(e => (e && e.id === exerciseId))
                                if (!exercise) return <View key={d} />
                                const totalWeight = deets.reduce((prev, curr) => prev + (curr.weight || 0), 0)
                                const totalReps = deets.reduce((prev, curr) => prev + (curr.reps || 0), 0)
                                return <View key={d} style={tw`flex-row items-start mb-6`}>
                                    <SupabaseImage uri={exercise.preview || defaultImage} style={`h-25 w-20 rounded-lg mr-3`} />
                                    <View>
                                        <Text style={[tw`mb-1`, { fontSize: 15 }]} weight='semibold'>{exercise.name}</Text>
                                        <Text style={tw`text-xs text-gray-500 mb-1`} weight='semibold'>{totalWeight} Volume • {totalReps} Reps</Text>
                                        {deets.map(x => {
                                            const isMaxWeight = (x.weight || 0) >= (exercise?.maxWeight || 1)
                                            const isMaxTime = (x.time || 0) >= (exercise?.maxTime || 1)
                                            const isMaxReps = (x.reps || 0) >= (exercise?.maxReps || 1)
                                            return <View key={x.id}>
                                                <View style={tw`flex-row items-center my-1`}>
                                                    <ExpoIcon name={x.completed ? 'check-circle' : 'circle'} size={15} color={x.completed ? 'green' : 'gray'} iconName='feather' />
                                                    <Text style={tw`ml-2 text-gray-500`}>{toHHMMSS(x.time || 0)} • {x.reps || 0} x {x.weight || 0}{x.metric ? 'kgs' : 'lbs'}</Text>
                                                </View>
                                                {/* @ts-ignore */}
                                                {(isMaxReps || isMaxTime || isMaxWeight) && <Achievement weight='semibold'>
                                                        New Record
                                                    </Achievement>}
                                            </View>
                                        })}
                                    </View>
                                </View>
                            })}
                        </View>}
                        {tab === 'Workout Details' && <View style={tw`px-6`}>
                            <Text style={tw`text-lg mb-2`} weight='semibold'>Description</Text>
                            <Text>{workout.description}</Text>
                            <Text style={tw`text-lg mb-2 mt-6`} weight='semibold'>Muscle Profile</Text>
                            <View style={tw`items-center justify-center my-4`}>
                                <Body colors={['#FAA0A0', '#FA5F55', '#FF0000']} data={Object.keys(bodyPartMapping).map(x => {
                                    let value = bodyPartMapping[x]
                                    if (value > 3) value = 3
                                    return { slug: x, intensity: value, color: '' }
                                })} scale={1.2} />
                            </View>
                        </View>}
                        {tab === 'Progress' && <View style={{flex: 1}}>
                            <ScrollView ref={progressRef} scrollEnabled={false} horizontal pagingEnabled>
                                {exercises.map((x, i) => {
                                    if (!x) return <View key={i} />
                                    return <View key={x.id} style={{width: Dimensions.get('screen').width, ...tw`items-center justify-center px-6`}}>
                                        <ExerciseProgress width={Dimensions.get('screen').width * 0.80} excludeList exerciseId={x.id}  />
                                        <View style={tw`flex-row items-center justify-evenly mt-6`}>
                                                <TouchableOpacity onPress={() => selectPage(i -1)} style={tw`p-3`}>
                                                <ExpoIcon name='chevron-left' iconName='feather' size={20} color='gray' />
                                                </TouchableOpacity>
                                                <Text style={tw`px-3`} weight='semibold'>{x.name}</Text>
                                                <TouchableOpacity onPress={() => selectPage(i + 1)} style={tw`p-3`}>
                                                <ExpoIcon name='chevron-right' iconName='feather' size={20} color='gray' />
                                                </TouchableOpacity>
                                            </View>
                                    </View>
                                })}
                            </ScrollView>
                        </View>}
                    </View>
                </View>
            </ScrollViewWithDrag>}
            <SaveButton favoriteId={workout?.id} favoriteType='workout' title='Redo Workout' onSave={() => {
                if (!workout) return;
                navigator.navigate('WorkoutPlay', {workoutId: workout.id})
            }} />
        </View>
    )
}