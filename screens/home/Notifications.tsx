import { ScrollView, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Text } from '../../components/Themed'
import { ExpoIcon } from '../../components/ExpoIcon'
import tw from 'twrnc'
import { useNavigation } from '@react-navigation/native'
import useColorScheme from '../../hooks/useColorScheme'
import { BackButton } from '../../components/BackButton'


interface NotificationOptions {
    id: string;
    emoji: string;
    title: string;
    read: boolean;
    navigationUrl: string;
    navigationPayload: any;
}

const exampleNotifications: NotificationOptions[] = [
    {id: '1', title: 'Kyle has just posted a new workout!', emoji: '🏋️‍♀️', read: false, navigationUrl: 'WorkoutDetails', navigationPayload: {id: '1'}},
    {id: '2', title: 'Kyle has just posted a new workout!', emoji: '🏋️‍♀️', read: true, navigationUrl: 'WorkoutDetails', navigationPayload: {id: '1'}},
    {id: '3', title: 'Kyle has just posted a new workout!', emoji: '🏋️‍♀️', read: true, navigationUrl: 'WorkoutDetails', navigationPayload: {id: '1'}},
    {id: '4', title: 'Kyle has just posted a new workout! and this notification has a really long name', emoji: '🏋️‍♀️', read: false, navigationUrl: 'WorkoutDetails', navigationPayload: {id: '1'}}
]


export default function Notifications() {
    const navigator = useNavigation()
    const [notifications, setNotifications] = React.useState<NotificationOptions[]>([])
    React.useEffect(() => {
        setNotifications(exampleNotifications)
    }, [])
    const dm = useColorScheme() === 'dark'
  return (
    <View  style={{flex: 1}}>
        <BackButton name='Notifications' />
      <ScrollView contentContainerStyle={[{flex: 1}, tw`mt-5`]}>
        {notifications.map((n, i) => {
            let bg = `${dm ? 'gray-700' : 'gray-300'}`
            if (n.read) bg += '/50'
            return <TouchableOpacity 
            //@ts-ignore
            onPress={() => navigator.navigate(n.navigationUrl, n.navigationPayload)}
            key={n.id} 
            style={tw`p-4 m-2 bg-${bg} rounded-lg flex-row items-center justify-between`}>
                <View style={tw`flex-row items-center max-w-9/12`}>
                <View style={tw`rounded-xl mr-2 p-2`}>
                    <Text style={tw`text-lg`}>{n.emoji}</Text>
                </View>
                <Text weight={n.read ? 'regular' : 'bold'}>{n.title}</Text>
                </View>
                <ExpoIcon name='chevron-right' iconName='feather' size={25} color={dm ? 'white' : 'black'} />
            </TouchableOpacity>
        })}
      </ScrollView>
    </View>
  )
}