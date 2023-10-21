import { IngredientAdditions } from "../hooks/useMultipartForm";
import { supabase } from "../supabase";
import { Tables, useDao } from "../supabase/dao";
import { useStorage } from "../supabase/storage";

export function MealDao() {
    const dao = useDao()
    const storage = useStorage()
    const find = async (id: Tables['meal']['Row']['id']) => (await dao.find('meal', id));
    const remove = async (id: Tables['meal']['Row']['id']) => {await dao.remove('meal', id)}
    const save = async (meal: Tables['meal']['Insert'], originalVideo?: string | undefined, originalPreview?: string | undefined): Promise<Tables['meal']['Row'] | null> => {
        let copiedDocument = { ...meal }
        let { preview, video } = await storage.uploadWithPreview(meal.video, meal.preview, originalVideo, originalPreview)
        copiedDocument['preview'] = preview;
        copiedDocument['video'] = video
        return meal.id ? await dao.update('meal', meal.id, copiedDocument) : await dao.save('meal', copiedDocument)
    }
    type TIngredientAddition = Tables['meal_ingredients']['Row'] & {food: {name: string, image: string, servingSizes: any}}
    const getIngredients = async (id: Tables['meal']['Row']['id']): Promise<TIngredientAddition[]> => {
        let res = await supabase.from('meal_ingredients').select('*, food(name, image, servingSizes)').filter('meal_id', 'eq', id)
        return res?.data || []
    }

    const getIngredientFromIngredientAddition = (i: IngredientAdditions): Tables['meal_ingredients']['Insert'] => {
        return {
            calories: i.calories,
            carbs: i.carbs,
            fat: i.fat,
            food_id: i.food_id,
            meal_id: i.meal_id,
            otherNutrition: i.otherNutrition,
            protein: i.protein,
            quantity: i.quantity,
            servingSize: i.servingSize,
            servingSizes: i.servingSizes,
            weight: i.weight
        }
    }

    const saveIngredients = async (meal: Tables['meal']['Row'], ingredients: IngredientAdditions[]): Promise<Tables['meal_ingredients']['Row'][] | null> => {
        console.log('saving ingredients')
        await supabase.from('meal_ingredients').delete().filter('meal_id', 'eq', meal.id)
        let ingrs: Tables['meal_ingredients']['Insert'][] = []
        for (var i of ingredients) {
            let newFood = i.food_id
            if (!newFood) {
                let copy = {...i, image: i.img}
                delete copy['img'] //@ts-ignore
                delete copy['tempId']
                delete copy['id']
                console.log('saving new food')
                newFood = (await dao.save('food', {...copy, otherNutrition: copy.otherNutrition || undefined, public: false}))?.id
            }
            console.log(newFood)
            if (!newFood) return null;
            ingrs.push(getIngredientFromIngredientAddition({...i, food_id: newFood, meal_id: meal.id}))
        }
        console.log(ingrs)
        const res = await supabase.from('meal_ingredients').insert(ingrs.map(x => ({ meal_id: meal.id, ...x }))).select()
        console.log('inserting details')
        console.log(res)
        return res?.data || null;
    }

    return { find, save, saveIngredients, getIngredientFromIngredientAddition, getIngredients, remove }
}