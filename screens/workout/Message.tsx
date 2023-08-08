import { View, Text } from '../../components/Themed'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import tw from 'twrnc'
import { Gesture, GestureDetector, RefreshControl, ScrollView, Swipeable, TextInput } from 'react-native-gesture-handler'
import { Dimensions, Image, Keyboard, KeyboardAvoidingView, Platform, TouchableOpacity, useColorScheme } from 'react-native'
import { useFocusEffect, useIsFocused, useNavigation } from '@react-navigation/native'
import { ExpoIcon } from '../../components/ExpoIcon'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ChatMessages, ChatRoom, User } from '../../aws/models'
import { DataStore, Storage } from 'aws-amplify'
import { defaultImage, isStorageUri, sleep } from '../../data'
import { useCommonAWSIds } from '../../hooks/useCommonContext'
import moment from 'moment'
import * as Haptics from 'expo-haptics'

interface UserInfo{ [k: string]: { username: string, name: string | null, pfp: string }}

const useChatMessages = (id: string): {messages: ChatMessages[], userInfo: UserInfo, refreshing: boolean, shouldScrollToEnd: boolean; fetchMessages: () => void; setShouldScrollToEnd: (v: boolean) => void;} => {
    const [messages, setMessages] = useState<ChatMessages[]>([])
    const [userInfo, setUserInfo] = useState<UserInfo>({})
    const [refreshing, setRefreshing] = useState<boolean>(false)
    const [pageNumber, setPageNumber] = useState<number>(0)
    const [messageMapping, setMessageMapping] = useState<ChatMessages[]>();
    const now = moment()
    const [shouldScrollToEnd, setShouldScrollToEnd] = useState<boolean>(false)
    

    useEffect(() => {
        const subscription = DataStore.observeQuery(ChatMessages, c => c.and(x => [
            x.chatroomID.eq(id),
            messageMapping?.length === 0 ? 
            x.chatroomID.ne('') : 
            x.or(msg => [
                msg.createdAt.ge(now.utc().format()), 
                ...(messageMapping || []).map(msg2 => msg.id.eq(msg2.id))
            ] )
        ]), {sort: x => x.createdAt('ASCENDING')}).subscribe(ss => {
            const {items} = ss;
            setMessages(items)            
        })
        return () => subscription.unsubscribe()
    }, [messageMapping])


    const fetchMessageInfo = async (fetched: ChatMessages[]) => {
        const internalUserMapping: { [k: string]: { username: string, name: string | null, pfp: string } } = {...userInfo}
        for (var fetchedMessage of fetched) {
            const userFromMap = internalUserMapping[fetchedMessage.from]
            if (!userFromMap?.username || !userFromMap?.pfp) {
                const user = await DataStore.query(User, fetchedMessage.from)
                if (!user) continue;
                let pfp = user.picture || defaultImage
                if (isStorageUri(pfp)) {
                    pfp = await Storage.get(pfp, {expires: 1800})
                }
                internalUserMapping[fetchedMessage.from] = { name: user.name || null, pfp, username: user.username }
            }
        }
        setUserInfo(internalUserMapping)
    }

    const fetchMessages = async () => {
        setShouldScrollToEnd(false)
        const fetched = await DataStore.query(
            ChatMessages, c => c.and(m => [
                m.chatroomID.eq(id),
                ...(messages.length > 0 ? messages.map(x => m.id.ne(x.id)) : [m.id.ne('')])
            ])
            , { limit: 10, sort: x => x.createdAt('DESCENDING'), page: pageNumber })
        await fetchMessageInfo(fetched)
        setMessageMapping([...fetched, ...messages])
        setPageNumber(pageNumber + 1)
    }

    useEffect(() => {
        (async () => {
            try {
                const chatRoom = await DataStore.query(ChatRoom, id)
                if (!chatRoom) return;
                const users = chatRoom.users
                if (users.length > 0) {
                    const fetchedUsers = await DataStore.query(User, u => u.or(user => users.map(x => user.id.eq(x))))
                    const userInfoCopy = {...userInfo}
                    for (let user of fetchedUsers) {
                        let info = userInfoCopy[user.id]
                        if (info) continue;
                        let pfp = user.picture || defaultImage
                        if (isStorageUri(pfp)) pfp = await Storage.get(pfp)
                        userInfoCopy[user.id] = {name: user.name || null, pfp, username: user.username}
                    }
                    setUserInfo(userInfoCopy)
                }
                let shouldProceed = (await chatRoom.ChatMessages.toArray()).length > 0
                if (shouldProceed) {
                    await fetchMessages()
                    sleep(1200)
                    setShouldScrollToEnd(true)
                }
            } catch (error) {
                
            }
        })()
    }, [])
    return {messages, userInfo, fetchMessages, refreshing, shouldScrollToEnd, setShouldScrollToEnd}
}



