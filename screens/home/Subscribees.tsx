import { Image, ScrollView, TextInput, TouchableOpacity, useColorScheme } from 'react-native'
import React from 'react'
import { Text, View } from '../../components/base/Themed'
import { useNavigation } from '@react-navigation/native'
import { User } from '../../aws/models'
import tw from 'twrnc'
import { DataStore, Storage } from 'aws-amplify'
import { defaultImage, getMatchingNavigationScreen, isStorageUri } from '../../data'
import { ExpoIcon } from '../../components/base/ExpoIcon'
import { BackButton } from '../../components/base/BackButton'
import { useDebounce } from '../../hooks/useDebounce'
import { TSubscriber, UserQueries } from '../../types/UserDao'
import SupabaseImage from '../../components/base/SupabaseImage'
import SearchBar from '../../components/inputs/SearchBar'
import Spacer from '../../components/base/Spacer'

interface SubscribeesProps{
    to: string;
    from: string;
}

export default function Subscribees(props: SubscribeesProps) {
    const navigator = useNavigation()
    const {to, from} = props;
    const [users, setUsers] = React.useState<TSubscriber[]>([])
    let dao = UserQueries()
    const fetchSubscribees = async (keyword: string) => {
        let res = await dao.fetch_following_users(props.to ? props.to : props.from, keyword, props.to ? true : false)
        if (res) {
            setUsers(res)
        }
    }
    const dm = useColorScheme() === 'dark'
    return (
    <View style={[tw``, {flex: 1}]} includeBackground>
        <BackButton name={props.to ? 'Followers' : "Following"} />
        <Spacer />
       <SearchBar onSearch={fetchSubscribees} />
        {users.length === 0 && <Text style={tw`text-center mt-9`}>There are no subscribers</Text>}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={tw`px-4 mt-1 pb-40`}>
        {users.map((item) => {
            if (!item.user) return <View key={item.id}/>
            let usernameText = item.user.username + ' '
            return <TouchableOpacity key={item.id} style={tw`flex-row items-center justify-between py-4`} onPress={() => {
                const screen = getMatchingNavigationScreen('User', navigator)
                //@ts-ignore
                navigator.push(screen, {id: props.to ? item.subscribed_from : item.user_id})
            }}>
                <View style={tw`flex-row items-center`}>
                <SupabaseImage style={tw`h-10 w-10 rounded-full mr-2`} uri={item.user.pfp || defaultImage} />
                <View>
                    <Text weight='semibold'>{item.user.name}</Text>
                <Text style={tw`text-xs text-gray-500`}>@{usernameText}</Text>
                </View>
                </View>
                <ExpoIcon name='chevron-right' iconName='feather' size={20} color='gray' />
            </TouchableOpacity>
        })}
        <View style={tw`h-10`} />
      </ScrollView>
    </View>
  )
}