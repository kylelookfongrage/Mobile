import { TouchableOpacity, Image, ScrollView, TextInput, Dimensions } from 'react-native'
import React, { useRef, useState } from 'react'
import { Text, View } from '../../components/Themed'
import useColorScheme from '../../hooks/useColorScheme';
import tw from 'twrnc'
import { ActivityIndicator } from 'react-native-paper';
import { ExpoIcon } from '../../components/ExpoIcon';
import { useNavigation } from '@react-navigation/native';
import { ImagePickerView } from '../../components/ImagePickerView';
import { ErrorMessage } from '../../components/ErrorMessage';
import { MediaType } from '../../types/Media';
import { ChartMapping, defaultImage, getFormattedDate, getMatchingNavigationScreen, isStorageUri, titleCase, toHHMMSS, uploadMedias } from '../../data';
import { DataStore, Storage } from 'aws-amplify';
import { Equiptment, Exercise, ExerciseEquiptmentDetail, Favorite, FavoriteType, User, Workout, WorkoutDetails, WorkoutPlayDetail } from '../../aws/models';
import { useCommonAWSIds } from '../../hooks/useCommonContext';
import { ZenObservable } from 'zen-observable-ts';
import { BackButton } from '../../components/BackButton';
import { useExerciseAdditions } from '../../hooks/useExerciseAdditions';
import { ShowMoreButton } from '../home/ShowMore';
import Body from 'react-native-body-highlighter'
import TabSelector from '../../components/TabSelector';
import moment from 'moment';
import {
    LineChart
} from "react-native-chart-kit";
import { useSwipe } from '../../hooks/useSwipe';
import ScrollViewWithDrag from '../../components/ScrollViewWithDrag';
import * as VT from 'expo-video-thumbnails'


export interface ExerciseDetailProps {
    id?: string;
    workoutId?: string;
    editable?: boolean
}

