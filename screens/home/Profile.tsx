import { ScrollView, TouchableOpacity, Dimensions, Image, RefreshControl } from 'react-native'
import React from 'react'
import { Text, View } from '../../components/base/Themed'
import tw from 'twrnc'
import useColorScheme from '../../hooks/useColorScheme';
import { ExpoIcon } from '../../components/base/ExpoIcon';
import { useNavigation } from '@react-navigation/native';
import { MediaType } from '../../types/Media';
import * as WebBrowser from 'expo-web-browser'
import { DataStore, Storage } from 'aws-amplify';
import { Exercise, FavoriteType, Follower, Goal, Meal, User, Workout } from '../../aws/models';
import { useCommonAWSIds } from '../../hooks/useCommonContext';
import { defaultImage, formatCash, getMatchingNavigationScreen, isStorageUri, substringForLists } from '../../data';
import { BackButton } from '../../components/base/BackButton';
import { ShowMoreButton } from './ShowMore';




interface ProfileProps {
    id?: string;
    personal?: boolean
    registration?: boolean
}

const quickLinks: {name: string, icon: string, screen: string}[] = [
    {name: 'Groceries', icon: 'shopping-cart', screen: 'GroceryList'},
    {name: 'Pantry', icon: 'shopping-bag', screen: 'Pantry'},
    {name: 'Favorites', icon: 'heart', screen: 'Favorites'},
    {name: 'Allergies', icon: 'alert-circle', screen: 'Allergens'}

]

