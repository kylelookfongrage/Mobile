import { useEffect, useState } from "react"
import { Tables, useDao, useRealtime } from "../supabase/dao"
import { useCommonAWSIds } from "../hooks/useCommonContext"
import moment from "moment"
import { useDateContext } from "../screens/home/Calendar"
import { supabase } from "../supabase"

export function ProgressDao(listen=true){
    const dao = useDao()
    const {progressId, setProgressId, profile} = useCommonAWSIds()
    const {AWSDate} = useDateContext()
    const [today, setToday] = useState<Tables['progress']['Row'] | null>()
    type TFoodProgress = Tables['food_progress']['Row'] & {food: Tables['food']['Row']}
    const [foodProgress, setFoodProgress] = useState<TFoodProgress[]>([])
    type TMealProgress = Tables['meal_progress']['Row'] & {
        meal: Tables['meal']['Row'] & {
            meal_ingredients: Tables['meal_ingredients']['Row'][]
        }
    }
    const [mealProgress, setMealProgress] = useState<TMealProgress[]>([])
    type TWorkoutPlay = Tables['workout_play']['Row'] & {workout: (Tables['workout']['Row'] & {user: Tables['user']['Row'] | null}) | null}
    const [workoutProgress, setWorkoutProgress] = useState<TWorkoutPlay[]>([])
    const [runProgress, setRunProgress] = useState<Tables['run_progress']['Row'][]>([])

    useEffect(() => {
        if (!profile || !AWSDate) return;
        fetchProgressForToday()
    }, [profile, AWSDate])

    const fetchChildren = async () => {
        if (!today) return;
        let res = await dao.query(x => x.from('food_progress').select('*, food(*)').filter('progress_id', 'eq', today.id))
        if (res) setFoodProgress(res)
        let mealFetch = await supabase.from('meal_progress').select('*, meal(*, meal_ingredients(*))').filter('progress_id', 'eq', today.id)
        if (mealFetch.data) { //@ts-ignore
            setMealProgress(mealFetch.data)
        }
        let workoutRes = await supabase.from('workout_play').select('*, workout(*, user(*))').filter('date', 'eq', today.date)
        if (workoutRes.data) {setWorkoutProgress(workoutRes.data)}
    }
    const saveProgress = async <T extends keyof Tables>(table: T, payload: Tables[T]['Insert']): Promise<Tables[T]['Insert'] | null> => {
        if (!today) return null;
        let res = await dao.save(table, {...payload, progress_id: today.id})
        await dao.update('progress', today.id, {points: (today.points || 0) + 1})
        return (res || null)
    }

    const log = async () => {
        await updateProgress('points', (today?.points || 0) + 1)
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

    useEffect(() => {
        if (!today || !listen) return;
        setProgressId(today.id);
        fetchChildren()
        console.log('Making Subscription for Progress table with ID: ' + today.id)
        const subscription = supabase.channel('progressDao').on('postgres_changes', {
            table: 'progress', 
            event: '*', 
            filter: `id=eq.${today.id}`, 
            schema: 'public'
        }, (x: any) => {
            let ogPoints = today.points
            if (x['new']) {
                setToday(x['new'])
                if (x['new']['points'] && x['new']['points'] !== ogPoints) {
                    fetchChildren()
                }
            }
        }).subscribe(c => {
            console.log(c + ': Progress table with ID: ' + today.id)
        })
        return () => {
            console.log('calling unsubscribe')
            subscription.unsubscribe()
        }
    }, [today?.id])



    const fetchProgressForToday = async () => {
        console.log('fetching progress for '+AWSDate)
        if (!profile?.id) return;
        if (today?.date === AWSDate) return;
        try {
            let res = await dao.query(db =>
                db.from('progress').select('*').filter('user_id', 'eq', profile.id).filter('date', 'eq', AWSDate)    
            , false, false)
            if (res?.[0]) {
                console.log('setting today')
                setToday(res[0])
            } else {
                console.log('saving progress for ' + AWSDate)
                let newProgress = await dao.save('progress', {date: AWSDate, metric: profile.metric})
                //@ts-ignore
                setToday(newProgress)
            }
        } catch (error) {
            console.log(error)
        }
    }

    return {today, fetchProgressForToday, saveProgress, updateProgress, deleteProgress, foodProgress, mealProgress, runProgress, workoutProgress, log}
}