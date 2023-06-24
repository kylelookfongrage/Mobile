import { View, TouchableOpacity, ScrollView, Image, TextInput, ActivityIndicator, RefreshControl } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, SafeAreaView } from '../../components/Themed';
import tw from 'twrnc'
import { FloatingActionButton } from '../../components/FAB';
import { useNavigation } from '@react-navigation/native';
import { ExpoIcon } from '../../components/ExpoIcon';
import useColorScheme from '../../hooks/useColorScheme';
import { defaultImage, getMatchingNavigationScreen, isStorageUri, substringForLists } from '../../data';
import { DataStore, Storage } from 'aws-amplify';
import { Exercise, Follower, FoodProgress, Ingredient, Meal, User, Workout } from '../../aws/models';
import { MediaType } from '../../types/Media';
import { useDebounce } from '../../hooks/useDebounce';
import { useCommonAWSIds } from '../../hooks/useCommonContext';
import { getCommonScreens } from '../../components/GetCommonScreens';
import GenerateMeal from './GenerateMeal';
import AllergenAlert from '../../components/AllergenAlert';



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

interface MealDisplay extends Meal {
    coverImage: string;
    username: string;
    userIsAllergic?: boolean;
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
    userIsAllergic?: boolean;
}

interface ExerciseDisplay extends Exercise {
    username: string;
    name: string;
    img: string;
}

interface WorkoutDisplay extends Workout {
    username: string;
    coverImage: string;
    useCount: number;
}

