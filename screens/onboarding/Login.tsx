import { ScrollView, TextInput, TouchableOpacity, Platform, ActivityIndicator, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Text, SafeAreaView, View } from '../../components/base/Themed'
import tw from 'twrnc'
import { ExpoIcon } from '../../components/base/ExpoIcon'
import useColorScheme from '../../hooks/useColorScheme'
import { useNavigation } from '@react-navigation/native'
import { ErrorMessage } from '../../components/base/ErrorMessage'
import { useCommonAWSIds } from '../../hooks/useCommonContext'
import { Checkbox } from 'react-native-paper'
import { useAppleLogin, useAuthListener, useGoogleSignIn } from '../../supabase/auth'
import Spacer from '../../components/base/Spacer'
import { UserQueries } from '../../types/UserDao'
import { supabase } from '../../supabase'
import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as Linking from "expo-linking";



const redirectTo = makeRedirectUri({scheme: 'ragepersonalhealth'}) + 'Login';
console.log(redirectTo)

const createSessionFromUrl = async (url: string) => {
  const { params, errorCode } = QueryParams.getQueryParams(url);

  if (errorCode) throw new Error(errorCode);
  const { access_token, refresh_token } = params;

  if (!access_token) return;

  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });
  if (error) throw error;
  return data.session;
};

const sendMagicLink = async (email: string) => {
  const { error } = await supabase.auth.signInWithOtp({
    email: email,
    options: {
      emailRedirectTo: redirectTo,
    },
  });

  if (error) throw error;
  // Email sent.
};




export default function Login() {
  const [email, setEmail] = React.useState<string>('')
  const [errors, setErrors] = React.useState<string[]>([])
  const { setSignedInWithEmail, setSub, setUserId, setUsername, setStatus, setProfile, profile } = useCommonAWSIds()
  const [uploading, setUploading] = React.useState(false)
  const dm = useColorScheme() === 'dark'
  const navigator = useNavigation()
  const [user, setUser] = React.useState<any>(null);
  const [message, setMessage] = useState<string>('')
  const dao = UserQueries(false)
  const url = Linking.useURL();
  const [session, setSession] = useState(null)
  useEffect(() => {
    if (!url || session) return;
    createSessionFromUrl(url).then(x => setSession(x))
  }, [url])



  useAuthListener((e, u) => {
    if (profile) return;
    setSignedInWithEmail(u?.app_metadata?.provider === 'email')
    dao.fetchProfile(u.id).then(x => {
      if (x?.id) {
        setUserId(x.id)
        setProfile(x)
      } else {
        navigator.navigate('Registration')
      }
    })
    setSub(u.id)
    setUser(u)
  })


  const onCreateAccountOrLoginPress = async () => {
    setUploading(true)
    setMessage('')
    try {
      await sendMagicLink(email)
      setMessage('We have sent you an email with a link to sign in, please check your inbox!')
    } catch (error) {
      setErrors([error?.toString()])
      setUploading(false)
      return
    }
    setUploading(false)

  }

  
  const [acceptedTerms, setAcceptedTerms] = React.useState<boolean>(false)
  
  

  let disabledButton = uploading || !email

  return (
    <SafeAreaView includeBackground style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={[tw`px-6`]}>
        <View style={tw`mt-9`}>
          {errors.length !== 0 && <ErrorMessage errors={errors} onDismissTap={() => setErrors([])} />}
          <View style={tw`w-12/12 items-center flex-row`}>
            <Text style={tw`text-2xl max-w-7/12 mt-4 mb-6`} weight='semibold'>{'Login or Sign Up to '}{<Text style={tw`text-red-600`} weight='semibold'>Rage</Text>}</Text>
          </View>
        </View>
        <Spacer />
        <Text style={tw`text-center text-gray-500`} weight='semibold'>{message}</Text>
        <Spacer />
        <View card style={tw`w-12/12 flex-row items-center py-3 px-4 justify-between rounded-lg`}>
          <TextInput value={email} onChangeText={setEmail} placeholder='email' keyboardType='email-address' style={tw`w-11/12 text-${dm ? 'white' : 'black'}`} />
          <ExpoIcon name='at-sign' iconName='feather' color={dm ? 'white' : 'gray'} size={20} />
        </View>
        <Spacer xl/>
        <TouchableOpacity
          disabled={disabledButton}
          onPress={() => {
            onCreateAccountOrLoginPress()
          }}
          style={tw`items-center rounded-lg bg-red-600${disabledButton ? '/50' : ""} py-3`}>
          {!uploading && <Text style={tw`text-white`} weight='bold'>Log In</Text>}
          {uploading && <ActivityIndicator />}
        </TouchableOpacity>
        <Spacer xl/>
        <View style={tw`flex-row items-center justify-between mt-9 mb-4`}>
          <View style={tw`h-0.5 w-5/12 bg-gray-700/60`} />
          <Text>or</Text>
          <View style={tw`h-0.5 w-5/12 bg-gray-700/60`} />
        </View>
        <Spacer xl/>
       <View style={tw`items-center justify-center`}>
       {/* <SignInButton email register={!loginMode} emailPress={() => {
          setLoginMode(!loginMode)
        }}/> */}
        {['ios', 'macos'].includes(Platform.OS) && <SignInButton apple />}
        <SignInButton google/>
       </View>
       <Spacer xl/>
        <Text style={tw`text-xs text-center text-gray-500 mx-6 mt-3`}>By signing in with Email, Apple or Google, you are also agreeing to the Privacy Policy and Terms and Conditions</Text>
        <View style={tw`pb-40`} />
      </ScrollView>
    </SafeAreaView>
  )
}




export const SignInButton = (props: { apple?: boolean; google?: boolean; email?: boolean, emailPress?: () => void; register?: boolean; }) => {
  const { loginWithGoogle } = useGoogleSignIn()
  const { signInWithApple } = useAppleLogin()
  const s = Dimensions.get('screen')
  let name = 'Email'
  let bg = 'red-600'
  let icon = 'mail'
  let iconColor = 'white'
  let textColor = 'white'

  let onPress = props.email ? props.emailPress : () => {}
  if (props.apple) {
      bg = 'black'
      name = 'Apple'
      icon = 'logo-apple'
      onPress = signInWithApple
  }
  if (props.google) {
      bg = 'sky-600'
      name = 'Google'
      icon = 'logo-google'
      onPress = loginWithGoogle
  }
  return <TouchableOpacity onPress={onPress} style={[tw`flex-row px-4 items-center justify-between rounded-xl my-2 bg-${bg}`, { width: s.width * 0.80, height: 50 }]}>
      <ExpoIcon iconName={'ion'} name={icon} size={20} color={iconColor} />
      <View>
          <Text weight='semibold' style={tw`text-center text-${textColor} font-semibold`}>{props.email ? (props.register ? 'Login' : 'Sign Up') : 'Continue'} With {name}</Text>
      </View>
      <Text> </Text>
  </TouchableOpacity>
}