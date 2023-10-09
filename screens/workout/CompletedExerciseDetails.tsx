import { View, Text } from '../../components/base/Themed'
import React, { useEffect, useRef, useState } from 'react'
import { BackButton } from '../../components/base/BackButton'
import tw from 'twrnc';
import * as VT from 'expo-video-thumbnails'
import { Exercise, Workout, WorkoutDetails, WorkoutPlay, WorkoutPlayDetail } from '../../aws/models';
import { ActivityIndicator, Alert, Dimensions, Image, TouchableOpacity, useColorScheme } from 'react-native';
import { DataStore, Storage } from 'aws-amplify';
import { useNavigation } from '@react-navigation/native';
import { ChartMapping, ExerciseDisplay, defaultImage, getFormattedDate, isStorageUri, toHHMMSS } from '../../data';
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import TabSelector from '../../components/base/TabSelector';
import { useSwipe } from '../../hooks/useSwipe';
import { ExpoIcon } from '../../components/base/ExpoIcon';
import Body from 'react-native-body-highlighter'
import moment from 'moment';
import { useCommonAWSIds } from '../../hooks/useCommonContext';
import ScrollViewWithDrag from '../../components/screens/ScrollViewWithDrag';
import { LineChart } from 'react-native-chart-kit';
import BackgroundGradient from '../../components/screens/BackgroundGradient';