interface ProfileExercise extends Exercise {
    img: string;
}
export default function Profile(props: ProfileProps) {
    const { id } = props
    const { userId, username } = useCommonAWSIds()
    const [pic, setPic] = React.useState<MediaType[]>([])
    const [workouts, setWorkouts] = React.useState<Workout[]>([])
    const [exercises, setExercises] = React.useState<ProfileExercise[]>([])
    const [meals, setMeals] = React.useState<Meal[]>([])
    const [bio, setBio] = React.useState<string | null | undefined>('')
    const [profileLink, setProfileLink] = React.useState<string>('')
    const isCurrentUsersProfile = id === userId || !id
    const navigator = useNavigation()

    React.useEffect(() => {
        fetchUserInfo()

    }, [])
    const fetchUserInfo = async () => {
        const queryID = props.id || userId
        if (!queryID) return
        let profileUsername = username
        const user = await DataStore.query(User, queryID)
        if (user) {
            const picture = user.picture || defaultImage
            profileUsername = user.username + ' '
            setProfileName(profileUsername)
            setBio(user.bio)
            setName(user.name)
            if (user.links?.[0]) {
                setProfileLink(user.links?.[0])
            }
            // setProfileLink(user.lin)
            setFollowers((await user.Followers.toArray()).length)
            setPic([{ type: 'image', uri: isStorageUri(picture) ? await Storage.get(picture) : picture }])
            const userPotentialFollowing = (await DataStore.query(Follower, f=>f.and(fav => [fav.subscribedFrom.eq(userId), fav.userID.eq(queryID)]))).length > 0
            setIsFollowing(userPotentialFollowing)
        }
        const potentialFollowing = await DataStore.query(Follower, f => f.subscribedFrom.eq(queryID))
        setFollowing(potentialFollowing.length)
        const userWorkouts = await DataStore.query(Workout, x => x.and(w => [w.userID.eq(queryID), w.name.ne(''), w.img.ne('')]), { sort: x => x.createdAt("DESCENDING"), limit: 20 })
        const workoutsWithImages = await Promise.all(userWorkouts.map(async wo => {
            let img = wo.img || defaultImage
            return { ...wo, userID: profileUsername, img: isStorageUri(img) ? await Storage.get(img) : img }
        }))
        setWorkouts(workoutsWithImages)
        const userMeals = await DataStore.query(Meal, m => m.and(x => [x.userID.eq(queryID), x.name.ne(''), x.public.eq(true), x.preview.ne(null)]), { sort: x => x.createdAt("DESCENDING"), limit: 20 })
        const mealsWithImages = await Promise.all(userMeals.map(async userMeal => {
            //@ts-ignore
            let img = userMeal.preview || defaultImage
            if (isStorageUri(img)) img = await Storage.get(img)
            return { ...userMeal, userID: profileUsername, preview: img }
        }))
        //@ts-ignore
        setMeals(mealsWithImages)
        if (isCurrentUsersProfile) {
            const exercisesWithoutImages = await DataStore.query(Exercise, e => e.and(ex => [ex.title.ne(''), ex.userID.eq(queryID)]), {
                limit: 10,
                sort: y => y.createdAt('DESCENDING')
              })
              const exercisesWithImages: ProfileExercise[] = await Promise.all(exercisesWithoutImages.map(async ex => {
                const img = ex.preview || defaultImage
                return { ...ex, img: isStorageUri(img) ? await Storage.get(img) : img }
              }))
              setExercises(exercisesWithImages)
        }
        setRefreshing(false)
    }

    const [profileName, setProfileName] = React.useState<string>('')
    const [followers, setFollowers] = React.useState<number>(0)
    const [following, setFollowing] = React.useState<number>(0)
    const [isFollowing, setIsFollowing] = React.useState<boolean>(false)
    const dm = useColorScheme() === 'dark'
    const [refreshing, setRefreshing] = React.useState<boolean>(false)
    const [name, setName] = React.useState<string | null | undefined>('')
    const [showBio, setShowBio] = React.useState<boolean>(false)

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

    return <View style={{ flex: 1 }} includeBackground>
        {id && <BackButton Right={() => {
            return <ShowMoreButton name={name || ''} desc={'@' +profileName} img={pic[0]?.uri || defaultImage} id={props.id || ''} />
        }} />}
        <ScrollView contentContainerStyle={[tw`w-12/12 px-4 mt-6 pb-40`]} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchUserInfo} />}>
            {!id && <TouchableOpacity style={tw`justify-end w-12/12 mt-9 items-end`} onPress={() => {
                navigator.navigate('Settings')
            }}>
                <ExpoIcon name='settings' iconName='feather' size={25} color={dm ? 'white' : 'black'} />
            </TouchableOpacity>}
            <View style={tw`flex-row items-center`}>
                <TouchableOpacity onPress={() => {
                        navigator.navigate('Image', { uris: [pic.length > 0 ? pic[0].uri : defaultImage] })
                    }}>
                    {pic.length > 0 && <Image source={{ uri: pic[0].uri }} style={tw`w-20 h-20 rounded-full`} />}
                </TouchableOpacity>
                <View style={tw`flex-row w-9/12 justify-around items-center`}>
                <TouchableOpacity onPress={() => {
                            const screen = getMatchingNavigationScreen('Subscribees', navigator)
                            //@ts-ignore
                            navigator.push(screen, { to: props.id || userId })
                        }} style={tw`items-center justify-center`}>
                            <Text>{formatCash(followers)}</Text>
                            <Text weight='semibold'>Followers</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            const screen = getMatchingNavigationScreen('Subscribees', navigator)
                            //@ts-ignore
                            navigator.push(screen, { from: props.id || userId })
                        }} style={tw`items-center justify-center`}>
                            <Text>{formatCash(following)}</Text>
                            <Text weight='semibold'>Following</Text>
                        </TouchableOpacity>
                </View>
            </View>
            {name && <Text style={tw`mt-4`} weight='bold'>{name}</Text>}
            <Text style={tw`my-${(name) ? '1' : '4'} text-gray-500`} weight='semibold'>{<Text style={tw`text-xs text-gray-500`}>@</Text>}{profileName}</Text>
            {bio && <Text style={tw`mb-1`}>{(showBio || bio.length <= 150) ? bio : bio.substring(0, 149)} {(bio.length >= 150) && <Text style={tw`text-gray-500`} weight='semibold' onPress={() => {setShowBio(!showBio)}}>...{showBio ? 'Hide' : 'Show More'}</Text>}</Text>}
            {profileLink && <TouchableOpacity onPress={async () => {
                try {
                    let url = 'https://'
                    if (!profileLink.includes('http')) {
                        url += profileLink
                    } else {
                        url = profileLink
                    }
                    await WebBrowser.openBrowserAsync(url)
                } catch (error) {
                    alert('There was a problem opening this link')
                }
            }}>
                    <Text style={tw`text-red-500`} weight='semibold'>{profileLink}</Text>
                </TouchableOpacity>}
            {!isCurrentUsersProfile && <TouchableOpacity onPress={onFollowingPress} style={tw`bg-red-${dm ? '700' : '300'} items-center justify-center p-3 mx-6 rounded-xl mt-3 mb-6`}>
                <Text>{isFollowing ? 'Unfollow' : 'Follow'}</Text>
            </TouchableOpacity>}
            {isCurrentUsersProfile && <View>
                <TouchableOpacity onPress={() => {
                    navigator.navigate('UserBio')
                }}>
                    <Text style={tw`text-center my-3 text-gray-500`} weight='bold'>Edit Account Info</Text>
                    </TouchableOpacity>
                <Text style={tw`text-xl`} weight='bold'>Quick Links</Text>
                <View style={tw`flex-row items-center justify-around px-3 py-4`}>
                   {quickLinks.map(link => {
                    return <TouchableOpacity onPress={() => {
                        const screen = getMatchingNavigationScreen(link.screen, navigator)
                        //@ts-ignore
                        navigator.navigate(screen)
                    }} key={link.name} style={tw`justify-center items-center`}> 
                    <ExpoIcon name={link.icon} iconName='feather' size={18} color='gray' />
                    <Text style={tw`text-gray-500 mt-2 text-xs`}>{link.name}</Text>
                </TouchableOpacity>
                   })}
                </View>
            </View>}
            <View style={tw`flex-row items-center justify-between mb-4 mt-4`}>
                <Text style={tw`text-lg`} weight="semibold">Meals</Text>
                <TouchableOpacity onPress={() => {
                    const screen = getMatchingNavigationScreen('ListMeal', navigator)
                    //@ts-ignore
                    navigator.navigate(screen, {userId: props.id || userId})
                }}>
                    <Text>See All</Text>
                </TouchableOpacity>
            </View>
            {meals.length === 0 && <Text style={tw`text-center my-5`}>No meals to display</Text>}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {meals.map((meal, i) => {
                    return <TouchableOpacity key={`food item ${meal.name} at index ${i}`}
                    onPress={() => {
                        const screen = getMatchingNavigationScreen('MealDetail', navigator)
                        //@ts-ignore
                        navigator.push(screen, { id: meal.id })
                    }}
                    style={[tw`items-start mx-1`]}>
                    <Image source={{ uri: meal.preview || '' }} style={tw`h-20 w-20 rounded-lg mb-1`} resizeMode='cover' />
                    <Text style={tw`text-xs max-w-20`}>{substringForLists(meal.name)}</Text>
                </TouchableOpacity>
                })}
            </ScrollView>
            <View style={tw`flex-row items-center justify-between mb-4 mt-4`}>
                <Text style={tw`text-lg`} weight="semibold">Workouts</Text>
                <TouchableOpacity onPress={() => {
                    const screen = getMatchingNavigationScreen('ListWorkout', navigator)
                    //@ts-ignore
                    navigator.navigate(screen, {userId: props.id || userId})
                }}>
                    <Text>See All</Text>
                </TouchableOpacity>
            </View>
            {workouts.length === 0 && <Text style={tw`text-center my-5`}>No workouts to display</Text>}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {workouts.map((workout, i) => {
                    return <TouchableOpacity
                        key={`workout ${workout.name} at index ${i}`}
                        onPress={() => {
                            const screen = getMatchingNavigationScreen('WorkoutDetail', navigator)
                            //@ts-ignore
                            navigator.navigate(screen, { id: workout.id })
                        }}
                        style={[tw`items-start px-1`]}>
                        <Image source={{ uri: workout.img || defaultImage }} style={tw`h-20 w-20 rounded-lg`} resizeMode='cover' />
                        <Text style={tw`text-xs max-w-20`}>{substringForLists(workout.name)}</Text>
                        {/* <Text>{r.calories} kcal</Text> */}
                    </TouchableOpacity>
                })}
            </ScrollView>
            {isCurrentUsersProfile && <View style={{flex: 1}}>
            <View style={tw`flex-row items-center justify-between mb-4 mt-4`}>
                <Text style={tw`text-lg`} weight="semibold">Exercises</Text>
                <TouchableOpacity onPress={() => {
                    const screen = getMatchingNavigationScreen('ListExercise', navigator)
                    //@ts-ignore
                    navigator.navigate(screen, {userId: props.id || userId})
                }}>
                    <Text>See All</Text>
                </TouchableOpacity>
            </View>
                {exercises.length === 0 && <Text style={tw`text-center my-5`}>No exercises to display</Text>}
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {exercises.map((exercise, i) => {
                    return <TouchableOpacity
                        key={`workout ${exercise.title} at index ${i}`}
                        onPress={() => {
                            const screen = getMatchingNavigationScreen('ExerciseDetail', navigator)
                            //@ts-ignore
                            navigator.navigate(screen, { id: exercise.id })
                        }}
                        style={[tw`items-start px-1`]}>
                        <Image source={{ uri: exercise.img || defaultImage }} style={tw`h-20 w-20 rounded-lg`} resizeMode='cover' />
                        <Text style={tw`text-xs max-w-20`}>{substringForLists(exercise.title)}</Text>
                        {/* <Text>{r.calories} kcal</Text> */}
                    </TouchableOpacity>
                })}
                </ScrollView>
            </View>}
            <View style={tw`h-20`}/>
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