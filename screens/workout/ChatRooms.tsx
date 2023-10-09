import { View, Text } from '../../components/base/Themed'
import React, { useState } from 'react'
import { ChatMessages, ChatRoom, User } from '../../aws/models'
import { DataStore, Storage } from 'aws-amplify'
import { useCommonAWSIds } from '../../hooks/useCommonContext'
import { defaultImage, isStorageUri } from '../../data'


const useChatRooms = () => {
    interface ChatRoomDisplay extends ChatRoom {
        lastMessage: string;
        lastMessageUsername: string;
        lastMessageName: string;
        lastMessageUserImg: string;
    }
    const {userId} = useCommonAWSIds()
    const [rooms, setRooms] = useState<ChatRoomDisplay[]>([])
    React.useEffect(() => {
        const subscription = DataStore.observeQuery(ChatRoom, room => room.users.contains(userId), {sort: x=> x.createdAt('DESCENDING')}).subscribe(async ss => {
            const {items} = ss;
            let roomsWithMedia: (ChatRoomDisplay | null)[] = await Promise.all(items.map(async x => {
                let lastMessage = await DataStore.query(ChatMessages, msg => msg.chatroomID.eq(x.id), {sort: msg => msg.createdAt('DESCENDING'), limit: 1})
                let msg = lastMessage?.[0]
                if (!msg) return null;
                let user = await DataStore.query(User, msg.from)
                if (!user) return null;
                let pic = user.picture || defaultImage
                if (isStorageUri(pic)) pic = await Storage.get(pic)
                return {...x, lastMessage: msg.description, lastMessageUsername: user.username, lastMessageName: user.name || '', lastMessageUserImg: pic}
            }))
            //@ts-ignore
            setRooms(roomsWithMedia)
        })

    }, [])
    return {rooms}
}

export default function ChatRooms() {
  return (
    <View>
      <Text>ChatRooms</Text>
    </View>
  )
}