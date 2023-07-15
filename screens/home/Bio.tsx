import { Text, View } from '../../components/Themed'
import React, { useEffect, useLayoutEffect, useState } from 'react'
import { BackButton } from '../../components/BackButton'
import { Keyboard, Pressable, ScrollView, TextInput, TouchableOpacity, useColorScheme } from 'react-native'
import tw from 'twrnc'
import { ActivityIndicator, Avatar } from 'react-native-paper'
import { useNavigation } from '@react-navigation/native'
import { useCommonAWSIds } from '../../hooks/useCommonContext'
import { DataStore, Storage } from 'aws-amplify'
import { Goal, Tier, User } from '../../aws/models'
import * as ImagePicker from 'expo-image-picker'
import { defaultImage, isStorageUri, uploadImageAndGetID, usernameRegex } from '../../data'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ExpoIcon } from '../../components/ExpoIcon'

type TextInputProps = TextInput['props'];
interface TextInputWithLeftProps extends TextInputProps{
    icon?: string;
}

const TextInputWithLeft = (props: TextInputWithLeftProps) => {
    const dm = useColorScheme() === 'dark'
    return <View style={tw`w-12/12 bg-gray-${dm ? '700' : '400'}/50 px-4 py-3 rounded-xl items-center flex-row`}>
        {props.icon && <ExpoIcon style={tw`mr-2`} name={props.icon} iconName='feather' size={25} color='gray' />}
        <TextInput {...props} style={tw`text-${dm ? 'white' : 'black'} max-w-10/12 w-10/12`}/>
    </View>
}

export default function Bio(props: {registration?: boolean;}) {
    const {registration} = props;
    const { userId, username, setUsername, sub, setUserId } = useCommonAWSIds()
    const [newUsername, setNewUsername] = React.useState<string>(username)
    const dm = useColorScheme() === 'dark'
    const navigator = useNavigation()
    const [uploading, setUploading] = useState<boolean>(false)
    const [bio, setBio] = useState<string>('')
    const [links, setLinks] = useState<string[]>()
    const [name, setName] = useState<string|null|undefined>('')
    const [newLink, setNewLink] = useState<string>('')
    const [pic, setPic] = React.useState<string>('')
    const [usernameError, setUsernameError] = useState<string | null>(null)
    useLayoutEffect(() => {
        const prepare = async () => {
            if (!userId || registration) return;
            if (userId && registration) {
                const user = await DataStore.query(User, userId)
                if (!user?.weight || !user.fat) {
                    navigator.navigate('About')
                } else {
                    navigator.navigate('Root')
                }
            }
        }
        prepare()
    }, [])
    useEffect(() => {
        const prepare = async () => {
            if (!registration) {
                const user = await DataStore.query(User, userId)
            if (user) {
                setBio(user.bio || '')
                setName(user.name)
                //@ts-ignore
                setLinks(user.links || [])
                setNewLink(user.links?.[0] || '')
                //@ts-ignore
                setPic(user.picture)
            }
            } 
        }
        prepare()
    }, [])
    const onFinishPress = async () => {
        setUploading(true)
        setUsernameError(null)
        if (!registration) {
            const error = await validateUsername()
            if (error) {
                setUsernameError(error)
                setUploading(false)
                return;
            }
            setUsername(newUsername)
            const picture = await uploadProfileImage()
            const user = await DataStore.query(User, userId)
            if (user) {
                await DataStore.save(User.copyOf(user, x => {
                    x.bio=bio || '';
                    x.links=[newLink];
                    x.name=name;
                    x.username=newUsername;
                    x.picture=picture;
                }))
                //@ts-ignore
                navigator.pop()
            } else {
                setUploading(false)
            }
        } else {
            const error = await validateUsername()
            if (error) {
                setUsernameError(error)
                setUploading(false)
                return;
            }
            const picture = await uploadProfileImage()
            const newUser = await DataStore.save(new User({sub: sub, picture, tier: Tier.FREE, accepted_terms: true, username: newUsername, bio: bio, links: [newLink], name: name, weight: 90, fat: 20, goal: Goal.DEFICIT}))
            setUserId(newUser.id)
            setUsername(newUsername)
            navigator.navigate('RegistrationEdit')
        }
    }

    const validateUsername = async (): Promise<string | null> => {
        if (newUsername === '') return 'You must input a username'
        if (!newUsername.match(usernameRegex)) {
            return 'Your username must be between 4 and 20 characters without special characters. Underscores and periods are allowed once'
        }
        if (username === newUsername) return null;
        const potentialMatches = await DataStore.query(User, u => u.username.eq(newUsername))
            if (potentialMatches.length > 0) {
                return 'This username is already taken'
            } 
            return null
    }

    const uploadProfileImage = async (): Promise<string> => {
        let mediaToUpload = pic
        if (!pic) {
            setPic(defaultImage)
            mediaToUpload = defaultImage
        }
        if (!isStorageUri(mediaToUpload) && mediaToUpload !== defaultImage) {
            mediaToUpload = await uploadImageAndGetID({ type: 'image', uri: pic })
        }
        return mediaToUpload;
    }
    const padding = useSafeAreaInsets()
  return (
    <View includeBackground style={{flex: 1, paddingTop: !registration ? 0 : padding.top }}>
        {!registration && <BackButton />}
        <ScrollView contentContainerStyle={tw`px-6 mt-2`}>
            <Pressable onPress={() => {
                Keyboard.dismiss()
            }}>
            <Text style={tw`text-xl mb-4`} weight='semibold'>Account Information</Text>
            <ProfilePicture uri={pic} onChange={setPic} />
            <Text style={tw`my-4`} weight='semibold'>Name</Text>
            <TextInputWithLeft value={name || ''} icon={'user'} onChangeText={setName} placeholder='Your Name' placeholderTextColor={'gray'} />
            <Text style={tw`mb-4 mt-6`} weight='semibold'>Username</Text>
            <TextInputWithLeft value={newUsername} icon='at-sign' onChangeText={(v) => setNewUsername(v.toLowerCase())} placeholder='@...' placeholderTextColor={'gray'} />
            {usernameError && <Text style={tw`text-red-500 mt-2`}>{usernameError}</Text>}
            <Text style={tw`mb-4 mt-6`} weight='semibold'>Your Bio</Text>
            <TextInputWithLeft value={bio} icon='align-center' onChangeText={setBio} placeholder='This is your bio' placeholderTextColor={'gray'} multiline numberOfLines={3} />
            <Text style={tw`mb-4 mt-6`} weight='semibold'>Website</Text>
            <TextInputWithLeft value={(newLink || '')} icon='compass' onChangeText={setNewLink} placeholder='https://' placeholderTextColor={'gray'} />
            </Pressable>
            <View style={tw`pb-90`} />
        </ScrollView>
        <View style={[
                {
                    position: 'absolute',
                    bottom: 20,
                    flex: 1
                },
                tw`w-12/12`
            ]}>
                {/* Add Food Button */}
                <View style={tw`py-5 w-12/12 items-center px-7 flex-row justify-center`}>
                    <TouchableOpacity disabled={uploading === true} onPress={onFinishPress} style={tw`bg-${dm ? 'red-600' : "red-500"} mr-2 px-9 h-12 justify-center rounded-full`}>
                        {!uploading && <Text numberOfLines={1} style={tw`text-center text-white`} weight='semibold'>Finish</Text>}
                        {uploading && <ActivityIndicator />}
                    </TouchableOpacity>
                </View>
            </View>
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
    {img!! && <Avatar.Image source={{ uri: img }} />}
    <Text style={tw`mt-2`}>Change Image</Text>
</TouchableOpacity>
}