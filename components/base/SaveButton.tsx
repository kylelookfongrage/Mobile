import { View, Text } from '../base/Themed'
import React, { useState } from 'react'
import { ActivityIndicator, TouchableOpacity, useColorScheme } from 'react-native'
import tw from 'twrnc'
import { ExpoIcon } from './ExpoIcon';

export default function SaveButton(props: {uploading?: boolean, discludeBackground?: boolean; onSave?: () => void; title?: string; favoriteId?: string | number, favoriteType?: 'food' | 'meal' | 'exercise' | 'workout' | 'plan'; hidden?: boolean}) {
    const dm = useColorScheme() === 'dark'
    let [favorited, setFavorited] = useState<boolean>(false)
    let bg = dm ? 'red-600' : "red-500"
    if (props.uploading) {
        bg += '/50'
    }
    let heartbg = `bg-gray-${dm ? '900' : '300'}`
    if (favorited) {
        heartbg = `bg-red-${dm ? '800/30' : '200'}`
    }
    if (props.hidden) return <View />
  return (
    <View includeBackground={!props.discludeBackground} style={[
        {
            position: 'absolute',
            bottom: 0,
            flex: 1
        },
        tw`w-12/12 flex-row items-center justify-evenly py-1.5`
    ]}>
        <TouchableOpacity disabled={props.uploading} onPress={props.onSave} style={tw`bg-${bg} px-5 h-12 w-6/12 items-center justify-center flex-row rounded-lg`}>
            <Text style={tw`text-center text-white mr-2`} weight='semibold'>{props.title || 'Save'}</Text>
            {props.uploading && <ActivityIndicator />}
            </TouchableOpacity>
        {(props.favoriteId && props.favoriteType && <TouchableOpacity disabled={props.uploading} style={tw`w-2/12 h-12 items-center justify-center rounded-lg ${heartbg}`}>
            <ExpoIcon name='heart' iconName='ion' size={25} color={favorited ? 'red' : 'gray'} />
        </TouchableOpacity>)}
    </View>
  )
}