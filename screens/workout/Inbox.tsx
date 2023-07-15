import { TouchableOpacity, useColorScheme, Image } from 'react-native'
import React, { useMemo, useState } from 'react'
import {View, Text} from '../../components/Themed'
import { ScrollView, Swipeable } from 'react-native-gesture-handler'
import tw from 'twrnc'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ExpoIcon } from '../../components/ExpoIcon'
import { useNavigation } from '@react-navigation/native'
import { ChatMessages, ChatRoom, User } from '../../aws/models'
import { useCommonAWSIds } from '../../hooks/useCommonContext'
import { DataStore, Storage } from 'aws-amplify'
import { defaultImage, isStorageUri } from '../../data'
import moment from 'moment'
interface UserInfo { [k: string]: { username: string; img: string; name: string | null } }


const useChatRooms = () => {
    interface ChatRoomDisplay extends ChatRoom {
        lastMessage: string;
        lastMessageUsername: string;
        lastMessageName: string;
        lastMessageUserImg: string;
    }
    const {userId} = useCommonAWSIds()
    const memoizedUserId = useMemo(() => userId, [userId])
    const [userMapping, setUserMapping] = useState<UserInfo>({})
    const [rooms, setRooms] = useState<ChatRoomDisplay[]>([])
    React.useEffect(() => {
        const subscription = DataStore.observeQuery(ChatRoom, room => room.and(r => [
            r.users.contains(memoizedUserId),
        ]), {sort: x=> x.createdAt('DESCENDING')}).subscribe(async ss => {
            const {items} = ss;
            let internalMapping: UserInfo = {...userMapping}
            //@ts-ignore
            let roomsWithMedia: (ChatRoomDisplay | null)[] = await Promise.all(items.map(async x => {
                let roomName = []
                for (var from of x.users) {
                    const info = internalMapping[from]
                    if (!info) {
                        let user = await DataStore.query(User, from)
                        if (!user) continue;
                        let pic = user?.picture || defaultImage
                        if (isStorageUri(pic)) pic = await Storage.get(pic)
                        internalMapping[from] = {name: user.name || null, username: user.username, img: pic}
                    }
                    let newInfo = internalMapping[from]
                    if (newInfo) {
                        roomName.push(newInfo.name || '@' + newInfo.username)
                    }
                }
                let lastMessage = await DataStore.query(ChatMessages, msg => msg.chatroomID.eq(x.id), {sort: msg => msg.createdAt('DESCENDING'), limit: 1})
                let msg = lastMessage?.[0]
                return {...x, lastMessage: (msg ? msg.description : 'no messages...'), lastMessageUsername: msg ? internalMapping[msg.from].username : '@rage', lastMessageName: roomName.join(', '), lastMessageUserImg:  msg ? internalMapping[msg.from].img : internalMapping[x.users[0]].img}
            }))
            //@ts-ignore
            setRooms(roomsWithMedia)
        })
        return () => {subscription.unsubscribe()}
    }, [memoizedUserId])
    return {rooms}
}

export default function Inbox() {
    const dm = useColorScheme() === 'dark'
    const {rooms} = useChatRooms() 
    const navigator = useNavigation()
  return (
    <View includeBackground style={{flex: 1}}>
      <InboxHeader />
      <ScrollView contentContainerStyle={tw`px-6`}>
        {rooms.map((x, i) => {
            if (!x) return <View key={'nouser-' + `${i}`} />
            return  <Swipeable key={x.id} renderRightActions={() => {
                return <TouchableOpacity style={tw`ml-5 p-3 rounded-xl items-center justify-center bg-red-${dm ? '600' : '500'}`}>
                    <ExpoIcon name='log-out' iconName='feather' size={20} color='white' />
                    <Text style={tw`text-white text-center text-xs`}>Leave</Text>
                </TouchableOpacity>
            }}>
                <View includeBackground>
                <TouchableOpacity onPress={() => navigator.navigate('Message', {id: x.id})} style={tw`flex-row items-center justify-between w-12/12 py-3 border-b border-gray-${dm ? '600' : '300'}`}>
                <View style={tw`flex-row items-center`}>
                    <Image source={{uri: x.lastMessageUserImg}} style={tw`h-10 w-10 rounded-full mr-2`} />
                    <View style={tw`max-w-10/12`}>
                        <Text weight='semibold'>{x.lastMessageName || x.lastMessageUsername}</Text>
                        <Text style={tw`text-gray-500`}>{x.lastMessage?.substring(0,25) || ''}{x.lastMessage?.length > 25 && '...'}</Text>
                    </View>
                </View>
                <Text style={tw`max-w-2/12 text-xs text-gray-500 text-center`}>{moment(x.createdAt).fromNow(true)}</Text>
            </TouchableOpacity>
                </View>

            </Swipeable>       
        })}
      </ScrollView>
    </View>
  )
}

const InboxHeader = () => {
    const navigator = useNavigation()
    const padding = useSafeAreaInsets()
    return <View includeBackground style={[{paddingTop: padding.top + 5}, tw`flex-row items-center justify-between px-6 pb-6`]}>
        {/* @ts-ignore */}
        <TouchableOpacity onPress={() => navigator.pop()}>
            <ExpoIcon name='chevron-left' iconName='feather' size={25} color='gray' />
        </TouchableOpacity>
        <Text weight='semibold' style={tw`text-center`}>Inbox</Text>
        <TouchableOpacity onPress={() => {
            navigator.navigate('NewChat')
        }}>
            <ExpoIcon name='edit' iconName='feather' size={25} color='gray' />
        </TouchableOpacity>
    </View>
}