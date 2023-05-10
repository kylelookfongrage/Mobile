import { Image, ScrollView, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Text } from '../../components/Themed'
import { useNavigation } from '@react-navigation/native'
import { Follower, User } from '../../aws/models'
import tw from 'twrnc'
import { DataStore, Storage } from 'aws-amplify'
import { defaultImage, getMatchingNavigationScreen, isStorageUri } from '../../data'
import { ExpoIcon } from '../../components/ExpoIcon'
import { BackButton } from '../../components/BackButton'

interface SubscribeesProps{
    to: string;
    from: string;
}

export default function Subscribees(props: SubscribeesProps) {
    const navigator = useNavigation()
    const {to, from} = props;
    const [users, setUsers] = React.useState<User[]>([])
    React.useEffect(() => {
        const fetchSubscribees = async () => {
            const followersOrFollowees = await DataStore.query(Follower, to ? x => x.userID.eq(to) : x => x.subscribedFrom.eq(from), {limit: 50})
            const usersFromFollowers = await DataStore.query(User, x => x.or(u => followersOrFollowees.map(fol => u.id.eq(to ? fol.subscribedFrom : fol.userID))))
            const usersWithPictures = await Promise.all(usersFromFollowers.map(async follower => {
                if (follower.picture && isStorageUri(follower.picture)) {
                    return {...follower, picture: await Storage.get(follower.picture)}
                }else {
                    return {...follower, picture: follower.picture || defaultImage}
                }
            }))
            setUsers(usersWithPictures)
        }
        fetchSubscribees()
    }, [])
    return (
    <View style={[tw``, {flex: 1}]}>
        <BackButton />
        {users.length === 0 && <Text style={tw`text-center mt-9`}>There are no subscribers</Text>}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={tw`px-4 mt-6 pb-40`}>
        {users.map((item) => {
            let usernameText = item.username + ' '
            if (item.personalTrainer) {
                usernameText +=  '🏋️‍♀️'
            } 
            if (item.foodProfessional) {
                usernameText +=  '🍎'
            }
            return <TouchableOpacity key={item.id} style={tw`flex-row items-center justify-between py-4`} onPress={() => {
                const screen = getMatchingNavigationScreen('User', navigator)
                //@ts-ignore
                navigator.push(screen, {id: item.id, personal: false})
            }}>
                <View style={tw`flex-row items-center`}>
                <Image style={tw`h-15 w-15 rounded-full`} source={{uri: item.picture || defaultImage}} />
                <Text style={tw`ml-2`}>{usernameText}</Text>
                </View>
                <ExpoIcon name='chevron-right' iconName='feather' size={20} color='gray' />
            </TouchableOpacity>
        })}
        <View style={tw`h-10`} />
      </ScrollView>
    </View>
  )
}