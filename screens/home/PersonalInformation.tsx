import { TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native'
import React from 'react'
import { ExpoIcon } from '../../components/ExpoIcon'
import { Text, View } from '../../components/Themed'
import tw from 'twrnc'
import { Avatar } from 'react-native-paper'
import { defaultImage, isStorageUri, titleCase, uploadImageAndGetID } from '../../data'
import { useNavigation } from '@react-navigation/native'
import { ErrorMessage } from '../../components/ErrorMessage'
import useColorScheme from '../../hooks/useColorScheme'
import { Ruler } from '../../components/Ruler'
import { getTdee } from './Profile'
import { Goal, Tier, User } from '../../aws/models'
import { useCommonAWSIds } from '../../hooks/useCommonContext'
import { DataStore, Storage } from 'aws-amplify'
import * as ImagePicker from 'expo-image-picker'
import { BackButton } from '../../components/BackButton'

interface PersonalInformationProps {
    registration?: boolean
}

export default function PersonalInfoScreen(props: PersonalInformationProps) {
    const { registration } = props;
    const { userId, username, setUsername, sub, setUserId } = useCommonAWSIds()
    const [pic, setPic] = React.useState<string>('')
    const [errors, setErrors] = React.useState<string[]>([])
    const navigator = useNavigation()
    const dm = useColorScheme() === 'dark'
    const [initialWeight, setInitialWeight] = React.useState<number>(70)
    const [weight, setWeight] = React.useState<number>(70)
    const [initialFat, setInitialFat] = React.useState<number>(30)
    const [fat, setFat] = React.useState<number>(30)
    const [goal, setGoal] = React.useState<Goal | "DEFICIT" | "MAINTENANCE" | "SURPLUS">(Goal.DEFICIT)
    const [newUsername, setNewUsername] = React.useState<string>(username)
    const [uploading, setUploading] = React.useState<boolean>(false)

    const tdee = getTdee(goal, weight, fat)

    React.useEffect(() => {
        if (!userId || registration) return;
        if (userId && registration) {
            navigator.navigate('Root')
        }
        const fetchUserDetails = async () => {
            const user = await DataStore.query(User, userId)
            if (!user) return;
            setPic(user.picture || '')
            setInitialWeight(user.weight)
            setWeight(user.weight)
            setInitialFat(user.fat)
            setFat(user.fat)
            setGoal(user.goal)
        }
        fetchUserDetails()
    }, [])

    React.useEffect(() => {
        if (errors.length > 0) setUploading(false)
    }, [errors])

    const onPressSaveProfile = async () => {
        let mediaToUpload = pic
        if (newUsername == '') {
            setErrors(['You must have a username'])
            return
        }
        if (!pic) {
            setPic(defaultImage)
            mediaToUpload = defaultImage
        }
        const re = /^(?=[a-zA-Z0-9._]{4,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/
        if (!newUsername.match(re)) {
            setErrors(['Your username must be between 4 and 20 characters without special characters. Underscores and periods are allowed once'])
            return;
        }
        setUploading(true)
        if (!username || username !== newUsername) {
            const potentialMatches = await DataStore.query(User, u => u.username.eq(newUsername))
            if (potentialMatches.length > 0) {
                setErrors(['The username is already taken'])
                return;
            }
        }
        if (!isStorageUri(mediaToUpload) && mediaToUpload !== defaultImage) {
            mediaToUpload = await uploadImageAndGetID({ type: 'image', uri: pic })
        }
        if (registration) {
            const newUser = new User({ sub: sub, username: newUsername, weight: weight, fat: fat, goal: goal, picture: mediaToUpload, tier: Tier.FREE, accepted_terms: true })
            await DataStore.save(newUser)
            setUserId(newUser.id)
            setUsername(newUser.username)            
            return;
        }
        const originalUser = await DataStore.query(User, userId)
        if (!originalUser) {
            setErrors(['There was a problem, please try again'])
            return
        }
        await DataStore.save(User.copyOf(originalUser, x => {
            x.picture = mediaToUpload;
            x.weight = weight;
            x.fat = fat;
            x.goal = goal;
            x.username = newUsername;
        }))
        setUsername(newUsername)
        //@ts-ignore
        navigator.pop()
        setUploading(false)
    }
    return (
        <View style={[{ flex: 1 }]} includeBackground>
            <BackButton name='My Info'/>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={tw`px-4`}>
                {errors.length !== 0 &&
                    <View style={tw`mt-2 mb-4`}>
                        <ErrorMessage errors={errors} onDismissTap={() => setErrors([])} />
                    </View>}

                <ProfilePicture uri={pic} onChange={setPic} />

                <Text style={tw`text-lg pt-4 pb-1`} weight='semibold'>Username</Text>
                <View style={tw`px-6 py-4 bg-gray-${dm ? '700' : '300'} flex-row items-center justify-between rounded-2xl`}>
                    <TextInput
                        style={tw`w-10/12 font-bold  text-${dm ? 'white' : "black"} `}
                        value={newUsername}
                        placeholder={'My username is...'}
                        placeholderTextColor={'gray'}
                        onChangeText={(x) => setNewUsername(x.toLowerCase())}
                    />
                    <ExpoIcon name='user' iconName='feather' size={20} color={dm ? 'white' : "black"} />
                </View>
                <Text style={tw`text-lg pt-4`} weight='semibold'>Body Fat</Text>
                <Ruler initial={initialFat} min={3} max={60} unit='%' onChange={setFat} />
                <Text style={tw`text-lg pt-3`} weight='semibold'>Weight</Text>
                <Ruler initial={initialWeight} min={70} max={300} unit='lbs' onChange={setWeight} />
                <View style={tw`flex-row items-center justify-between pt-5`}>
                    <Text style={tw`text-lg`} weight='semibold'>Goal</Text>
                    <Text>{tdee} kcal Limit</Text>
                </View>
                <Text style={tw`text-center text-gray-500 my-2`}>Your total calorie limit (TDEE) is based on your weight, body fat percentage, and goal. This limit cannot be lower than 1400kcal a day, for safety :).</Text>
                <View style={tw`pt-3`}>
                    {[{name: 'deficit', desc: 'Lose weight by eating less calories than your maintenance'}, {name: 'maintenance', desc: 'Maintain your body weight by eating the appropriate amout of calories'}, {name: 'surplus', desc: 'Gain weight by eating above your maintenance calories.'}].map((g, i) => {
                        const selected = goal.toLowerCase() === g.name
                        const isSelectedTextColor = selected ? 'text-white' : ''
                        return <TouchableOpacity
                            // @ts-ignore
                            onPress={() => setGoal(g.name.toUpperCase())}
                            key={`goal at ${i}`}
                            style={tw`bg-${selected ? 'red-700' : dm ? 'gray-700' : 'gray-300'} my-2 px-4 rounded-lg py-3`} >
                            <Text weight={selected ? 'bold' : 'regular'} style={tw`${isSelectedTextColor}`}>{titleCase(g.name)}</Text>
                            <Text weight={selected ? 'bold' : 'regular'} style={tw`${isSelectedTextColor} text-xs`}>{g.desc}</Text>
                        </TouchableOpacity>
                    })}
                </View>
                <View style={tw`py-5 w-12/12 mt-4 items-center px-7 flex-row justify-center`}>
                    <TouchableOpacity
                        disabled={uploading}
                        onPress={() => {
                            onPressSaveProfile()
                        }}
                        style={tw`bg-${dm ? 'red-600' : "red-500"} mr-2 px-5 h-12 justify-center rounded-full`}>
                        {!uploading && <Text numberOfLines={1} style={tw`text-center text-white`} weight='semibold'>Save Profile</Text>}
                        {uploading && <ActivityIndicator />}
                    </TouchableOpacity>
                </View>
                <View style={tw`pb-40`} />
            </ScrollView>
        </View>
    )
}

interface ProfilePicProps{
    uri: string;
    onChange: (uri: string) => void
}
export const ProfilePicture = (props: ProfilePicProps) => {
    const {uri, onChange} = props
    const [img, setImg] = React.useState<string | null>(null)
    const currentMediaPermissions = ImagePicker.useMediaLibraryPermissions()
    const onChangeImagePress = async () => {
        const fetchImage = async () => {
            try {
                const res = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    aspect: [9, 16],
                    allowsEditing: true,
                    quality: 1,
                })
                if (res && res.assets && res.assets.length > 0) {
                     setImg(res.assets[0].uri)
                     onChange && onChange(res.assets[0].uri)
                } else {
                    return
                }
            } catch (error) {
                alert('There was a problem getting your picture, please try again')
                return
            }    
        }
        if (currentMediaPermissions[0]?.granted) {
            await fetchImage()
        } else {
            ImagePicker.requestMediaLibraryPermissionsAsync().then(async x => {
                if (x.granted) {
                    await fetchImage()
                } else {
                    alert('We need your permission to access your camera roll')
                }
            }).catch(x => {
                alert('We need your permission to access your camera roll')
                return;
            })
        }
    }
    React.useEffect(() => {
        const prepare = async () => {
            let img = uri || defaultImage
            setImg(isStorageUri(img) ? await Storage.get(img) : img)
        }
        prepare()
    }, [uri])
    return <TouchableOpacity onPress={onChangeImagePress} style={tw`items-center justify-center mt-3 w-12/12`}>
    {img && <Avatar.Image source={{ uri: img }} />}
    <Text style={tw`mt-2`}>Change Image</Text>
</TouchableOpacity>
}