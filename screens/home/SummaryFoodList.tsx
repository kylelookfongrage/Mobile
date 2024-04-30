import { useColorScheme } from 'react-native'
import React, { useState } from 'react'
import { Text, View } from '../../components/base/Themed'
import { BackButton } from '../../components/base/BackButton'
import { defaultImage, getMacroTargets, getMacrosFromIngredients, getMatchingNavigationScreen } from '../../data'
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler'
import tw from 'twrnc'
import { useNavigation } from '@react-navigation/native'
import { ExpoIcon } from '../../components/base/ExpoIcon'
import ThisAdHelpsKeepFree from '../../components/features/ThisAdHelpsKeepFree'
import { ProgressDao } from '../../types/ProgressDao'
import SupabaseImage from '../../components/base/SupabaseImage'
import { getEmojiByCategory } from '../../types/FoodApi'
import ManageButton from '../../components/features/ManageButton'
import Spacer from '../../components/base/Spacer'
import { ImpactGridItem } from '../../components/base/InputGridItem'
import { _tokens } from '../../tamagui.config'
import SwipeWithDelete from '../../components/base/SwipeWithDelete'
import { useGet } from '../../hooks/useGet'
import Overlay from '../../components/screens/Overlay'
import NutritionLabel from '../../components/features/NutritionLabel'
import { aggregateFoodAndMeals } from '../../redux/reducers/progress'
import { useSelector } from '../../redux/store'

