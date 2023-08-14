import { useColorScheme, Image } from 'react-native'
import React from 'react'
import { Text, View } from '../../components/Themed'
import { BackButton } from '../../components/BackButton'
import { FoodProgress, Meal, MealProgress, User } from '../../aws/models'
import { DataStore, Storage } from 'aws-amplify'
import { useCommonAWSIds } from '../../hooks/useCommonContext'
import { defaultImage, getMatchingNavigationScreen } from '../../data'
import { ScrollView, Swipeable, TouchableOpacity } from 'react-native-gesture-handler'
import tw from 'twrnc'
import { useNavigation } from '@react-navigation/native'
import { AnimatedCircularProgress } from 'react-native-circular-progress'
import { getTdee } from './Profile'
import { Colors, ProgressBar } from 'react-native-paper'
import { ExpoIcon } from '../../components/ExpoIcon'
import { MealProgressDisplay, useProgressValues } from '../../hooks/useProgressValues'
import { categoryMapping } from '../diet/ListFood'
import ThisAdHelpsKeepFree from '../../components/ThisAdHelpsKeepFree'

export default function SummaryFoodList() {
    const { progressId, userId } = useCommonAWSIds()
    const { food, meals, carbGoal, fatGoal, proteinGoal, presetMacros } = useProgressValues({ foodAndMeals: true, metrics: true })
    const [totalCalories, setTotalCalories] = React.useState<number>(1400)
    const dm = useColorScheme() === 'dark'
    const navigator = useNavigation()
    React.useEffect(() => {
        DataStore.query(User, userId).then(x => {
            if (x) {
                setTotalCalories(getTdee(x.goal, x.weight, x.fat))
            }
        })
    }, [])

    const caloriesFromFoodAndMeals = food.reduce((prev, curr) => prev + curr.kcal, 0) + meals.reduce((prev, curr) => prev + curr.calories, 0)
    const cabrsFromFoodAndMeals = food.reduce((prev, curr) => prev + curr.carbs, 0) + meals.reduce((prev, curr) => prev + curr.carbs, 0)
    const proteinFromFoodAndMeals = food.reduce((prev, curr) => prev + curr.protein, 0) + meals.reduce((prev, curr) => prev + curr.protein, 0)
    const fatFromFoodAndMeals = food.reduce((prev, curr) => prev + curr.fat, 0) + meals.reduce((prev, curr) => prev + curr.fat, 0)
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
        carbsRef.current?.animate((totalCarbsGrams ? cabrsFromFoodAndMeals / totalProteinGrams : 0) * 100, 800)
        fatRef.current?.animate((totalFatGrams ? fatFromFoodAndMeals / totalProteinGrams : 0) * 100, 800)

    }, [caloriesFromFoodAndMeals, totalCalories])
    return (
        <View style={{ flex: 1 }} includeBackground>
            <BackButton name='Food and Meals' />
            <ScrollView style={tw`px-4 mt-4`} showsVerticalScrollIndicator={false}>
                <View style={[tw`w-12/12 h-90 shadow-xl rounded-lg items-center justify-evenly bg-${dm ? 'gray-700/40' : 'gray-500/20'}`]}>
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
                                            <Text style={tw`text-lg`} weight='semibold'>{Math.round(proteinFromFoodAndMeals).toFixed()}</Text>
                                            <Text>g</Text>
                                        </View>
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
                                            <Text style={tw`text-lg`} weight='semibold'>{Math.round(cabrsFromFoodAndMeals).toFixed()}</Text>
                                            <Text>g</Text>
                                        </View>
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
                                            <Text style={tw`text-lg`} weight='semibold'>{Math.round(fatFromFoodAndMeals).toFixed()}</Text>
                                            <Text>g</Text>
                                        </View>
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
                {food.length === 0 && <Text style={tw`text-center my-6`}>There is no food to display, add some!</Text>}
                {food.map(ingr => {
                    return <Swipeable renderRightActions={() => {
                        return <View style={tw`flex items-center justify-center ml-2`}>
                            <TouchableOpacity onPress={async () => {
                            await DataStore.delete(FoodProgress, ingr.id)
                        }} style={[tw`items-center my-2 justify-center p-4 rounded-lg bg-red-${dm ? '700' : '300'}`]}>
                            <ExpoIcon name='x' iconName='feather' size={20} color='gray' />
                            <Text>Delete</Text>
                        </TouchableOpacity>
                        </View>
                    }} key={ingr.id}>
                        <TouchableOpacity
                            onPress={() => {
                                const screen = getMatchingNavigationScreen('FoodDetail', navigator)
                                //@ts-ignore
                                navigator.navigate(screen, { id: ingr.id, editable: true, src: 'backend', progressId: progressId, img: ingr.img })
                            }}
                            style={tw`w-12/12 my-2 flex-row justify-between items-center ${dm ? 'bg-gray-700' : 'bg-slate-300'} rounded-2xl py-4 px-3`}>
                            <View style={tw`flex-row items-center`}>
                                {ingr.img && <Image source={{ uri: ingr.img }} style={[{ height: 60, width: 60, borderRadius: 20 }, tw`items-center justify-center`]} />}
                                {(ingr.category && !ingr.img) && <View style={[{ height: 60, width: 60, borderRadius: 20 }, tw`items-center justify-center ${dm ? 'bg-gray-400' : 'bg-gray-200'}`]}>
                                    {/* @ts-ignore */}
                                    <Text style={tw`text-2xl`}>{categoryMapping[ingr.category.toLowerCase()] || categoryMapping['generic foods']}</Text>
                                    </View>}
                                <View style={tw`ml-2 max-w-10/12`}>
                                    <Text weight='semibold' style={tw`mb-1`}>{ingr.name}</Text>
                                    <View style={tw`flex-row items-center`}>
                                        <Text style={tw`pr-2`}>{ingr.kcal.toFixed()}kcal</Text>
                                        <Text style={tw`px-2`}>P: {ingr.protein.toFixed()}g</Text>
                                        <Text style={tw`px-2`}>C: {ingr.carbs.toFixed()}g</Text>
                                        <Text style={tw`px-2`}>F: {ingr.fat.toFixed()}g</Text>
                                    </View>
                                </View>
                            </View>
                            <ExpoIcon style={tw``} name='chevron-right' iconName='feather' size={20} color={dm ? 'white' : 'black'} />
                        </TouchableOpacity>
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
                {meals.length === 0 && <Text style={tw`text-center my-6`}>There are no meals to display, add one!</Text>}
                {meals.map((ingr, i) => {
                    return <Swipeable renderRightActions={() => {
                        return <View style={tw`flex items-center justify-center ml-2`}>
                            <TouchableOpacity onPress={async () => {
                            await DataStore.delete(MealProgress, ingr.mealProgressID)
                        }} style={[tw`items-center my-2 justify-center p-4 rounded-lg bg-red-${dm ? '700' : '300'}`]}>
                            <ExpoIcon name='x' iconName='feather' size={20} color='gray' />
                            <Text>Delete</Text>
                        </TouchableOpacity>
                        </View>
                    }} key={ingr.id + `${i}`}>
                        <TouchableOpacity
                            onPress={() => {
                                const screen = getMatchingNavigationScreen('MealDetail', navigator)
                                //@ts-ignore
                                navigator.navigate(screen, { id: ingr.id, editable: false, idFromProgress: ingr.mealProgressID })
                            }}
                            style={tw`w-12/12 my-2 flex-row justify-between items-center ${dm ? 'bg-gray-700' : 'bg-slate-300'} rounded-2xl py-4 px-3`}>
                            <View style={tw`flex-row items-center`}>
                                <Image source={{ uri: ingr.preview || '' }} style={[{ height: 60, width: 60, borderRadius: 20 }, tw`items-center justify-center`]} />
                                <View style={tw`ml-2 max-w-9/12`}>
                                    <Text weight='semibold'>{ingr.name}</Text>
                                    <View style={tw`flex-row items-center`}>
                                        <Text style={tw`pr-2`}>{ingr.calories.toFixed()}kcal</Text>
                                        <Text style={tw`px-2`}>P: {ingr.protein.toFixed()}g</Text>
                                        <Text style={tw`px-2`}>C: {ingr.carbs.toFixed()}g</Text>
                                        <Text style={tw`px-2`}>F: {ingr.fat.toFixed()}g</Text>
                                    </View>
                                </View>
                            </View>
                            <ExpoIcon style={tw``} name='chevron-right' iconName='feather' size={20} color={dm ? 'white' : 'black'} />
                        </TouchableOpacity>
                    </Swipeable>
                })}
                <View style={tw`h-12`} />
                <ThisAdHelpsKeepFree />
                <View style={tw`h-40`} />
            </ScrollView>
        </View>
    )
}