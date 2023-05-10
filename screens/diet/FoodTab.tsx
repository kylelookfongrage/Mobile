import { View, ScrollView, TouchableOpacity, ImageBackground, Image, TextInput, ActivityIndicator, RefreshControl } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/Themed';
import tw from 'twrnc'
import { FloatingActionButton } from '../../components/FAB';
import { useNavigation } from '@react-navigation/native';
import { ExpoIcon } from '../../components/ExpoIcon';
import useColorScheme from '../../hooks/useColorScheme';
import { defaultImage, getMatchingNavigationScreen, isStorageUri } from '../../data';
import { DataStore, Storage } from 'aws-amplify';
import { Follower, FoodProgress, Ingredient, Meal, User } from '../../aws/models';
import { MediaType } from '../../types/Media';
import { useDebounce } from '../../hooks/useDebounce';
import { useCommonAWSIds } from '../../hooks/useCommonContext';
import { getCommonScreens } from '../../components/GetCommonScreens';
import GenerateMeal from './GenerateMeal';


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
    FTListExercise: {workoutId?: string; editable: boolean;}
    FTEquiptmentSearch: {exerciseId?: string;};
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

interface MealDisplay extends Meal {
    coverImage: string;
    username: string;
}

interface UserDisplay {
    id: string;
    username: string;
    subCount: number;
    following: boolean;
    picture: string;
}

interface FoodDisplay extends FoodProgress {
    username: string;
}

