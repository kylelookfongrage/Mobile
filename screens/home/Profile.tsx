import { ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import React, { useState } from 'react'
import { Text, View } from '../../components/base/Themed'
import tw from 'twrnc'
import useColorScheme from '../../hooks/useColorScheme';
import { ExpoIcon } from '../../components/base/ExpoIcon';
import { useNavigation } from '@react-navigation/native';
import { MediaType } from '../../types/Media';
import * as WebBrowser from 'expo-web-browser'
import { useCommonAWSIds } from '../../hooks/useCommonContext';
import { defaultImage, formatCash, getMatchingNavigationScreen, substringForLists } from '../../data';
import { BackButton } from '../../components/base/BackButton';
import { ShowMoreDialogue } from './ShowMore';
import { UserQueries } from '../../types/UserDao';
import SupabaseImage from '../../components/base/SupabaseImage';
import { Tables } from '../../supabase/dao';
import Spacer from '../../components/base/Spacer';
import ManageButton from '../../components/features/ManageButton';




interface ProfileProps {
    id?: string;
    personal?: boolean
    registration?: boolean
}

const quickLinks: {name: string, icon: string, screen: string}[] = [
    {name: 'My Pantry', icon: 'shopping-bag', screen: 'Pantry'},
    {name: 'My Gym', icon: 'shopping-bag', screen: 'Pantry'},
    {name: 'My Allergies', icon: 'alert-circle', screen: 'Allergens'},
    // {name: 'Favorites', icon: 'heart', screen: 'Favorites'},

]

export default function Profile(props: ProfileProps) {
    const { id } = props
    const { userId, username, profile } = useCommonAWSIds()
    const [pic, setPic] = React.useState<MediaType[]>([])
    const [img, setImg] = useState<string | null>(null)
    const [workouts, setWorkouts] = React.useState<Tables['workout']['Row'][]>([])
    const [exercises, setExercises] = React.useState<Tables['exercise']['Row'][]>([])
    const [food, setFood] = React.useState<Tables['food']['Row'][]>([])
    const [meals, setMeals] = React.useState<Tables['meal']['Row'][]>([])
    const [bio, setBio] = React.useState<string | null | undefined>('')
    const [profileLink, setProfileLink] = React.useState<string>('')
    const isCurrentUsersProfile = id === userId || !id
    const navigator = useNavigation()
    let dao = UserQueries()

    React.useEffect(() => {
        fetchUserInfo()

    }, [])
    const fetchUserInfo = async () => {
        const queryID = props.id || profile?.id
        if (!queryID) return
        const user = await dao.fetchProfile(queryID)
        if (user) {
            console.log(user)
            setProfileName(user.username)
            setBio(user.bio)
            setImg(user.pfp)
            setName(user.name)
            if (user.links?.[0]) {
                setProfileLink(user.links?.[0])
            }
            let res = await dao.fetch_subscribers(user.id)
            if (res) {
                setFollowers(res.subscribers)
                setFollowing(res.subscribees)
            }
            if (profile?.id && user.id !== profile.id) {
                let f = await dao.isFollowing(profile.id, user.id)
                if (f) setIsFollowing(true)
            }
            let children = await dao.fetch_user_children(user.id, [])
            setWorkouts(children.workout)
            setMeals(children.meal)
            setExercises(children.exercise)
            setFood(children.food)
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
        if (!id || !profile?.id) return;
        if (isFollowing) {
            await dao.onFollowPress(profile.id, id, true)
            setFollowers(followers - 1)
            setIsFollowing(false)
        } else {
            await dao.onFollowPress(profile.id, id, false)
            setFollowers(followers + 1)
            setIsFollowing(true)
        }
    }

    return <View style={{ flex: 1 }} includeBackground>
        {id && <BackButton Right={() => {
            return <ShowMoreDialogue user_id={id} />
        }} />}
        <ScrollView contentContainerStyle={[tw`w-12/12 px-4 mt-6 pb-40`]} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchUserInfo} />}>
            {!id && <TouchableOpacity style={tw`justify-end w-12/12 mt-9 items-end`} onPress={() => {
                navigator.navigate('Settings')
            }}>
                <ExpoIcon name='settings' iconName='feather' size={25} color={'gray'} />
            </TouchableOpacity>}
            <View style={tw`flex-row items-center`}>
                <TouchableOpacity onPress={() => {
                        navigator.navigate('Image', { uris: [pic.length > 0 ? pic[0].uri : defaultImage] })
                    }}>
                   <SupabaseImage uri={img || defaultImage} style={tw`w-20 h-20 rounded-full`} />
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
                {!isCurrentUsersProfile && <Spacer />}
            {!isCurrentUsersProfile && <TouchableOpacity onPress={onFollowingPress}>
                <View card={isFollowing} style={tw`${isFollowing ? '' : 'bg-red-600'} items-center justify-center p-3 mx-12 rounded-xl mt-3`}>
                <Text weight='bold'>{isFollowing ? 'Unfollow' : 'Follow'}</Text>
            </View>
                </TouchableOpacity>}
            {isCurrentUsersProfile && <View>
                <TouchableOpacity onPress={() => {
                    navigator.navigate('UserBio')
                }}>
                    <Text style={tw`text-center my-3 text-gray-500`} weight='bold'>Edit Account Info</Text>
                    </TouchableOpacity>
            </View>}
            <Spacer lg/>
            <ManageButton title='Meals' buttonText='See All' onPress={() => {
                const screen = getMatchingNavigationScreen('ListMeal', navigator)
                //@ts-ignore
                navigator.navigate(screen, {userId: props.id || userId})
            }} />
            <Spacer />
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
                    <SupabaseImage uri={meal.preview || defaultImage} style={tw`h-20 w-20 rounded-lg mb-1`} resizeMode='cover' />
                    <Text style={tw`text-xs max-w-20`} weight='semibold'>{substringForLists(meal.name || '')}</Text>
                </TouchableOpacity>
                })}
            </ScrollView>
            <Spacer />
            <ManageButton title='Workouts' buttonText='See All' onPress={() => {
                const screen = getMatchingNavigationScreen('ListWorkout', navigator)
                //@ts-ignore
                navigator.navigate(screen, {userId: props.id || userId})
            }} />
            <Spacer />
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
                        <SupabaseImage uri={workout.image || defaultImage} style={tw`h-20 w-20 rounded-lg`} resizeMode='cover' />
                        <Text style={tw`text-xs max-w-20`} weight='semibold'>{substringForLists(workout.name)}</Text>
                        {/* <Text>{r.calories} kcal</Text> */}
                    </TouchableOpacity>
                })}
            </ScrollView>
            {isCurrentUsersProfile && <View style={{flex: 1}}>
            <Spacer />
            <ManageButton title='Exercises' buttonText='See All' onPress={() => {
                const screen = getMatchingNavigationScreen('ListExercise', navigator)
                //@ts-ignore
                navigator.navigate(screen, {userId: props.id || userId})
            }} />
            <Spacer />
                {exercises.length === 0 && <Text style={tw`text-center my-5`}>No exercises to display</Text>}
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {exercises.map((exercise, i) => {
                    return <TouchableOpacity
                        key={`workout ${exercise.name} at index ${i}`}
                        onPress={() => {
                            const screen = getMatchingNavigationScreen('ExerciseDetail', navigator)
                            //@ts-ignore
                            navigator.navigate(screen, { id: exercise.id })
                        }}
                        style={[tw`items-start px-1`]}>
                        <SupabaseImage uri={exercise.preview || defaultImage} style={tw`h-20 w-20 rounded-lg`} resizeMode='cover' />
                        <Text style={tw`text-xs max-w-20`} weight='semibold'>{substringForLists(exercise.name || '')}</Text>
                        {/* <Text>{r.calories} kcal</Text> */}
                    </TouchableOpacity>
                })}
                </ScrollView>
                <Spacer />
            <ManageButton title='Food' buttonText='See All' onPress={() => {
                const screen = getMatchingNavigationScreen('ListFood', navigator)
                //@ts-ignore
                navigator.navigate(screen, {userId: props.id || userId})
            }} />
            <Spacer />
            {food.length === 0 && <Text style={tw`text-center my-5`}>No food to display</Text>}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {food.map((f, i) => {
                    return <TouchableOpacity
                        key={`workout ${f.name} at index ${i}`}
                        onPress={() => {
                            const screen = getMatchingNavigationScreen('FoodDetail', navigator)
                            //@ts-ignore
                            navigator.navigate(screen, { id: f.id, src: 'backend' })
                        }}
                        style={[tw`items-start px-1`]}>
                        <SupabaseImage uri={f.image || defaultImage} style={tw`h-20 w-20 rounded-lg`} resizeMode='cover' />
                        <Text style={tw`text-xs max-w-20`} weight='semibold'>{substringForLists(f.name || '')}</Text>
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