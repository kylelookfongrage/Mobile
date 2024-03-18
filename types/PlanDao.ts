import moment, { Moment } from "moment";
import { isStorageUri } from "../data";
import { PlanAdditions } from "../hooks/useMultipartForm";
import { TAgendaTask } from "../redux/reducers/progress";
import { supabase } from "../supabase";
import { Tables, useDao } from "../supabase/dao";
import { useStorage } from "../supabase/storage";

export function PlanDao(){
    const dao = useDao()
    const storage = useStorage()
    const find = async (id: number) => (await dao.find('fitness_plan', id))
    const save = async (document: Tables['fitness_plan']['Insert']): Promise<Tables['fitness_plan']['Insert'] | null> => {
        let copiedDocument = {...document}
        if (document.image) {
            let attemptedUpload = await storage.upload({type: 'image', uri: document.image, supabaseID: isStorageUri(document.image) ? document.image : undefined})
            console.log(attemptedUpload)
            copiedDocument['image'] = attemptedUpload?.uri || document['image']
        }
        console.log(copiedDocument)
        return document.id ? await dao.update('fitness_plan', document.id, copiedDocument) : await dao.save('fitness_plan', copiedDocument)
    }
    const saveDetails = async (fitness_plan_id: Tables['fitness_plan']['Row']['id'], documents: PlanAdditions[]) => {
        let copy = documents.map(x => {
            let c = {...x, fitness_plan_id: fitness_plan_id} //@ts-ignore
            delete c['image'] //@ts-ignore
            delete c['name']
            delete c['id']
            return c
        })
        let r = await supabase.from('fitness_plan_details').delete().filter('fitness_plan_id', 'eq', fitness_plan_id)
        if (!r.error) {
            let res = await supabase.from('fitness_plan_details').insert(copy).select()
            return res?.data
        }
        return null
    }

    const getDetails = async (id: Tables['fitness_plan']['Row']['id']): Promise<PlanAdditions[] | null> => {
        let d = await supabase.from('fitness_plan_details').select('*, meal(name, preview), workout(name, image)').filter('fitness_plan_id', 'eq', id)
        if (d.data) {
            let res = d.data.map(x => {
                return {...x, name: x.meal?.name || x.workout?.name || '', image: x.meal?.preview || x.workout?.image || ''}
            })
            return res
        }
        return null
    }

    const subscribeToPlan = async (user_id: Tables['user']['Row']['id'], date: string, fitness_plan: Tables['fitness_plan']['Row'], details: PlanAdditions[], subscribeMeals=true, subscribeWorkouts=true, subscribeMacros: boolean=false, tdee: number=2000) => {
        let updates: Tables['user']['Update'] | null = null;
        if (subscribeMacros) {
            let _updates: Tables['user']['Update'] = {
                proteinLimit: typeof fitness_plan.protein_limit === 'number' ? (fitness_plan.protein_limit) : (typeof fitness_plan.protein_percent === 'number' ? tdee * fitness_plan.protein_percent : ((tdee * 0.4) / 4)),
                carbLimit: typeof fitness_plan.carb_limit === 'number' ? (fitness_plan.carb_limit) : (typeof fitness_plan.carb_percent === 'number' ? tdee * fitness_plan.carb_percent : ((tdee * 0.3) / 4)),
                fatLimit: typeof fitness_plan.fat_limit === 'number' ? (fitness_plan.fat_limit) : (typeof fitness_plan.fat_percent === 'number' ? tdee * fitness_plan.fat_percent : ((tdee * 0.3) / 9)),
                tdee
            }
            let {data: userUpdateData, error: userUpdateError} = await supabase.from('user').update(_updates).filter('id', 'eq', user_id).select().single()
            if (userUpdateData) updates = userUpdateData
        }
        let {data: fitness_plan_subscription, error} = await supabase.from('fitness_plan_subscription').insert({
            user_id,
            fitness_plan_id: fitness_plan.id
        }).select().single()
        if (!fitness_plan_subscription) {
            throw Error(error?.message || 'There was a problem, please try again')
        }
        let _agendaTasks: Tables['agenda_task']['Insert'][] = details.filter(x => subscribeMeals ? true : !x.meal_id).filter(x => subscribeWorkouts ? true : !x.workout_id).map(x => {
            return {
                repeat_frequency: 'WEEKLY',
                user_id,
                fitness_plan_id: fitness_plan.id,
                workout_id: x.workout_id,
                meal_id: x.meal_id,
                days_of_week: [x.day_of_week || 0],
                subscription_id: fitness_plan_subscription.id,
                start_date: date
            }
        })
        let {data: agendaTasks, error: agendaError} = await supabase.from('agenda_task').insert(_agendaTasks).select()
        if (!agendaTasks) {
            throw Error(agendaError?.message || 'There was a problem, please try to make agenda items again')
        }
        return {fitness_plan_subscription, agendaTasks, updates}

    }

    let createOrUpdatePlan = async (t: TAgendaTaskAppended) => {
        console.log('new task', t)
        let id = t.task_id || t.id || undefined;
        let obj = {
            days_of_week: t.repeat_frequency === 'WEEKLY' ?  t.days_of_week || [] : null,
            end_date: t.end_date,
            meal_id: t.meal?.id || t.meal_id,
            name: t.name, 
            description: t.description,
            repeat_frequency: t.repeat_frequency,
            start_date: t.start_date || moment().format(),
            start_time: t.start_time,
            workout_id: t.workout?.id || t.workout_id,
            days_of_month: t.repeat_frequency === 'MONTHLY' ? t.days_of_month : null
        }
        if (id) {
            let res = await dao.update('agenda_task', id, {...obj, id: id})
            return res;
        } else {
            let res = await dao.save('agenda_task', {...obj, user_id: t.user_id})
            return res;
        }
    }

    return {find, save, saveDetails, getDetails, subscribeToPlan, createOrUpdatePlan, remove: dao.remove}
}



