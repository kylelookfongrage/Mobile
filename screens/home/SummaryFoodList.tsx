import { useColorScheme, View, Image } from 'react-native'
import React from 'react'
import { Text } from '../../components/Themed'
import { BackButton } from '../../components/BackButton'
import { FoodProgress, Meal, MealProgress, User } from '../../aws/models'
import { DataStore, Storage } from 'aws-amplify'
import { useCommonAWSIds } from '../../hooks/useCommonContext'
import { defaultImage, getMatchingNavigationScreen, isStorageUri } from '../../data'
import { ScrollView, Swipeable, TouchableOpacity } from 'react-native-gesture-handler'
import tw from 'twrnc'
import { useNavigation } from '@react-navigation/native'
import { AnimatedCircularProgress } from 'react-native-circular-progress'
import { getTdee } from './Profile'
import { Colors, ProgressBar } from 'react-native-paper'
import { ExpoIcon } from '../../components/ExpoIcon'
import { MealProgressDisplay, useProgressValues } from '../../hooks/useProgressValues'

export default function SummaryFoodList() {
    const { progressId, userId } = useCommonAWSIds()
    const {food, meals} = useProgressValues({foodAndMeals: true})
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
    const totalProteinGrams = (totalCalories * 0.4) / 4
    const totalFatGrams = (totalCalories * 0.3) / 9
    const totalCarbsGrams = (totalCalories * 0.3) / 4
    const cpRef = React.useRef<AnimatedCircularProgress | null>(null)
    React.useEffect(() => {
        cpRef.current?.animate((caloriesFromFoodAndMeals / totalCalories) * 100, 800)
    }, [caloriesFromFoodAndMeals, totalCalories])
    return (
        <View style={{ flex: 1 }}>
            <BackButton name='Food and Meals' />
            <ScrollView style={tw`px-4 mt-4`} showsVerticalScrollIndicator={false}>
                <View style={[tw`w-12/12 h-70 shadow-xl rounded-lg items-center justify-evenly bg-${dm ? 'gray-700' : 'border border-black'}`]}>
                    <AnimatedCircularProgress
                        size={170}
                        width={6}
                        rotation={360}
                        fill={0}
                        lineCap='round'
                        tintColor="#D22B2B"
                        backgroundColor={!dm ? '#50C878' : '#097969'}
                        ref={cpRef}
                    >
                        {
                            (fill) => (
                                <View style={tw`items-center`}>
                                    <View style={tw`flex-row items-center`}>
                                        <Text style={tw`text-lg`} weight='semibold'>{Math.round(caloriesFromFoodAndMeals).toFixed()}</Text>
                                        <Text>kCal</Text>
                                    </View>
                                    <Text>of {totalCalories.toFixed()} kCal</Text>
                                </View>
                            )
                        }
                    </AnimatedCircularProgress>
                    <View style={tw`flex-row items-center justify-around w-12/12`}>
                        <View style={tw`w-25 px-2`}>
                            <Text style={tw`mb-2`}>P: {proteinFromFoodAndMeals.toFixed()}g</Text>
                            <ProgressBar progress={proteinFromFoodAndMeals && totalProteinGrams ? proteinFromFoodAndMeals / totalProteinGrams : 0} color={Colors.teal400} />
                        </View>
                        <View style={tw`w-25 px-2`}>
                            <Text style={tw`mb-2`}>C: {cabrsFromFoodAndMeals.toFixed()}g</Text>
                            <ProgressBar progress={cabrsFromFoodAndMeals && totalCarbsGrams ? cabrsFromFoodAndMeals / totalCarbsGrams : 0} color={Colors.teal400} />
                        </View>
                        <View style={tw`w-25 px-2`}>
                            <Text style={tw`mb-2`}>F: {fatFromFoodAndMeals.toFixed()}g</Text>
                            <ProgressBar progress={fatFromFoodAndMeals && totalFatGrams ? fatFromFoodAndMeals / totalFatGrams : 0} color={Colors.teal400} />
                        </View>
                    </View>
                </View>

                <View style={tw`flex-row items-center justify-between mt-4`}>
                    <Text style={tw`text-lg `}>Food</Text>
                    <TouchableOpacity style={tw`py-4`} onPress={() => {
                        const screen = getMatchingNavigationScreen('ListFood', navigator)
                        //@ts-ignore
                        navigator.navigate(screen, { progressId: progressId })
                    }}>
                        <Text weight='semibold'>Add Food</Text>
                    </TouchableOpacity>
                </View>
                {food.length === 0 && <Text style={tw`text-center my-4`}>There is no food to display, add some!</Text>}
                {food.map(ingr => {
                    return <Swipeable renderRightActions={() => {
                        return <TouchableOpacity onPress={async () => {
                            await DataStore.delete(FoodProgress, ingr.id)
                        }} style={[tw`items-center my-2 justify-center p-4 rounded-lg bg-red-${dm ? '700' : '300'}`]}>
                            <ExpoIcon name='x' iconName='feather' size={20} color='gray' />
                            <Text>Delete</Text>
                        </TouchableOpacity>
                    }} key={ingr.id}>
                        <TouchableOpacity
                            onPress={() => {
                                const screen = getMatchingNavigationScreen('FoodDetail', navigator)
                                //@ts-ignore
                                navigator.navigate(screen, { id: ingr.id, editable: true, src: 'backend', progressId: progressId, img: ingr.img })
                            }}
                            style={tw`w-12/12 my-2 flex-row justify-between items-center ${dm ? 'bg-gray-700' : 'border border-black'} rounded-lg py-4 px-3`}>
                            <View style={tw`flex-row items-center`}>
                                <Image source={{ uri: ingr.img || defaultImage }} style={[{ height: 40, width: 40, borderRadius: 10 }, tw`items-center justify-center`]} />
                                <View style={tw`ml-2 max-w-10/12`}>
                                    <Text weight='semibold'>{ingr.name}</Text>
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
                    <Text style={tw`text-lg `}>Meals</Text>
                    <TouchableOpacity style={tw`py-4`} onPress={() => {
                        const screen = getMatchingNavigationScreen('ListMeal', navigator)
                        //@ts-ignore
                        navigator.navigate(screen, { progressId: progressId })
                    }}>
                        <Text weight='semibold'>Add Meals</Text>
                    </TouchableOpacity>
                </View>
                {meals.length === 0 && <Text style={tw`text-center my-4`}>There are no meals to display, add one!</Text>}
                {meals.map((ingr, i) => {
                    const imgs = ingr.media ? ingr.media.filter(x => x?.type === 'image') : []
                    let img = defaultImage
                    if (imgs.length !== 0) {
                        let firstImage = imgs[0]
                        if (firstImage) {
                            img = firstImage.uri || defaultImage
                        }
                    }
                    return <Swipeable renderRightActions={() => {
                        return <TouchableOpacity onPress={async () => {
                            await DataStore.delete(MealProgress, ingr.mealProgressID)
                        }} style={[tw`items-center my-2 justify-center p-4 rounded-lg bg-red-${dm ? '700' : '300'}`]}>
                            <ExpoIcon name='x' iconName='feather' size={20} color='gray' />
                            <Text>Delete</Text>
                        </TouchableOpacity>
                    }} key={ingr.id + `${i}`}>
                        <TouchableOpacity
                            onPress={() => {
                                const screen = getMatchingNavigationScreen('MealDetail', navigator)
                                //@ts-ignore
                                navigator.navigate(screen, { id: ingr.id, editable: false, idFromProgress: ingr.mealProgressID })
                            }}
                            style={tw`w-12/12 my-2 flex-row justify-between items-center ${dm ? 'bg-gray-700' : 'border border-black'} rounded-lg py-4 px-3`}>
                            <View style={tw`flex-row items-center`}>
                                <Image source={{ uri: img }} style={[{ height: 40, width: 40, borderRadius: 10 }, tw`items-center justify-center`]} />
                                <View style={tw`ml-2 max-w-10/12`}>
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
                <View style={tw`h-40`} />
            </ScrollView>
        </View>
    )
}