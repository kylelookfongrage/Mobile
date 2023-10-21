import { ScrollView, TextInput, TouchableOpacity, Platform, StyleSheet, ActivityIndicator, Image, Dimensions } from 'react-native'
import React from 'react'
import { Text, SafeAreaView, View } from '../../components/base/Themed'
import tw from 'twrnc'
import { ExpoIcon } from '../../components/base/ExpoIcon'
import useColorScheme from '../../hooks/useColorScheme'
import { useNavigation } from '@react-navigation/native'
import * as Google from 'expo-auth-session/providers/google'
import { Auth, DataStore, Hub } from 'aws-amplify'
import { ErrorMessage } from '../../components/base/ErrorMessage'
//@ts-ignore
import * as AppleAuthentication from 'expo-apple-authentication';
import jwt_decode from 'jwt-decode'

import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import { useCommonAWSIds } from '../../hooks/useCommonContext'
import { Tier, User } from '../../aws/models'
import { ZenObservable } from 'zen-observable-ts'
import { sleep } from '../../data'
import { Checkbox } from 'react-native-paper'
import { useAppleLogin, useAuthListener, useGoogleSignIn } from '../../supabase/auth'
import Spacer from '../../components/base/Spacer'
import { UserQueries } from '../../types/UserDao'


export default function Login() {
  const [email, setEmail] = React.useState<string>('')
  const [password, setPassword] = React.useState<string>('')
  const [confirmPassword, setConfirmPassword] = React.useState<string>('')
  const [loginMode, setLoginMode] = React.useState<boolean>(false)
  const [showPassword, setShowPassword] = React.useState<boolean>(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState<boolean>(false)
  const [errors, setErrors] = React.useState<string[]>([])
  const [shouldShowValidateCode, setShouldShowValidateCode] = React.useState<boolean>(false)
  const { setSignedInWithEmail, setSub, setUserId, setUsername, setStatus, setProfile } = useCommonAWSIds()
  const [uploading, setUploading] = React.useState(false)
  const dm = useColorScheme() === 'dark'
  const navigator = useNavigation()
  const [user, setUser] = React.useState<any>(null);
  const dao = UserQueries()

  const checkForUser = async () => {
    setUploading(true)
    try {
      const authUser = await Auth.currentAuthenticatedUser()
      if (authUser) {
        setUser(authUser)
      }
    } catch (error) {
      console.log('no user found :(')
    }
    setUploading(false)
  }

  // React.useEffect(() => {
  //   if (!loginMode) return;
  //   if (!email) return
  //   setUploading(true)
  //   Auth.resendSignUp(email).catch(x => {
  //     setErrors(['There was a problem, please try again'])
  //     setShouldShowValidateCode(false)
  //   })
  //   setUploading(false)
  // }, [shouldShowValidateCode])

  useAuthListener((e, u) => {
    setSignedInWithEmail(['apple', 'google'].includes(u?.app_metadata?.provider || ''))
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
    try {
      if (loginMode) {
        if (!password || !email) {
          setUploading(false)
          setErrors(['You must fill out all of the information'])
          return
        }
        // login
      } else {
        if (!password || !email || !confirmPassword) {
          setUploading(false)
          setErrors(['You must fill out all of the information'])
          return
        }
        if (!acceptedTerms) {
          setUploading(false)
          setErrors(['You must accept the terms and conditions, as well as the privacy policy'])
          return
        }
        if (password === confirmPassword) {
          // sign up
        } else {
          setErrors(['Your confirm password does not match'])
          return
        }
      }
    } catch (error) {
      return
    }

  }

  
  const [validateCode, setValidateCode] = React.useState<string>('')
  const [acceptedTerms, setAcceptedTerms] = React.useState<boolean>(false)
  const ref = useBlurOnFulfill({ value: validateCode, cellCount: 6 });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value: validateCode, setValue: setValidateCode
  });

  const styles = StyleSheet.create({
    root: { flex: 1, padding: 20 },
    title: { textAlign: 'center', fontSize: 30 },
    codeFieldRoot: { marginTop: 20 },
    cell: {
      width: 50,
      height: 50,
      lineHeight: 38,
      borderRadius: 10,
      fontSize: 24,
      borderWidth: 2,
      borderColor: dm ? '#880808' : '#F88379',
      color: 'gray',
      textAlign: 'center',
    },
    focusCell: {
      borderColor: dm ? '#ffffff' : '#000',
    },
  });

  async function onPressValidateCode() {
    setUploading(true)
    try {
      await Auth.confirmSignUp(email, validateCode, {})
      await Auth.signIn(email, password)
    } catch (error) {
      setErrors(['The validation code is not correct'])
    }
    setUploading(false)
  }

  if (shouldShowValidateCode) {
    return <SafeAreaView style={tw`px-6`}>
      <TouchableOpacity
        onPress={async () => {
          setErrors([])
          await Auth.signOut()
          setShouldShowValidateCode(false)
        }}
        style={tw`p-3 mt-5 bg-gray-${dm ? '700' : '300'} w-2/12 h-1.5/12 rounded-xl items-center justify-center`}>
        <ExpoIcon name='chevron-left' iconName='feather' color={dm ? 'white' : 'black'} size={20} />
      </TouchableOpacity>
      {errors.length !== 0 && <View style={tw`my-5`}>
        <ErrorMessage errors={errors} onDismissTap={() => setErrors([])} /></View>}
      <View style={tw`mt-10 max-w-10/12`}>
        <Text style={tw`text-2xl`} weight='semibold'>Validation Code</Text>
        <Text>{`Please enter the validation code sent to your email (${email})`}</Text>
      </View>
      <View style={tw`flex-row mt-6 w-12/12`}>
        <TouchableOpacity disabled={uploading} onPress={async () => {
          try {
            setUploading(true)
            await Auth.resendSignUp(email)
            setUploading(false)
          } catch (error) {
            setErrors(['There was a problem, try again later'])
          }
        }} style={tw`p-2 items-center border border-${dm ? 'white' : 'black'} rounded-lg`}>
          <Text>Resend Code</Text>
        </TouchableOpacity>
      </View>
      <View style={tw``}>
        <CodeField
          ref={ref}
          {...props}
          // Use `caretHidden={false}` when users can't paste a text value, because context menu doesn't appear
          cellCount={6}
          value={validateCode}
          onChangeText={setValidateCode}
          rootStyle={styles.codeFieldRoot}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          renderCell={({ index, symbol, isFocused }) => (
            <Text
              key={index}
              style={[styles.cell, isFocused && styles.focusCell, index <= validateCode.length - 1 && tw`text-${dm ? 'white' : 'black'}`]}
              onLayout={getCellOnLayoutHandler(index)}>
              {symbol || (isFocused ? <Cursor /> : null)}
            </Text>
          )}
        />
      </View>
      <View style={tw`w-12/12 items-center justify-center`}>
      <TouchableOpacity disabled={uploading} onPress={onPressValidateCode} style={tw`mt-6 w-5/12 px-6 py-3 rounded-2xl bg-red-${dm ? '700' : '400'} items-center justify-center`}>
        {!uploading && <Text>Validate</Text>}
        {uploading && <ActivityIndicator />}
      </TouchableOpacity>
      </View>
    </SafeAreaView>
  }
  return (
    <SafeAreaView includeBackground style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={[tw`px-6`]}>
        <View style={tw`mt-9`}>
          {errors.length !== 0 && <ErrorMessage errors={errors} onDismissTap={() => setErrors([])} />}
          <View style={tw`w-12/12 items-center flex-row`}>
            <Text style={tw`text-2xl max-w-7/12 mt-4 mb-6`} weight='semibold'>{loginMode ? 'Log in to Rage' : 'Create your free account'}</Text>
          </View>
        </View>
        <Spacer />
        <View style={tw`w-12/12 flex-row items-center py-3 px-4 justify-between bg-gray-${dm ? '700' : '300'} rounded-lg`}>
          <TextInput value={email} onChangeText={setEmail} placeholder='email' keyboardType='email-address' style={tw`w-11/12 text-${dm ? 'white' : 'black'}`} />
          <ExpoIcon name='at-sign' iconName='feather' color={dm ? 'white' : 'gray'} size={20} />
        </View>
        <Spacer />
        <View style={tw`w-12/12 flex-row items-center py-3 px-4 justify-between bg-gray-${dm ? '700' : '300'} rounded-lg`}>
          <TextInput value={password} onChangeText={setPassword} secureTextEntry={!showPassword} placeholder='password' style={tw`w-11/12 text-${dm ? 'white' : 'black'}`} />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <ExpoIcon name={showPassword ? 'lock' : 'unlock'} iconName='feather' color={dm ? 'white' : 'gray'} size={20} />
          </TouchableOpacity>
        </View>
        {loginMode && <View style={tw`w-12/12 flex-row justify-end py-6`}>
          <TouchableOpacity onPress={() => {
            //@ts-ignore
            navigator.push('ForgotPassword')
          }}>
            <Text style={tw`text-red-700`}>Forgot password?</Text>
          </TouchableOpacity>
        </View>}
        <Spacer />
        {!loginMode && <View>
          <View style={tw`w-12/12 flex-row items-center py-3 px-4 justify-between bg-gray-${dm ? '700' : '300'} rounded-lg`}>
            <TextInput value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showConfirmPassword} placeholder='confirm password' style={tw`w-11/12 text-${dm ? 'white' : 'black'}`} />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <ExpoIcon name={showConfirmPassword ? 'lock' : 'unlock'} iconName='feather' color={dm ? 'white' : 'gray'} size={20} />
            </TouchableOpacity>
          </View>
          <View key={'accept-terms'} style={tw`flex-row items-center max-w-12/12 mt-4 mb-4`}>
            <Checkbox.Android status={acceptedTerms ? 'checked' : 'unchecked'} color='red' uncheckedColor='gray' onPress={() => {
                setAcceptedTerms(!acceptedTerms)
            }} />   
            <Text style={tw`max-w-10/12 text-gray-500 text-xs`}>Accept the {<Text style={tw`text-red-500`} weight='semibold'>Terms and Conditions</Text>} and {<Text style={tw`text-red-500`} weight='semibold'>Privacy Policy</Text>}</Text>
        </View>
        </View>}
        <TouchableOpacity
          disabled={uploading}
          onPress={() => {
            onCreateAccountOrLoginPress()
          }}
          style={tw`items-center rounded-lg bg-red-600 py-3`}>
          {!uploading && <Text style={tw`text-white`}>{loginMode ? 'Log in' : 'Create Account'}</Text>}
          {uploading && <ActivityIndicator />}
        </TouchableOpacity>
        <View style={tw`flex-row items-center justify-between mt-9 mb-4`}>
          <View style={tw`h-0.5 w-5/12 bg-gray-700/60`} />
          <Text>or</Text>
          <View style={tw`h-0.5 w-5/12 bg-gray-700/60`} />
        </View>
       <View style={tw`items-center justify-center`}>
       <SignInButton email register={!loginMode} emailPress={() => {
          setLoginMode(!loginMode)
        }}/>
        {['ios', 'macos'].includes(Platform.OS) && <SignInButton apple />}
        <SignInButton google/>
       </View>
        <Text style={tw`text-xs text-center text-gray-500 mx-6 mt-3`}>By signing in with Apple or Google, you are also agreeing to the Privacy Policy and Terms and Conditions</Text>
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