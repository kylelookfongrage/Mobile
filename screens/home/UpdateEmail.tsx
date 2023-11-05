import { ActivityIndicator, TextInput, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Text, View } from '../../components/base/Themed'
import { Auth } from 'aws-amplify'
import { BackButton } from '../../components/base/BackButton'
import tw from 'twrnc'
import { ExpoIcon } from '../../components/base/ExpoIcon'
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell } from 'react-native-confirmation-code-field'
import { ErrorMessage } from '../../components/base/ErrorMessage'
import { useNavigation } from '@react-navigation/native'
import SaveButton from '../../components/base/SaveButton'
import { supabase } from '../../supabase'
import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as Linking from "expo-linking";
import { useCommonAWSIds } from '../../hooks/useCommonContext'
import Spacer from '../../components/base/Spacer'
import { UserQueries } from '../../types/UserDao'


const redirectTo = makeRedirectUri({scheme: 'ragepersonalhealth'}) + 'email';
console.log(redirectTo)

const createSessionFromUrl = async (url: string, cb?: () => void | undefined=undefined) => {
  const { params, errorCode } = QueryParams.getQueryParams(url);

  if (errorCode) throw new Error(errorCode);
  const { access_token, refresh_token } = params;

  if (!access_token) return;

  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });
  if (error) throw error;
  if (cb) {
    cb()
  }
  return data.session;
};

export default function UpdateEmail() {
  const dm = useColorScheme() === 'dark'
  const [newEmail, setNewEmail] = React.useState<string>('')
  const navigator = useNavigation()
  let {user, profile, setProfile} = useCommonAWSIds()
  console.log(profile?.email)
  const [uploading, setUploading] = React.useState<boolean>(false)
  const [oldEmail, setOldEmail] = useState<string>('')
  const [errors, setErrors] = React.useState<string[]>([])
  const [message, setMessage] = useState<string>('')
  const url = Linking.useURL();
  const [session, setSession] = useState(null)
  let dao = UserQueries()

  useEffect(() => {
    if (!url || session) return;
    createSessionFromUrl(url, () => {
      if (!profile) return;
      dao.update_profile({email: newEmail}, profile).then(() => {
        setProfile({...profile, email: newEmail})
        setUploading(false)
        alert('Your email has been changed!')
        navigator.pop()
      })
    }).then(x => setSession(x)).then()
  }, [url])

  async function onPressConfirm() {
    setMessage('')
    if (oldEmail !== profile?.email?.toLowerCase()) {
      setErrors(['Your current email is not correct'])
      return;
    }
    if (newEmail.length === 0 || !newEmail.includes('@')) {
      setErrors(['Your must input an email'])
      return;
    }
    if (newEmail.toLowerCase() === profile?.email?.toLowerCase()) {
      setErrors(['You already have this username in place'])
      return;
    }
    try {
      await supabase.auth.updateUser({email: newEmail}, {emailRedirectTo: redirectTo})
      setMessage('We have sent an email to your new email address, please confirm to solidify the change.')
      // navigator.pop()
    } catch (error) {
      setErrors([error.toString()])
    }
    setErrors([])
    setUploading(true)
   
  }

  

  return (
    <View style={{flex: 1}} includeBackground>
      <BackButton />
      <View style={tw`px-4 mt-9`}>
        {errors.length > 0 && <View style={tw`mb-4`}>
            <ErrorMessage errors={errors} onDismissTap={() => setErrors([])} />
          </View>}
        <Text style={tw`text-lg`} weight='bold'>Update Email Address</Text>
        <Spacer />
        <Text style={tw`text-center text-gray-500`} weight='semibold'>{message}</Text>
        <Spacer />
        <Text>Old Email</Text>
          <View card style={tw`w-12/12 mt-2 flex-row items-center py-3 px-4 justify-between rounded-lg`}>
            <TextInput value={oldEmail} onChangeText={setOldEmail} placeholder='email' keyboardType='email-address' style={tw`w-11/12 text-${dm ? 'white' : 'black'}`} />
            <ExpoIcon name='at-sign' iconName='feather' color={dm ? 'white' : 'gray'} size={25} />
          </View>
        <Spacer />
        <Text>New Email</Text>
          <View card style={tw`w-12/12 mt-2 flex-row items-center py-3 px-4 justify-between rounded-lg`}>
            <TextInput value={newEmail} onChangeText={setNewEmail} placeholder='email' keyboardType='email-address' style={tw`w-11/12 text-${dm ? 'white' : 'black'}`} />
            <ExpoIcon name='at-sign' iconName='feather' color={dm ? 'white' : 'gray'} size={25} />
          </View>
      </View>
      <SaveButton safeArea uploading={uploading} onSave={onPressConfirm} title='Change Email' />
    </View>
  )
}