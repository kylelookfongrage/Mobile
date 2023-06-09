import { ScrollView, Image, useColorScheme, ActivityIndicator, Alert } from 'react-native'
import React from 'react'
import { Text, View } from '../../components/Themed'
import { BackButton } from '../../components/BackButton'
import { Ingredient, PantryItem } from '../../aws/models'
import { useCommonAWSIds } from '../../hooks/useCommonContext'
import { DataStore, Storage } from 'aws-amplify'
import { defaultImage, getMatchingNavigationScreen, isStorageUri } from '../../data'
import tw from 'twrnc'
import { ExpoIcon } from '../../components/ExpoIcon'
import { useNavigation } from '@react-navigation/native'
import { Swipeable, TouchableOpacity } from 'react-native-gesture-handler'


export default function GroceryList() {
    const { userId } = useCommonAWSIds()
    const [items, setItems] = React.useState<PantryItem[]>([])
    const navigator = useNavigation()
    const dm = useColorScheme() === 'dark'
    const [uploading, setUploading] = React.useState<boolean>(false)
    React.useEffect(() => {
        const subscription = DataStore.observeQuery(PantryItem, x => x.and(pi => [pi.userID.eq(userId), pi.purchased.ne(true)])).subscribe(ss =>{
            setItems(ss.items)
        })
        return () => subscription.unsubscribe()
    }, [])

    async function onCheckoutPress(){
        setUploading(true)
        for (var item of items) {
            console.log(item)
            if (item.inCart) {
                const og = await DataStore.query(PantryItem, item.id)
                if (!og) return;
                await DataStore.save(PantryItem.copyOf(og, x => {
                    x.purchased=true;
                }))
            }
        }
        setUploading(false)
        const screen = getMatchingNavigationScreen('Pantry', navigator)
        //@ts-ignore
        navigator.navigate(screen)
    }
    return (
        <View style={{ flex: 1 }} includeBackground>
            <BackButton />
            <ScrollView showsVerticalScrollIndicator={false} style={tw`px-4 pt-6`}>
                <Text style={tw`text-lg`} weight='semibold'>Grocery List</Text>
                <Text style={tw``}>Add items to your grocery list, or add a meal to add all of it's ingredients! Then add these items to your pantry once you are done shopping!</Text>
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
                {items.map((item, idx) => {
                    return <PantryItemView key={item.id} item={item} 
                    onDeletePress={async (id) => {
                        await DataStore.delete(PantryItem, id)
                    }}
                    onItemPress={(id) => {
                        const screen = getMatchingNavigationScreen('FoodDetail', navigator)
                        //@ts-ignore
                        navigator.navigate(screen, {id, editable: false, src: 'backend', grocery: true})
                    }} onCheckPress={async (id) => {
                        const og = await DataStore.query(PantryItem, id)
                        if (og) {
                            await DataStore.save(PantryItem.copyOf(og, x => {
                                x.inCart = x.inCart ? false : true;
                            }))
                        }
                    }} />
                })}
                <View style={tw`h-40`} />
            </ScrollView>
            <View style={[
                {
                    position: 'absolute',
                    bottom: 0,
                    flex: 1
                },
                tw`w-12/12`
            ]}>
                {/* Add Food Button */}
                <View style={tw`py-5 w-12/12 items-center px-7 flex-row justify-center`}>
                    <TouchableOpacity 
                    disabled={uploading === true} 
                    onPress={() => {
                        Alert.alert('Are you sure you\'re done shopping?', 'Items you have not checked off will not be included in your pantry', [
                            {text: 'Cancel'}, {text: 'Yes', onPress: onCheckoutPress}
                        ])
                    }} 
                    style={tw`bg-${dm ? 'red-600' : "red-500"} mr-2 px-5 h-12 justify-center rounded-full`}>
                        {!uploading && <Text numberOfLines={1} style={tw`text-center text-white`} weight='semibold'>Check Out</Text>}
                        {uploading && <ActivityIndicator />}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}


export function PantryItemView(props: {item: PantryItem, onItemPress?: (id: string) => void, onCheckPress?: (id: string) => void, onDeletePress?: (id: string) => void}) {
    const { item } = props;
    const {ingredientID, inCart} = item
    const completed = inCart
    const [ingredient, setIngredient] = React.useState<Ingredient | undefined>(undefined)
    const dm = useColorScheme() === 'dark'
    React.useEffect(() => {
        DataStore.query(Ingredient, ingredientID).then(async x => {
            if (x) {
                if (isStorageUri(x.img || defaultImage)) {
                    setIngredient({ ...x, img: await Storage.get(x.img || defaultImage) })
                } else setIngredient(x)
            }
        })
    }, [props.item])
    if (!ingredient) return null;
    return <Swipeable renderRightActions={(progress, dragX) => {
        if (!props.onDeletePress) return null;
        return <TouchableOpacity onPress={() => {
            props.onDeletePress && props.onDeletePress(props.item.id)
        }} style={[tw`items-center justify-center p-3 bg-red-${dm ? '700' : '300'}`]}>
            <ExpoIcon name='x' iconName='feather' size={20} color='gray' />
            <Text>Delete</Text>
        </TouchableOpacity>
    }}>
        <TouchableOpacity onPress={() => {
            props.onItemPress && props.onItemPress(ingredient.id)
        }} style={tw`flex-row items-center my-2 justify-between`}>
        <View style={tw`flex-row items-center`}>
            <Image source={{ uri: ingredient.img || defaultImage }} style={tw`h-15 w-15 rounded-full`} />
            <View style={tw`ml-2 max-w-9/12`}>
                <Text weight={(completed && props.onCheckPress) ? 'regular' : 'bold'} style={tw`${(completed && props.onCheckPress) ? 'line-through' : ''}`}>{ingredient.name}</Text>
                <Text>{ingredient.quantity} {ingredient.units}</Text>
            </View>
        </View>
        {props.onCheckPress && <TouchableOpacity onPress={() => {
            props.onCheckPress && props.onCheckPress(item.id)
        }} style={tw`p-3`}>
        <ExpoIcon name='check-circle' iconName='feather' size={20} color={completed ? 'green' : 'gray'} />
        </TouchableOpacity>}
    </TouchableOpacity>
    </Swipeable>

}