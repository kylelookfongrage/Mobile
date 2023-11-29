

import moment, { Moment } from "moment"
import type { Tables } from "../../supabase/dao"
import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import { fetchProgressChildren, fetchToday } from "../api/progress"

type TFoodProgress = Tables['food_progress']['Row'] & {food: Tables['food']['Row']}
type TMealProgress = Tables['meal_progress']['Row'] & {
    meal: Tables['meal']['Row'] & {
        meal_ingredients: Tables['meal_ingredients']['Row'][]
    }
}
type TWorkoutPlay = Tables['workout_play']['Row'] & {workout: (Tables['workout']['Row'] & {user: Tables['user']['Row'] | null}) | null}

const initialState = {
    today: null as Tables['progress']['Row'] | null,
    formattedDate: moment().format() as string,
    foodProgress: [] as TFoodProgress[],
    mealProgress: [] as TMealProgress[],
    workoutProgress: [] as TWorkoutPlay[],
    runProgress: [] as Tables['run_progress']['Row'][]
}

export type TProgress = typeof initialState;

//@ts-ignore
let progressSlice = createSlice({
    initialState,
    name: 'progress',
    reducers: {
        changeDate: (state: TProgress, action: PayloadAction<{date: string}>) => {
            state.formattedDate = moment(action.payload.date).format()
        }
    },
    extraReducers: _builder => {
        _builder.addCase(fetchToday.fulfilled, (state, action) => {
            let today = action.payload
            state.today = today;
        })
        .addCase(fetchProgressChildren.fulfilled, (state, action) => {
            let {food, meals, workouts, runs} = action.payload
            state.foodProgress = food;
            state.mealProgress = meals;
            state.workoutProgress = workouts;
            state.runProgress = runs
        })
    }
})


export default progressSlice;
export const {changeDate} = progressSlice.actions