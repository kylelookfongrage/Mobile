import { createContext, useContext } from "react";
import { FormReducer, useForm } from "./useForm";
import { Tables } from "../supabase/dao";
import { defaultImage } from "../data";

export type IngredientAdditions = {
    name: string,
    img?: string | null,
    tempId: string
} & Tables['meal_ingredients']['Insert'];


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
        tempId,
    }
}


export type WorkoutAdditions = {
    name: string;
    img: string;
    equiptment: Tables['equiptment']['Row'][];
    tempId?: string
} & Tables['workout_details']['Insert'];

interface formContext {
    data: {
        meals: {
            [k: string] : IngredientAdditions[]
        }
        workouts: {
            [k: string] : WorkoutAdditions[]
        }
        edited: {
            [k: string] : boolean;
        }
    },
    upsert: <K extends keyof formContext['data'], T extends keyof formContext['data'][K]>(type: K, uuid: string, ingredients: formContext['data'][K][T]) => void;
    remove: (type: keyof formContext['data'], uuid: string) => void;
}


let MultiPartFormContext = createContext<formContext>({data: {meals: {}, workouts: {}, edited: {}}, upsert: () => {}, remove: () => {}})

export const useMultiPartForm = () => useContext<formContext>(MultiPartFormContext);

export const Provider = (props: any) => {
    let form = useForm<formContext['data']>({meals: {}, workouts: {}, edited: {}})
    let upsert = <K extends keyof formContext['data'], T extends keyof formContext['data'][K]>(type: K, uuid: string, ingredients: formContext['data'][K][T]) => {
        //@ts-ignore
        form.setForm(type, {...form.state.meals, [uuid] : ingredients})
        let hasProperty = form.state?.edited?.[uuid] !== undefined
        form.setForm('edited', {...form.state?.edited, [uuid] : (hasProperty ? true : false)})
    }
    let remove = (type: keyof formContext['data'], uuid: string) => {
        try {
            let copy = {...form.state}
            delete copy[type][uuid]
            if (copy['edited'][uuid]) {
                delete copy['edited'][uuid]
            }
            form.dispatch({type: FormReducer.Set, payload: copy})
        } catch (error) {
            
        }
    }
   
    return <MultiPartFormContext.Provider value={{data: form.state, upsert, remove}}>
        {props.children}
    </MultiPartFormContext.Provider>
}