export const def = {
    task_id: undefined as undefined | Tables['agenda_task']['Row']['id'],
    type: 'Task',
    screen: undefined as string | undefined,
    child_id: undefined as string | number | undefined,
    related: undefined as string | undefined | null,
    completed: false,
  }
  
export type TAgendaTaskAppended = typeof def & TAgendaTask;

export const isTaskCompleted = (x: TAgendaTask) => {
    return (x.progress) ? (Array.isArray(x.progress) ? x.progress.length > 0 : x.progress ? true : false) : false
}


export const agendaTaskToAppended = (selectedTask: TAgendaTask) => {
    //@ts-ignore
    let _def: TAgendaTaskAppended = { ...def }
    _def = { ...selectedTask, completed: isTaskCompleted(selectedTask), task_id: undefined, type: 'Task', screen: undefined, child_id: undefined, related: undefined}
    _def.fitness_plan = selectedTask.fitness_plan || undefined
    if (selectedTask.meal) {
      _def.meal = selectedTask.meal
      _def.name = selectedTask.name || selectedTask.meal.name || ''
      _def.screen = 'MealDetail'
      _def.child_id = selectedTask.meal.id
      _def.description = selectedTask.description || 'Log Meal: ' + selectedTask.meal
      _def.type = 'Meal'
      _def.related = selectedTask.meal.name || ''
    }
    if (selectedTask.workout) {
      _def.workout = selectedTask.workout
      _def.name = selectedTask.name || selectedTask.workout.name || ''
      _def.screen = 'WorkoutDetail'
      _def.child_id = selectedTask.workout.id
      _def.description = selectedTask.description || 'Complete Workout: ' + selectedTask.workout.name
      _def.type = 'Workout'
      _def.related = selectedTask.workout.name || ''
    }
    if (selectedTask.run) {
      _def.name = selectedTask.name || 'Run'
      _def.description =  selectedTask.description || 'Complete a Run!'
      _def.screen = 'RunProgress'
      _def.type = 'Activity'
      _def.related = 'Run Activity'
    }
    return _def
}


// let taskIncludesToday = (task: TAgendaTask, today: Moment=moment()): boolean => {
//     if (!task.start_date) return false;
//     let start = recur(task.start_date)

//     return start.matches(today)

// }

