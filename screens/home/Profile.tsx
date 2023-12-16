import { ScrollView, TouchableOpacity, RefreshControl, Pressable } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import { Text, View } from '../../components/base/Themed'
import tw from 'twrnc'
import useColorScheme from '../../hooks/useColorScheme';
import { ExpoIcon, Icon } from '../../components/base/ExpoIcon';
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
import { useSelector } from '../../redux/store';
import { XStack, YStack } from 'tamagui';
import TopBar from '../../components/base/TopBar';
import { ProfilePicture } from './Bio';
import { _tokens } from '../../tamagui.config';
import Button, { IconButton } from '../../components/base/Button';
import Description from '../../components/base/Description';
import Tag from '../../components/base/Tag';
import SearchResult from '../../components/base/SearchResult';




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
    let {profile} = useSelector(x => x.auth)
    let userId = profile?.id
    const [img, setImg] = useState<string | null>(null)
    const [workouts, setWorkouts] = React.useState<Tables['workout']['Row'][]>([])
    const [exercises, setExercises] = React.useState<Tables['exercise']['Row'][]>([])
    const [food, setFood] = React.useState<Tables['food']['Row'][]>([])
    const [meals, setMeals] = React.useState<Tables['meal']['Row'][]>([])
    let [plans, setPlans] = useState<Tables['fitness_plan']['Row'][]>([])
    const [bio, setBio] = React.useState<string | null | undefined>('')
    const [profileLink, setProfileLink] = React.useState<string>('')
    const isCurrentUsersProfile = id === userId || !id
    const navigator = useNavigation()
    let dao = UserQueries()


    React.useEffect(() => {
        fetchUserInfo()

    }, [])

    useEffect(() => {
        if (props.id || !profile) return;
        setBio(profile.bio)
        setName(profile.name)
        setProfileName(profile.username)
        setProfileLink(profile.links?.[0] || '')
    }, [profile])

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
            setPlans(children.fitness_plan)
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

    let options = {
        'Plans' : plans, 
        'Workouts' : workouts,
        'Meals' : meals,
        'Exercises': exercises,
        'Food' : food
    }

    let [selectedOption, setSelectedOption] = useState<string>(Object.keys(options)[0])
    let screen = useMemo(() => {
        switch (selectedOption) {
            case 'Plans':
                return ['FitnessPlan']
            case 'Workouts':
                return ['WorkoutDetail']
            case 'Meals':
                return ['MealDetail']
            case 'Exercises':
                return ['ExerciseDetail']
            case 'Food':
                return ['FoodDetail']
            default:
                return ['FitnessPlan']
        }
    }, [selectedOption])

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

    return <View includeBackground safeAreaTop style={{flex: 1}}>
        <Spacer />
        <TopBar title='Trainer Profile' iconLeftOnPress={props.id ? () => navigator.goBack() : undefined} iconLeft={props.id ? 'Arrow---Left' : 'Profile'} iconLeftWeight={props.id ? 'light' : 'bold'} iconLeftColor={props.id ? (dm ? _tokens.white : _tokens.black) : undefined} Right={() => {
            if (id) {
                return <ShowMoreDialogue user_id={id} />
            }
            return <TouchableOpacity style={tw``} onPress={() => {
                navigator.navigate('Settings')
            }}>
                <Icon name='Setting' size={25} color={dm ? 'white' : 'black'} />
            </TouchableOpacity>
        }} />
        <Spacer />
        <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchUserInfo} />} showsVerticalScrollIndicator={false}>
            <ProfilePicture uri={img || defaultImage} editable={false} />
            <Spacer />
            <Text style={tw`text-center`} h5 weight='bold'>{name}</Text>
            <Spacer xs/>
            <Text style={{...tw`text-center`, color: _tokens.gray500}}>@{profileName}</Text>
            {profileLink && <Spacer xs/>}
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
                    <Text style={tw`text-red-500 px-6 text-center`} weight='semibold'>{profileLink}</Text>
                </TouchableOpacity>}
                {bio && <Spacer xs />}
            {bio && <Description style={tw`px-6 text-center`} value={bio} placeholder='' editable={false} />}
            <Spacer />
            <XStack justifyContent='space-evenly' alignItems='center'>
                <YStack justifyContent='center' alignItems='center'>
                    <Text h4 weight='bold'>{followers}</Text>
                    <Spacer xs />
                    <Text>   Rating   </Text>
                </YStack>
                <YStack width={'$0.25'} height={'$2'} borderRadius={'$2'} backgroundColor={dm ? _tokens.gray900 : _tokens.gray300} />
                <YStack justifyContent='center' alignItems='center'>
                    <Pressable onPress={() => {
                        const screen = getMatchingNavigationScreen('Subscribees', navigator)
                        //@ts-ignore
                        navigator.push(screen, { to: props.id || userId })
                    }}>
                    <Text h4 weight='bold' style={tw`text-center`}>{formatCash(followers)}</Text>
                    <Spacer xs/>
                    <Text style={tw`text-center`}>Followers</Text>
                    </Pressable>
                </YStack>
                <YStack width={'$0.25'} height={'$2'} borderRadius={'$2'} backgroundColor={dm ? _tokens.gray900 : _tokens.gray300} />
                <YStack justifyContent='center' alignItems='center'>
                    <Pressable onPress={() => {
                        const screen = getMatchingNavigationScreen('Subscribees', navigator)
                        //@ts-ignore
                        navigator.push(screen, { from: props.id || userId })
                    }}>
                    <Text h4 weight='bold' style={tw`text-center`}>{formatCash(following)}</Text>
                    <Spacer xs/>
                    <Text style={tw`text-center`}>Following</Text>
                    </Pressable>
                </YStack>
            </XStack>
            <Spacer lg/>
            <XStack alignItems='center' justifyContent='center'>
                <Button pill width={'60%'} 
                    onPress={isCurrentUsersProfile ? () => navigator.navigate('UserBio') : onFollowingPress} 
                    title={!isCurrentUsersProfile ? (isFollowing ? 'Unsubscribe' : 'Subscribe') : "Edit Profile"} 
                    type={!isCurrentUsersProfile ? (isFollowing ? 'outline' : 'primary') : 'light'} />
                <Spacer horizontal lg />
                <IconButton iconName='Send' circle size={'$4'} type='dark' />
            </XStack>
            <Spacer xl/>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{minHeight: 50, ...tw`mx-2`}}>
            {Object.keys(options).map(x => {
                let selected = selectedOption === x
                return <TouchableOpacity key={x} style={tw`mr-2`} onPress={() => setSelectedOption(x)}>
                <Tag type={selected ? 'primary' : 'light'} color={selected ? 'primary900' : 'gray500'}>{x}</Tag>
            </TouchableOpacity>
            })}
            </ScrollView>
            <Spacer sm />
            {/* @ts-ignore */}
            {options[selectedOption].length === 0 && <Text lg weight='semibold' style={tw`text-center text-gray-500 mt-6`}>No {selectedOption.toLowerCase()} to display</Text>}
            {/* @ts-ignore */}
            {(options[selectedOption].length >0 && screen[1]) && <YStack paddingHorizontal={'$3'}>
                <Spacer />
                <ManageButton title={selectedOption} buttonText='See All' onPress={() => {
                    if (!screen[1]) return;
                let s = getMatchingNavigationScreen(screen[1], navigator)
                //@ts-ignore
                if (s) navigator.navigate(s, {userId: profile?.id})
            }} />
            <Spacer />
                </YStack>}
            {/* @ts-ignore */}
            {options[selectedOption].map(x => {
                return <SearchResult style={tw`px-3 flex-row items-center`} key={x.id} name={x.title || x.name} img={x.img || x.preview || x.image || defaultImage} onPress={() => {
                    if (!screen[0]) return;
                    let s = getMatchingNavigationScreen(screen[0], navigator)
                    //@ts-ignore
                    navigator.navigate(s, {id: x.id, src: 'backend'})


                }} />
            })}
            <View style={tw`h-90`} />
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