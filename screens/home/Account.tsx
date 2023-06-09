import { TouchableOpacity, useColorScheme } from 'react-native'
import React from 'react'
import { Text, View } from '../../components/Themed'
import { BackButton } from '../../components/BackButton'
import { useNavigation } from '@react-navigation/native'
import { AppSetting } from './Settings'
import { Auth } from 'aws-amplify'
import tw from 'twrnc'
import { ExpoIcon } from '../../components/ExpoIcon'
import { useCommonAWSIds } from '../../hooks/useCommonContext'

export default function Account() {
    const navigator = useNavigation()
    const {setUserId, signedInWithEmail, setUsername, setSub, setSubscribed, setHasSubscribedBefore, setStatus, setSignedInWithEmail} = useCommonAWSIds()
    const dm = useColorScheme() === 'dark'
    const emailSettings = signedInWithEmail ?  [{ title: 'Change Password', icon: 'lock', screen: 'ChangePassword' },
    { title: 'Update Email Address', icon: 'mail', screen: 'UpdateEmail' },] : []
    const settings: AppSetting[] = [
        {title: 'Edit Bio', icon: 'paperclip', screen:'UserBio' },
        ...emailSettings,
        { title: 'Delete Account', icon: 'trash', screen: 'DeleteAccount' },
    ]
    return (
        <View includeBackground style={{flex: 1}}>
            <BackButton name='Manage Account' />
            <View style={tw`px-4 mt-6`}>
            {settings.map((setting, i) => {
                return <TouchableOpacity
                onPress={() => {
                    //@ts-ignore
                    navigator.push(setting.screen, setting.payload || {})
                }}
                 key={i} style={tw`w-12/12 p-2 my-2 flex-row items-center justify-between`}>
                    <View style={tw`flex-row`}>
                    <ExpoIcon name={setting.icon} iconName={setting.iconName || 'feather'} size={setting.size || 25} color='gray' />
                    <Text style={tw`max-w-11/12 ml-3`}>{setting.title}</Text>
                    </View>
                    <ExpoIcon name='chevron-right' iconName={'feather'} size={20} color='gray' />
                </TouchableOpacity>
            })}
                <TouchableOpacity onPress={async () => {
                    await Auth.signOut()
                    setUserId('');
                    setUsername('')
                    setSub('') 
                    setSubscribed(false)
                    setHasSubscribedBefore(false) 
                    setStatus({pt: false, fp: false}) 
                    setSignedInWithEmail(false)
                }} style={tw`mt-9 items-center justify-center mx-6 bg-red-${dm ? '700' : '500'} p-3 rounded-lg`}>
                    <Text>Sign Out</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}