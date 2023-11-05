import { TouchableOpacity, useColorScheme, TextInput, ScrollView } from 'react-native'
import React from 'react'
import { Text, View } from '../../components/base/Themed'
import { BackButton } from '../../components/base/BackButton'
import tw from 'twrnc'
import { ErrorMessage } from '../../components/base/ErrorMessage'
import { ExpoIcon } from '../../components/base/ExpoIcon'
import { useNavigation } from '@react-navigation/native'
import Spacer from '../../components/base/Spacer'
import SaveButton from '../../components/base/SaveButton'
import { supabase } from '../../supabase'

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
    // if (!oldPassword || !newPassword || !confirmPassword) {
    //   setErrors(['You must input all information'])
    //   setUploading(false)
    //   return;
    // }
    if ([newPassword, confirmPassword].filter(x => x.length < 8).length > 0 || [newPassword, confirmPassword].filter(x => x.includes(' ')).length > 0) {
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
      await supabase.auth.updateUser({password: newPassword})
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
        <Text weight='regular' style={tw`pr-9`}>Please input your new password!</Text>

        {/* <Spacer lg/>
        <Text>Old Password</Text>
        <Spacer sm />
        <View card style={tw`w-12/12 mt-2 flex-row items-center py-3 px-4 justify-between rounded-lg`}>
          <TextInput value={oldPassword} onChangeText={setOldPassword} secureTextEntry={!showOldPassword} placeholder='old password' style={tw`w-11/12 text-${dm ? 'white' : 'black'}`} />
          <TouchableOpacity onPress={() => setShowOldPassword(!showOldPassword)}>
            <ExpoIcon name={showOldPassword ? 'lock' : 'unlock'} iconName='feather' color={dm ? 'white' : 'gray'} size={25} />
          </TouchableOpacity>
        </View> */}
        <Spacer lg/>
        <Text>New Password</Text>
        <Spacer sm />
        <View card style={tw`w-12/12 mt-2 flex-row items-center py-3 px-4 justify-between rounded-lg`}>
          <TextInput value={newPassword} onChangeText={setNewPassword} secureTextEntry={!showNewPassword} placeholder='new password' style={tw`w-11/12 text-${dm ? 'white' : 'black'}`} />
          <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
            <ExpoIcon name={showNewPassword ? 'lock' : 'unlock'} iconName='feather' color={dm ? 'white' : 'gray'} size={25} />
          </TouchableOpacity>
        </View>
        <Spacer lg/>
        <Text>Confirm New Password</Text>
        <Spacer sm />
        <View card style={tw`w-12/12 mt-2 flex-row items-center py-3 px-4 justify-between rounded-lg`}>
          <TextInput value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showConfirmPassword} placeholder='new password' style={tw`w-11/12 text-${dm ? 'white' : 'black'}`} />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <ExpoIcon name={showConfirmPassword ? 'lock' : 'unlock'} iconName='feather' color={dm ? 'white' : 'gray'} size={25} />
          </TouchableOpacity>
        </View>
      <View style={tw`pb-90`} />
      </ScrollView>
      <SaveButton disabled={!newPassword || !confirmPassword}  safeArea title='Confirm' uploading={uploading} onSave={onPressConfirm} />
    </View>
  )
}