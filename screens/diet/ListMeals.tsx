import { ScrollView, TextInput, TouchableOpacity, useColorScheme, Image } from 'react-native'
import React from 'react'
import { Text, View } from '../../components/Themed'
import { useDebounce } from '../../hooks/useDebounce'
import { ExpoIcon } from '../../components/ExpoIcon';
import tw from 'twrnc'
import { useNavigation } from '@react-navigation/native';
import { Ingredient, Meal, PantryItem, User } from '../../aws/models';
import { DataStore, Storage } from 'aws-amplify';
import { useCommonAWSIds } from '../../hooks/useCommonContext';
import { MediaType } from '../../types/Media';
import { defaultImage, getMatchingNavigationScreen, isStorageUri } from '../../data';
import { BackButton } from '../../components/BackButton';
import AllergenAlert from '../../components/AllergenAlert';

export interface ListMealSearchResults {
    name: string;
    id: string;
    img: string;
    author: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    ingredientCount: number;
    stepCount: number;
    userIsAllergic: boolean;
}

interface ListMealsProps {
    progressId?: string;
    grocery?: string;
}

export default function ListMeals(props: ListMealsProps) {
    const dm = useColorScheme() === 'dark'
    const navigator = useNavigation()
    const color = dm ? 'white' : 'black'
    const [searchKey, setSearchKey] = React.useState<string>()
    const debouncedSearchTerm = useDebounce(searchKey, 500);
    const searchOptions = ['All', 'From Pantry',  'My Meals'] as const
    const [selectedOption, setSelectedOption] = React.useState<typeof searchOptions[number]>(searchOptions[0])
    const [results, setResults] = React.useState<ListMealSearchResults[]>([])
    const [displaySearchState, setDisplaySearchState] = React.useState('Search for meals!')

    React.useEffect(() => {
        if (results.length > 0) {
            setDisplaySearchState('')
        }
    }, [results])
    const { userId } = useCommonAWSIds()
    async function fetchMeals() {
        let meals: Meal[] = []
        if (selectedOption === 'All') {
            meals = await DataStore.query(Meal, x => x.and(m => [
                debouncedSearchTerm ? m.name.contains(debouncedSearchTerm) : m.name.ne(''),
                m.public.eq(true)
            ]), { limit: 40 })
        } else if (selectedOption === 'From Pantry') {
            const pantryIngredients = await DataStore.query(PantryItem, pi => pi.and(x => [x.userID.eq(userId), x.purchased.eq(true)]),  { limit: 40 })
            if (pantryIngredients.length > 0) {
                const ingrs = await Promise.all(pantryIngredients.map(async x => {
                    const ingr = await DataStore.query(Ingredient, x.ingredientID)
                    return ingr?.name || ''
                }))
                meals = await DataStore.query(Meal, x => x.and(y => [
                    y.userID.eq(userId), debouncedSearchTerm ? y.name.contains(debouncedSearchTerm) : y.name.ne(''),
                    y.public.eq(true),
                    y.Ingredients.or(ingr => ingrs.map(z => ingr.name.contains(z)))
                ]), { limit: 40 })
            } 
        }
        else {
            meals = await DataStore.query(Meal, x => x.and(y => [y.userID.eq(userId), debouncedSearchTerm ? y.name.contains(debouncedSearchTerm) : y.name.ne(''), y.public.eq(true)]), { limit: 40 })
        }
        const mealResults: ListMealSearchResults[] = await Promise.all(meals.map(async meal => {
            //@ts-ignore
            const media: MediaType[] = meal.media || []
            const user = await DataStore.query(User, meal.userID)
            const allergens = user?.allergens || []
            const picture = media.length > 0 ? media.filter(x => x.type === 'image')[0] : {uri: defaultImage, type: 'image'}
            const ingredients = await meal.Ingredients.toArray()
            const ingredientsSearchKey = ingredients.map(x => `${x.name} ${x.foodContentsLabel}`.toLowerCase()).join(' ')
            const userIsAllergic = allergens.filter(x => ingredientsSearchKey.includes(x || 'nothing')).length > 0
            const ingredientLength = ingredients.length
            const stepLength = meal.steps?.length || 0
            return {
                name: meal.name,
                id: meal.id,
                userIsAllergic,
                img: isStorageUri(picture.uri || defaultImage) ? await Storage.get(picture.uri || defaultImage) : (picture.uri || defaultImage),
                author: user?.username || '',
                calories: ingredients.reduce((prev, curr) => prev+(curr.kcal || 0), 0),
                protein: ingredients.reduce((prev, curr) => prev+curr.protein, 0),
                carbs: ingredients.reduce((prev, curr) => prev+(curr.carbs || 0), 0),
                fat: ingredients.reduce((prev, curr) => prev+(curr.fat || 0), 0),
                ingredientCount: ingredientLength,
                stepCount: stepLength
            }

        }))
        setResults(mealResults)
        if (mealResults.length === 0) {
            setDisplaySearchState('No meals found')
        }

    }
    React.useEffect(() => {
        setResults([])
        setDisplaySearchState('Searching....')
        fetchMeals()
    }, [debouncedSearchTerm, selectedOption])

    return (
        <View style={{ flex: 1 }} includeBackground>
            <BackButton name='Meals' />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[tw`px-4 pb-20`]}>
                <View style={tw`flex flex-row items-center py-3 px-5 mt-6 w-12/12 bg-${dm ? 'gray-600' : 'gray-300'} rounded-xl`}>
                    <ExpoIcon name='search' iconName='feather' color='gray' size={25} />
                    <TextInput
                        placeholder='Name'
                        placeholderTextColor={'gray'}
                        style={tw`w-9/12 py-2 px-3 text-${dm ? 'white' : 'black'}`}
                        value={searchKey} onChangeText={setSearchKey}
                    />
                </View>
                <View style={tw`flex-row justify-between py-4 px-5`}>
                    {searchOptions.map((o, i) => {
                        const selected = selectedOption === o
                        return <TouchableOpacity
                            key={`Search option ${o} at idx ${i}`}
                            style={tw`items-center py-2 px-5 ${selected ? 'border-b border-' + color : ''}`}
                            onPress={() => setSelectedOption(o)}>
                            <Text
                                weight={selected ? 'semibold' : 'regular'}>{o}</Text>
                        </TouchableOpacity>
                    })}
                </View>
                {(displaySearchState !== '' && results.length === 0) && <View style={tw`w-12/12 justify-center items-center mt-9`}><Text>{displaySearchState}</Text></View>}
                {results.map((r, idx) => {
                    return <TouchableOpacity
                        key={`food item ${r.name} at index ${idx}`}
                        onPress={() => {
                            const screen = getMatchingNavigationScreen('MealDetail', navigator)
                            //@ts-ignore
                            navigator.navigate(screen, {id: r.id, grocery: props.grocery})
                        }}
                        style={tw`flex-row items-start w-12/12 px-2 my-3`}>
                        {/* @ts-ignore */}
                        <Image source={{ uri: r.img }} style={tw`h-15 w-15 rounded-lg`} resizeMode='cover' />
                        <View style={tw`px-2 w-9/12 max-w-9/12`}>
                            <Text weight='semibold'>{r.name} {r.userIsAllergic && <AllergenAlert size={15} />}</Text>
                            <Text style={tw`text-red-500 text-xs`}>@{r.author}</Text>
                            <View style={tw`w-12/12 py-1 rounded-xl`}>
                            <Text style={tw`text-xs`}>{r.ingredientCount} ingredients & {r.stepCount} steps</Text>
                            <Text style={tw`text-xs`}>{r.calories.toFixed()} kcal | P: {r.protein.toFixed()}g | C: {r.carbs.toFixed()}g | F: {r.fat.toFixed()}g</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                })}

            </ScrollView>
        </View>

    )
}