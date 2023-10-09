import { Text as DefaultText } from 'react-native'
import React, { useEffect, useState } from 'react'
import { View, Text } from '../base/Themed'
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useCommonAWSIds } from '../../hooks/useCommonContext';
import tw from 'twrnc'
import { UserQueries } from '../../types/UserDao';
import { getMatchingNavigationScreen } from '../../data';
import { useNavigation } from '@react-navigation/native';

export default function UsernameDisplay(props: DefaultText['props'] & { disabled?: boolean; screen?: string; id: string | undefined | null; username?: string | null | undefined }) {
    let { profile } = useCommonAWSIds()
    const dao = UserQueries()
    let [username, setUsername] = useState<string>(props.username || '')
    useEffect(() => {
        if (props.username || !props.id) return;
        dao.fetchProfile(props.id).then(x => {
            if (x) setUsername(x.username)
        })
    }, [props.id])
    const navigator = useNavigation()
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