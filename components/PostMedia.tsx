import { DataStore, Storage } from 'aws-amplify';
import React, { useCallback, useMemo } from 'react';
import { useState, useEffect } from 'react'
import { ScrollView, TouchableOpacity, Image, useColorScheme } from 'react-native';
import { Exercise, Meal, Media, RunProgress, Workout } from '../aws/models';
import { defaultImage, getMatchingNavigationScreen, getUsernameAndMedia, isStorageUri, PostMediaSearchDisplay, postMediaType } from '../data';
import { ExpoIcon } from './ExpoIcon';
import { View, Text } from '../components/Themed'
import tw from 'twrnc'
import RunListComponent from './RunListComponent';
import { useNavigation } from '@react-navigation/native';


export function PostMedia(props: { media?: Media[]; mealId?: string; workoutId?: string; exerciseId?: string; runProgressId?: string, canNavigate?: boolean; editable?: boolean; onDismissImagePress?: (uri: string) => void; onDismissTap: () => void; }) {
    interface MediaWithPreview extends Media {
        preview?: string;
    }
    let type = postMediaType.none
    if (props.media && props.media?.length > 0) type = (postMediaType.media)
    if (props.mealId) type = (postMediaType.meal)
    if (props.workoutId) type = (postMediaType.workout)
    if (props.exerciseId) type = (postMediaType.exercise)
    if (props.runProgressId) type = (postMediaType.run)

    const [imgs, setImgs] = useState<Media[]>([]);

    const res = useCallback(async () => {
        if (!props.media) return;
            const uris = await Promise.all(props.media?.map(async x => {
                let img = x?.uri || defaultImage
                if (isStorageUri(img)) {
                    img = await Storage.get(img)
                }
                if (x.type === 'video') {
                    //TODO: get image preview 
                }
                return { ...x, uri: img }
            }))
            return uris;
    }, [props.media])

    useEffect(() => {
        //@ts-ignore
        res().then(x => setImgs(x))
    }, [res])

    const [result, setResult] = useState<PostMediaSearchDisplay | RunProgress | null>(null)
    const navigator = useNavigation()
    const dm = useColorScheme() === 'dark'


    useEffect(() => {
        const prepare = async () => {
            if (type === postMediaType.exercise && props.exerciseId) {
                let exercise = await DataStore.query(Exercise, props.exerciseId)
                if (!exercise) return
                let exerciseWithMedia = await getUsernameAndMedia(exercise)
                setResult(exerciseWithMedia)
            } else if (type === postMediaType.run && props.runProgressId) {
                let run = await DataStore.query(RunProgress, props.runProgressId)
                if (!run) return;
                setResult(run)
            } else if (type === postMediaType.meal && props.mealId) {
                let meal = await DataStore.query(Meal, props.mealId)
                if (!meal) return
                let mealWithMedia = await getUsernameAndMedia(meal)
                setResult(mealWithMedia)
            } else if (type === postMediaType.workout && props.workoutId) {
                let workout = await DataStore.query(Workout, props.workoutId)
                if (!workout) return
                let workoutWithMedia = await getUsernameAndMedia(workout)
                setResult(workoutWithMedia)
            }
        }
        prepare()
    }, [props, type])


    if (type === postMediaType.media) {
        return <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {imgs?.map(x => {
                return <TouchableOpacity key={x.uri} disabled={props.editable} style={tw`mx-2 my-3 items-end`}>
                    {props.editable && <TouchableOpacity onPress={() => {
                        props.onDismissImagePress && props.onDismissImagePress(x.uri || '')
                        setImgs((imgs || []).filter(img => img.uri !== x.uri))
                    }} style={[tw`-mb-9 p-2 w-8 h-8 mr-1 rounded-full items-center justify-center bg-black`, { zIndex: 1 }]}>
                        <ExpoIcon name='x' iconName='feather' size={15} color='gray' />
                    </TouchableOpacity>}
                    <TouchableOpacity onPress={() => {
                        if (props.canNavigate) {
                            //@ts-ignore
                            navigator.navigate('Image', { uris: imgs.filter(x => x.type === 'image').map(x => x.uri) })
                        }
                    }}>
                        <Image source={{ uri: x.uri || defaultImage }} style={tw`h-50 w-40`} />
                    </TouchableOpacity>
                </TouchableOpacity>
            })}
        </ScrollView>
    }
    if (result && type !== postMediaType.run && (props.exerciseId || props.mealId || props.workoutId)) {
        return <View style={tw`justify-center items-center `}>
            <TouchableOpacity disabled={!props.canNavigate} onPress={() => {
                let screen: string | null = null
                let id = null
                if (type === postMediaType.exercise) {
                    screen = getMatchingNavigationScreen('ExerciseDetail', navigator)
                    id = props.exerciseId
                }
                if (type === postMediaType.workout) {
                    screen = getMatchingNavigationScreen('WorkoutDetail', navigator)
                    id = props.workoutId
                }
                if (type === postMediaType.meal) {
                    screen = getMatchingNavigationScreen('MealDetail', navigator)
                    id = props.mealId
                }
                if (screen && id) {
                    //@ts-ignore
                    navigator.navigate(screen, { id })
                }

            }} style={tw`items-center flex-row justify-between my-2 w-9/12 bg-${dm ? 'gray-800' : 'slate-400/40'} py-4 px-3 rounded-xl`}>
                
                <View style={tw`items-start flex-row justify-center pl-6 max-w-10/12`}>
                        {/* @ts-ignore */}
                        <Image source={{ uri: result.img }} style={tw`h-15 w-15 rounded-lg`} />
                        {/* @ts-ignore */}
                        <View style={tw`ml-2`}>
                        <Text weight='semibold' style={tw``}>{result.name}</Text>
                        {/* @ts-ignore */}
                        <Text style={tw`text-gray-500`}>@{result.author}</Text>
                        </View>
                    </View>
                    {props.editable && <View style={[tw`rounded-xl`, {position: 'absolute', top: 10, right: 10}]}>
                    <TouchableOpacity onPress={() => {
                        props.onDismissTap && props.onDismissTap()
                    }} style={[tw`w-8 h-8 p-2 rounded-full items-center justify-center bg-black`]}>
                        <ExpoIcon name='x' iconName='feather' size={15} color='gray' />
                    </TouchableOpacity>
                </View>}
            </TouchableOpacity>
        </View>
    }

    if (result && type === postMediaType.run && props.runProgressId) {
        return <View style={tw`items-end mx-2 my-3`}>
            {props.editable && <TouchableOpacity onPress={() => {
                props.onDismissTap && props.onDismissTap()
            }} style={[tw`-mb-4 p-2 w-8 h-8 mr-1 rounded-full items-center justify-center bg-black`, { zIndex: 1 }]}>
                <ExpoIcon name='x' iconName='feather' size={15} color='gray' />
            </TouchableOpacity>}
            {/* @ts-ignore */}
            <RunListComponent run={result} canScroll={props.canNavigate} />
        </View>
    }
    return <View><Text></Text></View>
} 