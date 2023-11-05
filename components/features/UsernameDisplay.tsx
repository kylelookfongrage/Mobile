import { Text as DefaultText } from 'react-native'
import React, { useEffect, useState } from 'react'
import { View, Text } from '../base/Themed'
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useCommonAWSIds } from '../../hooks/useCommonContext';
import tw from 'twrnc'
import { UserQueries } from '../../types/UserDao';
import { defaultImage, getMatchingNavigationScreen } from '../../data';
import { useNavigation } from '@react-navigation/native';
import SupabaseImage from '../base/SupabaseImage';
import Spacer from '../base/Spacer';

export default function UsernameDisplay(props: DefaultText['props'] & { disabled?: boolean; screen?: string; id: string | undefined | null; username?: string | null | undefined, image?: boolean }) {
    let { profile } = useCommonAWSIds()
    const dao = UserQueries()
    let [username, setUsername] = useState<string>(props.username || '')
    let [img, setImg] = useState<string | null | undefined>(profile?.pfp)
    const [name, setName] = useState<string | null | undefined>(profile?.name)
    useEffect(() => {
        if (props.username || !props.id) return;
        dao.fetchProfile(props.id).then(x => {
            if (x) {
                setUsername(x.username)
                setImg(x.pfp)
                setName(x.name)
            }
        })
    }, [props.id])
    const navigator = useNavigation()
    if (props.image) {
        return <TouchableOpacity disabled={props.disabled} onPress={() => {
            if (!props.id) return;
            const screen = getMatchingNavigationScreen('User', navigator)
            if (!screen) return;
            //@ts-ignore
            navigator.navigate(screen, { id: props.id })
        }}  style={tw`flex-row items-center`}>
            <SupabaseImage uri={img || defaultImage} style={tw`h-10 w-10 rounded-full`} />
            <Spacer horizontal sm/>
            <View>
                <Text style={tw``} weight='bold'>{name}</Text>
                <Text style={tw`text-red-500 text-xs`} weight='regular'>@{username}</Text>
            </View>
        </TouchableOpacity>
    }
    return (
        <TouchableOpacity disabled={props.disabled} onPress={() => {
            if (!props.id) return;
            const screen = getMatchingNavigationScreen('User', navigator)
            if (!screen) return;
            //@ts-ignore
            navigator.navigate(screen, { id: props.id })
        }}>
            <Text style={tw`text-red-600 text-center`}>@{username || profile?.username}</Text>
        </TouchableOpacity>
    )
}