export default function ExerciseDetail(props: ExerciseDetailProps) {
    const { id, workoutId } = props;
    const { sub, userId, username } = useCommonAWSIds()
    const { setWorkouts } = useExerciseAdditions()
    const [exerciseId, setExerciseId] = React.useState<string>(id || '')
    const [exerciseName, setExerciseName] = React.useState<string>('')
    const [description, setDescription] = React.useState<string>('')
    const [author, setAuthor] = React.useState<string>('')
    const [editable, setEditable] = React.useState<boolean>(props.editable!!)
    const [editMode, setEditMode] = React.useState<boolean>(props.editable === true)
    const dm = useColorScheme() === 'dark'
    const color = dm ? 'white' : 'black'
    const borderStyle = editMode ? `border-b border-gray-700` : ''
    const [video, setVideo] = React.useState<MediaType[]>([])
    const [equiptment, setEquiptment] = React.useState<Equiptment[]>([])
    const [errors, setErrors] = React.useState<string[]>([])
    const [uploading, setUploading] = React.useState<boolean>(false)
    const [authorId, setAuthorId] = React.useState<string>('')
    const [editEquiptment, setEditEquiptment] = React.useState<boolean>(false)
    const [originalMedia, setOriginalMedia] = React.useState<MediaType[]>([])
    const [originalName, setOriginalName] = React.useState<string>('')
    const [orignalDescription, setOrignalDescription] = React.useState<string>('')
    const [originalEquiptment, setOriginalEquiptment] = React.useState<Equiptment[]>([])
    const [originalBodyParts, setOriginalBodyParts] = React.useState<string[]>([])
    const [bodyParts, setBodyParts] = React.useState<string[]>([])

    React.useEffect(() => {
        if (!id) {
            setAuthor(username)
            DataStore.save(new Exercise({ title: '', description: '', userID: userId, sub: sub, })).then(e => {
                setExerciseId(e.id)
            })
        }
    }, [])
    React.useEffect(() => {
        if (!exerciseId) return;
        let subscription: ZenObservable.Subscription | null = null;
        DataStore.query(Exercise, exerciseId).then(e => {
            if (e) {
                //@ts-ignore
                setOriginalMedia(e.media)
                setOriginalName(e.title)
                //@ts-ignore
                setOriginalBodyParts(e.bodyParts || [])
                //@ts-ignore
                setBodyParts(e.bodyParts || [])
                setOrignalDescription(e.description)
                DataStore.query(Equiptment, eq => eq.ExerciseEquiptmentDetails.exerciseID.eq(exerciseId)).then(x => setOriginalEquiptment(x))
                if (id) {
                    DataStore.query(User, e.userID).then(u => {
                        if (!u) return;
                        setAuthorId(u.id)
                        setAuthor(u?.username || '')
                        setEditable((e.userID === userId) && !props.workoutId)
                    })
                }
                setDescription(e.description)
                setExerciseName(e.title)
                if (e.media) {
                    //@ts-ignore
                    setVideo(e.media || [{ uri: defaultImage, type: 'image' }])
                }
            }
            subscription = DataStore.observeQuery(ExerciseEquiptmentDetail, e => e.exerciseID.eq(exerciseId)).subscribe(ss => {
                const { items } = ss;
                // setEquiptment([])
                Promise.all(items.map(async x => await DataStore.query(Equiptment, x.equiptmentID))).then(res => {
                    if (res) {
                        Promise.all(res.map(async x => {
                            if (x && x.img && isStorageUri(x.img)) {
                                const url = await Storage.get(x.img)
                                return { ...x, img: url }
                            } else {
                                return x
                            }
                        })).then(e => {
                            if (e) {
                                //@ts-ignore
                                setEquiptment(e)
                            }
                        })
                    }

                })
            })
        })
        return () => {
            subscription && subscription.unsubscribe()
        }
    }, [exerciseId])

    const navigator = useNavigation()

    React.useEffect(() => {
        const resetEquiptment = async () => {
            for (var equ of originalEquiptment) {
                let potential = await DataStore.query(Equiptment, eq => eq.ExerciseEquiptmentDetails.and(x => [
                    x.equiptmentID.eq(equ.id), x.exerciseID.eq(exerciseId)
                ]))
                if (potential.length === 0) {
                    await DataStore.save(new ExerciseEquiptmentDetail({ exerciseID: exerciseId, equiptmentID: equ.id, userID: userId }))
                }
            }

            for (var equ of equiptment) {
                if (!originalEquiptment.find(x => x.id === equ.id)) {
                    await DataStore.delete(ExerciseEquiptmentDetail, x => x.and(e => [
                        e.exerciseID.eq(exerciseId), e.equiptmentID.eq(equ.id)
                    ]))
                }
            }
        }
        if (editMode === false) {
            setEditEquiptment(false)
            setExerciseName(originalName)
            setVideo(originalMedia)
            setBodyParts(originalBodyParts)
            setDescription(orignalDescription)
            resetEquiptment()
        }
    }, [editMode])

    const onAddEquiptmentPress = () => {
        const screen = getMatchingNavigationScreen('EquiptmentSearch', navigator)
        if (screen !== null) {
            //@ts-ignore
            navigator.navigate(screen, { exerciseId })
        } else {
            setErrors(['There was an unexpected problem, please try again'])
        }
    }

    const onDeleteEquiptmentPress = (id: any) => {
        DataStore.delete(ExerciseEquiptmentDetail, e => e.and(x => [
            x.userID.eq(userId), x.equiptmentID.eq(id), x.exerciseID.eq(exerciseId)
        ])).then(x => console.log(x))
    }
    const [hasChangedPhoto, setHasChangedPhoto] = useState<boolean>(false)

    const saveExercise = async () => {
        if (editMode) {
            setErrors([])
            let mediaToUpload = video
            if (exerciseName === "" || description === '') {
                setErrors(['Your exercise must have a name and description'])
                setUploading(false)
                return;
            }
            setUploading(true)
            try {
                const original = await DataStore.query(Exercise, exerciseId)
                if (!original) {
                    throw Error ('Something went wrong, please try again')
                }
                const imgs = await uploadMedias(mediaToUpload)
                let preview = ''
                if (hasChangedPhoto) {
                    preview = imgs[0]?.uri || defaultImage
                    if (imgs[0]?.type === 'video') {
                        if (imgs[0]?.uri && isStorageUri(imgs[0]?.uri)) preview = await Storage.get(imgs[0]?.uri)
                        let {uri} = await VT.getThumbnailAsync(preview, {time: 0, quality: 0.7})
                        console.log(`VT URI: ${uri}`)
                        preview = uri
                    }
                }
                let previewUpload: MediaType[] | null = null 
                if (preview) {
                    previewUpload = await uploadMedias([{type: 'image', uri: preview}])
                }
                if (original) {
                    await DataStore.save(Exercise.copyOf(original, x => {
                        x.media = imgs;
                        x.title = exerciseName;
                        x.description = description;
                        x.bodyParts = bodyParts;
                        x.preview=previewUpload?.[0]?.uri;
                    }))
                    //@ts-ignore
                    navigator.pop()
                }
            } catch (error) {
                setUploading(false)
                //@ts-ignore
                setErrors([error.toString()])
            }
        } else if (props.workoutId) {
            const wId = props.workoutId
            const wo = await DataStore.query(Workout, wId)
            if (!wo) {
                setErrors(['There was a problem fetching your workout, please try again'])
                return;
            }
            const resp = await DataStore.save(new WorkoutDetails({ exerciseID: exerciseId, workoutID: wId, sets: 0, reps: 0, rest: 0, secs: 0 }))
            if (resp.id) {
                //@ts-ignore
                navigator.pop()
            }
        } else {
            setWorkouts([])
            const screen = getMatchingNavigationScreen('AddExerciseToWorkout', navigator)
            //@ts-ignore
            navigator.navigate(screen, { exerciseId: exerciseId })
        }
        // 

    }

    const [favorite, setFavorite] = React.useState<boolean>(false);
    React.useEffect(() => {
        const subscription = DataStore.observeQuery(Favorite, f => f.and(fav => [
            fav.potentialID.eq(exerciseId), fav.type.eq('EXERCISE'), fav.userID.eq(userId)
        ])).subscribe(ss => {
            const { items } = ss;
            if (items.length > 0) {
                setFavorite(true)
            } else {
                setFavorite(false)
            }
        })
        return () => subscription.unsubscribe()
    }, [])
    const firstImage = video.filter(x => x.type === 'image')

    const data: { slug: string; intensity: number; color: string }[] = bodyParts.map(x => ({
        slug: x, intensity: 1, color: ''
    }))

    const tabs = ['Muscles', 'Procedure', 'Equiptment', 'Progress']
    const [tab, setTab] = useState<typeof tabs[number]>(tabs[0])
    const [exerciseProgress, setExerciseProgress] = useState<{ [k: string]: ChartMapping }>({})
    const [chartTitle, setChartTitle] = useState<string>('')
    const [chartSuffix, setChartSuffix] = useState<string>('')
    const changeTab = (forward: boolean=true) => {
        const currentTab = tabs.findIndex(x => x==tab)
        if (currentTab === -1) {
            setTab(tabs[0])
        } else {
            let newTab = tabs[currentTab + (forward ? 1 : -1)]
            if (newTab) setTab(newTab)
        } 
    }
    const {onTouchStart, onTouchEnd} = useSwipe(changeTab, () => changeTab(false), 4)
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
        })()
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

    const sortedChartLabels = sortedChart.filter((x,i) => i < 8).map(x => getFormattedDate(new Date(x.date)))

    return (
        <View style={{ flex: 1 }} includeBackground>
            <BackButton inplace Right={() => {
                if (!editMode) return <ShowMoreButton name={exerciseName} desc={'@' + author} img={firstImage.length === 0 ? defaultImage : firstImage[0].uri} id={exerciseId} type={FavoriteType.EXERCISE} userId={authorId} />
                return <TouchableOpacity style={tw`px-2`} onPress={async () => {
                    await DataStore.delete(Exercise, exerciseId)
                    //@ts-ignore
                    navigator.pop()
                }}>
                    <Text weight='semibold' style={tw`text-red-500`}>Delete Exercise</Text>
                </TouchableOpacity>
            }} />
            <ScrollViewWithDrag rerenderTopView={[video, editMode]} TopView={() => <ImagePickerView multiple type='all' editable={editMode} srcs={video} onChange={x => {
                setVideo(x)
                setHasChangedPhoto(true)
            }} />} showsVerticalScrollIndicator={false}>
                <View includeBackground style={[{flex: 1}, tw`-mt-4 rounded-3xl`]}>
                    {errors.length > 0 && <View style={tw`px-4 py-4`}>
                        <ErrorMessage errors={errors} onDismissTap={() => setErrors([])} />
                    </View>}
                    <View style={tw`flex flex-row items-center justify-between`}>
                        <View style={tw`pl-5 pt-4 w-8/12`}>
                            <TextInput
                                style={tw`text-2xl w-10/12 max-w-10/12 mb-2 py-2 ${borderStyle}
                        text-${dm ? 'white' : 'black'} font-bold
                        `}
                                onChangeText={setExerciseName}
                                value={exerciseName}
                                editable={editMode === true}
                                multiline
                                numberOfLines={3}
                                placeholder='Exercise Name'
                                placeholderTextColor={'gray'}
                            />
                            <TouchableOpacity onPress={() => {
                                //@ts-ignore
                                navigator.push(getMatchingNavigationScreen('User', navigator), { id: authorId })
                            }}>
                                <Text>by {<Text style={tw`text-red-600`}>{author}</Text>}</Text>
                            </TouchableOpacity>
                        </View>
                        {editable && <TouchableOpacity style={tw`py-5 px-4`} onPress={() => setEditMode(!editMode)}>
                            <Text>{editMode ? 'Cancel' : "Edit"}</Text>
                        </TouchableOpacity>}
                        {!editMode && <TouchableOpacity style={tw`px-3`} onPress={async () => {
                            const isFavorited = await DataStore.query(Favorite, f => f.and(fav => [
                                fav.potentialID.eq(exerciseId), fav.userID.eq(userId), fav.type.eq('EXERCISE')
                            ]))
                            if (isFavorited.length > 0) {
                                await DataStore.delete(Favorite, isFavorited[0].id)
                            } else {
                                await DataStore.save(new Favorite({ userID: userId, potentialID: exerciseId, type: 'EXERCISE' }))
                            }
                        }}>
                            <ExpoIcon name={favorite ? 'heart' : 'heart-outline'} iconName='ion' color={'red'} size={25} />
                        </TouchableOpacity>}
                    </View>
                    <TabSelector tabs={tabs} selected={tab} style={tw`my-4`} onTabChange={setTab} disabledTabs={editMode ? ['Progress'] : []} />
                    <View style={[tw`px-5 pt-2 pb-30`, {flex: 1}]} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} >
                        {tab === 'Procedure' && <View>
                            <Text style={tw`text-lg mb-3`} weight='bold'>Overview</Text>
                            <TextInput
                                value={description}
                                multiline
                                numberOfLines={20}
                                scrollEnabled={false}
                                onChangeText={setDescription}
                                editable={editMode === true}
                                placeholder='The description of your workout'
                                placeholderTextColor={'gray'}
                                style={tw`py-1 text-${dm ? 'white' : 'black'}`}
                            />
                            <View style={tw`h-20`} />
                        </View>}
                        {tab === 'Muscles' && <View>
                            <Text style={tw`text-lg mb-4`} weight='bold'>Muscles Worked</Text>
                            <View style={tw`items-center justify-center`}>
                                <Body colors={['#FF0000']} data={data} scale={1.5} onMusclePress={(m) => {
                                    if (editMode) {
                                        const isSelected = bodyParts.includes(m.slug)
                                        if (isSelected) {
                                            setBodyParts([...bodyParts].filter(x => x !== m.slug))
                                        } else {
                                            setBodyParts([...bodyParts, m.slug])
                                        }

                                    }
                                }} />
                            </View>
                            <View style={tw`mt-4`}>
                                {bodyParts.map(x => {
                                    return <View key={x} style={tw`py-2`}>
                                        <Text>• {titleCase(x)}</Text>
                                    </View>
                                })}
                            </View>
                        </View>}
                        {tab === 'Equiptment' && <View>
                            <View style={tw`flex-row justify-between items-center`}>
                                <Text style={tw`text-lg`} weight='bold'>You'll Need</Text>
                                {editMode === true && <View style={tw`flex-row items-center w-5/12 justify-around`}>
                                    <TouchableOpacity onPress={() => setEditEquiptment(!editEquiptment)}>
                                        <Text>{editEquiptment ? 'Cancel' : 'Edit'}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={onAddEquiptmentPress}>
                                        <Text>Add New</Text>
                                    </TouchableOpacity>
                                </View>}
                            </View>
                            <View style={tw``}>
                                {equiptment.map((e, i) => {
                                    return <View style={tw`items-center flex-row justify-between my-2`} key={`Equiptment ${e.name} at ${i}`}>
                                        <TouchableOpacity style={tw`flex-row items-center`} onPress={() => {
                                            navigator.navigate('Image', { uris: [e.img], defaultIndex: 0 })
                                        }}>
                                            <Image source={{ uri: e.img }} style={tw`h-15 w-15 rounded-xl`} />
                                            <Text style={tw`ml-2`}>{e.name}</Text>
                                        </TouchableOpacity>
                                        {editEquiptment && <TouchableOpacity
                                            onPress={() => onDeleteEquiptmentPress(e.id)}
                                            style={[tw`items-center justify-center p-3`]}>
                                            <ExpoIcon name='x' iconName='feather' color={dm ? 'white' : 'black'} size={20} />
                                        </TouchableOpacity>}
                                    </View>
                                })}
                            </View>
                        </View>}
                        {(tab === 'Progress' && chartTitle == '') && <Text style={tw`my-3 text-gray-500 text-center`} weight='semibold'>No progress to display</Text>}
                        {(tab === 'Progress' && chartTitle != '') && <View>
                            <View style={tw`flex-row items-center justify-between`}>
                            <Text style={tw`text-lg`} weight='semibold'>Your {chartTitle} Progress</Text>
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
                            <View style={tw`items-center justify-center p-6 rounded-xl bg-gray-${dm ? '800/30' : '300'} my-4`}>
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
                                    width={Dimensions.get("window").width - 25} // from react-native
                                    height={220}
                                    style={tw``}
                                    withInnerLines={false}
                                    withOuterLines={false}
                                    bezier />
                            </View>
                            <Text style={tw`text-xs text-gray-500 text-center mx-12 pb-2`}>This chart shows your progress for the 8 most recent days you have performed this exercise</Text>
                            <Text style={tw`text-lg`} weight='semibold'>Past 60 Days</Text>
                            {sortedChart.map(x => {
                                return <View key={x.date} style={tw`my-1 border-b border-gray-${dm ? '800' : '300'} p-3`}>
                                    <Text>{moment(new Date(x.date)).format('LL')}</Text>
                                    <View style={tw`flex-row items-center justify-evenly mt-3`}> 
                                        <View style={tw`items-center justify-center`}>
                                            <Text weight='semibold'>{x.weight}</Text>
                                            <Text style={tw`text-xs text-gray-500`}>Max Weight</Text>
                                        </View>
                                        <View style={tw`items-center justify-center`}>
                                            <Text weight='semibold'>{x.reps}</Text>
                                            <Text style={tw`text-xs text-gray-500`}>Max Reps</Text>
                                        </View>
                                        <View style={tw`items-center justify-center`}>
                                            <Text weight='semibold'>{toHHMMSS(x.secs)}</Text>
                                            <Text style={tw`text-xs text-gray-500`}>Max Time</Text>
                                        </View>
                                    </View>
                                </View>
                            })}
                        </View>}
                    </View>
                </View>
                <View style={tw`h-40`} />
            </ScrollViewWithDrag>
            <View style={[
                {
                    position: 'absolute',
                    bottom: 0,
                    flex: 1
                },
                tw`w-12/12`
            ]}>
                {/* Add Food Button */}
                <View style={tw`py-5 w-12/12 items-center px-7 flex-row justify-center`}>
                    <TouchableOpacity onPress={saveExercise} style={tw`bg-${dm ? 'red-600' : "red-500"} mr-2 px-5 h-12 justify-center rounded-full`}>
                        {!uploading && <Text numberOfLines={1} style={tw`text-center text-white`} weight='semibold'>{(editMode || workoutId) ? 'Save Exercise' : 'Add to Workout'}</Text>}
                        {uploading && <ActivityIndicator />}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}


