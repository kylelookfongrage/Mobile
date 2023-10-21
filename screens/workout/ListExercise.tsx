import { ScrollView, TextInput, TouchableOpacity, Image, useColorScheme } from 'react-native'
import React from 'react'
import { Text, View } from '../../components/base/Themed'
import { useDebounce } from '../../hooks/useDebounce'
import tw from 'twrnc'
import { ExpoIcon } from '../../components/base/ExpoIcon'
import { useNavigation } from '@react-navigation/native'
import { VideoThumbail } from '../../components/base/VideoThumbnail'
import { defaultImage, getMatchingNavigationScreen, isStorageUri } from '../../data'
import { DataStore, Predicates, Storage } from 'aws-amplify'
import { Exercise, LazyExercise, User } from '../../aws/models'
import { MediaType } from '../../types/Media'
import { BackButton } from '../../components/base/BackButton'
import { useCommonAWSIds } from '../../hooks/useCommonContext'
import SearchBar from '../../components/inputs/SearchBar'
import { ExerciseDao } from '../../types/ExerciseDao'
import { Tables } from '../../supabase/dao'
import SupabaseImage from '../../components/base/SupabaseImage'
import Spacer from '../../components/base/Spacer'
import useAsync from '../../hooks/useAsync'

export interface ListExerciseSearchResultsType {
    name: string;
    author: string;
    id: string;
    img: string | null;
    favorited: boolean;

}

interface ListExerciseProps {
    workoutId?: string;
    editable?: boolean;
    userId?: string;
}
export default function ListExercise(props: ListExerciseProps) {
    const { workoutId, editable } = props;
    const { profile } = useCommonAWSIds()
    const dm = useColorScheme() === 'dark'
    const color = dm ? 'white' : 'black'
    const navigator = useNavigation()
    const [searchKey, setSearchKey] = React.useState<string>()
    const searchOptions = ['All Exercises', 'My Exercises', 'Favorites'] as const
    const [selectedOption, setSelectedOption] = React.useState<typeof searchOptions[number]>(searchOptions[0])
    const [results, setResults] = React.useState<Tables['exercise']['Row'][]>([])
    let dao = ExerciseDao()

    const fetchExerciseResults = async (keyword: string) => {
        let res = await dao.search({keyword, selectString: `
            *, author: user_id(username)
        `, belongsTo: selectedOption === 'My Exercises' ? profile?.id : props.userId, favorited: selectedOption ==='Favorites', user_id: profile?.id})
        if (!res) return;
        setResults(res)
    }

    useAsync(async () => {
        await fetchExerciseResults(searchKey || "")
    }, [selectedOption, searchKey])

    React.useEffect(() => { }, [selectedOption])
    return (
        <View style={{ flex: 1 }} includeBackground>
            <BackButton name='Exercises' />
            <SearchBar onSearch={x => setSearchKey(x)} />
            <Spacer />
            <View style={tw`flex-row justify-around`}>
                    {searchOptions.map((o, i) => {
                        if (props.userId && o === 'My Exercises') return;
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
                <Spacer />
            <ScrollView
                keyboardDismissMode='interactive'
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[tw`px-3 pb-20`]}>
                {results.length === 0 && <View style={tw`w-12/12 justify-center items-center mt-9`}><Text>No results to display</Text></View>}
                {results.map((r, idx) => {
                    return <View card key={`search result at index ${idx}`} style={{...tw`mb-2 rounded`}}>
                        <TouchableOpacity
                        onPress={() => {
                            const screen = getMatchingNavigationScreen('ExerciseDetail', navigator)
                            if (screen !== null) {
                                //@ts-ignore
                                navigator.navigate(screen, { workoutId: props.workoutId, id: r.id })
                            }
                        }}
                        style={[tw`flex-row items-center justify-between rounded-xl py-2 px-2 mx-2`]}>
                        <View style={tw`flex-row items-center max-w-8/12`}>
                            <SupabaseImage uri={r.preview || defaultImage} style={`h-12 w-12 rounded mr-2`} />
                            <View>
                                <Text style={tw``} weight='semibold'>{r.name}</Text>
                                <Text style={tw`text-red-500 text-xs`}>@{r.author?.username || 'rage'}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                    </View>
                })}
            </ScrollView>
        </View>

    )
}