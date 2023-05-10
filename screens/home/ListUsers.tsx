import { View, useColorScheme, TextInput, TouchableOpacity, FlatList, Image } from 'react-native'
import React from 'react'
import { BackButton } from '../../components/BackButton'
import { useNavigation } from '@react-navigation/native';
import { useDebounce } from '../../hooks/useDebounce';
import { User } from '../../aws/models';
import tw from 'twrnc'
import { ExpoIcon } from '../../components/ExpoIcon';
import { Text } from '../../components/Themed';
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
    const searchOptions = ['All', 'Trainers', 'Food Profs.'] as const
    const [selectedOption, setSelectedOption] = React.useState<typeof searchOptions[number]>(searchOptions[0])
    const [results, setResults] = React.useState<User[]>([])
    const [displaySearchState, setDisplaySearchState] = React.useState('Search for food!')
    React.useEffect(() => {
        if (props.foodProfessionals) {
            setSelectedOption('Food Profs.')
        } else if (props.trainers) {
            setSelectedOption('Trainers')
        }
    }, [])

    const fetchUsers = async () => {
        const usersToFetch = await DataStore.query(User, x => x.and(u => [
            u.picture.ne(''), debouncedSearchTerm ? u.username.contains(debouncedSearchTerm.toLowerCase()) : u.username.ne(''),
            selectedOption === 'All' ? u.username.ne('') : (selectedOption === 'Trainers' ? u.personalTrainer.eq(true) : u.foodProfessional.eq(true)) 
        ]), {sort: x => x.Followers("DESCENDING"), limit: 20})
        const usersWithPictures = await Promise.all(usersToFetch.map(async user => {
            if (user.picture && isStorageUri(user.picture)) {
                return {...user, picture: await Storage.get(user.picture)}
            } else if (user.picture) {
                return user 
            }else {
                return {...user, picture: defaultImage}
            }
        }))
        setResults(usersWithPictures)
    }

    React.useEffect(() => {
        setResults([])
        setDisplaySearchState('Searching')
        fetchUsers()
    }, [debouncedSearchTerm, selectedOption])
    
    return (
        <View style={{flex: 1}}>
            <BackButton name='Users' />
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

                <View style={tw`flex-row justify-between py-4 px-5`}>
                    {searchOptions.map((o, i) => {
                        const selected = selectedOption === o
                        return <TouchableOpacity
                            key={`Search option ${o} at idx ${i}`}
                            style={tw`items-center py-2 px-5 ${selected ? 'border-b border-' + color : ''}`}
                            onPress={() => setSelectedOption(o)}>
                            <Text
                                weight={selected ? 'semibold' : 'regular'}>{o}</Text>
                        </TouchableOpacity>
                    })}
                </View>

                {results.length === 0 && <Text>{displaySearchState}</Text>}
                {results.length > 0 && <FlatList showsVerticalScrollIndicator={false} contentContainerStyle={tw`pb-90`} data={results} keyExtractor={x => x.id} renderItem={({item}) => {
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