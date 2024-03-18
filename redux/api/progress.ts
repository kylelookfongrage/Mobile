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

export const fetchTodaysTasks = createAsyncThunk('progress/fetchTodaysTasks', async (today: Tables['progress']['Row']) => {
    let {data: plans, error: fpError} = await supabase.from('fitness_plan_subscription').select('*, fitness_plan(*)').filter('user_id', 'eq', today.user_id)
    if (fpError || !plans) {
        throw Error(fpError?.message)
    }
    let {data: tasks, error: atError} = await supabase.from('agenda_task').select('*, meal(*), workout(*), fitness_plan(*), progress:task_progress(*)').filter('user_id', 'eq', today.user_id).eq('progress.date', today.date).filter('start_date', 'lte', today.date).or(`end_date.is.null, end_date.gte.${today.date}`)
    if (atError || !tasks) {
        throw Error(atError?.message)
    }
    console.log(tasks)
    return {plans, tasks}
})


export const saveTaskProgress = createAsyncThunk('progress/saveTaskProgress', async (inp: {today: Tables['progress']['Insert'], task_progress: Tables['task_progress']['Insert']}) => {
    let {today, task_progress} = inp;
    let {data, error} = await supabase.from('task_progress').insert({...task_progress, date: today.date, user_id: today.user_id}).select().single()
    if (error || !data) throw Error(error?.message || 'There was a problem, please try again.')
    return {task_progress: data as Tables['task_progress']['Row']}
})

export const deleteTaskProgress = createAsyncThunk('progress/deleteTaskProgress', async (task_progress: Tables['task_progress']['Row']) => {
    let {data, error} = await supabase.from('task_progress').delete().filter('id', 'eq', task_progress.id)
    console.log(error)
    if (error) throw Error(error?.message || 'There was a problem, please try again.')
    return {task_id: task_progress.task_id}
})