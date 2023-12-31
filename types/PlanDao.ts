import { isStorageUri } from "../data";
import { PlanAdditions } from "../hooks/useMultipartForm";
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

    const subscribeToPlan = async (user_id: Tables['user']['Row']['id'], fitness_plan: Tables['fitness_plan']['Row'], details: PlanAdditions[], subscribeMacros: boolean=false, tdee: number=2000) => {
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
        let _agendaTasks: Tables['agenda_task']['Insert'][] = details.map(x => {
            return {
                repeat_frequency: undefined,
                user_id,
                fitness_plan_id: fitness_plan.id,
                workout_id: x.workout_id,
                meal_id: x.meal_id,
                days_of_week: [x.day_of_week || 0],
                subscription_id: fitness_plan_subscription.id
            }
        })
        let {data: agendaTasks, error: agendaError} = await supabase.from('agenda_task').insert(_agendaTasks).select()
        if (!agendaTasks) {
            throw Error(agendaError?.message || 'There was a problem, please try to make agenda items again')
        }
        return {fitness_plan_subscription, agendaTasks, updates}

    }

    return {find, save, saveDetails, getDetails, subscribeToPlan}
}