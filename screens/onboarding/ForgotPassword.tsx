import { ActivityIndicator, ScrollView, TextInput, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native'
import React from 'react'
import { Text, View } from '../../components/base/Themed'
import tw from 'twrnc'
import { BackButton } from '../../components/base/BackButton'
import { ExpoIcon } from '../../components/base/ExpoIcon'
import { ErrorMessage } from '../../components/base/ErrorMessage'
import { Auth } from 'aws-amplify'
import { useNavigation } from '@react-navigation/native'
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell } from 'react-native-confirmation-code-field'

export default function ForgotPassword() {
    const dm = useColorScheme() === 'dark'
    const [email, setEmail] = React.useState<string>('')
    const [password, setPassword] = React.useState<string>('')
    const [showPassword, setShowPassword] = React.useState<boolean>(false)
    const [confirmPassword, setConfirmPassword] = React.useState<string>('')
    const [showConfirmPassword, setShowConfirmPassword] = React.useState<boolean>(false)
    const [uploading, setUploading] = React.useState<boolean>(false)
    const [showVerificationCode, setShowVerificationCode] = React.useState<boolean>(false);
    const [code, setCode] = React.useState<string>('')
    const [errors, setErrors] = React.useState<string[]>([])
    const navigator = useNavigation()

    const ref = useBlurOnFulfill({ value: code, cellCount: 6 });
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({
      value: code, setValue: setCode
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
  
    async function onPressConfirm() {
        setErrors([])
        if (!email || !password || !confirmPassword) {
            setErrors(['You must input all information'])
            return
        }
        if (password !== confirmPassword) {
            setErrors(['Your confirm password must match your password'])
            return
        }
        if ([email, password, confirmPassword].filter(x => x.includes(' ')).length !== 0) {
            console.log([email, password, confirmPassword])
            setErrors(['Your emails or password cannot contain spaces'])
            return
        }
        setUploading(true)
        if (!showVerificationCode) {
            try {
                await Auth.forgotPassword(email)
                setShowVerificationCode(true)
                setUploading(false)
                return;
            } catch (e) {
                //@ts-ignore
                setErrors([e.message || 'There was a problem, please make sure that you have the right email address'])
                setUploading(false)
                return;
            }
        } else {
            try {
                await Auth.forgotPasswordSubmit(email, code, password)
                alert('Your password was successfully changed')
                //@ts-ignore
                navigator.pop()
            } catch (e) {
                //@ts-ignore
                setErrors([e.message || 'There was a problem, please make sure that you have the right code'])
                setUploading(false)
                return;
            }
        }
    }
    
    return (
        <View style={{ flex: 1 }} includeBackground>
            <BackButton />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={tw`px-4 mt-9`}>
                {errors.length > 0 && <View style={tw`pb-6`}>
                    <ErrorMessage errors={errors} onDismissTap={() => setErrors([])} />
                </View>}
                <Text weight='semibold' style={tw`text-lg mb-2`}>Forgot Password</Text>
                {!showVerificationCode && <View>
                    <Text style={tw`pr-9 pb-12`}>Please input your email and confirm your new password, you'll be sent a verification code. Please make sure your password is at least 8 characters.</Text>
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

                    <Text style={tw`mt-4`}>Confirm Password</Text>
                    <View style={tw`w-12/12 mt-2 flex-row items-center py-3 px-4 justify-between bg-gray-${dm ? '700' : '300'} rounded-lg`}>
                        <TextInput value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showConfirmPassword} placeholder='password' style={tw`w-11/12 text-${dm ? 'white' : 'black'}`} />
                        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                            <ExpoIcon name={showConfirmPassword ? 'lock' : 'unlock'} iconName='feather' color={dm ? 'white' : 'gray'} size={25} />
                        </TouchableOpacity>
                    </View>
                   </View>}
                {showVerificationCode && <View>
                    <TouchableOpacity onPress={() => setShowVerificationCode(!showVerificationCode)} style={tw`p-4 flex-row items-center`}>
                        <ExpoIcon name='chevron-left' iconName='feather' size={20} color={'gray'} />
                        <Text>Go Back</Text>
                    </TouchableOpacity>
                    <View style={tw`px-4`}>

                        <Text>Please input the validation code sent to {email}</Text>
                        <CodeField
                            ref={ref}
                            {...props}
                            // Use `caretHidden={false}` when users can't paste a text value, because context menu doesn't appear
                            cellCount={6}
                            value={code}
                            onChangeText={setCode}
                            rootStyle={styles.codeFieldRoot}
                            keyboardType="number-pad"
                            textContentType="oneTimeCode"
                            renderCell={({ index, symbol, isFocused }) => (
                                <Text
                                    key={index}
                                    style={[styles.cell, isFocused && styles.focusCell, index <= code.length - 1 && tw`text-${dm ? 'white' : 'black'}`]}
                                    onLayout={getCellOnLayoutHandler(index)}>
                                    {symbol || (isFocused ? <Cursor /> : null)}
                                </Text>
                            )}
                        />
                    </View>
                </View>}
                <TouchableOpacity
                        disabled={uploading}
                        onPress={onPressConfirm}
                        style={tw`items-center rounded-lg bg-red-700 mt-6 py-3`}>
                        {!uploading && <Text style={tw`text-white`}>{showVerificationCode ? 'Confirm' : 'Send Email'}</Text>}
                        {uploading && <ActivityIndicator />}
                    </TouchableOpacity>
                <View style={tw`pb-90`} />
            </ScrollView>
        </View>
    )
}