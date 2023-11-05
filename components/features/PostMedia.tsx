import React, { useCallback } from 'react';
import { useState, useEffect } from 'react'
import { ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { defaultImage, getMatchingNavigationScreen, isStorageUri, MediaType, PostMediaSearchDisplay, postMediaType } from '../../data';
import { ExpoIcon } from '../base/ExpoIcon';
import { View, Text } from '../base/Themed'
import tw from 'twrnc'
import RunListComponent from './RunListComponent';
import { useNavigation } from '@react-navigation/native';
import { useStorage } from '../../supabase/storage';
import { Tables } from '../../supabase/dao';
import SupabaseImage from '../base/SupabaseImage';
import { SearchDao } from '../../types/SearchDao';


export function PostMedia(props: { media?: MediaType[]; mealId?: number; workoutId?: number; exerciseId?: number; runProgressId?: number, canNavigate?: boolean; editable?: boolean; onDismissImagePress?: (uri: string) => void; onDismissTap: () => void; }) {
    let type = postMediaType.none
    if (props.media && props.media?.length > 0) type = (postMediaType.media)
    if (props.mealId) type = (postMediaType.meal)
    if (props.workoutId) type = (postMediaType.workout)
    if (props.exerciseId) type = (postMediaType.exercise)
    if (props.runProgressId) type = (postMediaType.run)
    let s = useStorage()
    let dao = SearchDao()

    const [imgs, setImgs] = useState<MediaType[]>([]);

    const res = useCallback(async () => {
        if (!props.media) return;
        const uris = await Promise.all(props.media?.map(async x => {
            let img = x?.uri || defaultImage
            if (isStorageUri(img)) {
                img = s.constructUrl(img)?.data?.publicUrl || img
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

    const [result, setResult] = useState<PostMediaSearchDisplay | Tables['run_progress']['Row'] | null>(null)
    const navigator = useNavigation()
    const dm = useColorScheme() === 'dark'


    useEffect(() => {
        const prepare = async () => {
            let table: keyof Tables | null = null
            let id: number | null = null
            if (type === postMediaType.meal && props.mealId) { table = 'meal'; id = props.mealId }
            if (type === postMediaType.exercise && props.exerciseId) { table = 'exercise'; id = props.exerciseId }
            if (type === postMediaType.workout && props.workoutId) { table = 'workout'; id = props.workoutId }
            if (type === postMediaType.run && props.runProgressId) { table = 'run_progress'; id = props.runProgressId }
            if (!table || !id) return;
            let res = await dao.find(table, id, '*, author:user_id(username)')
            if (res && table === 'run_progress') { //@ts-ignore
                setResult(res)
            } else if (res) {
                setResult({
                    id: res.id, //@ts-ignore
                    name: res.name, //@ts-ignore
                    img: res.preview || res.image, //@ts-ignore
                    author: res?.author?.username || '', //@ts-ignore
                    coordinates: res?.coordinates, //@ts-ignore
                    totalTime: res?.time,
                })
            }
        }
        prepare()
    }, [type])


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
                        <SupabaseImage uri={x.uri || defaultImage} style={tw`h-50 w-40`} />
                    </TouchableOpacity>
                </TouchableOpacity>
            })}
        </ScrollView>
    }
    if (result && type !== postMediaType.run && (props.exerciseId || props.mealId || props.workoutId)) {
        return <View style={tw`justify-center items-center`}>
            <TouchableOpacity disabled={!props.canNavigate} style={tw`w-11/12 items-center justify-center`} onPress={() => {
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
            }}>
                <View card style={tw`items-center flex-row justify-between my-2 w-11/12 py-4 px-3 rounded-xl`}>
                <View style={tw`items-start flex-row justify-center max-w-10/12`}>
                    <SupabaseImage uri={result.img || defaultImage} style={tw`h-15 w-15 rounded-lg`} />
                    <View style={tw`ml-2`}>
                        <Text weight='semibold' style={tw``}>{result?.name || ''}</Text>
                        <Text style={tw`text-red-500`}>@{result?.author || ''}</Text>
                    </View>
                </View>
                {props.editable && <View style={[tw`rounded-xl`, { position: 'absolute', top: 10, right: 10 }]}>
                    <TouchableOpacity onPress={() => {
                        props.onDismissTap && props.onDismissTap()
                    }} style={[tw`w-8 h-8 p-2 rounded-full items-center justify-center bg-black`]}>
                        <ExpoIcon name='x' iconName='feather' size={15} color='gray' />
                    </TouchableOpacity>
                </View>}
                </View>
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