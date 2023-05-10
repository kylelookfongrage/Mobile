import { ActivityIndicator, TextInput, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native'
import React from 'react'
import { Text } from '../../components/Themed'
import { Auth } from 'aws-amplify'
import { BackButton } from '../../components/BackButton'
import tw from 'twrnc'
import { ExpoIcon } from '../../components/ExpoIcon'
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell } from 'react-native-confirmation-code-field'
import { ErrorMessage } from '../../components/ErrorMessage'
import { useNavigation } from '@react-navigation/native'

export default function UpdateEmail() {
  const dm = useColorScheme() === 'dark'
  const [newEmail, setNewEmail] = React.useState<string>('')
  const navigator = useNavigation()
  
  const [showVerificationCode, setShowVerificaionCode] = React.useState<boolean>(false)
  const [uploading, setUploading] = React.useState<boolean>(false)
  const [errors, setErrors] = React.useState<string[]>([])
  async function onPressConfirm() {
    if (newEmail.length === 0 || !newEmail.includes('@')) {
      setErrors(['Your must input an email'])
      return;
    }
    setErrors([])
    setUploading(true)
    if (!showVerificationCode) {
      try{
        const user = await Auth.currentAuthenticatedUser({bypassCache: true});
        await Auth.updateUserAttributes(user, {
          email: newEmail
        })
        setShowVerificaionCode(true)
        setUploading(false)
        return;
      }catch (e) {
        //@ts-ignore
        setErrors([e.message || 'There was a problem'])
        setUploading(false)
        return;
      }
    } else {
      try{
        await Auth.verifyCurrentUserAttributeSubmit('email', validateCode)
        alert('Your email has been validated!')
        setUploading(false)
        //@ts-ignore
        navigator.pop()
      }catch (e) {
        setUploading(false)
        //@ts-ignore
        setErrors([e.message || 'There was a problem, please check your validation code and internet connection'])
      }
  
    }
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

  return (
    <View>
      <BackButton />
      <View style={tw`px-4 mt-9`}>
        {errors.length > 0 && <View style={tw`mb-4`}>
            <ErrorMessage errors={errors} onDismissTap={() => setErrors([])} />
          </View>}
        <Text style={tw`text-lg`} weight='bold'>Update Email Address</Text>
        <Text style={tw`pr-9 mb-9`}>Please note that if you update your email, you will have to verify a code to fully update your email address.</Text>
        {!showVerificationCode && <View>
          <Text>New Email</Text>
          <View style={tw`w-12/12 mt-2 flex-row items-center py-3 px-4 justify-between bg-gray-${dm ? '700' : '300'} rounded-lg`}>
            <TextInput editable={!showVerificationCode} value={newEmail} onChangeText={setNewEmail} placeholder='email' keyboardType='email-address' style={tw`w-11/12 text-${dm ? 'white' : 'black'}`} />
            <ExpoIcon name='at-sign' iconName='feather' color={dm ? 'white' : 'gray'} size={25} />
          </View>
        </View>}
        {showVerificationCode && <View>
          <Text>Confirm Code sent to {newEmail}</Text>
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
        </View>}
        <TouchableOpacity disabled={uploading} onPress={onPressConfirm} style={tw`mt-9 items-center justify-center bg-red-${dm ? '700' : '500'} p-3 rounded-lg`}>
          {uploading && <ActivityIndicator />}
          {!uploading && <Text>{showVerificationCode ? 'Confirm Code' : 'Change Email'}</Text>}
        </TouchableOpacity>
      </View>
    </View>
  )
}