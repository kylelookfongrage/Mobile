import { ScrollView, View, TouchableOpacity, Image, Dimensions, RefreshControl } from 'react-native'
import React from 'react'
import { Text } from '../../components/Themed'
import tw from 'twrnc'
import useColorScheme from '../../hooks/useColorScheme';
import { ExpoIcon } from '../../components/ExpoIcon';
import { useNavigation } from '@react-navigation/native';
import { MediaType } from '../../types/Media';
import { DataStore, Storage } from 'aws-amplify';
import { Follower, Goal, Meal, User, Workout } from '../../aws/models';
import { useCommonAWSIds } from '../../hooks/useCommonContext';
import { defaultImage, getMatchingNavigationScreen, isStorageUri } from '../../data';
import { BackButton } from '../../components/BackButton';



interface ProfileProps {
    id?: string;
    personal?: boolean
    registration?: boolean
}

const quickLinks: {name: string, icon: string, screen: string}[] = [
    {name: 'Grocery List', icon: 'shopping-cart', screen: 'GroceryList'},
    {name: 'Pantry', icon: 'shopping-bag', screen: 'Pantry'},
    {name: 'Favorites', icon: 'heart', screen: 'Favorites'},

]


export default function Profile(props: ProfileProps) {
    const { id } = props
    const { userId, username } = useCommonAWSIds()
    const [pic, setPic] = React.useState<MediaType[]>([])
    const [workouts, setWorkouts] = React.useState<Workout[]>([])
    const [meals, setMeals] = React.useState<Meal[]>([])
    const isCurrentUsersProfile = id === userId || !id
    const navigator = useNavigation()

    React.useEffect(() => {
        fetchUserInfo()

    }, [])

    const fetchUserInfo = () => {
        const queryID = props.id || userId
        if (!queryID) return
        let profileUsername = username
        DataStore.query(User, queryID).then(x => {
            if (x) {
                profileUsername = x.username + ' '
                if (x.personalTrainer) {
                    profileUsername += '🏋️‍♀️'
                }
                if (x.foodProfessional) {
                    profileUsername += '🍎'
                }
                setProfileName(profileUsername)
                x.Followers.toArray().then(x => setFollowers(x.length))
            }
            if (x?.picture && isStorageUri(x.picture)) {
                Storage.get(x.picture).then(x => {
                    setPic([{ type: 'image', uri: x }])
                })
            } else if (x?.picture) {
                setPic([{ type: 'image', uri: x.picture || '' }])
            }
        })
        DataStore.query(Workout, x => x.and(w => [w.userID.eq(queryID), w.name.ne(''), w.img.ne('')]), { sort: x => x.createdAt("DESCENDING"), limit: 20 }).then(async userWorkouts => {
            const workoutsWithImages = await Promise.all(userWorkouts.map(async wo => {
                if (wo.img && isStorageUri(wo.img)) {
                    return { ...wo, userID: profileUsername, img: await Storage.get(wo.img) }
                } else {
                    return { ...wo, userID: profileUsername }
                }
            }))
            setWorkouts(workoutsWithImages)
        })
        DataStore.query(Meal, m => m.and(x => [x.userID.eq(queryID), x.name.ne(''), x.public.eq(true)]), { sort: x => x.createdAt("DESCENDING"), limit: 20 }).then(async userMeals => {
            const mealsWithImages = await Promise.all(userMeals.map(async userMeal => {
                //@ts-ignore
                const media: MediaType[] = userMeal.media || []
                const images = media.filter(x => x.type === 'image')
                if (images.length > 0) {
                    return { ...userMeal, userID: profileUsername, media: [{ type: 'image', uri: isStorageUri(images[0].uri) ? await Storage.get(images[0].uri) : images[0].uri }] }
                } else {
                    return { ...userMeal, media: [{ type: 'image', uri: defaultImage }], userID: profileUsername }
                }
            }))
            //@ts-ignore
            setMeals(mealsWithImages)
        })
        DataStore.query(Follower, f => f.subscribedFrom.eq(queryID)).then(x => {
            setFollowing(x.length)
        })
        setRefreshing(false)
    }

    React.useEffect(() => {
        if (!id) return;
        const subscription = DataStore.observeQuery(Follower, x => x.and(y => [y.subscribedFrom.eq(userId), y.userID.eq(id)])).subscribe(ss => {
            const { items } = ss
            setIsFollowing(items.length > 0)
        })
        return () => {
            subscription.unsubscribe()
        }
    }, [])

    const [profileName, setProfileName] = React.useState<string>('')
    const [followers, setFollowers] = React.useState<number>(0)
    const [following, setFollowing] = React.useState<number>(0)
    const [isFollowing, setIsFollowing] = React.useState<boolean>(false)
    const dm = useColorScheme() === 'dark'
    const [refreshing, setRefreshing] = React.useState<boolean>(false)

    const onFollowingPress = async () => {
        if (!id) return;
        if (isFollowing) {
            await DataStore.delete(Follower, x => x.and(y => [y.subscribedFrom.eq(userId), y.userID.eq(id)]))
            setFollowers(followers - 1)
            setIsFollowing(false)
        } else {
            await DataStore.save(new Follower({ subscribedFrom: userId, userID: id }))
            setFollowers(followers + 1)
            setIsFollowing(true)
        }
    }


    return <View style={{ flex: 1 }}>
        {id && <BackButton />}
        <ScrollView contentContainerStyle={[tw`w-12/12 px-4 mt-6 pb-40`]} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchUserInfo} />}>
            {!id && <TouchableOpacity style={tw`justify-end w-12/12 mt-9 items-end`} onPress={() => {
                navigator.navigate('Settings')
            }}>
                <ExpoIcon name='settings' iconName='feather' size={25} color={dm ? 'white' : 'black'} />
            </TouchableOpacity>}
            <View style={tw`flex-row w-12/12`}>
                <TouchableOpacity onPress={() => {
                    navigator.navigate('Image', { uris: [pic.length > 0 ? pic[0].uri : defaultImage] })
                }}>
                    <Image source={{ uri: pic.length > 0 ? pic[0].uri : defaultImage }} style={tw`w-15 h-15 rounded-full`} />
                </TouchableOpacity>
                <View style={tw`ml-4`}>
                    <Text style={tw`text-lg`} weight="semibold">{profileName}</Text>
                    <View style={tw`bg-gray-${dm ? '700' : 300} w-10/12 flex-row items-center justify-around px-9 py-2 my-4 rounded-xl`}>
                        <TouchableOpacity onPress={() => {
                            const screen = getMatchingNavigationScreen('Subscribees', navigator)
                            //@ts-ignore
                            navigator.push(screen, { to: props.id || userId })
                        }} style={tw`items-center justify-center`}>
                            <Text>{followers}</Text>
                            <Text weight='semibold'>Followers</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            const screen = getMatchingNavigationScreen('Subscribees', navigator)
                            //@ts-ignore
                            navigator.push(screen, { from: props.id || userId })
                        }} style={tw`items-center justify-center`}>
                            <Text>{following}</Text>
                            <Text weight='semibold'>Following</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            {!isCurrentUsersProfile && <TouchableOpacity onPress={onFollowingPress} style={tw`bg-red-${dm ? '700' : '300'} items-center justify-center p-3 mx-6 rounded-xl mt-3 mb-6`}>
                <Text>{isFollowing ? 'Unfollow' : 'Follow'}</Text>
            </TouchableOpacity>}
            {isCurrentUsersProfile && <View>
                <Text style={tw`text-xl`} weight='bold'>Quick Links</Text>
                <View style={tw`flex-row items-center justify-between px-9 py-4`}>
                   {quickLinks.map(link => {
                    return <TouchableOpacity onPress={() => {
                        const screen = getMatchingNavigationScreen(link.screen, navigator)
                        //@ts-ignore
                        navigator.navigate(screen)
                    }} key={link.name} style={tw`justify-center items-center`}> 
                    <ExpoIcon name={link.icon} iconName='feather' size={20} color='gray' />
                    <Text style={tw`text-gray-500 mt-2`}>{link.name}</Text>
                </TouchableOpacity>
                   })}
                </View>
            </View>}
            <Text style={tw`text-xl mb-4`} weight="semibold">Meals</Text>
            {meals.length === 0 && <Text style={tw`text-center my-5`}>No meals to display</Text>}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {meals.map((meal, i) => {
                    let img: string | null = null;
                    if (meal.media && meal.media.length > 0) {
                        //@ts-ignore
                        img = meal.media.filter(x => x.type === 'image')[0].uri
                    }
                    return <TouchableOpacity
                        key={`food item ${meal.name} at index ${i}`}
                        onPress={() => {
                            const screen = getMatchingNavigationScreen('MealDetail', navigator)
                            //@ts-ignore
                            navigator.push(screen, { id: meal.id, editable: isCurrentUsersProfile })
                        }}
                        style={[tw`items-start px-3`, { width: Dimensions.get('screen').width * 0.40 }]}>
                        <Image source={{ uri: img || defaultImage }} style={tw`h-25 w-25 rounded-lg`} resizeMode='cover' />
                        <Text weight='semibold'>{meal.name}</Text>
                        <Text numberOfLines={2}>{meal.userID}</Text>
                        {/* <Text>{r.calories} kcal</Text> */}
                    </TouchableOpacity>
                })}
            </ScrollView>
            <Text style={tw`text-xl my-4`} weight="semibold">Workouts</Text>
            {workouts.length === 0 && <Text style={tw`text-center my-5`}>No workouts to display</Text>}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {workouts.map((workout, i) => {
                    return <TouchableOpacity
                        key={`workout ${workout.name} at index ${i}`}
                        onPress={() => {
                            const screen = getMatchingNavigationScreen('WorkoutDetail', navigator)
                            //@ts-ignore
                            navigator.navigate(screen, { editable: isCurrentUsersProfile, id: workout.id })
                        }}
                        style={[tw`items-start px-3`, { width: Dimensions.get('screen').width * 0.40 }]}>
                        <Image source={{ uri: workout.img || defaultImage }} style={tw`h-25 w-25 rounded-lg`} resizeMode='cover' />
                        <Text weight='semibold'>{workout.name}</Text>
                        <Text numberOfLines={2}>{workout.userID}</Text>
                        {/* <Text>{r.calories} kcal</Text> */}
                    </TouchableOpacity>
                })}
            </ScrollView>
        </ScrollView>
    </View>

}


export const getTdee = (goal: string, weight: number, fat: number) => {
    const bmr = 370 + (21.6 * ((1 - (Number(fat) / 100))) * (weight * 0.45359237))
    let tdee = bmr
    if (goal.toLowerCase() == 'deficit') {
        tdee = bmr - 250
    } else if (goal.toLowerCase() == 'surplus') {
        tdee = bmr + 250
    }
    tdee = Math.round(tdee)
    return tdee < 1400 ? 1400 : tdee
}