export const exampleEquiptment: { name: string, img: string }[] = [
    { name: 'Barbell', img: 'https://cdn.shopify.com/s/files/1/0575/5401/0306/t/15/assets/acf.BB-6000-Main.png?v=1634937073' },
    { name: 'Weights', img: 'https://www.titan.fitness/dw/image/v2/BDBZ_PRD/on/demandware.static/-/Sites-masterCatalog_Titan/default/dwab22fc78/images/hi-res/Fitness/BBUMP_01.jpg?sw=1001&sh=1000' },
    { name: 'Bench', img: 'https://m.media-amazon.com/images/I/31+Wg45GriL._AC_SY1000_.jpg' },
    { name: 'Rack', img: 'https://m.media-amazon.com/images/I/31Bwuhrpl9S._AC_SY1000_.jpg' },
    { name: 'Dumbbell', img: 'https://i5.walmartimages.com/asr/74935386-0b8e-4f70-9a5e-200bbec8c89d.bfb94a10b43699ce3a8f139416be61da.jpeg' },
    { name: 'Lat Pulldown Machine', img: 'https://cdn.shopify.com/s/files/1/0405/9358/8374/products/cb-12-lat-pull-down-seated-crunch-upright-row-machine-1.jpg' },
    { name: 'Cable Tower', img: 'https://www.bellsofsteel.us/wp-content/uploads/2022/05/Pulley-Tower-With-Weight-Stack-var2-1.jpg' },
    { name: 'Chest Press Machine', img: 'https://cdn.shopify.com/s/files/1/0017/9650/5709/products/precor-discovery-series-incline-press-dpl0541_2000x.jpg?v=1663794936' },
    { name: 'Leg Press Machine', img: 'http://cdn.shopify.com/s/files/1/0320/0391/5914/products/legpress_noweight_black.png?v=1622220356' }

]





