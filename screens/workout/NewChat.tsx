import { View, Text } from '../../components/Themed'
import React, { useEffect, useMemo, useState } from 'react'
import tw from 'twrnc'
import { Dimensions, Keyboard, Pressable, TouchableOpacity, useColorScheme, Image } from 'react-native'
import { ScrollView, TextInput } from 'react-native-gesture-handler'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { ExpoIcon } from '../../components/ExpoIcon'
import { useDebounce } from '../../hooks/useDebounce'
import { DataStore, Storage } from 'aws-amplify'
import { ChatRoom, User } from '../../aws/models'
import { useCommonAWSIds } from '../../hooks/useCommonContext'
import { defaultImage, isStorageUri } from '../../data'

export default function NewChat() {
    const h = Dimensions.get('screen').height
    const dm = useColorScheme() === 'dark'
    const padding = useSafeAreaInsets()
    const navigator = useNavigation()
    const [searchKey, setSearchKey] = useState<string>('')
    const debouncedSearchKey = useDebounce(searchKey, 800)
    const { userId } = useCommonAWSIds()
    const memoizedUserId = useMemo(() => userId, [userId])
    const [results, setResults] = useState<User[]>([])
    useEffect(() => {
        fetchUsers()
    }, [debouncedSearchKey])
    const fetchUsers = async () => {
        const followedUsers = await DataStore.query(User, u => u.and(user => [
            debouncedSearchKey ?
                user.or(x => [x.name.contains(debouncedSearchKey), x.username.contains(debouncedSearchKey)]) :
                user.username.ne(''),
            user.Followers.subscribedFrom.eq(memoizedUserId)
        ]), {
            limit: 20,
            sort: x => x.Followers('DESCENDING')
        })
        const unFollowedUsers = await DataStore.query(User, u => u.and(user => [
            debouncedSearchKey ?
                user.or(x => [x.name.contains(debouncedSearchKey), x.username.contains(debouncedSearchKey)]) :
                user.username.ne(''),
            ...(followedUsers.length > 0 ? followedUsers.map(z => user.id.ne(z.id)) : [user.username.ne('')])
        ]), { limit: 20 })
        const usersWithMedia = await Promise.all([...followedUsers, ...unFollowedUsers].map(async user => {
            let img = user.picture || defaultImage
            if (isStorageUri(img)) {
                img = await Storage.get(img)
            }
            return { ...user, picture: img }
        }))
        setResults(usersWithMedia)

    }
    const [selectedUsers, setSelectedUsers] = useState<{ id: string; name: string | null | undefined; username: string; }[]>([])
    const onNewChatPress = async ()=> {
        let usersNowCopy = selectedUsers.map(x => x.id)
        if (!usersNowCopy.includes(memoizedUserId)) {
            usersNowCopy.push(memoizedUserId)
        }
        let potentialMatches = await DataStore.query(ChatRoom, x => x.and(room => [
            ...usersNowCopy.map(x => room.users.contains(x))
        ]))
        let matchingMatches = potentialMatches.filter(x => x.users.length === usersNowCopy.length)
        let chatId = null
        if (matchingMatches.length === 0) {
            const newChat = await DataStore.save(new ChatRoom({users: usersNowCopy, accepted: memoizedUserId}))
            chatId = newChat.id
        } else {
            chatId=matchingMatches[0].id
        }
        navigator.pop()
        navigator.navigate('Message', {id: chatId})
    }
    return (
        <Pressable onPress={() => Keyboard.dismiss()} style={[{ height: h * .80, marginTop: h * .20, borderTopLeftRadius: h * .03, borderTopRightRadius: h * .03, flex: 1, paddingBottom: padding.bottom, paddingTop: 30 }, tw`bg-gray-${dm ? '800' : '400'} justify-between`]}>
            <View style={tw`justify-center items-center`}>
                <View style={tw`px-9 flex-row items-center justify-between mb-3 w-12/12`}>
                    <Text style={tw`text-lg`} weight='semibold'>Start a New Chat</Text>
                    {/* @ts-ignore */}
                <TouchableOpacity onPress={() => navigator.pop()} style={tw``}>
                    <ExpoIcon iconName='feather' name='x-circle' size={25} color='gray'  />
                </TouchableOpacity>
                </View>
                <View style={tw`flex-row flex-wrap items-center w-10/12 bg-gray-${dm ? '600' : '300'} p-2 rounded-2xl`}>
                    <ExpoIcon name='search' iconName='feather' size={25} color='gray' style={tw`mr-2`} />
                    {selectedUsers.map(x => {
                        return <View key={x.id + '-selected'}>
                            <Text style={tw`text-xs text-red-500`}> {x.name || ('@' + x.username)}</Text>
                        </View>
                    })}
                    <TextInput
                        value={searchKey}
                        onKeyPress={(e => {
                            const {nativeEvent} = e
                            let isBackSpace = nativeEvent.key === 'Backspace'
                            if (isBackSpace && searchKey.length === 0) {
                                if (selectedUsers.length > 0) {
                                    let copy = [...selectedUsers]
                                    copy.pop()
                                    setSelectedUsers(copy)
                                }
                            }
                        })}
                        onChangeText={setSearchKey}
                        placeholder='search for user'
                        placeholderTextColor={'gray'}
                        style={tw`w-3/12 p-2`} />
                </View>
                <ScrollView style={tw`py-3 w-12/12 px-6`} contentContainerStyle={tw`max-h-7/12`}>
                    {results.map(result => {
                        return <TouchableOpacity onPress={() => {
                            if (selectedUsers.filter(x => x.id === result.id).length === 0) {
                                setSelectedUsers([...selectedUsers, { name: result.name, username: result.username, id: result.id }])
                            }
                        }} style={[tw`flex-row items-center py-2 border-b border-gray-500 w-12/12`]} key={result.id}>
                            <Image source={{ uri: result.picture || defaultImage }} style={tw`h-10 w-10 rounded-full mr-3`} />
                            <View style={tw`max-w-9/12`}>
                                <Text style={tw``} weight='semibold'>{result.name}</Text>
                                <Text style={tw`text-xs text-gray-600`}>@{result.username}</Text>
                            </View>
                        </TouchableOpacity>
                    })}
                </ScrollView>
            </View>
            {/* @ts-ignore */}
            {selectedUsers.length > 0 && <TouchableOpacity style={tw`px-6 py-3 bg-red-500 w-4/12 items-center mb-3 self-center rounded-2xl`} onPress={onNewChatPress}>
                <Text style={tw`text-center text-white`} weight='semibold'>New Chat</Text>
            </TouchableOpacity>}
        </Pressable>
    )
}