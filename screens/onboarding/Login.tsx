import { ScrollView, TextInput, TouchableOpacity, View, Platform, StyleSheet, ActivityIndicator, Image } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text } from '../../components/Themed'
import tw from 'twrnc'
import { ExpoIcon } from '../../components/ExpoIcon'
import useColorScheme from '../../hooks/useColorScheme'
import { useNavigation } from '@react-navigation/native'
import * as Google from 'expo-auth-session/providers/google'
import { Auth, DataStore, Hub } from 'aws-amplify'
import { ErrorMessage } from '../../components/ErrorMessage'
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


export default function Login() {
  const [email, setEmail] = React.useState<string>('')
  const [password, setPassword] = React.useState<string>('')
  const [confirmPassword, setConfirmPassword] = React.useState<string>('')
  const [loginMode, setLoginMode] = React.useState<boolean>(false)
  const [showPassword, setShowPassword] = React.useState<boolean>(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState<boolean>(false)
  const [errors, setErrors] = React.useState<string[]>([])
  const [shouldShowValidateCode, setShouldShowValidateCode] = React.useState<boolean>(false)
  const { setSignedInWithEmail, setSub, setUserId, setUsername, setStatus } = useCommonAWSIds()
  const [uploading, setUploading] = React.useState(false)
  const dm = useColorScheme() === 'dark'
  const navigator = useNavigation()

  const [shouldRefreshUser, setShouldRefreshUser] = React.useState<boolean>(false)

  const [user, setUser] = React.useState<any>(null);
  React.useEffect(() => {
    Auth.currentAuthenticatedUser().then(x => {
      setUser(x)
    }).catch(x => console.log('user not found'))
  }, [shouldRefreshUser])

  React.useEffect(() => {
    if (!user) return;
    setUploading(true)
    const currentSub = user.attributes.sub
    setSub(currentSub)
    if (user.attributes.identities) {
      setSignedInWithEmail(false)
    } else {
      setSignedInWithEmail(true)
    }
    const subscripton = DataStore.observeQuery(User, u => u.sub.eq(currentSub)).subscribe(ss => {
      const { items, isSynced } = ss;
      if (isSynced) {
        const us = items
        if (us[0]) {
          setUserId(us[0].id)
          setUsername(us[0].username)
          setStatus({pt: us[0].personalTrainer || false, fp: us[0].foodProfessional || false})
        } else {
          navigator.navigate('Registration')
        }
      }
    })
    setUploading(false)
    return () => subscripton.unsubscribe()
  }, [user])

  React.useEffect(() => {
    if (!loginMode) return;
    if (!email) return
    setUploading(true)
    Auth.resendSignUp('lookfongkyle@gmail.com').catch(x => {
      setErrors(['There was a problem, please try again'])
      setShouldShowValidateCode(false)
    })
    setUploading(false)
  }, [shouldShowValidateCode])

  React.useEffect(() => {
    const listener = async (data: any) => {
      switch (data.payload.event) {
        case 'signIn':
          setShouldRefreshUser(!shouldRefreshUser)
          break;
        case 'signIn_failure':
          if (data.payload.data.message.includes('Incorrect')) {
            setErrors(['Please check your credentials and try again'])
          } else if (data.payload.data.message.includes('confirmed')) {
            setShouldShowValidateCode(true)
          } else {
            setErrors([data.payload.data.message || 'There was a problem please try again'])
          }
          break;
        case 'signUp':
          setShouldShowValidateCode(true)
          break;
        case 'signUp_failure':
          setErrors([data.payload.data.message || 'There was a problem please try again'])
        case 'confirmSignUp':
          break;
        case 'forgotPassword':
          console.log('password recovery initiated');
          break;
        case 'forgotPassword_failure':
          console.log('password recovery failed');
          break;
        case 'forgotPasswordSubmit':
          console.log('password confirmation successful');
          break;
        case 'forgotPasswordSubmit_failure':
          console.log('password confirmation failed');
          break;
        case 'parsingCallbackUrl':
          console.log('Cognito Hosted UI OAuth url parsing initiated');
          break;
        case 'signOut':
          setSub('')
          setUserId('')
          setUsername('')
          break;
        case 'autoSignIn':
          setShouldRefreshUser(!shouldRefreshUser)
      }
      setUploading(false)
    };

    Hub.listen('auth', listener);

  }, [])
  React.useEffect(() => {
    if (uploading) {
      setErrors([])
    }
  }, [uploading])

  const onCreateAccountOrLoginPress = async () => {
    setUploading(true)
    try {
      if (loginMode) {
        if (!password || !email) {
          setUploading(false)
          setErrors(['You must fill out all of the information'])
          return
        }
        Auth.signIn(email, password).catch(x => { return })
      } else {
        if (!password || !email || !confirmPassword) {
          setUploading(false)
          setErrors(['You must fill out all of the information'])
          return
        }
        if (password === confirmPassword) {
          Auth.signUp({
            username: email,
            password: password,
            attributes: {
              email: email, name: email
            },
            autoSignIn: { // optional - enables auto sign in after user is confirmed
              enabled: true,
            },
          }).catch(x => { return })
        } else {
          setErrors(['Your confirm password does not match'])
          return
        }
      }
    } catch (error) {
      return
    }

  }


  const [request, response, promptAsync] = Google.useIdTokenAuthRequest(
    {
      clientId: '1011458459335-64j3b75rn4o0tjtpn9kucvu6d72693mg.apps.googleusercontent.com',
      redirectUri: 'https://google.com'
    },
  );


  const onGoogleButtonPress = async () => {
    setUploading(true)
    try {
      //@ts-ignore
      await Auth.federatedSignIn({ provider: 'Google' })
    } catch (error) {
      //@ts-ignore
      setErrors([error.toString()])
      setUploading(false)
    }
    setUploading(false)

  }
  const [validateCode, setValidateCode] = React.useState<string>('')
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

  function onPressValidateCode() {
    setUploading(true)
    Auth.confirmSignUp(email, validateCode).then(x => {
    }).catch(e => {
      setErrors(['The validation code is not correct'])
    })
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
      <View style={tw`flex-row justify-end w-12/12`}>
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
      <TouchableOpacity disabled={uploading} onPress={onPressValidateCode} style={tw`mt-6 rounded bg-red-${dm ? '700' : '400'} items-center justify-center py-2`}>
        {!uploading && <Text>Validate</Text>}
        {uploading && <ActivityIndicator />}
      </TouchableOpacity>
    </SafeAreaView>
  }
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={[tw`px-6`]}>
        <View style={tw`mt-9`}>
          {errors.length !== 0 && <ErrorMessage errors={errors} onDismissTap={() => setErrors([])} />}
          <View style={tw`w-12/12 items-center flex-row`}>
            <Text style={tw`text-2xl max-w-7/12 mt-4 mb-6`} weight='semibold'>{loginMode ? 'Log in to Rage' : 'Create your free account'}</Text>
          </View>
        </View>
        <Text>Email</Text>
        <View style={tw`w-12/12 mt-2 flex-row items-center py-3 px-4 justify-between bg-gray-${dm ? '700' : '300'} rounded-lg`}>
          <TextInput value={email} onChangeText={setEmail} placeholder='email' keyboardType='email-address' style={tw`w-11/12 text-${dm ? 'white' : 'black'}`} />
          <ExpoIcon name='at-sign' iconName='feather' color={dm ? 'white' : 'gray'} size={25} />
        </View>

        <Text style={tw`mt-4`}>Password</Text>
        <View style={tw`w-12/12 mt-2 flex-row items-center py-3 px-4 justify-between bg-gray-${dm ? '700' : '300'} rounded-lg`}>
          <TextInput value={password} onChangeText={setPassword} secureTextEntry={!showPassword} placeholder='password' style={tw`w-11/12 text-${dm ? 'white' : 'black'}`} />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <ExpoIcon name={showPassword ? 'lock' : 'unlock'} iconName='feather' color={dm ? 'white' : 'gray'} size={25} />
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
        {!loginMode && <View>
          <Text style={tw`mt-4`}>Confirm Password</Text>
          <View style={tw`w-12/12 mt-2 mb-9 flex-row items-center py-3 px-4 justify-between bg-gray-${dm ? '700' : '300'} rounded-lg`}>
            <TextInput value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showConfirmPassword} placeholder='confirm password' style={tw`w-11/12 text-${dm ? 'white' : 'black'}`} />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <ExpoIcon name={showConfirmPassword ? 'lock' : 'unlock'} iconName='feather' color={dm ? 'white' : 'gray'} size={25} />
            </TouchableOpacity>
          </View>
        </View>}
        <TouchableOpacity
          disabled={uploading}
          onPress={() => {
            onCreateAccountOrLoginPress()
          }}
          style={tw`items-center rounded-lg bg-red-700 py-3`}>
          {!uploading && <Text style={tw`text-white`}>{loginMode ? 'Log in' : 'Create Account'}</Text>}
          {uploading && <ActivityIndicator />}
        </TouchableOpacity>
        <View style={tw`flex-row items-center justify-between mt-9 mb-4`}>
          <View style={tw`h-0.5 w-5/12 bg-gray-700/60`} />
          <Text>or</Text>
          <View style={tw`h-0.5 w-5/12 bg-gray-700/60`} />
        </View>
        {['ios', 'macos'].includes(Platform.OS) && <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={5}
          style={tw`w-12/12 h-12 rounded-xl border border-${dm ? 'white' : 'black'}`}
          onPress={async () => {
            setUploading(true)
            try {
              //@ts-ignore
              await Auth.federatedSignIn({provider: 'SignInWithApple'})
            } catch (error) {
              //@ts-ignore
              setErrors([error.toString()])
              setUploading(false)
            }
            setUploading(false)
          }}
        />}
        <TouchableOpacity onPress={onGoogleButtonPress} style={tw`w-12/12 mt-3 flex-row items-center border border-${dm ? 'white' : 'gray-500'} rounded-xl py-3 px-4`}>
          <ExpoIcon name='logo-google' iconName='ion' size={25} color={dm ? 'white' : 'black'} />
          <Text style={tw`ml-6`}>Continue with Google</Text>
        </TouchableOpacity>
        <View style={tw`pb-40`} />
      </ScrollView>
      <TouchableOpacity
        onPress={() => setLoginMode(!loginMode)}
        style={[tw`items-center flex-row w-12/12 pb-15 pt-3 bg-${dm ? 'black' : 'gray-200'} justify-center`, {
          position: 'absolute', bottom: 0
        }]}>
        <Text>{loginMode ? "Don't have an account? " : 'Already have an account? '}</Text>
        <Text style={tw`text-red-700`} weight='semibold'>{loginMode ? 'Register' : 'Log in'}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}