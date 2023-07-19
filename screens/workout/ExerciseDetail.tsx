import { TouchableOpacity, Image, ScrollView, TextInput } from 'react-native'
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
import { defaultImage, getMatchingNavigationScreen, isStorageUri, uploadMedias } from '../../data';
import { DataStore, Storage } from 'aws-amplify';
import { Equiptment, Exercise, ExerciseEquiptmentDetail, Favorite, FavoriteType, User, Workout, WorkoutDetails } from '../../aws/models';
import { useCommonAWSIds } from '../../hooks/useCommonContext';
import { ZenObservable } from 'zen-observable-ts';
import { BackButton } from '../../components/BackButton';
import { useExerciseAdditions } from '../../hooks/useExerciseAdditions';
import { ShowMoreButton } from '../home/ShowMore';
import Body from 'react-native-body-highlighter'


export interface ExerciseDetailProps {
    id?: string;
    workoutId?: string;
    editable?: boolean
}

export default function ExerciseDetail(props: ExerciseDetailProps) {
    const { id, workoutId } = props;
    const { sub, userId, username } = useCommonAWSIds()
    const {setWorkouts} = useExerciseAdditions()
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
                    await DataStore.save(new ExerciseEquiptmentDetail({exerciseID: exerciseId, equiptmentID: equ.id, userID: userId}))
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

    const saveExercise = async () => {
        if (editMode) {
            setErrors([])
            let mediaToUpload = video
            if (exerciseName === "" || description === '') {
                setErrors(['Your exercise must have a name and description'])
                setUploading(false)
                return;
            }
            if (video.filter(x => x.type === 'image').length === 0) {
                setVideo([...video, { type: 'image', uri: defaultImage }])
                mediaToUpload = [...video, { type: 'image', uri: defaultImage }]
            }
            setUploading(true)
            try {
                const imgs = await uploadMedias(mediaToUpload)
                const original = await DataStore.query(Exercise, exerciseId)
                if (original) {
                    await DataStore.save(Exercise.copyOf(original, x => {
                        x.media = imgs;
                        x.title = exerciseName;
                        x.description = description;
                        x.bodyParts=bodyParts;
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
        } else{
            setWorkouts([])
            const screen = getMatchingNavigationScreen('AddExerciseToWorkout', navigator)
            //@ts-ignore
            navigator.navigate(screen, {exerciseId: exerciseId})
        }
        // 

    }

    const [favorite, setFavorite] = React.useState<boolean>(false);
    React.useEffect(() => {
        const subscription = DataStore.observeQuery(Favorite, f => f.and(fav => [
            fav.potentialID.eq(exerciseId), fav.type.eq('EXERCISE'), fav.userID.eq(userId)
        ])).subscribe(ss => {
            const {items} = ss;
            if (items.length > 0) {
                setFavorite(true)
            }else {
                setFavorite(false)
            }
        })
        return () => subscription.unsubscribe()
    }, [])
    const firstImage = video.filter(x => x.type === 'image')

    const data: {slug: string; intensity: number; color: string}[] = bodyParts.map(x => ({
        slug: x, intensity: 1, color: ''
    }))
    console.log(bodyParts)

    return (
        <View style={{flex: 1}} includeBackground>
        <BackButton Right={() => {
            if (!editMode) return <ShowMoreButton name={exerciseName} desc={'@'+author} img={firstImage.length === 0 ? defaultImage : firstImage[0].uri} id={exerciseId} type={FavoriteType.EXERCISE} userId={authorId} />
            return <TouchableOpacity style={tw`px-2`} onPress={async () => {
                await DataStore.delete(Exercise, exerciseId)
                //@ts-ignore
                navigator.pop()
            }}>
                <Text weight='semibold' style={tw`text-red-500`}>Delete Exercise</Text>
            </TouchableOpacity>
        }} />
        <ScrollView showsVerticalScrollIndicator={false}>
            <ImagePickerView multiple type='all' editable={editMode} srcs={video} onChange={setVideo} />
            <View>
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
                    {!editMode &&  <TouchableOpacity style={tw`px-3`} onPress={async () => {
                        const isFavorited = await DataStore.query(Favorite, f => f.and(fav => [
                            fav.potentialID.eq(exerciseId), fav.userID.eq(userId), fav.type.eq('EXERCISE')
                        ]))
                        if (isFavorited.length > 0) {
                            await DataStore.delete(Favorite, isFavorited[0].id)
                        } else {
                            await DataStore.save(new Favorite({userID: userId, potentialID: exerciseId, type: 'EXERCISE'}))
                        }
                   }}>
                        <ExpoIcon name={favorite ? 'heart' : 'heart-outline'} iconName='ion' color={'red'} size={25} />
                    </TouchableOpacity>}
                </View>
                <View style={tw`px-5 pt-5`}>
                    <Text style={tw`text-2xl`} weight='bold'>Procedure</Text>
                    <TextInput
                        value={description}
                        multiline
                        numberOfLines={4}
                        onChangeText={setDescription}
                        editable={editMode === true}
                        placeholder='The description of your workout'
                        placeholderTextColor={'gray'}
                        style={tw`py-1 text-${dm ? 'white' : 'black'}`}
                    />
                    <View style={tw`h-10`} />
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
                    }}/>
                    </View>
                    <View style={tw`flex-row justify-between items-center`}>
                        <Text style={tw`text-2xl`} weight='bold'>Equiptment</Text>
                        {editMode === true && <View style={tw`flex-row items-center w-5/12 justify-around`}>
                            <TouchableOpacity onPress={() => setEditEquiptment(!editEquiptment)}>
                                <Text>{editEquiptment ? 'Cancel' : 'Edit'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={onAddEquiptmentPress}>
                                <Text>Add New</Text>
                            </TouchableOpacity>
                        </View>}
                    </View>
                    <View style={tw`flex-row flex-wrap max-w-12/12 mt-5`}>
                        {equiptment.map((e, i) => {
                            return <View style={tw`items-center w-6/12`} key={`Equiptment ${e.name} at ${i}`}>
                                {!editEquiptment && <TouchableOpacity onPress={() => {
                                    navigator.navigate('Image', {uris: [e.img], defaultIndex: 0})
                                }}>
                                    <Image source={{ uri: e.img }} style={{ width: 100, height: 100, resizeMode: 'contain' }} />
                                    </TouchableOpacity>}
                                {editEquiptment && <TouchableOpacity
                                    onPress={() => onDeleteEquiptmentPress(e.id)}
                                    style={[tw`items-center justify-center p-3`, { width: 100, height: 100 }]}>
                                    <ExpoIcon name='trash' iconName='feather' color={dm ? 'white' : 'black'} size={30} />
                                </TouchableOpacity>}
                                <Text style={tw`pb-3 pt-2`} weight='bold'>{e.name}</Text>
                            </View>
                        })}
                    </View>
                </View>
                <View style={tw`pb-30`} />
            </View>
            <View style={tw`h-40`} />
        </ScrollView>
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





