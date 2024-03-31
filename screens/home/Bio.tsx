import { Text, View } from '../../components/base/Themed'
import React, { useState } from 'react'
import { BackButton } from '../../components/base/BackButton'
import { Keyboard, Pressable, ScrollView, TextInput, TouchableOpacity, useColorScheme } from 'react-native'
import tw from 'twrnc'
import { Avatar } from 'react-native-paper'
import { useNavigation } from '@react-navigation/native'
import * as ImagePicker from 'expo-image-picker'
import { defaultImage, isStorageUri } from '../../data'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ExpoIcon } from '../../components/base/ExpoIcon'
import { UserQueries } from '../../types/UserDao'
import { useStorage } from '../../supabase/storage'
import SaveButton from '../../components/base/SaveButton'
import { useDispatch, useSelector } from '../../redux/store'
import { fetchUser } from '../../redux/api/auth'
import Input, { TextArea } from '../../components/base/Input'
import Spacer from '../../components/base/Spacer'
import { useGet } from '../../hooks/useGet'

type TextInputProps = TextInput['props'];
interface TextInputWithLeftProps extends TextInputProps{
    icon?: string;
}

const TextInputWithLeft = (props: TextInputWithLeftProps) => {
    const dm = useColorScheme() === 'dark'
    return <View card style={tw`w-12/12 px-4 py-3 rounded-xl items-center flex-row`}>
        {props.icon && <ExpoIcon style={tw`mr-2`} name={props.icon} iconName='feather' size={25} color='gray' />}
        <TextInput {...props} style={tw`text-${dm ? 'white' : 'black'} max-w-10/12 w-10/12`}/>
    </View>
}

export default function Bio(props: {registration?: boolean;}) {
    const {registration} = props;
    let {profile} = useSelector(x => x.auth)
    let dispatch = useDispatch()
    let setProfile = () => dispatch(fetchUser())
    const [newUsername, setNewUsername] = React.useState<string>(profile?.username || '')
    const dm = useColorScheme() === 'dark'
    const navigator = useNavigation()
    const [uploading, setUploading] = useState<boolean>(false)
    const [bio, setBio] = useState<string>(profile?.bio || '')
    const [name, setName] = useState<string|null|undefined>(profile?.name || '')
    const [newLink, setNewLink] = useState<string>(profile?.links?.[0] || '')
    const [pic, setPic] = React.useState<string>(profile?.pfp || '')
    const [usernameError, setUsernameError] = useState<string | null>(null)
    let dao = UserQueries()
    let g = useGet()
    
    
    const onFinishPress = async () => {
        setUploading(true)
        setUsernameError(null)
        try {
            g.set('loading', true)
            if (!registration) {
                if (!profile) return;
                if (!name) throw Error('You must have a name')
                const error = await dao.validateUsername(newUsername, profile?.username)
                if (error) {
                    setUsernameError(error)
                    throw Error('Username is already taken')
                }
                let res = await dao.update_profile({name: name || '', username: newUsername || profile?.username || '', bio, links: [newLink], pfp: pic}, profile)
                g.set('loading', false)
                if (res) {
                    setUploading(false)
                    setProfile()
                    navigator.pop()
                }
            } 
        } catch (error) {
            setUploading(false)
            g.setFn(p => {
                let og = {...p}
                return {...og, loading: false, error: error?.toString() || 'There was a problem'}
            })
        }
    }

    const padding = useSafeAreaInsets()
  return (
    <View includeBackground style={{flex: 1, paddingTop: !registration ? 0 : padding.top }}>
        {!registration && <BackButton name='My Profile' />}
        <ScrollView contentContainerStyle={tw`px-6 mt-2`} showsVerticalScrollIndicator={false}>
            <Spacer />
            <Pressable onPress={() => {
                Keyboard.dismiss()
            }}>
            {registration && <Text style={tw`text-xl mb-4`} weight='semibold'>Account Information</Text>}
            <ProfilePicture uri={pic} onChange={setPic} />
            <Spacer />
            <Input id='Name' iconLeft='Profile' name='Name' value={name || ''} textChange={setName} placeholder='Your Name...'  />
            <Spacer />
            <Input id='Username' error={usernameError || undefined} iconLeft='Send' name='Username' value={newUsername || ''} textChange={v => setNewUsername(v.toLowerCase())} placeholder='@...'  />
            <Spacer />
            <TextArea value={bio} iconLeft='Document' height={'$12'} textChange={setBio} placeholder='Your bio...' id='Bio' name='Bio' />
            <Spacer />
            <Input id='Links' iconLeft='Discovery' value={newLink || ''} textChange={setNewLink} placeholder='https://....' name='Website' />
            {/* <Text style={tw`my-4`} weight='semibold'>Name</Text>
            <TextInputWithLeft value={name || ''} icon={'user'} onChangeText={setName} placeholder='Your Name' placeholderTextColor={'gray'} /> */}
            {/* <Text style={tw`mb-4 mt-6`} weight='semibold'>Username</Text>
            <TextInputWithLeft value={newUsername} icon='at-sign' onChangeText={(v) => setNewUsername(v.toLowerCase())} placeholder='@...' placeholderTextColor={'gray'} /> */}
            </Pressable>
            <View style={tw`pb-90`} />
        </ScrollView>
        <SaveButton uploading={uploading} onSave={onFinishPress} safeArea />
        
    </View>
  )
}



interface ProfilePicProps{
    uri: string;
    onChange?: (uri: string) => void
    editable?: boolean;
}
export const ProfilePicture = (props: ProfilePicProps) => {
    const {uri, onChange} = props
    const [img, setImg] = React.useState<string | null>(null)
    let s = useStorage()
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
            let newUrl = isStorageUri(img) ? s.constructUrl(img)?.data?.publicUrl : img
            if (newUrl) setImg(newUrl)
        }
        prepare()
    }, [uri])
    return <TouchableOpacity disabled={props.editable === false} onPress={onChangeImagePress} style={tw`items-center justify-center mt-3 w-12/12`}>
    {img!! && <Avatar.Image source={{ uri: img }} />}
    {props.editable !== false && <Text style={tw`mt-2`}>Change Image</Text>}
</TouchableOpacity>
}