export const FoodAndMeals = () => {
    const navigator = useNavigation()
    const dm = useColorScheme() === 'dark'
    const { userId } = useCommonAWSIds()
    const [users, setUsers] = React.useState<UserDisplay[]>([])
    const [q1, setQ1] = React.useState<MealDisplay[] | WorkoutDisplay[]>([])
    const [q2, setQ2] = React.useState<FoodDisplay[] | ExerciseDisplay[]>([])
    const [loading, setLoading] = React.useState<boolean>(false)

    const [keyword, setKeyword] = React.useState<string>('')
    const debouncedKeyword = useDebounce(keyword, 500)
    const [refreshing, setRefreshing] = React.useState<boolean>(false)
    const fetchFoodAndMeals = async () => {
        const searchTerm = debouncedKeyword
        setLoading(true)
        const usersWithoutImages = await DataStore.query(User, u => u.and(x => [searchTerm ? x.username.contains(searchTerm.toLowerCase()) : x.username.ne('')]), {
            sort: x => x.Followers('ASCENDING'),
            limit: 10
        })
        const usersWithImages: UserDisplay[] = await Promise.all(usersWithoutImages.map(async x => {
            const potentialFollowing = (await DataStore.query(Follower, f => f.and(y => [y.userID.eq(x.id), y.subscribedFrom.eq(userId)]))).length > 0
            const followers = (await x.Followers.toArray()).length
            let img = x.picture || defaultImage
            return { id: x.id, username: x.username, subCount: followers, following: potentialFollowing, picture: isStorageUri(img) ? await Storage.get(img) : img }

        }))
        setUsers(usersWithImages)
        if (selectedOption === 'Meals & Food') {
            const userAllergens = (await DataStore.query(User, userId))?.allergens || []
            const mealsWithoutImages = await DataStore.query(Meal, m => m.and(x => [searchTerm ? x.name.contains(searchTerm) : x.name.ne(''), x.public.eq(true)]), {
                sort: x => x.createdAt('DESCENDING').MealProgresses('DESCENDING'),
                limit: 10
            })
            const mealsWithImages: MealDisplay[] = await Promise.all(mealsWithoutImages.map(async x => {
                const defaultMealToReturn = { ...x, coverImage: defaultImage, username: '' }
                const ingredients = (await x.Ingredients.toArray()) || []
                const ingredientLabels = ingredients.map(ingr => (ingr.foodContentsLabel || '') + ingr.name).join(',').toLowerCase() || ''
                const potentialAllergens = userAllergens.filter(al => ingredientLabels.includes(al?.toLowerCase() || 'nothing'))
                console.log(ingredientLabels)
                console.log(potentialAllergens)
                const user = await DataStore.query(User, x.userID)
                if (!user || !x.media) {
                    return {...defaultMealToReturn, userIsAllergic: potentialAllergens.length > 0}
                }
                //@ts-ignore
                let media: MediaType[] = [{ uri: defaultImage, type: 'image' }]
                try {
                    //@ts-ignore
                    media = x.media || []
                } catch (error) {

                }
                const images: MediaType[] = media.filter(x => x.type === 'image') || []
                if (images.length === 0) {
                    defaultMealToReturn.coverImage = images[0].uri
                }
                return { ...x, userIsAllergic: potentialAllergens.length > 0, coverImage: isStorageUri(defaultMealToReturn.coverImage) ? await Storage.get(defaultMealToReturn.coverImage) : defaultMealToReturn.coverImage, username: user.username }
            }))
            setQ1(mealsWithImages)

            const foodWithoutImages = await DataStore.query(FoodProgress, x => x.and(food => [searchTerm ? food.name.contains(searchTerm) : food.name.ne(''), food.userID.ne('')]), { limit: 10, sort: x => x.createdAt('DESCENDING') })
            const foodWithImages: FoodDisplay[] = await Promise.all(foodWithoutImages.map(async f => {
                let username = 'Edamam Nutrition'
                const allergenSearchString = f.name + f.foodContentsLabel
                const potentialAllergens = userAllergens.filter(al => allergenSearchString.toLowerCase()?.includes(al?.toLowerCase() || 'nothing'))
                if (!f.edamamId) {
                    const user = await DataStore.query(User, f.userID || '')
                    username = user?.username || 'Edamam Nutrition'
                }
                return { ...f, userIsAllergic: potentialAllergens.length > 0, img: isStorageUri(f.img || defaultImage) ? await Storage.get(f.img || defaultImage) : f.img, username }
            }))
            setQ2(foodWithImages)
        } else if (selectedOption === 'Workouts & Exercises') {
            const ws = await DataStore.query(Workout, wo => wo.and(x => [debouncedKeyword ? x.name.contains(debouncedKeyword) : x.name.ne(''), x.WorkoutDetails.sets.gt(1)]), {
                sort: x => x.createdAt('DESCENDING'), limit: 10
            })
            // graphqlOperation()
            const wsWithImages: WorkoutDisplay[] = await Promise.all(ws.map(async wo => {
                const user = await DataStore.query(User, wo.userID)
                const username = user?.username
                const useCount = (await wo.WorkoutPlayDetails.toArray()).length
                let img = wo.img || defaultImage
                return { ...wo, coverImage: isStorageUri(img) ? await Storage.get(img) : img, username: username || '', useCount }
            }))
            setQ1(wsWithImages.sort((a, b) => (b.useCount || 1) - (a.useCount || 0)))

            const exercisesWithoutImages = await DataStore.query(Exercise, e => e.and(ex => [debouncedKeyword ? ex.title.contains(debouncedKeyword) : ex.title.ne('')]), {
                limit: 10,
                sort: y => y.createdAt('DESCENDING').WorkoutPlayDetails('DESCENDING')
            })
            const exercisesWithImages: ExerciseDisplay[] = await Promise.all(exercisesWithoutImages.map(async ex => {
                const user = await DataStore.query(User, ex.userID)
                const username = user?.username
                //@ts-ignore
                const media: MediaType[] = ex.media || []
                const img = media.filter(x => x.type == 'image')?.[0]?.uri || defaultImage
                return { ...ex, img: isStorageUri(img) ? await Storage.get(img) : img, username: username || '', name: ex.title }
            }))
            setQ2(exercisesWithImages)
        }

        setLoading(false)
        setRefreshing(false)
    }

    const searchOptions = ['Meals & Food', 'Workouts & Exercises'] as const
    const [selectedOption, setSelectedOption] = React.useState<typeof searchOptions[number]>(searchOptions[0])

    React.useEffect(() => {
        fetchFoodAndMeals()
    }, [debouncedKeyword, selectedOption])

    const color = dm ? 'white' : 'black'

    //@ts-ignore
    return <SafeAreaView style={[tw`h-12/12`]} edges={['top']} includeBackground>
        <ScrollView contentContainerStyle={[tw`px-4 py-3`]} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchFoodAndMeals} />}>
            <Text style={tw`text-2xl max-w-7/12`} weight='bold'>Search</Text>
            <View style={tw`w-12/12 mt-6 flex-row items-center py-2.5 px-4 justify-between bg-gray-${dm ? '700' : '300'} rounded-lg`}>
                <View style={tw`flex flex-row items-center`}>
                    <ExpoIcon name='search' iconName='feather' color={'gray'} style={tw`pr-2`} size={25} />
                    <TextInput value={keyword} onChangeText={setKeyword} placeholder='search...' style={tw`w-9/12 text-${dm ? 'white' : 'black'}`} />
                </View>
                <TouchableOpacity style={tw`p-2`} onPress={() => {setKeyword('')}}>
                    <ExpoIcon name='x' iconName='feather' color={'gray'} style={tw``} size={20} />
                </TouchableOpacity>
            </View>
            <View style={tw`flex-row justify-between py-4`}>
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
            <View style={tw`flex-row items-center justify-between mt-9`}>
                <Text style={tw`text-lg`} weight='semibold'>Users</Text>
                <TouchableOpacity onPress={() => {
                    const screen = getMatchingNavigationScreen('ListUser', navigator)
                    //@ts-ignore
                    navigator.navigate(screen, { foodProfessionals: true })
                }}>
                    <Text>See All</Text>
                </TouchableOpacity>
            </View>
            {users.length === 0 && <Text style={tw`text-center my-5`}>No users to display</Text>}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tw`pt-4`} contentContainerStyle={tw`flex-row items-center justify-center`}>
                {users.map((u) => {
                    return <TouchableOpacity key={u.id} style={tw`items-center mr-2`} onPress={() => {
                        //@ts-ignore
                        navigator.navigate('FTUser', { id: u.id })
                    }}>
                        <Image source={{ uri: u.picture || defaultImage }} style={tw`w-17 h-17 rounded-full`} />
                        <Text style={tw`max-w-23 text-center text-xs mt-2 text-red-500`} weight='regular'>@{substringForLists(u.username, 15)}</Text>
                    </TouchableOpacity>
                })}
            </ScrollView>
            <View style={tw`flex-row items-center justify-between mt-9`}>
                <Text style={tw`text-lg`} weight='semibold'>{selectedOption === 'Meals & Food' ? 'Meals' : 'Workouts'}</Text>
                <TouchableOpacity onPress={() => {
                    if (selectedOption === 'Meals & Food') {
                        const screen = getMatchingNavigationScreen('ListMeal', navigator)
                        //@ts-ignore
                        navigator.navigate(screen)
                    } else if (selectedOption === 'Workouts & Exercises') {
                        const screen = getMatchingNavigationScreen('ListWorkout', navigator)
                        //@ts-ignore
                        navigator.navigate(screen)
                    }
                }}>
                    <Text>See All</Text>
                </TouchableOpacity>
            </View>
            {q1.length === 0 && <Text style={tw`text-center my-5`}>No {selectedOption === 'Meals & Food' ? 'meals' : 'workouts'} to display</Text>}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tw`pt-4`}>
                {q1.map((m, i) => {
                    return <TouchableOpacity
                        onPress={() => {
                            if (selectedOption === 'Meals & Food') {
                                const screen = getMatchingNavigationScreen('MealDetail', navigator)
                                //@ts-ignore
                                navigator.navigate(screen, { id: m.id })
                            } else if (selectedOption === 'Workouts & Exercises') {
                                const screen = getMatchingNavigationScreen('WorkoutDetail', navigator)
                                //@ts-ignore
                                navigator.navigate(screen, { id: m.id })
                            }
                        }}
                        key={`meal ${m.id} at index ${i}`} style={tw`mx-1 flex-col items-start`}>
                        <Image style={tw`w-20 h-20 rounded-lg`} source={{ uri: m.coverImage || defaultImage }} />
                        <View style={tw`pt-2`}>
                            <Text style={tw`max-w-25 text-xs`}>{substringForLists(m.name)}</Text>
                            <Text style={tw`text-red-500 max-w-25 text-xs`}>@{substringForLists(m.username)}</Text>
                            {/* @ts-ignore */}
                            {m.userIsAllergic && <AllergenAlert size={15} style={tw`text-center mt-2`} />}
                        </View>
                    </TouchableOpacity>
                })}
            </ScrollView>
            <View style={tw`flex-row items-center justify-between mt-9`}>
                <Text style={tw`text-lg`} weight='semibold'>{selectedOption === 'Meals & Food' ? 'Food' : 'Exercises'}</Text>
                <TouchableOpacity onPress={() => {
                    if (selectedOption === 'Meals & Food') {
                        const screen = getMatchingNavigationScreen('ListFood', navigator)
                        //@ts-ignore
                        navigator.navigate(screen)
                    } else if (selectedOption === 'Workouts & Exercises') {
                        const screen = getMatchingNavigationScreen('ListExercise', navigator)
                        //@ts-ignore
                        navigator.navigate(screen)
                    }
                }}>
                    <Text>See All</Text>
                </TouchableOpacity>
            </View>
            {q2.length === 0 && <Text style={tw`text-center my-5`}>No {selectedOption === 'Meals & Food' ? 'food' : 'exercises'} to display</Text>}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tw`pt-4`}>
                {q2.map((m, i) => {
                    return <TouchableOpacity
                        onPress={() => {
                            if (selectedOption === 'Meals & Food') {
                                const screen = getMatchingNavigationScreen('FoodDetail', navigator)
                                //@ts-ignore
                                navigator.navigate(screen, { id: m.id, src: 'existing', editable: true })
                            } else if (selectedOption === 'Workouts & Exercises') {
                                const screen = getMatchingNavigationScreen('ExerciseDetail', navigator)
                                //@ts-ignore
                                navigator.navigate(screen, { id: m.id })
                            }
                        }}
                        key={`meal ${m.id} at index ${i}`} style={tw`mx-1 flex-col`}>
                        <Image style={tw`w-20 h-20 rounded-lg mb-2`} source={{ uri: m.img || defaultImage }} />
                        <Text style={tw`max-w-25 text-xs`}>{substringForLists(m.name)}</Text>
                        <Text style={tw`text-red-500 text-xs max-w-25`}>@{substringForLists(m.username)}</Text>
                        {/* @ts-ignore */}
                        {m.userIsAllergic && <AllergenAlert size={15} style={tw`text-center`} />}
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


