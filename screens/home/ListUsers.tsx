import { useColorScheme, TextInput, TouchableOpacity, FlatList, Image } from 'react-native'
import React from 'react'
import { BackButton } from '../../components/BackButton'
import { useNavigation } from '@react-navigation/native';
import { useDebounce } from '../../hooks/useDebounce';
import { User } from '../../aws/models';
import tw from 'twrnc'
import { ExpoIcon } from '../../components/ExpoIcon';
import { Text, View } from '../../components/Themed';
import { DataStore, Storage } from 'aws-amplify';
import { defaultImage, getMatchingNavigationScreen, isStorageUri } from '../../data';

interface ListUsersProps {
    trainers?: boolean;
    foodProfessionals?: boolean;
}
export default function ListUsers(props: ListUsersProps) {
    const dm = useColorScheme() === 'dark'
    const navigator = useNavigation()
    const color = dm ? 'white' : 'black'
    const [searchKey, setSearchKey] = React.useState<string>()
    const debouncedSearchTerm = useDebounce(searchKey, 500);
    const [results, setResults] = React.useState<User[]>([])
    const [displaySearchState, setDisplaySearchState] = React.useState('Search for food!')

    const fetchUsers = async () => {
        const usersToFetch = await DataStore.query(User, x => x.and(u => [
            u.picture.ne(''), debouncedSearchTerm ? u.username.contains(debouncedSearchTerm.toLowerCase()) : u.username.ne('') 
        ]),  { limit: 40 })
        const usersWithPictures = await Promise.all(usersToFetch.map(async user => {
            let img = user.picture || defaultImage
            return {...user, picture: isStorageUri(img) ? await Storage.get(img) : img}
            
        }))
        setResults(usersWithPictures)
    }   

    React.useEffect(() => {
        setResults([])
        setDisplaySearchState('Searching')
        fetchUsers()
    }, [debouncedSearchTerm])

    React.useEffect(() => {
        if (results.length === 0) {
            setDisplaySearchState('No users found')
        }
    }, [results])
    
    return (
        <View style={{flex: 1}} includeBackground>
            <BackButton name='Users' />
            <View style={tw`px-4`}>
                <View style={tw`flex flex-row items-center py-3 px-5 mt-6 w-12/12 bg-${dm ? 'gray-600' : 'gray-300'} rounded-xl`}>
                    <ExpoIcon name='search' iconName='feather' color='gray' size={25} />
                    <TextInput
                        placeholder='username'
                        placeholderTextColor={'gray'}
                        style={tw`w-9/12 py-2 px-3 text-${dm ? 'white' : 'black'}`}
                        value={searchKey} onChangeText={setSearchKey}
                    />
                </View>

                {results.length === 0 && <Text style={tw`text-center my-9`}>{displaySearchState}</Text>}
                {results.length > 0 && <FlatList showsVerticalScrollIndicator={false} contentContainerStyle={tw`pb-90 mt-6`} data={results} keyExtractor={x => x.id} renderItem={({item}) => {
                    let usernameText = item.username + ' '
                    if (item.personalTrainer) {
                        usernameText +=  '🏋️‍♀️'
                    } 
                    if (item.foodProfessional) {
                        usernameText +=  '🍎'
                    }
                    return <TouchableOpacity style={tw`pb-9 flex-row items-center justify-between`} onPress={() => {
                        const screen = getMatchingNavigationScreen('User', navigator)
                        //@ts-ignore
                        navigator.navigate(screen, {id: item.id})
                    }}>
                        <View style={tw`flex-row items-center`}>
                            {/* @ts-ignore */}
                            <Image source={{uri: item.picture}} style={tw`w-15 h-15 rounded-full mr-4`} />
                            <Text>{usernameText}</Text>
                        </View>
                        <ExpoIcon color='gray' iconName='feather' name='chevron-right' size={20} />
                    </TouchableOpacity>
                }} />}
            </View>
        </View>
    )
}