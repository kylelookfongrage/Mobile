import { ScrollView, View } from 'react-native'
import React from 'react'
import { Text } from '../../components/Themed'
import { BackButton } from '../../components/BackButton'
import tw from 'twrnc'
import { Expand } from '../../components/Expand'

export default function Help() {
  return (
    <View style={{ flex: 1 }}>
      <BackButton name='Back' />
      <ScrollView showsVerticalScrollIndicator={false} style={tw`px-4 pt-9`}>
        <Text style={tw`text-lg mb-4`} weight='semibold'>Help</Text>
        <Text>Logging & Creating Food</Text>
        <Expand header='Finding a food to log' Component={() => {
          return <View>
            <Text>1. First, press on the floating action button, then select add meal</Text>
            <Text>2. Then you should be able to search for any meal you want, ensure that you don't have spelling mistakes!</Text>
            <Text>3. Press on the food and it should show you the details of the food, press on it and add the quantity!</Text>
            <Text>4. The food should be added to your progress for the day you selected!</Text>
            <Text></Text>
            <Text>Alternatively, you can also find a food using the search functionality of the Food tab, and follow steps 3-4</Text>
          </View>
        }} />
        <Expand header='Creating a food' Component={() => {
          return <View>
            <Text>1. First, press on the food tab on your tab bar, you should see a search bar for food and meals</Text>
            <Text>2. You then should be able to click on the floating action button and press Add Food!</Text>
            <Text>3. Once you pressed on the button, you should be able to see the details of the food, make sure it has a name!</Text>
            <Text>4. Add the food to your progress by pressing the button, you will be able to add the food in the future without having to make it again</Text>
          </View>
        }} />
        <Expand header='Logging Water' Component={() => {
          return <View>
            <Text>1. Go to your home page and find the Water progress tile</Text>
            <Text>2. Increment or decrement the amount of water that you have drunk, these go up by 10oz increments!</Text>
            <Text>3. Please note that your recommended water intake is based off of your  body weight (0.5oz per pound)</Text>
          </View>
        }} />

        <Text style={tw`mt-9`}>Meals & Ingredients</Text>
        <Expand header='Creating your own meal' Component={() => {
          return <View>
            <Text>1. First, press on the floating action button, then select Create Meal</Text>
            <Text>2. Then you should be able to input all steps for your meal, don't forget your name, description and cover image!</Text>
            <Text>3. Press the 'Add Food' button next to your meal, make sure that you add all of the ingredients you need later!</Text>
            <Text>4. Make sure you add your steps to your meal as well! Finish by pressing Save Meal</Text>
          </View>
        }} />
        <Expand header='Creating a meal using AI' Component={() => {
          return <View>
            <Text>1. First, press on the floating action button on your Food Tab, then press Generate Meal </Text>
            <Text>2. You then should be able to generate a meal using AI via your prompt message</Text>
            <Text>3. Once this message has been completed, give your meal a name and finish linking your ingredients from the AI to an actual ingredient from the app!</Text>
            <Text>4. Once you've linked all the ingredients, press the Create Meal button and edit the image, category, and description if you need to. Then save the meal!</Text>
          </View>
        }} />
        <Expand header='Monetize your meals' Component={() => {
          return <View>
            <Text>1. You need to apply as a Food Professional on the app, go to the Apply to be a Personal Trainer or Food Professional page from your settings </Text>
            <Text>2. Fill out the application for your specality, you can become both if approved! Make sure to input some meals that you have made yourself, and agree to the agreement!</Text>
            <Text>3. Once approved, you should be able to mark your new meals as "Premium" from now on</Text>
          </View>
        }} />

        <Text style={tw`mt-9`}>Workouts, Exercises & Equiptment</Text>
        <Expand header='Creating your own exercise with equiptment' Component={() => {
          return <View>
            <Text>1. First, go to the Exercise tab press on the floating action button, then select Create Exercise</Text>
            <Text>2. Input a cover image and any videos you need! Add a description with some helpful steps and pointers!</Text>
            <Text>3. Press the 'Add Equiptment' button, add any equiptment necessary for the exercise; make any equiptment needed directly below the search bar!</Text>
            <Text>4. Finish by pressing Save Exercise</Text>
          </View>
        }} />
        <Expand header='Making a new Workout' Component={() => {
          return <View>
            <Text>1. First, First, go to the Exercise tab press on the floating action button, then select Create Workout </Text>
            <Text>2. You should be able to input all of your information needed for that workout, including it's name, cover image, and description</Text>
            <Text>3. Add some exercises to your workout by pressing the Add Exercises button, then search for the exercise you need!</Text>
            <Text>4. Once exercises are added, you should see the equiptment dynamically populate! Save the workout when completed</Text>
          </View>
        }} />
        <Expand header='Performing a Workout' Component={() => {
          return <View>
            <Text>1. First, find a workout you would like to perform using the Workout Tab's search functionality </Text>
            <Text>2. Click on the workout that you would like to perform, if it is a premium workout, ensure that you are subscribed to the application</Text>
            <Text>3. Start the clock and log each of your set's reps, weight, and completion status for each workout.</Text>
            <Text>4. Once you are done, click Finish!</Text>
          </View>
        }} />
        <Expand header='Performing a Run' Component={() => {
          return <View>
            <Text>1. First, go to your Home tab, then go to Runs and Workouts </Text>
            <Text>2. Click on Start a Run</Text>
            <Text>3. Ensure that the app has permission to track your location activity so that we can track your run!</Text>
            <Text>4. Start the clock and run, walk, or bike using the application to track where you are moving!</Text>
            <Text>4. Once finished, click on Finish to log your progress!</Text>
          </View>
        }} />

        <View style={tw`pb-40`} />
      </ScrollView>
    </View>
  )
}