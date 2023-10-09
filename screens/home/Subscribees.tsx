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

interface SubscribeesProps{
    to: string;
    from: string;
}

export default function Subscribees(props: SubscribeesProps) {
    const navigator = useNavigation()
    const {to, from} = props;
    const [users, setUsers] = React.useState<User[]>([])
    const [searchKey, setSearchKey] = React.useState<string>()
    const debouncedSearchTerm = useDebounce(searchKey, 500);
    
    React.useEffect(() => {
        const fetchSubscribees = async () => {
            const followersOrFollowees = await DataStore.query(User, u => u.and(x => [
                to ? x.Followers.userID.contains(to) : x.Followers.subscribedFrom.eq(from), (debouncedSearchTerm ? x.username.contains(debouncedSearchTerm.toLowerCase()) : x.username.ne(''))
            ]), {limit: 50})
            console.log(to)
            const usersWithPictures = await Promise.all(followersOrFollowees.map(async follower => {
                let img = follower.picture || defaultImage
                return {...follower, picture: isStorageUri(img) ? await Storage.get(img) : img}
            }))
            setUsers(usersWithPictures)
        }
        fetchSubscribees()
    }, [debouncedSearchTerm])
    const dm = useColorScheme() === 'dark'
    return (
    <View style={[tw``, {flex: 1}]} includeBackground>
        <BackButton />
        <View style={tw`px-4`}>
        <View style={tw`flex flex-row items-center py-3 px-5 mt-6 w-12/12 bg-${dm ? 'gray-600' : 'gray-300'} rounded-xl`}>
                    <ExpoIcon name='search' iconName='feather' color='gray' size={25} />
                    <TextInput
                        placeholder='User'
                        placeholderTextColor={'gray'}
                        style={tw`w-9/12 py-2 px-3 text-${dm ? 'white' : 'black'}`}
                        value={searchKey} onChangeText={setSearchKey}
                    />
                </View>
        </View>
        {users.length === 0 && <Text style={tw`text-center mt-9`}>There are no subscribers</Text>}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={tw`px-4 mt-6 pb-40`}>
        {users.map((item) => {
            let usernameText = item.username + ' '
            return <TouchableOpacity key={item.id} style={tw`flex-row items-center justify-between py-4`} onPress={() => {
                const screen = getMatchingNavigationScreen('User', navigator)
                //@ts-ignore
                navigator.push(screen, {id: item.id, personal: false})
            }}>
                <View style={tw`flex-row items-center`}>
                <Image style={tw`h-10 w-10 rounded-full mr-2`} source={{uri: item.picture || defaultImage}} />
                <View>
                    <Text weight='semibold'>{item.name}</Text>
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