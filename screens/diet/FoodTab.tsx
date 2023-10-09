import { TouchableOpacity, ScrollView, Image, TextInput, ActivityIndicator, RefreshControl } from 'react-native'
import React, { useState } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, SafeAreaView, View } from '../../components/base/Themed';
import tw from 'twrnc'
import { FloatingActionButton } from '../../components/base/FAB';
import { useNavigation } from '@react-navigation/native';
import { ExpoIcon } from '../../components/base/ExpoIcon';
import useColorScheme from '../../hooks/useColorScheme';
import { defaultImage, getMatchingNavigationScreen, isStorageUri, substringForLists, titleCase } from '../../data';
import { DataStore, Storage } from 'aws-amplify';
import { Exercise, Follower, FoodProgress, Ingredient, Meal, User, Workout } from '../../aws/models';
import { MediaType } from '../../types/Media';
import { useDebounce } from '../../hooks/useDebounce';
import { useCommonAWSIds } from '../../hooks/useCommonContext';
import { getCommonScreens } from '../../components/screens/GetCommonScreens';
import GenerateMeal from './GenerateMeal';
import AllergenAlert from '../../components/features/AllergenAlert';
import SearchBar from '../../components/inputs/SearchBar';
import Spacer from '../../components/base/Spacer';
import { supabase } from '../../supabase';
import SupabaseImage from '../../components/base/SupabaseImage';



interface FoodTabProps {
    FoodAndMeals: undefined;
    FTListFood: { progressId?: string, mealId?: string }
    FTListMeals: { progressId?: string };
    FTMealDetail: { id: string, editable: boolean };
    FTFoodDetail: {
        id: string;
        editable: boolean;
        img: string;
        progressId: string;
        name: string;
        mealId: string;
        src: 'new' | 'api' | 'backend'
        category: string;
        measures: any;
        edamamId: string;
        foodContentsLabel: string;
    }
    FTExerciseDetail: { id: string, workoutId: string, editable: boolean; };
    FTWorkoutDetail: { id: string; };
    FTUser: { id: string; };
    FTSubscribees: { to: string; from: string; };
    FTListWorkout: undefined;
    FTListExercise: { workoutId?: string; editable: boolean; }
    FTEquiptmentSearch: { exerciseId?: string; };
    GenerateMeal: undefined
}

//@ts-ignore
const Stack = createNativeStackNavigator<FoodTabProps>();
export default function FoodTab() {
    return (
        <Stack.Navigator initialRouteName='FoodAndMeals'>
            <Stack.Screen name='FoodAndMeals' component={FoodAndMeals} options={{ headerShown: false }} />
            <Stack.Screen name="GenerateMeal" component={GenerateMeal} options={{ headerShown: false }} />
            {getCommonScreens('FT', Stack)}
        </Stack.Navigator>
    )
}

const searchOptions = ['Profiles', 'Meals', 'Food', 'Workouts', 'Exercises'] as const

interface ISearchResult {
    author: string;
    created_at: string;
    identifier: string;
    image: string;
    name: string;
    pfp: string;
    search_by: string;
    type: 'WORKOUT' | 'MEAL' | 'EXERCISE' | 'FOOD' | 'PLAN' | 'USER';
    user_id: string;
    username: string;
}

export const FoodAndMeals = () => {
    const navigator = useNavigation()
    const dm = useColorScheme() === 'dark'
    const { userId } = useCommonAWSIds()
    let [results, setResults] = useState<ISearchResult[]>([])
    const [selectedOptions, setSelectedOptions] = React.useState<typeof searchOptions[number][]>([])
    const search = async (keyword: string) => {
        console.log(keyword)
        const { data, error } = await supabase.rpc('fn_search', { keyword })
        if (error || !data) return;
        setResults(data)

    }


    //@ts-ignore
    return <SafeAreaView style={[tw`px-3`, { flex: 1 }]} edges={['top']} includeBackground>
        <Spacer />
        <Text h2>Search</Text>
        <Spacer />
        <SearchBar full onSearch={search} />
        <Spacer />
        <ScrollView style={{ minHeight: 35, maxHeight: 35 }} horizontal showsHorizontalScrollIndicator={false}>
            {searchOptions.map(x => {
                const selected = selectedOptions.includes(x)
                return <TouchableOpacity onPress={() => {
                    if (selected) {
                        setSelectedOptions([...selectedOptions].filter(z => z !== x))
                    }
                    else {
                        setSelectedOptions([...selectedOptions, x])
                    }
                }} key={`Search Option` + x} style={{ ...tw`py-2 px-3 mx-1 ${selected ? 'rounded-full bg-red-600 text-white' : ''}` }}>
                    <Text>{x}</Text>
                </TouchableOpacity>
            })}
        </ScrollView>
        <Spacer divider/>
        <ScrollView contentContainerStyle={[tw``]} showsVerticalScrollIndicator={false}>
            {results.map((x, i) => {
                return <TouchableOpacity key={`Search Result ${x.identifier} - ${i}`} onPress={() => {
                    let screenName = 'FoodDetail'
                    let id = x.identifier
                    if (x.type === 'EXERCISE') screenName='ExerciseDetail'
                    if (x.type === 'MEAL') screenName='MealDetail'
                    if (x.type === 'WORKOUT') screenName='WorkoutDetail'
                    if (x.type === 'USER') {
                        screenName='User'
                        id=x.user_id
                    }
                    let s = getMatchingNavigationScreen(screenName, navigator)
                    navigator.navigate(s, {id, src:'backend'})
                }}>
                    <View card style={tw`flex-row items-center justify-between p-2 my-1 rounded-xl`}>
                        <View style={tw`flex-row items-center`}>
                            <SupabaseImage style='h-13 w-13 mr-2 rounded-lg' uri={x.image || defaultImage} />
                            <View>
                                <Text weight='semibold'>{x.name}</Text>
                                <Text xs style={tw`text-red-500`}>@{x.username}</Text>
                            </View>
                        </View>
                        <Text xs style={tw`text-gray-500`}>{titleCase(x.type)} - {x.identifier}</Text>
                    </View>
                </TouchableOpacity>
            })}
        </ScrollView>
        <FloatingActionButton options={[
            {
                name: 'New Food', icon: () => (<Text style={{ fontSize: 15 }}>🍎</Text>), onPress: () => {
                    //@ts-ignore
                    navigator.navigate('FTFoodDetail', { id: null, editable: true, src: 'new' })
                }
            },
            {
                name: 'New Meal', icon: () => (<Text style={{ fontSize: 15 }}>🍽</Text>), onPress: () => {
                    //@ts-ignore
                    navigator.navigate('FTMealDetail', { id: null, editable: true })
                }
            },
            {
                name: 'Generate Meal', icon: () => (<Text style={{ fontSize: 15 }}>🪄</Text>), onPress: () => {
                    //@ts-ignore
                    navigator.navigate('GenerateMeal')
                }
            },
            {
                name: 'New Exercise', icon: () => (<Text style={{ fontSize: 15 }}>👟</Text>), onPress: () => {
                    //@ts-ignore
                    navigator.navigate('FTExerciseDetail', { id: null, editable: true })
                }
            },
            {
                name: 'New Workout', icon: () => (<Text style={{ fontSize: 15 }}>🏋️‍♀️</Text>), onPress: () => {
                    //@ts-ignore
                    navigator.navigate('FTWorkoutDetail', { id: null, editable: true })
                }
            },
        ]} initialIcon={'plus'} bgColor='teal-500' openIcon={() => {
            return <ExpoIcon name='close' iconName='ion' color='black' size={23} />
        }} />
    </SafeAreaView>
}


