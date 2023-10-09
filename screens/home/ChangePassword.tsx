import { TouchableOpacity, useColorScheme, TextInput, ScrollView } from 'react-native'
import React from 'react'
import { Text, View } from '../../components/base/Themed'
import { BackButton } from '../../components/base/BackButton'
import tw from 'twrnc'
import { ErrorMessage } from '../../components/base/ErrorMessage'
import { ExpoIcon } from '../../components/base/ExpoIcon'
import { Auth } from 'aws-amplify'
import { ActivityIndicator } from 'react-native-paper'
import { useNavigation } from '@react-navigation/native'

export default function ChangePassword() {
  const [errors, setErrors] = React.useState<string[]>([])
  const dm = useColorScheme() === 'dark'
  const [oldPassword, setOldPassword] = React.useState<string>('')
  const [showOldPassword, setShowOldPassword] = React.useState<boolean>(false)
  
  const [newPassword, setNewPassword] = React.useState<string>('')
  const [showNewPassword, setShowNewPassword] = React.useState<boolean>(false)

  const [confirmPassword, setConfirmPassword] = React.useState<string>('')
  const [showConfirmPassword, setShowConfirmPassword] = React.useState<boolean>(false)

  const [uploading, setUploading] = React.useState<boolean>(false)
  const navigator = useNavigation()

  async function onPressConfirm() {
    setErrors([])
    setUploading(true)
    if (!oldPassword || !newPassword || !confirmPassword) {
      setErrors(['You must input all information'])
      setUploading(false)
      return;
    }
    if ([oldPassword, newPassword, confirmPassword].filter(x => x.length < 8).length > 0 || [oldPassword, newPassword, confirmPassword].filter(x => x.includes(' ')).length > 0) {
      setErrors(['Your password must be at least 8 characters long and not contain any spaces'])
      setUploading(false)
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors(['Your password and confirm password must match'])
      setUploading(false)
      return;
    }

    try{
      const user = await Auth.currentAuthenticatedUser()
      await Auth.changePassword(user, oldPassword, newPassword)
      setUploading(false)
      alert('Your password has successfully changed!')
      //@ts-ignore
      navigator.pop();
    }catch (e){
      //@ts-ignore
      setErrors([e.message || 'There was a problem'])
      setUploading(false)

    }
  }

  return (
    <View style={{flex: 1}} includeBackground>
      <BackButton name='Back' />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[tw`px-4 mt-9`]}>
        {errors.length > 0 && <ErrorMessage errors={errors} onDismissTap={() => setErrors([])} />}
        <Text style={tw`text-lg mt-4`} weight='bold'>Change Password</Text>
        <Text weight='regular' style={tw`pr-9`}>Please input your old password and confirm your new password!</Text>

        <Text style={tw`mt-4`}>Old Password</Text>
        <View style={tw`w-12/12 mt-2 flex-row items-center py-3 px-4 justify-between bg-gray-${dm ? '700' : '300'} rounded-lg`}>
          <TextInput value={oldPassword} onChangeText={setOldPassword} secureTextEntry={!showOldPassword} placeholder='old password' style={tw`w-11/12 text-${dm ? 'white' : 'black'}`} />
          <TouchableOpacity onPress={() => setShowOldPassword(!showOldPassword)}>
            <ExpoIcon name={showOldPassword ? 'lock' : 'unlock'} iconName='feather' color={dm ? 'white' : 'gray'} size={25} />
          </TouchableOpacity>
        </View>
        <Text style={tw`mt-4`}>New Password</Text>
        <View style={tw`w-12/12 mt-2 flex-row items-center py-3 px-4 justify-between bg-gray-${dm ? '700' : '300'} rounded-lg`}>
          <TextInput value={newPassword} onChangeText={setNewPassword} secureTextEntry={!showNewPassword} placeholder='new password' style={tw`w-11/12 text-${dm ? 'white' : 'black'}`} />
          <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
            <ExpoIcon name={showNewPassword ? 'lock' : 'unlock'} iconName='feather' color={dm ? 'white' : 'gray'} size={25} />
          </TouchableOpacity>
        </View>
        <Text style={tw`mt-4`}>Confirm New Password</Text>
        <View style={tw`w-12/12 mt-2 flex-row items-center py-3 px-4 justify-between bg-gray-${dm ? '700' : '300'} rounded-lg`}>
          <TextInput value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showConfirmPassword} placeholder='new password' style={tw`w-11/12 text-${dm ? 'white' : 'black'}`} />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <ExpoIcon name={showConfirmPassword ? 'lock' : 'unlock'} iconName='feather' color={dm ? 'white' : 'gray'} size={25} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity disabled={uploading} onPress={onPressConfirm} style={tw`mt-9 items-center justify-center bg-red-${dm ? '700' : '500'} p-3 rounded-lg`}>
                    {uploading && <ActivityIndicator />}
                    {!uploading && <Text>Confirm</Text>}
                </TouchableOpacity>
      <View style={tw`pb-90`} />
      </ScrollView>
    </View>
  )
}