import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Tables } from "../../supabase/dao";

export type WorkoutAdditions = {
    name: string;
    img: string;
    equiptment: Tables['equiptment']['Row'][];
    tempId?: string
} & Tables['workout_details']['Insert'];

export type IngredientAdditions = {
    name: string,
    img?: string | null,
    tempId: string
} & Tables['meal_ingredients']['Insert'];


export type PlanAdditions = {
    name: string;
    image: string;
} & Tables['fitness_plan_details']['Insert']

const initialState = {
    edited : {} as {[k: string]: boolean},
    meals: {} as {[k: string]: IngredientAdditions[]},
    workouts: {} as {[k: string]: WorkoutAdditions[]},
    plans: {} as {[k: string]: PlanAdditions[]}
};


export type TMultiPartForm = typeof initialState;

//@ts-ignore
const multipartformSlice = createSlice({
    initialState, 
    name: 'multipartform',
    reducers: {
        upsert: <K extends keyof TMultiPartForm, T extends keyof TMultiPartForm[K], Z extends TMultiPartForm[K][T]>(state: TMultiPartForm, action: PayloadAction<{ingredients: Z, uuid: string, type: K}>) => {
            let {ingredients, uuid, type} = action.payload;
            let og = state[type][uuid]
            state[type][uuid] = ingredients
            state['edited'][uuid] = og ? true : false
        },
        remove: <K extends keyof TMultiPartForm>(state: TMultiPartForm, action: PayloadAction<{uuid: string, type: K}>) => {
            let {uuid, type} = action.payload;
            try {
                delete state[type][uuid]
                delete state['edited'][uuid]
            } catch (error) {
                
            }
        },

    }
})

export default multipartformSlice;
export const {remove, upsert} = multipartformSlice.actions

