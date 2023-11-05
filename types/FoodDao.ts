import { useEffect, useState } from "react";
import { Tables, useDao } from "../supabase/dao";
import { useStorage } from "../supabase/storage";
import { supabase } from "../supabase";

export function FoodDao(){
    const dao = useDao()
    const storage = useStorage() //@ts-ignore
    const remove = async (id: Tables['food']['Row']['id']) => (await dao.remove('food', id))
    const find = async (id: Tables['food']['Row']['id']) => (await dao.find('food', id))
    const save = async (document: Tables['food']['Insert'], uploadImage=true): Promise<Tables['food']['Row'] | null> => {
        let copiedDocument = {...document}
        if (document.image && uploadImage) {
            let attemptedUpload = await storage.upload({type: 'image', uri: document.image})
            copiedDocument['image'] = attemptedUpload?.uri || document['image']
        }
        return await dao.save('food', copiedDocument)
    }
    return {find, save, remove}
}

type TPantryItem = Tables['pantry_item']['Row'] & {food?: Tables['food']['Row']}
export function PantryDao(user_id: string){
    let [items, setItems] = useState<TPantryItem[]>([])
    let [sub, setSub] = useState<any>(null)
    let dao = useDao()
    let insertFood = async (food: Tables['food']['Insert']) => {
        if (food.id) {
            await supabase.from('pantry_item').insert({
                food_id: food.id,
                user_id, 
                quantity: food.quantity,
                servingSize: food.servingSize,
                purchased: false,
                cart: true,
            })
        } else {
            let res = await dao.save('food', food)
            if (res) {
                await supabase.from('pantry_item').insert({
                    food_id: res.id,
                    user_id, 
                    quantity: res.quantity,
                    servingSize: res.servingSize,
                    purchased: false,
                    cart: true,
                })
            }
        }
    }

    const insertMeal = async (meal_id: Tables['meal']['Row']['id']) => {
        let meal_ingredients = await supabase.from('meal_ingredients').select('food_id, quantity, servingSize').filter('meal_id', 'eq', meal_id)
        console.log('inserting meal ingredients with ids')
        console.log(meal_ingredients)
        if (meal_ingredients.data) {
            await supabase.from('pantry_item').insert(meal_ingredients.data.map(x => ({
                user_id, 
                quantity: x.quantity,
                servingSize: x.servingSize,
                purchased: false,
                cart: true,
                food_id: x.food_id
            })))
        }
    }
    const fetchItems = async () => {
        let res = await supabase.from('pantry_item').select('*, food(*)').filter('user_id', 'eq', user_id).filter('food_id', 'neq', null)
        if (res.data) {
            setItems(res.data)
        }
    }

    //@ts-ignore
    const remove = async (id: Tables['pantry_item']['Row']['id']) => await dao.remove('pantry_item', id)
    const update = async (id: Tables['pantry_item']['Row']['id'], doc: Tables['pantry_item']['Update']) => await dao.update('pantry_item',id, doc)

    useEffect(() => {
        if (sub) return;
        let subscription = supabase.channel('pantryDao').on('postgres_changes', {
            table: 'pantry_item', 
            event: '*', 
            filter: `user_id=eq.${user_id}`, 
            schema: 'public'
        }, async () => {
            await fetchItems()
        }).subscribe()
        setSub(subscription)
        return () => {
            if (subscription) subscription.unsubscribe()
        }
    }, [user_id])

    return {items, insertMeal, insertFood, remove, update}
}