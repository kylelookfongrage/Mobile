import { Alert, useColorScheme } from 'react-native'
import React, { useState } from 'react'
import { Text, View } from '../../components/base/Themed'
import { BackButton } from '../../components/base/BackButton'
import tw from 'twrnc'
import { ErrorMessage } from '../../components/base/ErrorMessage'
import { supabase } from '../../supabase'
import SaveButton from '../../components/base/SaveButton'
import { Checkbox } from 'react-native-paper'
import Spacer from '../../components/base/Spacer'
import { useDispatch, useSelector } from '../../redux/store'
import { signOut as _signOut } from '../../redux/reducers/auth'

export default function DeleteAccount() {
  let {profile} = useSelector(x => x.auth)
  let dispatch = useDispatch()
  let signOut = () => dispatch(_signOut())
  const dm = useColorScheme() === 'dark'
  const [errors, setErrors] = React.useState<string[]>([])
  const [uploading, setUploading] = React.useState<boolean>(false)
  const [confirmed, setConfirmed] = useState<boolean>(false)

  async function onPressConfirm() {
    setUploading(true)
    if (!profile) return;
    console.log(profile)
    try {
      let {data, error} = await supabase.from('user').delete().filter('id', 'eq', profile.id)
      console.log(error)
      await supabase.auth.signOut()
      signOut()
      setUploading(false)
    } catch (e) {
      setUploading(false)
      //@ts-ignore
      setErrors([e.message || 'There was a problem deleting your account, please check your connection.'])
    }
  }
  return (
    <View style={{ flex: 1 }} includeBackground>
      <BackButton name='Delete Account' />
      <View style={tw`px-4`}>
        {errors.length > 0 && <View style={tw`mb-4`}>
          <ErrorMessage errors={errors} onDismissTap={() => setErrors([])} />
        </View>}
        <Spacer />
        <Text lg style={tw`pb-2`}>
          Please note that if you delete your account{
            <Text lg style={tw`text-red-500`} weight='bold'> ALL </Text>}
          of your
          {<Text lg style={tw`text-red-500`} weight='semibold'> progress, followers, meals, ingredients, exercises, equiptment, workouts and likes </Text>}
          will be deleted.
        </Text>
        <Text lg > If you are a personal trainer or food professional,
          {<Text lg style={tw`text-red-500`} weight='semibold'> all of your content will be deleted, and all content associated with your account from other users. All unpaid payments will be deleted. </Text>}
          Please only delete your account if you are 100% sure!</Text>
          <Spacer />

        <View key={'accept-terms'} style={tw`flex-row items-center`}>
          <Checkbox.Android status={confirmed ? 'checked' : 'unchecked'} color='red' uncheckedColor='gray' onPress={() => {
            setConfirmed(!confirmed)
          }} />
          <Text style={tw`max-w-10/12 text-gray-500`}>I understand that I am deleting my account</Text>
        </View>
      </View>
      <SaveButton disabled={!confirmed} uploading={uploading} safeArea title='Delete Account' onSave={() => {
        Alert.alert('Are you sure you want to delete your account?', 'This may take some time.', [
          { text: 'Cancel', onPress: () => { } },
          {
            text: 'Delete', onPress: () => {
              // save workout
              onPressConfirm()
            }
          },
        ])
      }} />
    </View>
  )
}