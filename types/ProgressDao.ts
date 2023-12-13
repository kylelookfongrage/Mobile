import { useEffect, useState } from "react"
import { Tables, useDao, useRealtime } from "../supabase/dao"
import { useCommonAWSIds } from "../hooks/useCommonContext"
import moment from "moment"
import { useDateContext } from "../screens/home/Calendar"
import { supabase } from "../supabase"
import { useDispatch, useSelector } from "../redux/store"
import { fetchProgressChildren, fetchToday } from "../redux/api/progress"

export function ProgressDao(listen=true){
    const dao = useDao()
    let {profile} = useSelector(x => x.auth)
    let dispatch = useDispatch()
    let {runProgress, foodProgress, mealProgress, workoutProgress, today, formattedDate: date} = useSelector(x => x.progress)

    useEffect(() => {
        if (!profile) return;
        dispatch(fetchToday({date: date, user: profile}))
    }, [date])

    useEffect(() => {
        if (!today) return;
        dispatch(fetchProgressChildren(today))
    }, [today?.id])

    const saveProgress = async <T extends keyof Tables>(table: T, payload: Tables[T]['Insert']): Promise<Tables[T]['Insert'] | null> => {
        if (!today) return null;
        let res = payload.id ? await dao.update(table, payload.id, {...payload, progress_id: today.id}) : await dao.save(table, {...payload, progress_id: today.id})
        await log()
        return (res || null)
    }

    const log = async () => {
        if (!today) return;
        await updateProgress('points', (today?.points || 0) + 1)
        dispatch(fetchProgressChildren(today))
    }

    const deleteProgress = async <T extends keyof Tables>(id: Tables[T]['Row']['id'], table: T) => {
        await dao.remove(table, id)
        await log()
    }

    const updateProgress = async <C extends keyof Tables['progress']['Update'], V extends Tables['progress']['Update'][C]>(column: C, value: V) => {
        if (!today) return;
        //@ts-ignore
        let document: {
            [key in C]: V
        } = {}
        document[column] = value
        await dao.update('progress', today.id, document)
    }

    return {today, saveProgress, updateProgress, deleteProgress, foodProgress, mealProgress, runProgress, workoutProgress, log}
}