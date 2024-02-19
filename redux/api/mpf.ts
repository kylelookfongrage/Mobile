import { Tables } from "../../supabase/dao";
import { useDispatch, useSelector } from "../store"
import {upsert as _upsert, remove as _remove, TMultiPartForm} from '../reducers/multiform'
import { defaultImage } from "../../data";

export const useMultiPartForm = <K extends keyof TMultiPartForm, T extends keyof TMultiPartForm[K], Z extends TMultiPartForm[K][T]>(type: K, uuid: string) => {
    let state = useSelector(x => x.mpf)
    let edited = state['edited'][uuid]!!
    //@ts-ignore
    let data: Z = state[type][uuid] || (type === 'edited' ? false : [])
    let dispatch = useDispatch()
    const upsert = (ingredients: Z) => {
        dispatch(_upsert({ingredients, type, uuid}))
    }
    const remove = () => {
        dispatch(_remove({type, uuid}))
    }
    const upsert_other = <K1 extends keyof TMultiPartForm, T1 extends keyof TMultiPartForm[K1], Z1 extends TMultiPartForm[K1][T1]>(_type: K1, _uuid: string, ingredients: Z1) => {
        dispatch(_upsert({ingredients, type: _type, uuid: _uuid}))
    }
    const q = <K1 extends keyof TMultiPartForm, T1 extends keyof TMultiPartForm[K1], Z1 extends TMultiPartForm[K1][T1]>(key: K1, uuid: string): Z1 => {
        //@ts-ignore
        return state[key][uuid]
    }

    return {remove, upsert, edited, data, upsert_other, q}
}

export type MPFType = ReturnType<typeof useMultiPartForm>



export const formToIngredient = (form: Tables['food']['Insert'], payload: {calories: number, protein: number, carbs: number, fat: number, otherNutrition: any[]; tempId: string}) => {
    let {calories, protein, carbs, fat, otherNutrition, tempId} = payload
    return  {
        calories: calories,
        carbs: carbs,
        fat: fat,
        food_id: form.id,
        otherNutrition: otherNutrition,
        protein: protein,
        quantity: form.quantity,
        servingSize: form.servingSize,
        servingSizes: form.servingSizes,
        name: form.name,
        img: form.image || defaultImage,
        weight: form.weight,
        category: form.category,
        ingredients: form.ingredients,
        tempId,
    }
}