import { ScrollView, TouchableOpacity, useColorScheme } from 'react-native'
import React from 'react'
import { Text, View } from '../../components/base/Themed'
import { BackButton } from '../../components/base/BackButton'
import tw from 'twrnc'
import { useNavigation } from '@react-navigation/native'
import { getMatchingNavigationScreen } from '../../data'
import { Tables } from '../../supabase/dao'
import useAsync from '../../hooks/useAsync'
import { supabase } from '../../supabase'
import ManageButton from '../../components/features/ManageButton'
import Spacer from '../../components/base/Spacer'
import { ExpoIcon } from '../../components/base/ExpoIcon'
import { useSelector } from '../../redux/store'

export default function Patry() {
    let {profile} = useSelector(x => x.auth)
    const [items, setItems] = React.useState<Tables['pantry_item']['Row'][]>([])
    const navigator = useNavigation()
    const dm = useColorScheme() === 'dark'
    useAsync(async () => {
        let res = await supabase.from('pantry_item').select('*, food(name, img, calories, protein, carbs, fat)').filter('user_id', 'eq', profile?.id).filter('food_id', 'neq', null)
        console.log(res)
    }, [])
    return (
        <View includeBackground style={{flex: 1}}>
            <BackButton name='My Pantry' />
            <ScrollView showsVerticalScrollIndicator={false} style={tw`px-4 pt-6`}>
                <ManageButton title='Pantry' buttonText=' ' />
                <Spacer />
                {items.length === 0 && <Text style={tw`text-center text-gray-500 my-3`}>There are no items in your pantry</Text>}
                {items.map((item, i) => {
                    return <View key={i}>
                        <Text>{item.food_id}</Text>
                    </View>
                })}
                <Spacer />
                <ManageButton title='Grocery List' buttonText=' ' />
                <View style={tw`flex-row items-center justify-around`}>
                    <TouchableOpacity onPress={() => {
                        const screen = getMatchingNavigationScreen('ListFood', navigator)
                        //@ts-ignore
                        navigator.navigate(screen, {grocery: true})
                    }} style={tw`px-4 py-6 items-center justify-center`}>
                    <Text style={tw`text-gray-500 mb-2`}>Add Ingredient</Text>
                    <ExpoIcon iconName='feather' size={20} color='gray' name='plus-circle' />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                        const screen = getMatchingNavigationScreen('ListMeal', navigator)
                        //@ts-ignore
                        navigator.navigate(screen, {grocery: true})
                    }} style={tw`px-4 py-6 items-center justify-center`}>
                    <Text style={tw`text-gray-500 mb-2`}>Add From Meal</Text>
                    <ExpoIcon iconName='feather' size={20} color='gray' name='copy' />
                    </TouchableOpacity>
                </View>
                <View style={tw`h-40`} />
            </ScrollView>
        </View>
    )
}