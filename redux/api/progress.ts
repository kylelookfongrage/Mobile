import { createAsyncThunk } from "@reduxjs/toolkit";
import { Tables } from "../../supabase/dao";
import { supabase } from "../../supabase";



export const fetchProgressChildren = createAsyncThunk('progress/fetchProgressChildren', async (today: Tables['progress']['Row']) => {
    let {data: food, error: foodError} = await supabase.from('food_progress').select('*, food(*)').filter('progress_id', 'eq', today.id)
    if (foodError) throw Error(foodError.message)
    let {data: meal, error: mealError} = await supabase.from('meal_progress').select('*, meal(*, meal_ingredients(*))').filter('progress_id', 'eq', today.id)
    if (mealError) throw Error(mealError.message)
    let {data: workouts, error: workoutError} = await supabase.from('workout_play').select('*, workout(*, user(*))').filter('date', 'eq', today.date)
    if (workoutError) throw Error(workoutError.message)
    let {data: runs, error: runError} = await supabase.from('run_progress').select('*').filter('progress_id', 'eq', today.id)
    if (runError) throw Error(runError.message)
    return {food: food || [], meals: meal || [], workouts: workouts || [], runs: runs || []}
});


export const fetchToday = createAsyncThunk('progress/fetchToday', async (inp: {date: string, user: Tables['user']['Row']}): Promise<Tables['progress']['Row']> => {
    let {date, user} = inp;
    let {data: today, error} = await supabase.from('progress').select('*').filter('user_id', 'eq', user.id).filter('date', 'eq', date)
    if (error) throw Error(error.message)
    if (today?.[0]) {
        return today[0]
    } else {
        let {data: newProgress, error: newProgressError} = await supabase.from('progress').insert({date, metric: user.metric, user_id: user.id}).select()
        if (newProgressError) throw Error(newProgressError.message)
        return newProgress?.[0]
    }
})