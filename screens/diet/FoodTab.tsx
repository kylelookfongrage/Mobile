import { TouchableOpacity, ScrollView, Image, TextInput, ActivityIndicator, RefreshControl } from 'react-native'
import React, { useState } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, SafeAreaView, View } from '../../components/base/Themed';
import tw from 'twrnc'
import { FloatingActionButton } from '../../components/base/FAB';
import { useNavigation } from '@react-navigation/native';
import { ExpoIcon, Icon } from '../../components/base/ExpoIcon';
import useColorScheme from '../../hooks/useColorScheme';
import { defaultImage, getMatchingNavigationScreen, isStorageUri, substringForLists, titleCase } from '../../data';
import { getCommonScreens } from '../../components/screens/GetCommonScreens';
import GenerateMeal from './GenerateMeal';
import SearchBar from '../../components/inputs/SearchBar';
import Spacer from '../../components/base/Spacer';
import { supabase } from '../../supabase';
import SupabaseImage from '../../components/base/SupabaseImage';
import { XStack } from 'tamagui';
import { _tokens } from '../../tamagui.config';
import TopBar from '../../components/base/TopBar';
import Tag from '../../components/base/Tag';



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

const searchOptions = [
    {'All': 'null'},
    // {'Users': 'null' },
    {'Plans' : 'ListPlan'},
    {'Meals': 'ListMeals'}, 
    {'Workouts': 'ListWorkout'}, 
    {'Food': 'ListFood'}, 
    {'Exercises': 'ListExercise'},
] as const

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
    let [results, setResults] = useState<ISearchResult[]>([])
    let [loading, setLoading] = useState<boolean>(false)
    const search = async (keyword: string) => {
        setLoading(true)
        console.log(keyword)
        const { data, error } = await supabase.rpc('fn_search', { keyword })
        if (error || !data) return;
        setLoading(false)
        setResults(data)
    }
    let dm = useColorScheme() === 'dark'


    //@ts-ignore
    return <SafeAreaView style={[tw``, { flex: 1 }]} edges={['top']} includeBackground>
        <Spacer />
        <TopBar iconLeft='Search' title='Search' />
        <Spacer />
        <View style={tw`px-2`}><SearchBar full onSearch={search} /></View>
        <Spacer sm />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{minHeight: 50, maxHeight: 50, ...tw`px-2`}}>
        {searchOptions.map(obj => {
            let key = Object.keys(obj)[0]
            let screen = getMatchingNavigationScreen(Object.values(obj)[0], navigator)
            return <TouchableOpacity key={key} style={tw`mr-2`} disabled={screen === null} onPress={() => navigator.navigate(screen)}>
                <Tag type={key==='All' ? 'primary' : 'outline'} color={key === 'All' ? 'primary900' : (dm ? "white" : 'dark1')}>{key}</Tag>
            </TouchableOpacity>
        })}
        </ScrollView>
        
        
        {loading && <ActivityIndicator style={{alignSelf: 'stretch', paddingTop: 30}} />}
        <ScrollView contentContainerStyle={[tw`px-1`]} showsVerticalScrollIndicator={false}>
            {(loading ? [] : results).map((x, i) => {
                return <TouchableOpacity key={`Search Result ${x.identifier} - ${i}`} onPress={() => {
                    let screenName = 'FoodDetail'
                    let id = x.identifier
                    if (x.type === 'EXERCISE') screenName='ExerciseDetail'
                    if (x.type === 'MEAL') screenName='MealDetail'
                    if (x.type === 'WORKOUT') screenName='WorkoutDetail'
                    if (x.type === 'PLAN') screenName='FitnessPlan'
                    if (x.type === 'USER') {
                        screenName='User'
                        id=x.user_id
                    }
                    let s = getMatchingNavigationScreen(screenName, navigator)
                    navigator.navigate(s, {id, src:'backend'})
                }}>
                    <View includeBackground style={tw`flex-row items-center justify-between p-2 my-1 rounded-xl`}>
                        <View style={tw`flex-row items-center`}>
                            <SupabaseImage style='h-13 w-13 mr-2 rounded-lg' uri={x.image || defaultImage} />
                            <View>
                                <Text lg weight='bold'>{substringForLists(x.name, 27)}</Text>
                                <Text sm style={tw`text-gray-500`} weight='semibold'>@{substringForLists(x.username, 40)}</Text>
                            </View>
                        </View>
                        <Text sm style={tw`text-gray-500`}>{titleCase(x.type)}</Text>
                    </View>
                </TouchableOpacity>
            })}
        </ScrollView>
        {/* <FloatingActionButton options={[
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
            {
                name: 'New Fitness Plan', icon: () => (<Text style={{ fontSize: 15 }}>🤸‍♂️</Text>), onPress: () => {
                    //@ts-ignore
                    navigator.navigate('FTFitnessPlan', { id: null, editable: true })
                }
            },
        ]} initialIcon={'plus'} bgColor={_tokens.primary900} openIcon={() => {
            return <ExpoIcon name='close' iconName='ion' color='white' size={23} />
        }} /> */}
    </SafeAreaView>
}


