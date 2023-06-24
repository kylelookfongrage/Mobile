import { Text, View } from '../../components/Themed'
import React, { useEffect, useState } from 'react'
import { BackButton } from '../../components/BackButton'
import { Keyboard, Pressable, ScrollView, TextInput, TouchableOpacity, useColorScheme } from 'react-native'
import tw from 'twrnc'
import { ActivityIndicator } from 'react-native-paper'
import { useNavigation } from '@react-navigation/native'
import { useCommonAWSIds } from '../../hooks/useCommonContext'
import { DataStore } from 'aws-amplify'
import { User } from '../../aws/models'

export default function Bio() {
    const {userId} = useCommonAWSIds()
    const dm = useColorScheme() === 'dark'
    const navigator = useNavigation()
    const [uploading, setUploading] = useState<boolean>(false)
    const [bio, setBio] = useState<string>('')
    const [links, setLinks] = useState<string[]>()
    const [name, setName] = useState<string|null|undefined>('')
    const [newLink, setNewLink] = useState<string>('')
    useEffect(() => {
        const prepare = async () => {
            const user = await DataStore.query(User, userId)
            if (user) {
                console.log(user)
                setBio(user.bio || '')
                setName(user.name)
                //@ts-ignore
                setLinks(user.links || [])
                setNewLink(user.links?.[0] || '')
            }
        }
        prepare()
    }, [])
    const onFinishPress = async () => {
        setUploading(true)
        const user = await DataStore.query(User, userId)
            if (user) {
                await DataStore.save(User.copyOf(user, x => {
                    x.bio=bio || '';
                    x.links=[newLink];
                    x.name=name;
                }))
                //@ts-ignore
                navigator.pop()
            } else {
                setUploading(false)
            }
    }
  return (
    <View includeBackground style={{flex: 1}}>
        <BackButton />
        <ScrollView contentContainerStyle={tw`px-6 pt-4`}>
            <Pressable onPress={() => {
                Keyboard.dismiss()
            }}>
            <Text style={tw`text-xl`} weight='semibold'>Account Information</Text>
            <Text style={tw`my-4`} weight='semibold'>Name</Text>
            <TextInput value={name || ''} onChangeText={setName} style={tw`w-12/12 border-gray-500 border-b text-${dm ? 'white' : 'black'}`} placeholder='Your Name' placeholderTextColor={'gray'}/>
            <Text style={tw`mb-4 mt-9`} weight='semibold'>Your Bio</Text>
            <TextInput value={bio} onChangeText={setBio} style={tw`w-12/12 border-gray-500 border-b text-${dm ? 'white' : 'black'}`} placeholder='This is your bio' placeholderTextColor={'gray'} multiline numberOfLines={3} />
            <Text style={tw`mb-4 mt-9`} weight='semibold'>Website</Text>
            <TextInput value={(newLink || '')} onChangeText={setNewLink} style={tw`w-12/12 border-gray-500 border-b text-${dm ? 'white' : 'black'}`} placeholder='https://' placeholderTextColor={'gray'}/>
            </Pressable>
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