export default function CompletedExerciseDetails(props: { workoutPlayId: string; }) {
    const [workout, setWorkout] = useState<Workout | null>(null);
    const [workoutPlay, setWorkoutPlay] = useState<WorkoutPlay | null>(null);
    const [workoutPlayDetails, setWorkoutPlayDetails] = useState<WorkoutPlayDetail[] | null>(null);
    interface LeaderboardItem {
        userId: string; username: string; name?: string; secs: number; weight: number; reps: number;
    }
    // const [leaderboard, setLoaderboard] = useState<LeaderboardItem[] | null>(null)
    const navigator = useNavigation()
    const [details, setDetails] = useState<{ [k: string]: WorkoutPlayDetail[] }>({})
    interface ExerciseDis extends Exercise { img: string, maxWeight: number; maxTime: number; maxReps: number; sets: WorkoutPlayDetail[] }
    const [exercises, setExercises] = useState<(ExerciseDis | null)[]>([])
    const { userId } = useCommonAWSIds()
    useEffect(() => {
        if (!workoutPlayDetails) return
        (async () => {
            let exerciseMapping: { [k: string]: WorkoutPlayDetail[] } = {}
            let detailMapping: { [k: string]: WorkoutPlayDetail[] } = {}
            workoutPlayDetails.forEach((wpd) => {
                let detail = (exerciseMapping[wpd.exerciseID]) || []
                let detail2 = (detailMapping[wpd.workoutdetailsID || 'null']) || []
                detail.push(wpd)
                detail2.push(wpd)
                exerciseMapping[wpd.exerciseID] = detail
                detailMapping[wpd.workoutdetailsID || 'null'] = detail2
            })
            let sixtyDaysAgo = moment().subtract(60, 'days').utc().format()
            let ex = await Promise.all(Object.keys(exerciseMapping).map(async ex => {
                let exercise = await DataStore.query(Exercise, ex)
                let maxWeight = await DataStore.query(WorkoutPlayDetail, wpd => wpd.and(e => [
                    e.exerciseID.eq(ex), e.completed.eq(true), e.userID.eq(userId)
                ]), { sort: x => x.weight('DESCENDING'), limit: 1 })
                let maxTime = await DataStore.query(WorkoutPlayDetail, wpd => wpd.and(e => [
                    e.exerciseID.eq(ex), e.completed.eq(true), e.userID.eq(userId)
                ]), { sort: x => x.secs('DESCENDING'), limit: 1 })
                let maxReps = await DataStore.query(WorkoutPlayDetail, wpd => wpd.and(e => [
                    e.exerciseID.eq(ex), e.completed.eq(true), e.userID.eq(userId)
                ]), { sort: x => x.reps('DESCENDING'), limit: 1 })
                let sets = await DataStore.query(WorkoutPlayDetail, wpd => wpd.and(e => [
                    e.exerciseID.eq(ex), e.completed.eq(true), e.userID.eq(userId), e.createdAt.ge(sixtyDaysAgo)
                ]), { sort: x => x.createdAt('ASCENDING') })
                let uri = exercise?.preview || defaultImage
                if (isStorageUri(uri)) uri = await Storage.get(uri)
                return { ...exercise, id: ex, sets, img: uri, maxWeight: (maxWeight?.[0]?.weight || 0), maxTime: (maxTime?.[0]?.secs || 0), maxReps: (maxReps?.[0]?.reps || 0) }
            }))
            //@ts-ignore
            setExercises(ex)
            setDetails(detailMapping)

        })()
    }, [workoutPlayDetails])
    // useEffect(() => {
    //     if (!workout) return;
    //     const wp = 
    // }, [workout])
    useEffect(() => {
        (async () => {
            try {
                const wp = await DataStore.query(WorkoutPlay, props.workoutPlayId)
                if (!wp || !wp.workoutID) throw Error('No workout found')
                const wo = await DataStore.query(Workout, wp.workoutID)
                if (!wo) throw Error('No workout found')
                const wpd = await wp.WorkoutPlayDetails.toArray()
                let img = wo.img || defaultImage
                if (isStorageUri(img)) img = await Storage.get(img)
                setWorkoutPlay(wp)
                setWorkoutPlayDetails(wpd)
                setWorkout({ ...wo, img })
            } catch (error) {
                //@ts-ignore
                Alert.alert('Error', error.toString(), [
                    //@ts-ignore
                    { onPress: () => navigator.pop(), text: 'Back' }
                ])
            }
        })()
    }, [])
    const s = Dimensions.get('screen')
    const tabs = ['Summary', 'Workout Details', 'My Progress'] as const
    const [tab, setTab] = useState<typeof tabs[number]>(tabs[0])
    const changeTab = (forward: boolean = true) => {
        const currentTab = tabs.findIndex(x => x == tab)
        if (currentTab === -1) {
            setTab(tabs[0])
        } else {
            let newTab = tabs[currentTab + (forward ? 1 : -1)]
            if (newTab) setTab(newTab)
        }
    }
    const { onTouchStart, onTouchEnd } = useSwipe(changeTab, () => changeTab(false), 6)
    let bodyPartMapping: { [k: string]: number } = {}
    exercises.forEach((e) => {
        if (!e) return;
        for (var part of (e.bodyParts || [])) {
            if (!part) continue
            bodyPartMapping[part] = (bodyPartMapping[part] || 0) + 1
        }
    })
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
    const dm = useColorScheme() === 'dark'
    const [chartTitle, setChartTitle] = useState<string>('Weight')
    const [chartSuffix, setChartSuffix] = useState<string>('')
    const progressRef = useRef<ScrollView | null>(null)
    const selectPage = (i: number) => {
        if (i < 0) return;
        if (!progressRef || !progressRef?.current) return;
        const w = Dimensions.get('screen').width
        progressRef.current.scrollTo({x: i * w})
    }
    return (
        <View includeBackground style={[{ flex: 1 }]}>
            <BackButton inplace />
            {(!workout || !workoutPlay || !workoutPlayDetails || !workout.img || (Object.keys(details).length === 0)) && <View style={[tw`flex items-center justify-center`, { flex: 1 }]}>
                <ActivityIndicator />
                <Text style={tw`text-gray-500 mt-2`}>Loading...</Text>
            </View>}
            {(workout && workoutPlay && workoutPlayDetails && workout.img && (Object.keys(details).length > 0)) && <ScrollViewWithDrag TopView={() => <Image resizeMode='cover' style={[tw`w-12/12`, { height: s.height * 0.45 }]} source={{ uri: workout.img || "" }} />} showsVerticalScrollIndicator={false}>
                <BackgroundGradient onTouchEnd={onTouchEnd} onTouchStart={onTouchStart} style={[tw`pt-6 pb-60 -mt-12`, { zIndex: 1, flex: 1 }]}>
                    <Text style={tw`text-xl px-6`} weight='semibold'>{workout.name}</Text>
                    <Text style={tw`px-6 text-gray-500 text-xs mt-2`} weight='semibold'>{moment(workoutPlay.createdAt).format('LL • LT')}</Text>
                    {/* @ts-ignore */}
                    <TabSelector style={tw`py-3`} tabs={[...tabs]} selected={tab} onTabChange={setTab} />
                    <View style={[tw`pt-4`]}>
                        {tab === 'Summary' && <View style={tw`px-6`}>
                            <View style={tw`px-3 py-4 bg-gray-${dm ? '800' : "300"} rounded-3xl mb-6 flex-row items-center justify-around`}>
                                <View style={tw`items-center justify-center`}>
                                    <Text weight='bold'>{exercises.length}</Text>
                                    <Text style={tw`text-xs text-gray-500 mt-1`} weight='semibold'>Exercises</Text>
                                </View>
                                <View style={tw`items-center justify-center`}>
                                    <Text weight='bold'>{toHHMMSS(workoutPlay.totalTime || 0)}</Text>
                                    <Text style={tw`text-xs text-gray-500 mt-1`} weight='semibold'>Time</Text>
                                </View>
                                <View style={tw`items-center justify-center`}>
                                    <Text weight='bold'>{workoutPlayDetails.reduce((prev, curr) => prev + (curr.weight || 0), 0)}</Text>
                                    <Text style={tw`text-xs text-gray-500 mt-1`} weight='semibold'>Volume</Text>
                                </View>
                            </View>
                            {Object.keys(details).map(d => {
                                let deets = details[d]
                                let exerciseId = deets?.[0]?.exerciseID
                                if (!exerciseId) return <View key={d} />
                                let exercise = exercises.find(e => (e && e.id === exerciseId))
                                if (!exercise) return <View key={d} />
                                const totalWeight = deets.reduce((prev, curr) => prev + (curr.weight || 0), 0)
                                const totalReps = deets.reduce((prev, curr) => prev + (curr.reps || 0), 0)
                                return <View key={d} style={tw`flex-row items-start mb-6`}>
                                    <Image source={{ uri: exercise.img }} style={tw`h-25 w-20 rounded-lg mr-3`} />
                                    <View>
                                        <Text style={[tw`mb-1`, { fontSize: 15 }]} weight='semibold'>{exercise.title}</Text>
                                        <Text style={tw`text-xs text-gray-500 mb-1`} weight='semibold'>{totalWeight} Volume • {totalReps} Reps</Text>
                                        {deets.map(x => {
                                            const isMaxWeight = (x.weight || 0) >= (exercise?.maxWeight || 1)
                                            const isMaxTime = (x.secs || 0) >= (exercise?.maxTime || 1)
                                            const isMaxReps = (x.reps || 0) >= (exercise?.maxReps || 1)
                                            return <View key={x.id}>
                                                <View style={tw`flex-row items-center my-1`}>
                                                    <ExpoIcon name={x.completed ? 'check-circle' : 'circle'} size={15} color={x.completed ? 'green' : 'gray'} iconName='feather' />
                                                    <Text style={tw`ml-2 text-gray-500`}>{toHHMMSS(x.secs || 0)} • {x.reps || 0} x {x.weight || 0}lbs</Text>
                                                </View>
                                                {(isMaxReps || isMaxTime || isMaxWeight) && <View style={tw`flex-row items-center p-1 mb-1 rounded-xl bg-red-600 px-2`}>
                                                    <ExpoIcon name='award' iconName='feather' size={15} color='white' />
                                                    <Text style={tw`text-xs text-white`} weight='semibold'>
                                                        {isMaxWeight ? ((isMaxWeight && isMaxTime && !isMaxReps) ? ' Weight & ' : (isMaxWeight && !isMaxTime && !isMaxReps ? ' Weight' : ' Weight, ')) : ' '}
                                                        {isMaxTime ? ((isMaxTime && !isMaxReps) ? 'Time' : 'Time & ') : ''}
                                                        {isMaxReps ? 'Reps' : ''} Record
                                                    </Text>
                                                </View>}
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
                        {tab === 'My Progress' && <View>
                            <ScrollView ref={progressRef} scrollEnabled={false} horizontal pagingEnabled>
                                {exercises.map((x, i) => {
                                    if (!x) return <View key={i + 'ExerciseProgress - Not Found'} />
                                    let dateMapping: { [k: string]: ChartMapping } = {}
                                    let shouldBeSeconds = true
                                    for (var wo of x.sets) {
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
                                    const sortedChart = Object.values(dateMapping).sort((a, b) => {
                                        var c = new Date(a.date);
                                        var d = new Date(b.date);
                                        //@ts-ignore
                                        return c - d;
                                    })

                                    const sortedChartLabels = sortedChart.filter((x, i) => i < 8).map(x => getFormattedDate(new Date(x.date)))
                                    return <View key={`ExerciseProgress-${x?.id || null} ${i}`} style={[tw`items-center justify-center`, {width: Dimensions.get('screen').width}]}>
                                        <View style={tw`flex-row items-center justify-between w-12/12 px-6`}>
                                            <Text style={tw`text-left`} weight='semibold'>Your {chartTitle} Progress</Text>
                                            <View style={tw`flex-row items-center justify-evenly`}>
                                                {['Weight', 'Reps', 'Time'].map(x => {
                                                    if (chartTitle === x) return <View key={x} />
                                                    return <Text onPress={() => {
                                                        setChartTitle(x)
                                                        if (x === 'Weight') setChartSuffix('lbs')
                                                        if (x === 'Reps') setChartSuffix('')
                                                        if (x === 'Time' && sortedChart[0]) setChartSuffix(sortedChart[0].secs > 60 ? 'm' : 's')
                                                    }} key={x} style={tw`mx-4 text-red-500`}>{x}</Text>
                                                })}
                                            </View>
                                        </View>
                                        <View style={tw`items-center justify-center rounded-xl bg-gray-${dm ? '800/30' : '300'} my-4`}>
                                            {/* @ts-ignore */}
                                            <LineChart chartConfig={chartConfig} yAxisSuffix={chartSuffix} data={{
                                                labels: sortedChartLabels,
                                                datasets: [
                                                    {
                                                        data: sortedChart.filter((x, i) => i < 8).map(x => {
                                                            if (chartTitle === 'Weight') return Math.round(x.weight)
                                                            if (chartTitle === 'Reps') return Math.round(x.reps)
                                                            return Math.round(chartSuffix === 'm' ? x.secs / 60 : x.secs)
                                                        })
                                                    }
                                                ]

                                            }}
                                                width={Dimensions.get("window").width * 0.80} // from react-native
                                                height={220}
                                                style={tw`items-center justify-center`}
                                                withInnerLines={false}
                                                withOuterLines={false}
                                                bezier />
                                        </View>
                                        <View style={tw`flex-row items-center justify-evenly mt-6`}>
                                                <TouchableOpacity onPress={() => selectPage(i -1)} style={tw`p-3`}>
                                                <ExpoIcon name='chevron-left' iconName='feather' size={20} color='gray' />
                                                </TouchableOpacity>
                                                <Text style={tw`px-3`} weight='semibold'>{x.title}</Text>
                                                <TouchableOpacity onPress={() => selectPage(i + 1)} style={tw`p-3`}>
                                                <ExpoIcon name='chevron-right' iconName='feather' size={20} color='gray' />
                                                </TouchableOpacity>
                                            </View>
                                    </View>
                                })}
                            </ScrollView>
                        </View>}
                    </View>
                </BackgroundGradient>
            </ScrollViewWithDrag>}
            <View style={tw`px-4`}>

            </View>
        </View>
    )
}