export default function Message(props: { id: string }) {
    const { userId } = useCommonAWSIds()
    const memoizedUserId = useMemo(() => userId, [userId])
    const {refreshing, fetchMessages, messages, userInfo, shouldScrollToEnd, setShouldScrollToEnd} = useChatMessages(props.id)
    const usernames = Object.values(userInfo).map(x => x.name || ('@' + x.username))    
    const dm = useColorScheme() === 'dark'
    const padding = useSafeAreaInsets()
    const navigator = useNavigation()
    const [newMessage, setNewMessage] = useState<string>('')
    const [keyboardPresent, setKeyboardPresent] = useState<boolean>(false)
    const scrollRef = useRef<ScrollView | null>(null)

    useEffect(() => {
        let l1 = Keyboard.addListener('keyboardWillShow', () => {
            scrollRef.current?.scrollToEnd({animated: true})
            setKeyboardPresent(true)
        })
        let l2 = Keyboard.addListener('keyboardWillHide', () => {
            setKeyboardPresent(false)
        })
        return () => {
            l1.remove()
            l2.remove()
        }
    }, [])

    const onNewMessagePress = async () => {
        if (!newMessage || newMessage === '') return;
        await DataStore.save(new ChatMessages({from: memoizedUserId, chatroomID: props.id, description: newMessage}))
        setNewMessage('')
        await sleep(800)
        scrollRef.current?.scrollToEnd()
    }

    return (
        <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} enabled>
            <View includeBackground style={{ flex: 1 }}>
            <MessageHeader names={usernames} onPress={() => {
                navigator.navigate('ChatDetail', {id: props.id})
            }}  />
            <ScrollView 
            showsVerticalScrollIndicator={false}
            snapToEnd
            ref={scrollRef} 
            onContentSizeChange={(contentWidth, contentHeight) => {
                if (shouldScrollToEnd) {
                    scrollRef.current?.scrollToEnd()
                }
              }}              
            keyboardDismissMode='interactive'
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchMessages} />} 
            contentContainerStyle={tw`px-4 pt-5`}>
                {messages.map((message, i) => {
                    let isUsers = message.from === memoizedUserId
                    const info = userInfo[message.from]
                    let previousMessage = i === 0 ? null : messages[i-1]
                    let shouldShowTime = i===0
                    if (previousMessage) {
                        let diff = moment(message.createdAt).diff(moment(previousMessage.createdAt), 'minutes')
                        if (diff > 10) shouldShowTime = true
                    }
                    return <View key={message.id}>
                        {shouldShowTime && <Text style={tw`text-center text-xs text-gray-500 my-3`} weight='regular'>{moment(message.createdAt).format('lll')}</Text>}
                        <ChatBubble 
                                message={message} 
                                userId={memoizedUserId}
                                isUsers={isUsers} 
                                userInfo={info} 
                                onDoubleTap={async (mes) => {
                                    setShouldScrollToEnd(false)
                                    if (!mes.likes) {
                                        await DataStore.save(ChatMessages.copyOf(mes, x => {
                                            x.likes=[memoizedUserId]
                                        }))
                                        return;
                                    }
                                    if (mes.likes && mes.likes.includes(memoizedUserId)) {
                                        await DataStore.save(ChatMessages.copyOf(mes, x => {
                                            x.likes=mes.likes?.filter(x => x !== memoizedUserId)
                                        }))
                                    } else {
                                        let newLikes = [...mes.likes, memoizedUserId]
                                        await DataStore.save(ChatMessages.copyOf(mes, x => {
                                            x.likes=newLikes
                                        }))
                                    }
                                    
                                }}
                    />
                    </View>
                })}
            </ScrollView>
            <View includeBackground style={[{paddingBottom: keyboardPresent ? padding.bottom - 8 : padding.bottom}, tw`pt-5 px-6 flex-row justify-between items-center`]}>
                <TextInput onSubmitEditing={onNewMessagePress} value={newMessage} onChangeText={setNewMessage} style={tw`px-3 rounded-t-2xl rounded-l-2xl py-4 w-10/12 bg-gray-${dm ? '800' : '300'} text-${dm ? 'white' : 'black'}`} placeholder='Send a message...' placeholderTextColor={'gray'} multiline numberOfLines={3}  />
                <TouchableOpacity onPress={onNewMessagePress} style={tw`items-center justify-center p-3 bg-gray-${dm ? '700/20' : '300'} rounded-full`}>
                    <ExpoIcon name='navigation' iconName='feather' size={20} color='gray' />
                </TouchableOpacity>
            </View>
        </View>
        </KeyboardAvoidingView>
    )
}


