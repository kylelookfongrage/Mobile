import { SafeAreaView, ScrollView, TextInput, TouchableOpacity, Image, useColorScheme, View } from 'react-native'
import React from 'react'
import { Text } from '../../components/Themed'
import { useDebounce } from '../../hooks/useDebounce'
import tw from 'twrnc'
import { ExpoIcon } from '../../components/ExpoIcon'
import { useNavigation } from '@react-navigation/native'
import { VideoThumbail } from '../../components/VideoThumbnail'
import { defaultImage, getMatchingNavigationScreen, isStorageUri } from '../../data'
import { DataStore, Predicates, Storage } from 'aws-amplify'
import { Exercise, LazyExercise, User } from '../../aws/models'
import { MediaType } from '../../types/Media'
import { BackButton } from '../../components/BackButton'
import { useCommonAWSIds } from '../../hooks/useCommonContext'

export interface ListExerciseSearchResultsType {
    name: string;
    author: string;
    id: string;
    img: string | null;
    favorited: boolean;

}

interface ListExerciseProps {
    workoutId?: string;
    editable?: boolean
}
export default function ListExercise(props: ListExerciseProps) {
    const { workoutId, editable } = props;
    const { userId } = useCommonAWSIds()
    const dm = useColorScheme() === 'dark'
    const color = dm ? 'white' : 'black'
    const navigator = useNavigation()
    const [searchKey, setSearchKey] = React.useState<string>()
    const debouncedSearchTerm = useDebounce(searchKey, 500);
    const searchOptions = ['All', 'My Exercises'] as const
    const [selectedOption, setSelectedOption] = React.useState<typeof searchOptions[number]>(searchOptions[0])
    const [results, setResults] = React.useState<ListExerciseSearchResultsType[]>([])

    const fetchExerciseResults = async () => {
        const exercisesWithoutImages = await DataStore.query(Exercise, x => x.and(ex => [
            debouncedSearchTerm ? ex.title.contains(debouncedSearchTerm) : ex.title.ne(''),
            selectedOption === 'My Exercises' ? ex.userID.eq(userId) : ex.userID.ne('')
        ]))
        const exercisesWithImages: ListExerciseSearchResultsType[] = await Promise.all(exercisesWithoutImages.map(async ex => {
            const user = await DataStore.query(User, ex.userID)
            const author = user?.username || ''
            //@ts-ignore
            const media: MediaType[] = ex.media || []
            const images = media.filter(x => x.type == 'image')
            if (images.length === 0 || (images.length > 0 && !isStorageUri(images[0].uri))) {
                return { id: ex.id, name: ex.title, img: defaultImage, author, favorited: false }
            } else {
                return { id: ex.id, name: ex.title, img: await Storage.get(images[0].uri), author, favorited: false}
            }
        }))
        setResults(exercisesWithImages)
    }

    React.useEffect(() => {
        fetchExerciseResults()
    }, [debouncedSearchTerm, selectedOption])

    React.useEffect(() => { }, [selectedOption])
    return (
        <View style={{ flex: 1 }}>
            <BackButton name='Exercises' />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[tw`px-3 pb-20`]}>
                <View style={tw`flex flex-row items-center py-3 px-5 mt-6 w-12/12 bg-${dm ? 'gray-600' : 'gray-300'} rounded-xl`}>
                    <ExpoIcon name='search' iconName='feather' color='gray' size={25} />
                    <TextInput
                        placeholder='Name'
                        placeholderTextColor={dm ? 'white' : 'gray'}
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
                {results.length === 0 && <View style={tw`w-12/12 justify-center items-center mt-15`}><Text style={tw`text-xl`} weight='bold'>No results to display</Text></View>}
                {results.map((r, idx) => {
                    return <TouchableOpacity
                        onPress={() => {
                            const screen = getMatchingNavigationScreen('ExerciseDetail', navigator)
                            if (screen !== null) {
                                //@ts-ignore
                                navigator.navigate(screen, { workoutId: props.workoutId, id: r.id })
                            }
                        }}
                        key={`search result at index ${idx}`}
                        style={[tw`my-2 max-w-11/12 flex-row items-center justify-between rounded-lg py-4 px-4 mx-4 bg-${dm ? 'gray-700' : 'gray-300'}`,
                        ]}
                    >
                        <View style={tw`flex-row items-center max-w-8/12`}>
                            <Image source={{ uri: r.img || defaultImage }} style={tw`h-20 w-20 rounded mr-2`} />
                            <View>
                                <Text style={tw`text-lg`} weight='semibold'>{r.name}</Text>
                                <Text style={tw`text-${dm ? 'red-300' : 'red-700'}`}>by {r.author}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                })}
            </ScrollView>
        </View>

    )
}