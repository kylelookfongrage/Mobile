import { View, Text } from '../../components/base/Themed'
import React, { useEffect, useState } from 'react'
import { BackButton } from '../../components/base/BackButton'
import tw from 'twrnc'
import { ChatRoom, User } from '../../aws/models';
import { DataStore, Storage } from 'aws-amplify';
import { defaultImage, getMatchingNavigationScreen, isStorageUri } from '../../data';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { Image } from 'react-native';
import { ExpoIcon } from '../../components/base/ExpoIcon';
import { useNavigation } from '@react-navigation/native';
import { useCommonAWSIds } from '../../hooks/useCommonContext';

export default function ChatDetail(props: { id: string; }) {
    interface UserDisplay {
        name: string | null; username: string; img: string; id: string;
    }
    const [users, setUsers] = useState<UserDisplay[]>([])
    useEffect(() => {
        (async () => {
            const chatRoom = await DataStore.query(ChatRoom, props.id)
            if (!chatRoom) return;
            if (chatRoom.users.length === 0) return;
            const u1 = await DataStore.query(User, u => u.or(user => [
                ...chatRoom.users.map(x => user.id.eq(x))
            ]), { limit: chatRoom.users.length })
            const userDisplays: UserDisplay[] = await Promise.all(u1.map(async user => {
                let img = user.picture || defaultImage
                if (isStorageUri(img)) img = await Storage.get(img)
                return { id: user.id, name: user.name || null, username: user.username, img }
            }))
            setUsers(userDisplays)
        })()
    }, [])
    const navigator = useNavigation()
    const {userId} = useCommonAWSIds()
    return (
        <View includeBackground style={{ flex: 1 }}>
            <BackButton />
            <ScrollView style={tw`px-6 pt-4`}>
                <Text style={tw`text-lg`} weight='semibold'>Users</Text>
                {users.map(user => {
                    return <TouchableOpacity onPress={() => {
                        const screen = getMatchingNavigationScreen('Profile', navigator)
                        //@ts-ignore
                        navigator.navigate(screen, { id: user.id })
                    }} key={user.id} style={tw`flex-row items-center justify-between my-2`}>
                        <View style={tw`flex-row items-start`}>
                            <Image source={{ uri: user.img }} style={tw`h-12 w-12 rounded-full`} />
                            <View style={tw`ml-2 max-w-9/12`}>
                                <Text weight='semibold'>{user.name}</Text>
                                <Text style={tw`text-xs text-gray-500`}>@{user.username}</Text>
                            </View>
                        </View>
                        <ExpoIcon name='chevron-right' iconName='feather' size={20} color='gray' />
                    </TouchableOpacity>
                })}
                <TouchableOpacity onPress={async () => {
                    try {
                        const ogRoom = await DataStore.query(ChatRoom, props.id)
                        if (!ogRoom) {
                            throw Error('There was a problem leaving this room, try again!')
                        }
                        await DataStore.save(ChatRoom.copyOf(ogRoom, x => {
                            x.users = x.users.filter(u => u !== userId)
                        }))
                        navigator.navigate('Root')
                    } catch (error) {
                        //@ts-ignore
                        alert(error.toString())
                    }
                }} style={tw`mx-15 my-4 rounded-2xl bg-red-500 p-3 items-center justify-center`}>
                    <Text style={tw`text-center`}>Leave Room</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    )
}