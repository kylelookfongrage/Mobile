import { View, Text } from '../base/Themed'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, TouchableOpacity, useColorScheme } from 'react-native'
import tw from 'twrnc'
import { ExpoIcon } from './ExpoIcon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FavoritesDao from '../../types/FavoritesDao';
import useAsync from '../../hooks/useAsync';
import { useSelector } from '../../redux/store';
import { _tokens } from '../../tamagui.config';

export default function SaveButton(props: {secondary?: boolean, uploading?: boolean, disabled?: boolean, discludeBackground?: boolean; onSave?: () => void; title?: string; favoriteId?: string | number, favoriteType?: 'food' | 'meal' | 'exercise' | 'workout' | 'plan'; hidden?: boolean, safeArea?: boolean}) {
    const dm = useColorScheme() === 'dark'
    let [favorited, setFavorited] = useState<boolean>(false)
    let {profile} = useSelector(x => x.auth)
    let bg = {backgroundColor: _tokens.primary900}
    if (props.uploading || props.disabled) {
        bg.backgroundColor = _tokens.secondary900 + '90'
    }
    if (props.secondary) {
        bg.backgroundColor = dm ? _tokens.darkBg : _tokens.lightBg
        //@ts-ignore
        bg.borderColor = _tokens.primary900
        //@ts-ignore
        bg.borderWidth = 2
    }
    let heartbg = `bg-gray-${dm ? '900/50' : '300/30'}`
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
            bottom: 0,
            marginBottom: props.safeArea ? insets.bottom + 20 : 10,
            paddingTop: 10,
            flex: 1
        },
        tw`w-12/12 flex-row items-center justify-evenly`
    ]}>
        <TouchableOpacity disabled={props.uploading || props.disabled} onPress={props.onSave} style={{...tw`px-5 h-14 w-6/12 items-center justify-center flex-row rounded-full`, ...bg}}>
            <Text lg weight='bold' style={tw`text-center text-white mr-2`}>{props.title || 'Save'}</Text>
            {props.uploading && <ActivityIndicator />}
            </TouchableOpacity>
        {(props.favoriteId && props.favoriteType && <TouchableOpacity onPress={onFavoritePress} disabled={props.uploading} style={tw`w-14 h-14 items-center justify-center rounded-full ${heartbg}`}>
            <ExpoIcon name='heart' iconName='ion' size={25} color={favorited ? 'red' : 'gray'} />
        </TouchableOpacity>)}
    </View>
  )
}