const ChatBubble = (props: { isUsers: boolean; userId: string; message: ChatMessages; userInfo: { name: string | null; username: string; pfp: string }; onDoubleTap?: (message: ChatMessages) => void }) => {
    const { userInfo, message, isUsers } = props;
    const dm = useColorScheme() === 'dark'
    let color = 'gray-' + (dm ? '700/40' : '300/40')
    if (isUsers) {
        color = 'red-' + (dm ? '700' : '300')
    }
    const userhasLiked = message.likes && message.likes.includes(props.userId)
    const onDoubleTap = Gesture.Tap().numberOfTaps(2).runOnJS(true).onStart(async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        props.onDoubleTap && props.onDoubleTap(message)
    })
    const navigator = useNavigation()
    if (!userInfo) return <View key={message.id} />
    return <View key={message.id}>
        <GestureDetector gesture={onDoubleTap}>
        <View includeBackground style={tw`max-w-9/12 my-2 items-end ${isUsers ? 'flex-row-reverse self-end' : 'flex-row'}`}>
            <TouchableOpacity onPress={() => {
                //@ts-ignore
                navigator.navigate('Profile', {id: message.from})
            }}>
            <Image source={{ uri: userInfo.pfp }} style={tw`h-10 w-10 rounded-full m${isUsers ? 'l' : 'r'}-2`} />
            </TouchableOpacity>
            <View style={tw`bg-transparent`}>
                <View style={tw`p-3 flex rounded-${isUsers ? 'l' : 'r'}-2xl bg-${color} rounded-t-2xl`}>
                    <Text>{message.description}</Text>
                </View>
                <View style={tw`${isUsers ? 'flex-row-reverse self-end' : 'flex-row'} items-center mt-2`}>
                <Text style={tw`text-xs ${isUsers ? 'text-right ml-6' : 'mr-6'}`} weight='semibold'>{userInfo.name || ('@' + userInfo.username)}</Text>
                {(message.likes && message.likes.length > 0) && <View style={tw`flex-row items-center`}>
                        <ExpoIcon name={userhasLiked ? 'heart' : 'heart-outline'} iconName='ion' size={20} color={userhasLiked ? 'red' : 'gray'} />
                        <Text style={tw`text-xs text-gray-500 mx-1`}>{message.likes.length}</Text>
                    </View>}
                </View>
            </View>
        </View>
        </GestureDetector>
    </View>
}

const MessageHeader = (props: { names: string[]; onPress?: () => void; }) => {
    const navigator = useNavigation()
    const namesJoined = props.names.join(', ')
    const padding = useSafeAreaInsets()
    return <View style={[tw`flex-row items-center justify-between px-6`, { paddingTop: padding.top + 5 }]}>
        {/* @ts-ignore */}
        <TouchableOpacity style={tw`p-3`} onPress={() => navigator.pop()}>
            <ExpoIcon name='chevron-left' iconName='feather' size={25} color='gray' />
        </TouchableOpacity>
        <Text weight='semibold'>{namesJoined.substring(0, 20)}{namesJoined.length > 19 && "..."}</Text>
        <TouchableOpacity style={tw`p-3`} onPress={() => {
            props.onPress && props.onPress()
        }}>
            <ExpoIcon name='more-horizontal' iconName='feather' size={25} color='gray' />
        </TouchableOpacity>
    </View>
}