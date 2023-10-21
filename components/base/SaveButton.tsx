import { View, Text } from '../base/Themed'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, TouchableOpacity, useColorScheme } from 'react-native'
import tw from 'twrnc'
import { ExpoIcon } from './ExpoIcon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FavoritesDao from '../../types/FavoritesDao';
import useAsync from '../../hooks/useAsync';
import { useCommonAWSIds } from '../../hooks/useCommonContext';

export default function SaveButton(props: {uploading?: boolean, discludeBackground?: boolean; onSave?: () => void; title?: string; favoriteId?: string | number, favoriteType?: 'food' | 'meal' | 'exercise' | 'workout' | 'plan'; hidden?: boolean, safeArea?: boolean}) {
    const dm = useColorScheme() === 'dark'
    let [favorited, setFavorited] = useState<boolean>(false)
    let {profile} = useCommonAWSIds()
    let bg = dm ? 'red-600' : "red-500"
    if (props.uploading) {
        bg += '/50'
    }
    let heartbg = `bg-gray-${dm ? '900' : '300'}`
    if (favorited) {
        heartbg = `bg-red-${dm ? '800/30' : '200'}`
    }
    if (props.hidden) return <View />
    let insets = useSafeAreaInsets()
    let dao = FavoritesDao()
    useAsync(async () => {
        if (!props.favoriteId || !props.favoriteType || !profile) return;
        let f = await dao.favorited(props.favoriteId, props.favoriteType, profile.id)
        setFavorited(f)
    }, [props.favoriteId])
    let onFavoritePress = async () => {
        if (!props.favoriteId || !props.favoriteType || !profile) return;
        let res = await dao.onLike(props.favoriteId, props.favoriteType, profile.id, favorited)
        setFavorited(res)
    }
  return (
    <View includeBackground={!props.discludeBackground} style={[
        {
            position: 'absolute',
            bottom: props.safeArea ? insets.bottom : 0,
            flex: 1
        },
        tw`w-12/12 flex-row items-center justify-evenly py-1.5`
    ]}>
        <TouchableOpacity disabled={props.uploading} onPress={props.onSave} style={tw`bg-${bg} px-5 h-12 w-6/12 items-center justify-center flex-row rounded-lg`}>
            <Text style={tw`text-center text-white mr-2`} weight='semibold'>{props.title || 'Save'}</Text>
            {props.uploading && <ActivityIndicator />}
            </TouchableOpacity>
        {(props.favoriteId && props.favoriteType && <TouchableOpacity onPress={onFavoritePress} disabled={props.uploading} style={tw`w-2/12 h-12 items-center justify-center rounded-lg ${heartbg}`}>
            <ExpoIcon name='heart' iconName='ion' size={25} color={favorited ? 'red' : 'gray'} />
        </TouchableOpacity>)}
    </View>
  )
}