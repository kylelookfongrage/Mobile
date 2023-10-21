import { ScrollView, TextInput, TouchableOpacity, useColorScheme, Image } from 'react-native'
import React from 'react'
import { Text, View } from '../../components/base/Themed'
import { useDebounce } from '../../hooks/useDebounce'
import { ExpoIcon } from '../../components/base/ExpoIcon';
import tw from 'twrnc'
import { useNavigation } from '@react-navigation/native';
import { Ingredient, Meal, PantryItem, User } from '../../aws/models';
import { DataStore, Storage } from 'aws-amplify';
import { useCommonAWSIds } from '../../hooks/useCommonContext';
import { MediaType } from '../../types/Media';
import { defaultImage, getMatchingNavigationScreen, isStorageUri } from '../../data';
import { BackButton } from '../../components/base/BackButton';
import AllergenAlert from '../../components/features/AllergenAlert';
import { SearchDao } from '../../types/SearchDao';
import { Tables } from '../../supabase/dao';
import SearchScreen from '../../components/screens/SearchScreen';
import SearchResult from '../../components/base/SearchResult';
import Spacer from '../../components/base/Spacer';

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
    userIsAllergic?: boolean;
}

interface ListMealsProps {
    progressId?: string;
    grocery?: string;
    userId?: string;
}

export default function ListMeals(props: ListMealsProps) {
    const dm = useColorScheme() === 'dark'
    const navigator = useNavigation()
    const color = dm ? 'white' : 'black'
    const { profile } = useCommonAWSIds()
    const searchOptions = ['All Meals', 'My Meals', 'Favorites']
    let dao = SearchDao()


    async function fetchMeals(keyword: string, option: string) {
        let meals: Tables['meal']['Row'][] = []
        if (option === 'From Pantry') {

        }
        else {
            let res = await dao.search('meal', {
                keyword, keywordColumn: 'name', selectString: `
                  *, author: user_id(username), ingredients:meal_ingredients(*)`,
                belongsTo: option === 'My Meals' ? profile?.id : props.userId,
                favorited: option === 'Favorites', user_id: profile?.id
            })
            if (!res) return;
            meals = res;
        }
        const mealResults: ListMealSearchResults[] = meals.map(meal => {
            //@ts-ignore
            const allergens = profile?.allergens || [] //@ts-ignore
            const ingredients: Tables['meal_ingredients']['Row'][] = meal.ingredients
            // const ingredientsSearchKey = ingredients.map(x => `${x.name} ${x.foodContentsLabel}`.toLowerCase()).join(' ')
            // const userIsAllergic = allergens.filter(x => ingredientsSearchKey.includes(x || 'nothing')).length > 0
            const ingredientLength = ingredients?.length
            const stepLength = meal.steps?.length || 0
            return {
                ...meal,
                // userIsAllergic,
                calories: ingredients?.reduce((prev, curr) => prev + (curr.calories || 0), 0),
                protein: ingredients?.reduce((prev, curr) => prev + (curr.protein || 0), 0),
                carbs: ingredients?.reduce((prev, curr) => prev + (curr.carbs || 0), 0),
                fat: ingredients?.reduce((prev, curr) => prev + (curr.fat || 0), 0),
                ingredientCount: ingredientLength,
                stepCount: stepLength
            }

        })
        return mealResults
    }


    return <SearchScreen name='Meals' table='meal' onSearch={fetchMeals} searchOptions={searchOptions} excludeOptions={[props.userId ? "My Meals" : 'null']} Item={p => {
        return <MealSearchResult item={p.item} idx={p.index} onPress={(id) => {
            const screen = getMatchingNavigationScreen('MealDetail', navigator)
            //@ts-ignore
            navigator.navigate(screen, { id: id, grocery: props.grocery })
        }} />
    }}>

    </SearchScreen>
}


const MealSearchResult = (props: { idx: number, item: Tables['meal']['Row'], onPress: (id: number) => void; }) => {
    const { idx, item: r, onPress } = props;
    return <SearchResult name={r.name || ''} img={r.preview} onPress={() => {
        if (onPress) onPress(r.id)
    }}>
        {/* @ts-ignore */}
        <View>
            <Text style={tw`text-red-500 text-xs`}>@{r?.author?.username || 'rage'}</Text>
            <View style={tw`flex-row items-center justify-between w-12/12`}>
                <Text weight='semibold' style={tw`text-xs text-gray-500`}>{r.calories?.toFixed()} kcal</Text>
                <Text weight='semibold' style={tw`text-xs text-gray-500`}>P: {r.protein?.toFixed()}g</Text>
                <Text weight='semibold' style={tw`text-xs text-gray-500`}>C: {r.carbs?.toFixed()}g</Text>
                <Text weight='semibold' style={tw`text-xs text-gray-500`}>F: {r.fat?.toFixed()}g</Text>
            </View>
        </View>
    </SearchResult>
}


// onPress = {() => {
//     const screen = getMatchingNavigationScreen('MealDetail', navigator)
//     //@ts-ignore
//     navigator.navigate(screen, { id: r.id, grocery: props.grocery })
// }}


{/* <View style={tw`w-12/12 py-1 rounded-xl`}>
    <Text style={tw`text-xs`}>{r.ingredientCount} ingredients & {r.stepCount} steps</Text>
    <Text style={tw`text-xs`}>{r.calories.toFixed()} kcal | P: {r.protein.toFixed()}g | C: {r.carbs.toFixed()}g | F: {r.fat.toFixed()}g</Text>
</View> */}