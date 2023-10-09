import { useColorScheme, Image } from 'react-native'
import React from 'react'
import { Text, View } from '../../components/base/Themed'
import { BackButton } from '../../components/base/BackButton'
import { FoodProgress, Meal, MealProgress, User } from '../../aws/models'
import { DataStore, Storage } from 'aws-amplify'
import { useCommonAWSIds } from '../../hooks/useCommonContext'
import { defaultImage, getMacrosFromIngredients, getMatchingNavigationScreen } from '../../data'
import { ScrollView, Swipeable, TouchableOpacity } from 'react-native-gesture-handler'
import tw from 'twrnc'
import { useNavigation } from '@react-navigation/native'
import { AnimatedCircularProgress } from 'react-native-circular-progress'
import { getTdee } from './Profile'
import { Colors, ProgressBar } from 'react-native-paper'
import { ExpoIcon } from '../../components/base/ExpoIcon'
import { MealProgressDisplay, useProgressValues } from '../../hooks/useProgressValues'
import { categoryMapping } from '../diet/ListFood'
import ThisAdHelpsKeepFree from '../../components/features/ThisAdHelpsKeepFree'
import { ProgressDao } from '../../types/ProgressDao'
import SupabaseImage from '../../components/base/SupabaseImage'

export default function SummaryFoodList() {
    const { progressId, userId, profile } = useCommonAWSIds()
    const { food, meals, carbGoal, fatGoal, proteinGoal, presetMacros } = useProgressValues({ foodAndMeals: true, metrics: true })
    const totalCalories = profile?.tdee || 2000
    const dm = useColorScheme() === 'dark'
    const dao = ProgressDao()
    const [food_progress, meal_progress] = [dao.foodProgress, dao.mealProgress]
    let ingredients = meal_progress.map(x => (x.meal)).flatMap(x => x.meal_ingredients)
    const caloriesFromFoodAndMeals = food_progress.reduce((prev, c) => prev + (c.calories || 0), 0) + ingredients.reduce((prev, curr) => prev + (curr.calories || 0), 0)
    const proteinFromFoodAndMeals = food_progress.reduce((prev, c) => prev + (c.protein || 0), 0) + ingredients.reduce((prev, curr) => prev + (curr.protein || 0), 0)
    const carbsFromFoodAndMeals = food_progress.reduce((prev, c) => prev + (c.carbs || 0), 0) + ingredients.reduce((prev, curr) => prev + (curr.carbs || 0), 0)
    const fatFromFoodAndMeals = food_progress.reduce((prev, c) => prev + (c.fat || 0), 0) + ingredients.reduce((prev, curr) => prev + (curr.fat || 0), 0)
  
    const navigator = useNavigation()

    const totalProteinGrams = proteinGoal || (totalCalories * 0.4) / 4
    const totalFatGrams = fatGoal || (totalCalories * 0.3) / 9
    const totalCarbsGrams = carbGoal || (totalCalories * 0.3) / 4
    const cpRef = React.useRef<AnimatedCircularProgress | null>(null)
    const proteinRef = React.useRef<AnimatedCircularProgress | null>(null)
    const carbsRef = React.useRef<AnimatedCircularProgress | null>(null)
    const fatRef = React.useRef<AnimatedCircularProgress | null>(null)
    React.useEffect(() => {
        cpRef.current?.animate((caloriesFromFoodAndMeals / totalCalories) * 100, 800)
        proteinRef.current?.animate((totalProteinGrams ? proteinFromFoodAndMeals / totalProteinGrams : 0) * 100, 800)
        carbsRef.current?.animate((totalCarbsGrams ? carbsFromFoodAndMeals / totalProteinGrams : 0) * 100, 800)
        fatRef.current?.animate((totalFatGrams ? fatFromFoodAndMeals / totalProteinGrams : 0) * 100, 800)

    }, [caloriesFromFoodAndMeals, totalCalories])
    return (
        <View style={{ flex: 1 }} includeBackground>
            <BackButton name='Food and Meals' />
            <ScrollView style={tw`px-4 mt-4`} showsVerticalScrollIndicator={false}>
                <View card style={[tw`w-12/12 h-90 shadow-xl rounded-lg items-center justify-evenly`]}>
                    <Text style={tw`text-lg mt-3`} weight='semibold'>Daily Macros</Text>
                    {presetMacros && <Text style={tw`text-gray-500`} weight='semibold'>{presetMacros} Diet</Text>}
                    <AnimatedCircularProgress
                        size={170}
                        width={6}
                        rotation={270}
                        fill={0}
                        arcSweepAngle={180}
                        lineCap='round'
                        tintColor="#D22B2B"
                        backgroundColor={!dm ? '#C0C0C0': '#808080'}
                        ref={cpRef}
                    >
                        {
                            (fill) => (
                                <View style={tw`items-center -mt-9`}>
                                    <View style={tw`flex-row items-center`}>
                                        <Text style={tw`text-lg`} weight='semibold'>{Math.round(caloriesFromFoodAndMeals).toFixed()}{<Text style={tw`text-xs`} weight='semibold'>kcal</Text>}</Text>
                                    </View>
                                    <Text>consumed</Text>
                                </View>
                            )
                        }
                    </AnimatedCircularProgress>
                    <View style={tw`flex-row items-center justify-around w-12/12 -mt-12 mb-4`}>
                        <View>
                        <AnimatedCircularProgress
                            size={80}
                            width={3}
                            rotation={0}
                            fill={0}
                            lineCap='round'
                            tintColor="#F17112"
                            backgroundColor={!dm ? '#B2BEB5' : '#B2BEB5'}
                            ref={proteinRef}
                        >
                            {
                                (fill) => (
                                    <View style={tw`items-center`}>
                                        <View style={tw`flex-row items-center`}>
                                            <Text h3>{Math.round(proteinFromFoodAndMeals).toFixed()}</Text>
                                            <Text xs>g</Text>
                                        </View>
                                        <Text xs>{fill.toFixed()}%</Text>
                                    </View>
                                )
                            }
                        </AnimatedCircularProgress>
                        <Text style={tw`text-center mt-4`} weight='semibold'>Protein</Text>
                        </View>
                        <View>
                        <AnimatedCircularProgress
                            size={80}
                            width={3}
                            rotation={0}
                            fill={0}
                            lineCap='round'
                            tintColor="#0FC40F"
                            backgroundColor={!dm ? '#B2BEB5' : '#B2BEB5'}
                            ref={carbsRef}
                        >
                            {
                                (fill) => (
                                    <View style={tw`items-center`}>
                                        <View style={tw`flex-row items-center`}>
                                            <Text h3>{Math.round(carbsFromFoodAndMeals).toFixed()}</Text>
                                            <Text xs>g</Text>
                                        </View>
                                        <Text xs>{fill.toFixed()}%</Text>
                                    </View>
                                )
                            }
                        </AnimatedCircularProgress>
                        <Text style={tw`text-center mt-4`} weight='semibold'>Carbs</Text>
                        </View>
                        <View>
                        <AnimatedCircularProgress
                            size={80}
                            width={3}
                            rotation={0}
                            fill={0}
                            lineCap='round'
                            tintColor="#E8BC19"
                            backgroundColor={!dm ? '#B2BEB5' : '#B2BEB5'}
                            ref={fatRef}
                        >
                            {
                                (fill) => (
                                    <View style={tw`items-center`}>
                                        <View style={tw`flex-row items-center`}>
                                            <Text h3>{Math.round(fatFromFoodAndMeals).toFixed()}</Text>
                                            <Text xs>g</Text>
                                        </View>
                                        <Text xs>{fill.toFixed()}%</Text>
                                    </View>
                                )
                            }
                        </AnimatedCircularProgress>
                        <Text style={tw`text-center mt-4`} weight='semibold'>Fat</Text>
                        </View>
                    </View>
                </View>

                <View style={tw`flex-row items-center justify-between mt-4`}>
                    <Text style={tw`text-lg`} weight='semibold'>Food</Text>
                    <TouchableOpacity style={tw`py-4`} onPress={() => {
                        const screen = getMatchingNavigationScreen('ListFood', navigator)
                        //@ts-ignore
                        navigator.navigate(screen, { progressId: progressId })
                    }}>
                        <Text style={tw`text-red-500`} weight='semibold'>Add Food</Text>
                    </TouchableOpacity>
                </View>
                {food_progress.length === 0 && <Text style={tw`text-center my-6`}>There is no food to display, add some!</Text>}
                {food_progress.map(ingr => {
                    return <Swipeable renderRightActions={() => {
                        return <View style={tw`flex items-center justify-center ml-2`}>
                            <TouchableOpacity onPress={async () => {
                        }} style={[tw`items-center my-2 justify-center p-4 rounded-lg bg-red-${dm ? '700' : '300'}`]}>
                            <ExpoIcon name='x' iconName='feather' size={20} color='gray' />
                            <Text>Delete</Text>
                        </TouchableOpacity>
                        </View>
                    }} key={ingr.id}>
                        <View
                            card
                            style={tw`w-12/12 my-2 flex-row justify-between items-center rounded-2xl py-4 px-3`}>
                            <TouchableOpacity onPress={() => {
                                const screen = getMatchingNavigationScreen('FoodDetail', navigator)
                                //@ts-ignore
                                navigator.navigate(screen, { id: ingr.id, editable: true, src: 'backend', progressId: progressId, img: ingr.img })
                            }} style={tw`flex-row items-center`}>
                                {ingr.food.image && <SupabaseImage uri={ingr.food.image} style='items-center justify-center h-12 w-12 rounded-lg' />}
                                {(!ingr.food.image) && <View style={[tw`items-center h-12 w-12 rounded-lg justify-center ${dm ? 'bg-gray-400' : 'bg-gray-200'}`]}>
                                    {/* @ts-ignore */}
                                    <Text style={tw`text-2xl`}>{categoryMapping['generic foods']}</Text>
                                    </View>}
                                <View style={tw`ml-2 max-w-10/12`}>
                                    <Text weight='semibold' style={tw`mb-1`}>{ingr.food.name}</Text>
                                    <View style={tw`flex-row items-center`}>
                                        <Text style={tw`pr-2 text-gray-500`}>{(ingr.food.calories || 0).toFixed()}kcal</Text>
                                        <Text style={tw`px-2 text-gray-500`}>P: {(ingr.food.protein || 0).toFixed()}g</Text>
                                        <Text style={tw`px-2 text-gray-500`}>C: {(ingr.food.carbs || 0).toFixed()}g</Text>
                                        <Text style={tw`px-2 text-gray-500`}>F: {(ingr.food.fat || 0).toFixed()}g</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                            <ExpoIcon style={tw``} name='chevron-right' iconName='feather' size={20} color={dm ? 'white' : 'black'} />
                        </View>
                    </Swipeable>
                })}

                <View style={tw`flex-row items-center justify-between mt-4`}>
                    <Text style={tw`text-lg`} weight='semibold'>Meals</Text>
                    <TouchableOpacity style={tw`py-4`} onPress={() => {
                        const screen = getMatchingNavigationScreen('ListMeal', navigator)
                        //@ts-ignore
                        navigator.navigate(screen, { progressId: progressId })
                    }}>
                        <Text style={tw`text-red-500`} weight='semibold'>Add Meals</Text>
                    </TouchableOpacity>
                </View>
                {meal_progress.length === 0 && <Text style={tw`text-center my-6`}>There are no meals to display, add one!</Text>}
                {meal_progress.map((ingr, i) => {//@ts-ignore
                    const r = getMacrosFromIngredients(ingr.meal.meal_ingredients)
                    
                    return <Swipeable renderRightActions={() => {
                        return <View style={tw`flex items-center justify-center ml-2`}>
                            <TouchableOpacity onPress={async () => {
                        }} style={[tw`items-center my-2 justify-center p-4 rounded-lg bg-red-${dm ? '700' : '300'}`]}>
                            <ExpoIcon name='x' iconName='feather' size={20} color='gray' />
                            <Text>Delete</Text>
                        </TouchableOpacity>
                        </View>
                    }} key={ingr.id + `${i}`}>
                        <View
                            card
                            style={tw`w-12/12 my-2 flex-row justify-between items-center  rounded-2xl py-4 px-3`}>
                            <TouchableOpacity onPress={() => {
                                const screen = getMatchingNavigationScreen('MealDetail', navigator)
                                //@ts-ignore
                                navigator.navigate(screen, { id: ingr.meal_id, editable: false, idFromProgress: ingr.mealProgressID })
                            }} style={tw`flex-row items-center`}>
                                <SupabaseImage uri={ingr.meal.preview || defaultImage} style={`items-center justify-center h-12 w-12 rounded-lg`} />
                                <View style={tw`ml-2 max-w-9/12`}>
                                    <Text weight='semibold'>{ingr.meal.name}</Text>
                                    <View style={tw`flex-row items-center`}>
                                        <Text style={tw`pr-2 text-gray-500`}>{r.calories}kcal</Text>
                                        <Text style={tw`px-2 text-gray-500`}>P: {r.protein.toFixed()}g</Text>
                                        <Text style={tw`px-2 text-gray-500`}>C: {r.carbs.toFixed()}g</Text>
                                        <Text style={tw`px-2 text-gray-500`}>F: {r.fat.toFixed()}g</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                            <ExpoIcon style={tw``} name='chevron-right' iconName='feather' size={20} color={dm ? 'white' : 'black'} />
                        </View>
                    </Swipeable>
                })}
                <View style={tw`h-12`} />
                <ThisAdHelpsKeepFree />
                <View style={tw`h-40`} />
            </ScrollView>
        </View>
    )
}