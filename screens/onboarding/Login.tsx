import { ScrollView, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Text, SafeAreaView, View } from '../../components/base/Themed'
import tw from 'twrnc'
import { useNavigation } from '@react-navigation/native'
import { useAppleLogin, useAuthListener, useGoogleSignIn } from '../../supabase/auth'
import Spacer from '../../components/base/Spacer'
import { UserQueries } from '../../types/UserDao'
import { supabase } from '../../supabase'
import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as Linking from "expo-linking";
import Button, { SignInButton } from '../../components/base/Button'
import Input from '../../components/base/Input'
import { useDispatch, useSelector } from '../../redux/store'
import { Session } from '@supabase/supabase-js'
import { login, registerProfile } from '../../redux/reducers/auth'



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
  let {profile, user} = useSelector(x => x.auth)
  const [uploading, setUploading] = React.useState(false)
  const navigator = useNavigation()
  let dispatch = useDispatch()
  const [message, setMessage] = useState<string>('')
  const { loginWithGoogle } = useGoogleSignIn()
  const { signInWithApple } = useAppleLogin()
  const dao = UserQueries(false)
  const url = Linking.useURL();
  const [session, setSession] = useState<Session | null | undefined>(null)

  useEffect(() => {
    if (!url || session) return;
    createSessionFromUrl(url).then(x => setSession(x))
  }, [url])



  useAuthListener((e, u) => {
    if (profile) return;
    if (user) return;
    dispatch(login({user: u}))
    dao.fetchProfile(u.id).then(x => {
      if (x?.id) {
        dispatch(registerProfile({profile: x}))
      } else {
        navigator.navigate('Registration')
      }
    })
  })


  const onCreateAccountOrLoginPress = async () => {
    setUploading(true)
    setMessage('')
    try {
      await sendMagicLink(email)
      setMessage('We have sent you an email with a link to sign in, please check your inbox!')
    } catch (error) { //@ts-ignore
      setErrors([error?.toString()])
      setUploading(false)
      return
    }
    setUploading(false)

  }

  return (
    <SafeAreaView includeBackground style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={[tw`px-6`]}>
        <Spacer lg />
        <Text style={tw``} h3 weight='bold'>{'Login or Create Your Free Account'}</Text>
        <Spacer />
        <Text xl weight='thin'>Sign in to access your personalized fitness plans! We will send a sign-in link to your email.</Text>
        <Spacer lg />
        {/* <Text style={tw`text-center text-gray-500`} weight='semibold'>{message}</Text>
        <Spacer /> */}
        <Input iconLeft='Message' info={message} type={'email-address'} onSubmit={onCreateAccountOrLoginPress} name='Email' id='email' value={email} textChange={setEmail} placeholder='Email' />
        <Spacer xl/>
        <Button title='Sign in' pill height={'$5'} disabled={email.length === 0} uploading={uploading} onPress={onCreateAccountOrLoginPress}  />
        <Spacer xl/>
        <View style={tw`flex-row items-center justify-between mt-4 mb-4`}>
          <View style={tw`h-0.5 w-5/12 bg-gray-700/60`} />
          <Text>or</Text>
          <View style={tw`h-0.5 w-5/12 bg-gray-700/60`} />
        </View>
        <Spacer xl/>
       <View style={tw`items-center justify-center`}>
        {['ios', 'macos'].includes(Platform.OS) && <SignInButton onPress={signInWithApple} apple />}
        <Spacer />
        <SignInButton onPress={loginWithGoogle} google/>
       </View>
       <Spacer xl/>
        <Text style={tw`text-xs text-center text-gray-500 mx-6 mt-3`}>By signing in with Email, Apple or Google, you are also agreeing to the Privacy Policy and Terms and Conditions</Text>
        <View style={tw`pb-40`} />
      </ScrollView>
    </SafeAreaView>
  )
}
