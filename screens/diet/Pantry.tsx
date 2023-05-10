import { ScrollView, useColorScheme, View } from 'react-native'
import React from 'react'
import { Text } from '../../components/Themed'
import { BackButton } from '../../components/BackButton'
import tw from 'twrnc'
import { useCommonAWSIds } from '../../hooks/useCommonContext'
import { PantryItem } from '../../aws/models'
import { useNavigation } from '@react-navigation/native'
import { DataStore } from 'aws-amplify'
import { PantryItemView } from './GroceryList'
import { getMatchingNavigationScreen } from '../../data'

export default function Patry() {
    const { userId } = useCommonAWSIds()
    const [items, setItems] = React.useState<PantryItem[]>([])
    const navigator = useNavigation()
    const dm = useColorScheme() === 'dark'
    React.useEffect(() => {
        const subscription = DataStore.observeQuery(PantryItem, x => x.and(pi => [pi.userID.eq(userId), pi.purchased.eq(true)])).subscribe(ss =>{
            console.log(ss.items)
            setItems(ss.items)
        })
        return () => subscription.unsubscribe()
    }, [])
    return (
        <View>
            <BackButton />
            <ScrollView showsVerticalScrollIndicator={false} style={tw`px-4 pt-6`}>
                <Text style={tw`text-lg`} weight='semibold'>Pantry</Text>
                <Text style={tw`mb-6`}>These pantry items are the ones purchased from your grocery list! You can use these items to see what meals you can create!</Text>
                {items.map(item => {
                    return <PantryItemView key={item.id} item={item} 
                    onDeletePress={async (id) => {
                        await DataStore.delete(PantryItem, id)
                    }}
                    onItemPress={(id) => {
                        const screen = getMatchingNavigationScreen('FoodDetail', navigator)
                        //@ts-ignore
                        navigator.navigate(screen, {id, editable: false, src: 'backend', grocery: true})
                    }} />
                })}
                <View style={tw`h-40`} />
            </ScrollView>
        </View>
    )
}