export const FoodAndMeals = () => {
    const navigator = useNavigation()
    const dm = useColorScheme() === 'dark'
    const { userId } = useCommonAWSIds()
    const [users, setUsers] = React.useState<UserDisplay[]>([])
    const [meals, setMeals] = React.useState<MealDisplay[]>([])
    const [food, setFood] = React.useState<FoodDisplay[]>([])
    const [loading, setLoading] = React.useState<boolean>(false)

    const [keyword, setKeyword] = React.useState<string>('')
    const debouncedKeyword = useDebounce(keyword, 500)
    const [refreshing, setRefreshing] = React.useState<boolean>(false)
    const fetchFoodAndMeals = async () => {
        const searchTerm = debouncedKeyword
        setLoading(true)
        const usersWithoutImages = await DataStore.query(User, u => u.and(x => [searchTerm ? x.username.contains(searchTerm.toLowerCase()) : x.username.ne(''), x.foodProfessional.eq(true)]), {
            sort: x => x.Followers('ASCENDING'),
            limit: 10
        })
        const usersWithImages: UserDisplay[] = await Promise.all(usersWithoutImages.map(async x => {
            const potentialFollowing = (await DataStore.query(Follower, f => f.and(y => [y.userID.eq(x.id), y.subscribedFrom.eq(userId)]))).length > 0
            const followers = (await x.Followers.toArray()).length
            if (x.picture && isStorageUri(x.picture)) {
                return { id: x.id, username: x.username, subCount: followers, following: potentialFollowing, picture: await Storage.get(x.picture) }
            } else {
                return { id: x.id, username: x.username, subCount: followers, following: potentialFollowing, picture: defaultImage }
            }
        }))
        setUsers(usersWithImages)
        const mealsWithoutImages = await DataStore.query(Meal, m => m.and(x => [searchTerm ? x.name.contains(searchTerm) : x.name.ne(''), x.public.eq(true)]), {
            sort: x => x.createdAt('DESCENDING').MealProgresses('DESCENDING'),
            limit: 10
        })
        const mealsWithImages: MealDisplay[] = await Promise.all(mealsWithoutImages.map(async x => {
            const defaultMealToReturn = { ...x, coverImage: defaultImage, username: '' }
            const user = await DataStore.query(User, x.userID)
            if (!user || !x.media) {
                return defaultMealToReturn
            }
            //@ts-ignore
            let media: MediaType[] = [{uri: defaultImage, type: 'image'}]
            try {
                //@ts-ignore
                media = x.media || []
            } catch (error) {
                
            }
            const images = media.filter(x => x.type === 'image')
            if (images.length === 0) {
                return defaultMealToReturn
            }
            return { ...x, coverImage: isStorageUri(images[0].uri) ? await Storage.get(images[0].uri) : images[0].uri, username: user.username }
        }))
        setMeals(mealsWithImages)

        const foodWithoutImages = await DataStore.query(FoodProgress, x => x.and(food => [searchTerm ? food.name.contains(searchTerm) : food.name.ne(''), food.userID.ne(''), food.img.ne('')]), {limit: 10, sort: x => x.createdAt('DESCENDING')})
        const foodWithImages: FoodDisplay[] = await Promise.all(foodWithoutImages.map(async f => {
            let username = 'Edamam Nutrition'
            if (!f.edamamId) {
                const user = await DataStore.query(User, f.userID || '')
                username = user?.username || 'Edamam Nutrition'
            }
            return {...f, img: (f.img && isStorageUri(f.img)) ? await Storage.get(f.img) : f.img, username}
        }))
        setFood(foodWithImages)
        setLoading(false)
        setRefreshing(false)
    }

    React.useEffect(() => {
        fetchFoodAndMeals()
    }, [debouncedKeyword])

    return <SafeAreaView style={[tw`h-12/12`]} edges={['top']}>
        <ScrollView contentContainerStyle={[tw`px-4 py-3`]} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchFoodAndMeals} />}>
            <Text style={tw`text-2xl max-w-7/12`} weight='bold'>Food and Meals</Text>
            <View style={tw`w-12/12 mt-6 flex-row items-center py-3 px-4 justify-between bg-gray-${dm ? '700' : '300'} rounded-lg`}>
                <TextInput value={keyword} onChangeText={setKeyword} placeholder='search...' style={tw`w-11/12 text-${dm ? 'white' : 'black'}`} />
                <ExpoIcon name='search' iconName='feather' color={dm ? 'white' : 'gray'} size={25} />
            </View>
            <View style={tw`flex-row items-center justify-between mt-9`}>
                    <Text style={tw`text-lg`} weight='semibold'>Food Professionals</Text>
                    <TouchableOpacity onPress={() => {
                        const screen = getMatchingNavigationScreen('ListUser', navigator)
                        //@ts-ignore
                        navigator.navigate(screen, { foodProfessionals: true })
                    }}>
                        <Text>See All</Text>
                    </TouchableOpacity>
                </View>
                {users.length === 0 && <Text style={tw`text-center my-5`}>No users to display</Text>}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tw`pt-4`}>
                    {users.map((u) => {
                        return <TouchableOpacity key={u.id} style={tw`mx-2`} onPress={() => {
                            //@ts-ignore
                            navigator.navigate('FTUser', { id: u.id })
                        }}>
                            <ImageBackground source={{ uri: u.picture || defaultImage }} style={tw`w-40 h-50 flex-col justify-end`}>
                                {u.following && <View style={tw`bg-white rounded-xl p-1 w-20 my-2 mx-1 items-center`}>
                                    <Text style={tw`text-black text-xs`}>Following</Text>
                                </View>}
                                <View style={tw`w-12/12 h-15 bg-gray-${dm ? '700' : '300'}/70 px-2 py-3`}>
                                    <Text style={tw`max-w-35`} weight='semibold'>{u.username}</Text>
                                    <Text style={tw`max-w-35`}>{u.subCount} subscribers</Text>
                                </View>
                            </ImageBackground>

                        </TouchableOpacity>
                    })}
                </ScrollView>
                <View style={tw`flex-row items-center justify-between mt-9`}>
                    <Text style={tw`text-lg`} weight='semibold'>Meals</Text>
                    <TouchableOpacity onPress={() => {
                        //@ts-ignore
                        navigator.navigate('FTListMeals')
                    }}>
                        <Text>See All</Text>
                    </TouchableOpacity>
                </View>
                {meals.length === 0 && <Text style={tw`text-center my-5`}>No meals to display</Text>}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tw`pt-4`}>
                    {meals.map((m, i) => {
                        return <TouchableOpacity
                            onPress={() => {
                                //@ts-ignore
                                navigator.navigate('FTMealDetail', { id: m.id })
                            }}
                            key={`meal ${m.id} at index ${i}`} style={tw`mx-2 max-w-30`}>
                            <Image style={tw`w-30 h-30`} source={{ uri: m.coverImage || defaultImage }} />
                            <View style={tw`w-12/12 h-15 py-3`}>
                                <Text style={tw`max-w-30`} weight='semibold'>{m.name.length > 15 ? m.name.substring(0, 15) + '...' : m.name}</Text>
                                <Text style={tw`max-w-30 text-xs`}>by {<Text style={tw`text-red-500 text-xs`}>{m.username}</Text>}</Text>
                            </View>
                        </TouchableOpacity>
                    })}
                </ScrollView>
                <View style={tw`flex-row items-center justify-between mt-9`}>
                    <Text style={tw`text-lg`} weight='semibold'>Food</Text>
                    <TouchableOpacity onPress={() => {
                        //@ts-ignore
                        navigator.navigate('FTListFood')
                    }}>
                        <Text>See All</Text>
                    </TouchableOpacity>
                </View>
                {food.length === 0 && <Text style={tw`text-center my-5`}>No food to display</Text>}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tw`pt-4`}>
                    {food.map((m, i) => {
                        return <TouchableOpacity
                            onPress={() => {
                                //@ts-ignore
                                navigator.navigate('FTFoodDetail', { id: m.id, src: 'existing', editable: true })
                            }}
                            key={`meal ${m.id} at index ${i}`} style={tw`mx-2 max-w-30`}>
                            <Image style={tw`w-30 h-30`} source={{ uri: m.img || defaultImage }} />
                            <View style={tw`w-12/12 h-15 py-3`}>
                                <Text style={tw`max-w-30`} weight='semibold'>{m.name.length > 15 ? m.name.substring(0, 15) + '...' : m.name}</Text>
                                <Text style={tw`max-w-30 text-xs`}>by {<Text style={tw`text-red-500 text-xs`}>{m.username}</Text>}</Text>
                            </View>
                        </TouchableOpacity>
                    })}
                </ScrollView>
                <View style={tw`pb-40`} />
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
                name: 'AI Generated', icon: () => (<Text style={{ fontSize: 15 }}>🪄</Text>), onPress: () => {
                    //@ts-ignore
                    navigator.navigate('GenerateMeal')
                }
            }
        ]} initialIcon={'plus'} bgColor='teal-500' openIcon={() => {
            return <ExpoIcon name='close' iconName='ion' color='black' size={23} />
        }} />
    </SafeAreaView>
}
