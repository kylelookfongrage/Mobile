import { ActivityIndicator, Alert, TouchableOpacity, useColorScheme } from 'react-native'
import React from 'react'
import { Text, View } from '../../components/Themed'
import { BackButton } from '../../components/BackButton'
import tw from 'twrnc'
import { ErrorMessage } from '../../components/ErrorMessage'
import { Auth, DataStore, Predicates } from 'aws-amplify'
import { 
  Follower, FoodProgress, Ingredient, Meal, MealProgress, Progress, 
  WorkoutDetails, ExerciseEquiptmentDetail, Exercise, 
  WorkoutPlayDetail, WorkoutPlay, Application, Favorite, User, RunProgress, Workout, LazyWorkoutPlay, LazyWorkoutPlayDetail, Equiptment 
} from '../../aws/models'
import { useCommonAWSIds } from '../../hooks/useCommonContext'

export default function DeleteAccount() {
  const {userId, setUserId} = useCommonAWSIds()
  const dm = useColorScheme() === 'dark'
  const [errors, setErrors] = React.useState<string[]>([])
  const [uploading, setUploading] = React.useState<boolean>(false)

  async function onPressConfirm(){
    setUploading(true)
    try{
      await DataStore.delete(FoodProgress, f => f.userID.eq(userId))
      await DataStore.delete(MealProgress, mp => mp.userID.eq(userId))
      await DataStore.delete(Follower, f => f.or(x => [x.subscribedFrom.eq(userId), f.userID.eq(userId)]))
      await DataStore.delete(Ingredient, i => i.userID.eq(userId))

      const meals = await DataStore.delete(Meal, m => m.userID.eq(userId))
      await DataStore.delete(WorkoutPlayDetail, m => m.userID.eq(userId))
      await DataStore.delete(WorkoutPlay, wo => wo.userID.eq(userId))
      await DataStore.delete(WorkoutDetails, wo => wo.userID.eq(userId))
      await DataStore.delete(ExerciseEquiptmentDetail, e => e.userID.eq(userId))
      await DataStore.delete(Exercise, e => e.userID.eq(userId))
      const workouts = await DataStore.delete(Workout, wo => wo.userID.eq(userId))
      await DataStore.delete(RunProgress, r => r.userID.eq(userId))
      await DataStore.delete(Progress, p => p.userID.eq(userId))
      await DataStore.delete(Application, x => x.userID.eq(userId))
      await DataStore.delete(Favorite, f => f.userID.eq(userId))
      await DataStore.delete(User, userId)

      // delete all associated data for the meals, workouts, exercises for that user
      for (var meal of meals) {
        await DataStore.delete(MealProgress, mp => mp.mealID.eq(meal.id))
      }

      let wPlaysToDelete: LazyWorkoutPlayDetail[] = [] 
      for (var workout of workouts) {
        const deletedWPDetail = await DataStore.delete(WorkoutPlayDetail, wo => wo.workoutID.eq(workout.id))
        wPlaysToDelete = [...wPlaysToDelete, ...deletedWPDetail]
      }
      
      for (var workoutPlay of wPlaysToDelete) {
        await DataStore.delete(WorkoutPlay, x => x.id.eq(workoutPlay.workoutplayID))
      }
      
      
      await Auth.deleteUser()
      alert('Your account has officially been deleted')
      await Auth.signOut()
      //@ts-ignore
      setUserId(null)
      setUploading(false)
    }catch (e) {
      setUploading(false)
      //@ts-ignore
      setErrors([e.message || 'There was a problem deleting your account, please check your connection.'])
    }
  }
  return (
    <View style={{flex: 1}} includeBackground>
      <BackButton />
      <View style={tw`px-4`}>
        {errors.length > 0 && <View style={tw`mb-4`}>
          <ErrorMessage errors={errors} onDismissTap={() => setErrors([])} />
        </View>}
        <Text style={tw`text-lg mt-9`} weight='bold'>Delete Account</Text>
        <Text style={tw`pb-2`}>
          Please note that if you delete your account{
            <Text style={tw`text-red-500`} weight='bold'> ALL </Text>} 
            of your 
            {<Text style={tw`text-red-500`} weight='semibold'> progress, followers, meals, ingredients, exercises, equiptment, workouts and likes </Text>}
            will be deleted.
          </Text>
          <Text style={tw`pb-9`}> If you are a personal trainer or food professional, 
            {<Text style={tw`text-red-500`} weight='semibold'> all of your content will be deleted, and all content associated with your account from other users. However, we will make an account of monies owed as of today and will still pay out this amount. </Text>}
            Please only delete your account if you are 100% sure!</Text>
          <TouchableOpacity disabled={uploading} onPress={() => {
            Alert.alert('Are you sure you want to delete your account?', 'This may take some time.', [
            { text: 'Cancel', onPress: () => { } },
            {
              text: 'Delete', onPress: () => {
                  // save workout
                  onPressConfirm()
              }
          },
            ])
          }} style={tw`mt-9 items-center justify-center bg-red-${dm ? '700' : '500'} p-3 rounded-lg`}>
          {uploading && <ActivityIndicator />}
          {!uploading && <Text>Delete Account</Text>}
        </TouchableOpacity>
      </View>
    </View>
  )
}