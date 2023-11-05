import { TouchableOpacity } from 'react-native'
import React from 'react'
import { Text, View } from '../../components/base/Themed'
import { BackButton } from '../../components/base/BackButton'
import { useNavigation } from '@react-navigation/native'
import { AppSetting } from './Settings'
import tw from 'twrnc'
import { ExpoIcon } from '../../components/base/ExpoIcon'
import { useCommonAWSIds } from '../../hooks/useCommonContext'
import { useSignOut } from '../../supabase/auth'
import SaveButton from '../../components/base/SaveButton'

export default function Account() {
    const navigator = useNavigation()
    const {setUserId, signedInWithEmail, setUsername, setSub, setSubscribed, setHasSubscribedBefore, setStatus, setSignedInWithEmail, setUser, setProfile, profile} = useCommonAWSIds()
    let a = useSignOut()
    let emailSettings = signedInWithEmail ?  [{ title: 'Update Email Address', icon: 'mail', screen: 'UpdateEmail' }] : []
    const settings: AppSetting[] = [
        {title: 'Edit Bio', icon: 'edit', screen:'UserBio' },
        ...emailSettings,
        { title: 'Delete Account', icon: 'user-x', screen: 'DeleteAccount' },
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
                    <ExpoIcon name={setting.icon} iconName={setting.iconName || 'feather'} size={setting.size || 20} color='gray' />
                    <Text style={tw`max-w-11/12 ml-3`}>{setting.title}</Text>
                    </View>
                    <ExpoIcon name='chevron-right' iconName={'feather'} size={15} color='gray' />
                </TouchableOpacity>
            })}
                
            </View>
            <SaveButton safeArea title='Sign Out' onSave={async () => {
                    await a.signOut()
                    setUserId('');
                    setUsername('')
                    setUser(null)
                    setProfile(null)
                    setSub('') 
                    setSubscribed(false)
                    setHasSubscribedBefore(false) 
                    setStatus({pt: false, fp: false}) 
                    setSignedInWithEmail(false)
                    // navigator.navigate('GetStarted')
                }} />
        </View>
    )
}