export default function SummaryFoodList() {
    let { profile } = useSelector(x => x.auth)
    let { today } = useSelector(x => x.progress)
    let progressId = today?.id
    let { tdee, totalCarbsGrams, totalFatGrams, totalProteinGrams } = getMacroTargets(profile)
    const dm = useColorScheme() === 'dark'
    const dao = ProgressDao()
    const [food_progress, meal_progress] = [dao.foodProgress, dao.mealProgress]
    let { calories: caloriesConsumed, protein: proteinConsumed, carbs: carbsConsumed, fat: fatConsumed, otherNutrition } = aggregateFoodAndMeals(food_progress, meal_progress)
    const navigator = useNavigation()
    const caloriePercent = (caloriesConsumed / tdee) * 100
    const totalProteinPercent = (proteinConsumed / totalProteinGrams) * 100
    const totalCarbsPercent = (carbsConsumed / totalCarbsGrams) * 100
    const totalFatPercent = (fatConsumed / totalFatGrams) * 100
    let [showNutrition, setShowNutrition] = useState<boolean>(false)
    let g = useGet()


    return (
        <View style={{ flex: 1 }} includeBackground>
            <BackButton name='Food and Meals' Right={() => {
                return <TouchableOpacity onPress={() => setShowNutrition(true)} style={tw`px-4`}>
                    <Text lg weight='bold' style={{ color: _tokens.primary900 }}>Nutrition Label</Text>
                </TouchableOpacity>
            }} />
            <Spacer />
            <Overlay clearBackground visible={showNutrition} onDismiss={() => setShowNutrition(false)}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <NutritionLabel disabled calories={caloriesConsumed} protein={proteinConsumed} fat={fatConsumed} carbs={carbsConsumed} otherNutrition={otherNutrition} />
                    <Spacer xl />
                    <Spacer xl />
                </ScrollView>
            </Overlay>

            <ScrollView style={tw`px-4 `} showsVerticalScrollIndicator={false}>
            <ThisAdHelpsKeepFree addedPb />
                <View style={[tw`rounded-lg items-center justify-center self-center w-12/12 py-3 px-4`, {backgroundColor: g.dm ? _tokens.dark1 : _tokens.gray100}]}>
                    <ImpactGridItem header t2='Goal' t3='Consumed' t4='%' />
                    <ImpactGridItem t1='Calories (kcal)' t2={(tdee || 0).toFixed()} t3={(caloriesConsumed || 0).toFixed()} t3Color={caloriesConsumed > tdee ? _tokens.red : undefined} t4={caloriePercent.toFixed()} t4Color={caloriesConsumed > tdee ? _tokens.red : _tokens.green} />
                    <ImpactGridItem t1='Protein (g)' t2={(totalProteinGrams || 0).toFixed()} t3={(proteinConsumed || 0).toFixed()} t3Color={proteinConsumed > totalProteinGrams ? _tokens.red : undefined} t4={totalProteinPercent.toFixed()} t4Color={proteinConsumed > totalProteinGrams ? _tokens.red : _tokens.green} />
                    <ImpactGridItem t1='Carbs (g)' t2={(totalCarbsGrams || 0).toFixed()} t3={(carbsConsumed || 0).toFixed()} t3Color={carbsConsumed > totalCarbsGrams ? _tokens.red : undefined} t4={totalCarbsPercent.toFixed()} t4Color={carbsConsumed > totalCarbsGrams ? _tokens.red : _tokens.green} />
                    <ImpactGridItem t1='Fats (g)' t2={(totalFatGrams || 0).toFixed()} t3={(fatConsumed || 0).toFixed()} t3Color={fatConsumed > totalFatGrams ? _tokens.red : undefined} t4={totalFatPercent.toFixed()} t4Color={fatConsumed > totalFatGrams ? _tokens.red : _tokens.green} />
                </View>
                <Spacer lg />
                <ManageButton title='Food' buttonText='Add Food' onPress={() => {
                    const screen = getMatchingNavigationScreen('ListFood', navigator)
                    //@ts-ignore
                    navigator.navigate(screen, { progressId: progressId })
                }} />
                {food_progress.length === 0 && <Text style={tw`text-center my-6`}>There is no food to display, add some!</Text>}
                {food_progress.map(ingr => {
                    return <SwipeWithDelete onDelete={async () => {
                        try {
                            g.set('loading', true)
                            await dao.deleteProgress(ingr.id, 'food_progress')
                        } catch (error) {
                            //@ts-ignore
                            g.setFn(prev => ({ ...prev, error: error.toString(), loading: false }))
                        } finally {
                            g.set('loading', false)
                        }
                    }} key={ingr.id}>
                        <View
                            card
                            style={tw`w-12/12 my-1 flex-row justify-between items-center rounded-2xl py-2 px-3`}>
                            <TouchableOpacity onPress={() => {
                                const screen = getMatchingNavigationScreen('FoodDetail', navigator)
                                //@ts-ignore
                                navigator.navigate(screen, { progress_id: ingr.id })
                            }} style={tw`flex-row items-center`}>
                                <Text h3 style={tw`mr-2`}>{getEmojiByCategory(ingr.category)}</Text>
                                <View style={tw`ml-2 max-w-10/12`}>
                                    <Text weight='semibold' lg style={tw`mb-1`}>{ingr.name}</Text>
                                    <View style={tw`flex-row items-center`}>
                                        <Text style={tw`pr-2 text-gray-500`}>{(ingr.calories || 0).toFixed()}kcal</Text>
                                        <Text style={tw`px-2 text-gray-500`}>P: {(ingr.protein || 0).toFixed()}g</Text>
                                        <Text style={tw`px-2 text-gray-500`}>C: {(ingr.carbs || 0).toFixed()}g</Text>
                                        <Text style={tw`px-2 text-gray-500`}>F: {(ingr.fat || 0).toFixed()}g</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                            <ExpoIcon style={tw``} name='chevron-right' iconName='feather' size={20} color={dm ? 'white' : 'black'} />
                        </View>
                    </SwipeWithDelete>
                })}
                <Spacer />
                <ManageButton title='Meals' buttonText='Add Meals' onPress={() => {
                    const screen = getMatchingNavigationScreen('ListMeal', navigator)
                    //@ts-ignore
                    navigator.navigate(screen, { progressId: progressId })
                }} />

                {meal_progress.length === 0 && <Text style={tw`text-center my-6`}>There are no meals to display, add one!</Text>}
                {meal_progress.map((ingr, i) => {//@ts-ignore
                    const r = getMacrosFromIngredients(ingr.meal.meal_ingredients)
                    return <SwipeWithDelete onDelete={async () => {
                        try {
                            g.set('loading', true)
                            await dao.deleteProgress(ingr.id, 'meal_progress')
                        } catch (error) {
                            //@ts-ignore
                            g.setFn(prev => ({ ...prev, error: error.toString(), loading: false }))
                        } finally {
                            g.set('loading', false)
                        }
                    }} key={'meal_progress_' + `${ingr.id}` + `${i}`}>
                        <View
                            card
                            style={tw`w-12/12 my-1 flex-row justify-between items-center  rounded-2xl py-2 px-3`}>
                            <TouchableOpacity onPress={() => {
                                const screen = getMatchingNavigationScreen('MealDetail', navigator)
                                //@ts-ignore
                                navigator.navigate(screen, { id: ingr.meal_id, editable: false, idFromProgress: ingr.id })
                            }} style={tw`flex-row items-center`}>
                                <SupabaseImage uri={ingr.meal.preview || defaultImage} style={`items-center justify-center h-12 w-12 rounded-lg`} />
                                <View style={tw`ml-2 max-w-9/12`}>
                                    <Text lg weight='semibold'>{ingr.meal.name}</Text>
                                    <View style={tw`flex-row items-center mt-1`}>
                                        <Text style={tw`pr-2 text-gray-500`}>{(r.calories * ((ingr.consumed_weight || 1) / (ingr.total_weight || 1))).toFixed()}kcal</Text>
                                        <Text style={tw`px-2 text-gray-500`}>P: {(r.protein * ((ingr.consumed_weight || 1) / (ingr.total_weight || 1))).toFixed()}g</Text>
                                        <Text style={tw`px-2 text-gray-500`}>C: {(r.carbs * ((ingr.consumed_weight || 1) / (ingr.total_weight || 1))).toFixed()}g</Text>
                                        <Text style={tw`px-2 text-gray-500`}>F: {(r.fat * ((ingr.consumed_weight || 1) / (ingr.total_weight || 1))).toFixed()}g</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                            <ExpoIcon style={tw``} name='chevron-right' iconName='feather' size={20} color={dm ? 'white' : 'black'} />
                        </View>
                    </SwipeWithDelete>
                })}
                <View style={tw`h-12`} />
                <View style={tw`h-40`} />
            </ScrollView>
        </View>
    )
}