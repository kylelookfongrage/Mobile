import { TouchableOpacity } from 'react-native'
import React from 'react'
import { Text, View } from '../../components/base/Themed'
import { BackButton } from '../../components/base/BackButton'
import { useNavigation } from '@react-navigation/native'
import { AppSetting, SettingItem } from './Settings'
import tw from 'twrnc'
import { ExpoIcon } from '../../components/base/ExpoIcon'
import { useSignOut } from '../../supabase/auth'
import SaveButton from '../../components/base/SaveButton'
import { useDispatch, useSelector } from '../../redux/store'
import { signOut } from '../../redux/reducers/auth'

export default function Account() {
    const navigator = useNavigation()
    let {signedInWithEmail, profile} = useSelector(x => x.auth)
    let dispatch = useDispatch()
    let a = useSignOut()
    let emailSettings = signedInWithEmail ?  [{ title: 'Update Email Address', screen: 'UpdateEmail' }] : []
    const settings: AppSetting[] = [
        { title: 'Update Goal', screen: 'Setup' },
        ...emailSettings,
        { title: 'Delete Account', dangerous: true, description: 'Permanently remove your account and data from Rage. Proceed with caution.', screen: 'DeleteAccount' },
    ]
    return (
        <View includeBackground style={{flex: 1}}>
            <BackButton name='Manage Account' />
            <View style={tw`px-4 mt-6`}>
            {settings.map((setting, i) => {
                return <SettingItem setting={setting} key={i} />
            })}
                
            </View>
            <SaveButton safeArea title='Sign Out' onSave={async () => {
                    await a.signOut()
                    dispatch(signOut())
                }} />
        </View>
    )
}