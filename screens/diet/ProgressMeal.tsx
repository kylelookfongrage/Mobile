import { useNavigation } from "@react-navigation/native"
import React from "react"
import { Dimensions, useColorScheme, View, TouchableOpacity, ActivityIndicator } from "react-native"
import { Text } from "../../components/base/Themed"
import tw from 'twrnc'
import { Ingredient, Meal, MealProgress } from "../../aws/models"
import { DataStore } from "aws-amplify"
import { ScrollView } from "react-native-gesture-handler"
import { ExpoIcon } from "../../components/base/ExpoIcon"

interface NutritionDisplay {
    protein: number; carbs: number; fat: number; calories: number
}

export default function ProgressMeal(props: any) {
    const { id } = props;
    const [uploading, setUploading] = React.useState<boolean>(false)
    const height = Dimensions.get('screen').height
    const dm = useColorScheme() === 'dark'
    const [mealProgress, setMealProgress] = React.useState<MealProgress | undefined>(undefined)
    const [originalIngredients, setOriginalIngredients] = React.useState<Ingredient[]>([])
    const [ingredients, setIngredients] = React.useState<Ingredient[]>([])
    const [meal, setMeal] = React.useState<Meal | undefined>(undefined)

    const [originalNutrition, setOriginalNutrition] = React.useState<NutritionDisplay>({
        calories: 0, protein: 0, carbs: 0, fat: 0
    })
    const [nutrition, setNutrition] = React.useState<NutritionDisplay>({
        calories: 0, protein: 0, carbs: 0, fat: 0
    })
    const getMacrosFromIngredients = (ingrs: Ingredient[]): NutritionDisplay => {
        const c = ingrs?.reduce((prev, curr) => prev + (curr.kcal || 0), 0) || 0
        const p = ingrs?.reduce((prev, curr) => prev + (curr.protein || 0), 0) || 0
        const ca = ingrs?.reduce((prev, curr) => prev + (curr.carbs || 0), 0) || 0
        const f = ingrs?.reduce((prev, curr) => prev + (curr.fat || 0), 0) || 0
        return { protein: p, calories: c, carbs: ca, fat: f }
    }

    React.useEffect(() => {
        const prepare = async () => {
            const potential = await DataStore.query(MealProgress, id)
            setMealProgress(potential)
            if (potential?.consumedWeight === 0.75) {
                setAmount('3/4ths')
            } else if (potential?.consumedWeight === 0.50) {
                setAmount('Half')
            } else if (potential?.consumedWeight === 0.25) {
                setAmount('Quarter')
            }
            if (potential) {
                const m = await DataStore.query(Meal, potential.mealID)
                setMeal(m)
                const ingrs = await m?.Ingredients.toArray() || []
                setOriginalIngredients(ingrs)
                setIngredients(ingrs)
                const originalMacros = getMacrosFromIngredients(ingrs)
                setNutrition(originalMacros)
                setOriginalNutrition(originalMacros)
            } else {
                alert('There was a problem fetching this meal')
                //@ts-ignore
                navigator.pop()
            }
        }
        prepare()
    }, [])
    const navigator = useNavigation()
    const amounts = ['Quarter', 'Half', '3/4ths', 'Whole'] as const
    const [amount, setAmount] = React.useState<typeof amounts[number]>('Whole')
    React.useEffect(() => {
        const decimal = getDecimal()
        let nutritionToUpdate = getMacrosFromIngredients(ingredients)
        for (var key in nutritionToUpdate) {
            //@ts-ignore
            nutritionToUpdate[key] = nutritionToUpdate[key] * decimal
        }
        setNutrition(nutritionToUpdate)
    }, [amount, ingredients])

    const getDecimal = () => {
        let decimal = 1
        if (amount === '3/4ths') {
            decimal = 0.75
        } else if (amount === 'Half') {
            decimal = 0.5
        } else if (amount === 'Quarter') {
            decimal = 0.25
        }
        return decimal
    }

    const onSave = async () => {
        const decimal = getDecimal()
        let mealId = meal?.id || ''
        if (!mealId) {
            alert('There was a problem fetching this meal')
            return
        }
        if (originalIngredients.length !== ingredients.length) {
            const ogMeal = await DataStore.query(Meal, mealId)
            if (!ogMeal) {
                alert('There was a problem replicating this meal')
                return;
            }
            const newMeal = await DataStore.save(new Meal({
                description: ogMeal.description, steps: ogMeal.steps,
                premium: ogMeal.premium, category: ogMeal.category, userID: ogMeal.userID,
                sub: ogMeal.sub, name: ogMeal.name, media: ogMeal.media, isAiGenerated: ogMeal.isAiGenerated,
                public: false, preview: ogMeal.preview
            }))
            for (var ingr of ingredients) {
                await DataStore.save(new Ingredient({
                    name: ingr.name, units: ingr.units, quantity: ingr.quantity,
                    protein: ingr.protein, carbs: ingr.carbs, fat: ingr.fat,
                    //@ts-ignore
                    otherNutrition: ingr.otherNutrition, measures: JSON.parse(ingr.measures),
                    healthLabels: ingr.healthLabels, totalWeight: ingr.totalWeight, img: ingr.img,
                    category: ingr.category, foodContentsLabel: ingr.foodContentsLabel,
                    kcal: ingr.kcal, mealID: newMeal.id, edamamId: ingr.edamamId,
                    userID: ingr.userID
                }))
            }
            mealId = newMeal.id
        }
        const og = await DataStore.query(MealProgress, id)
        if (!og) return;
        await DataStore.save(MealProgress.copyOf(og, x => {
            x.consumedWeight = decimal;
            x.totalWeight = 1;
            x.initialMeal = og.mealID ? og.mealID : mealId;
            x.mealID=mealId
        }))
        //@ts-ignore
        navigator.pop()
    }

    return <View style={[{ marginTop: height * 0.30, height: height * 0.70, flex: 1 }, tw`bg-${dm ? 'gray-800' : 'gray-200'} rounded-t-3xl p-6`]}>
        <View style={tw`justify-between h-12/12 pb-9`}>
            <View>
                <Text style={tw`text-lg max-w-11/12`} weight='semibold'>{meal?.name}</Text>
                <View style={tw`flex-row items-center justify-around my-6`}>
                    <VerticalNutrientDisplay title={nutrition.calories.toFixed()} unit="" desc="Calories" />
                    <VerticalNutrientDisplay title={nutrition.protein.toFixed()} unit="g" desc="Protein" />
                    <VerticalNutrientDisplay title={nutrition.carbs.toFixed()} unit="g" desc="Carbs" />
                    <VerticalNutrientDisplay title={nutrition.fat.toFixed()} unit="g" desc="Fat" />
                </View>
                <Text style={tw`mb-2`} weight='semibold'>How much did you eat?</Text>
                <View style={tw`flex-row items-center justify-between mb-4`}>
                    {amounts.map(amt => {
                        const selected = amount === amt
                        return <TouchableOpacity onPress={() => {
                            if (selected) return;
                            setAmount(amt)
                        }} style={tw`p-3 rounded-xl ${selected ? 'bg-red-500' : ""}`} key={amt}>
                            <Text>{amt}</Text>
                        </TouchableOpacity>
                    })}
                </View>
                <Text style={tw`mb-4`} weight='semibold'>Did you omit any ingredients?</Text>
                <ScrollView horizontal>
                    {ingredients.map(ingr => {
                        return <View key={ingr.id} style={tw`items-center justify-center p-3`}>
                            <Text>{ingr.name}</Text>
                            <Text style={tw`text-xs text-gray-500`}>{(ingr.kcal || 0).toFixed()} kcal</Text>
                            <TouchableOpacity onPress={() => {
                                setIngredients([...ingredients.filter(x => x.id !== ingr.id)])
                            }} style={tw`px-3 pt-1 pb-2`}>
                                <ExpoIcon iconName="feather" name="x-circle" size={20} color={dm ? 'white' : 'black'} />
                            </TouchableOpacity>
                        </View>
                    })}
                </ScrollView>
            </View>
            <TouchableOpacity disabled={uploading} style={tw`rounded-xl p-3 mx-9 bg-red-${dm ? '500' : '300'}`} onPress={() => {
                //@ts-ignore
                onSave()
            }}>
                {!uploading && <Text style={tw`text-center`} weight='semibold'>Save Meal</Text>}
                {uploading && <ActivityIndicator />}
            </TouchableOpacity>
        </View>
    </View>
}


const VerticalNutrientDisplay = (props: { title: string, unit: string; desc: string }) => {
    return <View style={tw`items-center justify-center`}>
        <Text style={tw`text-gray-500 text-xl`} weight='bold'>{props.title}{<Text style={tw`text-gray-500 text-xs`} weight='semibold'>{props.unit}</Text>}</Text>
        <Text style={tw`text-gray-500 text-xs`}>{props.desc}</Text>
    </View>
}