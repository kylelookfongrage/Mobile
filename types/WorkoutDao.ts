import { WorkoutAdditions } from "../hooks/useMultipartForm";
import { supabase } from "../supabase";
import { Tables, useDao } from "../supabase/dao";
import { useStorage } from "../supabase/storage";

export function WorkoutDao(){
    const dao = useDao()
    const storage = useStorage()
    const find = async (id: Tables['exercise']['Row']['id']) => (await dao.find('workout', id))
    type TWorkoutDetails = Tables['workout_details']['Row'] & {
        exercise: Tables['exercise']['Row'] & {
            exercise_equiptment: {
                equiptment: Tables['equiptment']['Row']
            }[]
        }
    }
    const find_eqipment = async (id: Tables['exercise']['Row']['id']): Promise<TWorkoutDetails[]> => {
        let res = await supabase.from('workout_details').select(`
            *, exercise(*, exercise_equiptment(
                equiptment(*)
            ))
        `).filter('workout_id', 'eq', id)
        return res?.data || []
    }
    const search = async (keyword: string | undefined) => {
        // console.log('searching for ' + keyword)
        if (!keyword) return (await supabase.from('workout').select('*').range(0, 50))?.data || null
        let res = await supabase.from('workout').select('*').filter('name', 'ilike', `%${keyword}%`).range(0, 50)
        return res?.data || null
    }
    const save = async (workout: Tables['workout']['Insert']): Promise<Tables['workout']['Insert'] | null> => {
        let copiedDocument = {...workout}
        if (workout.image) {
            let attemptedUpload = await storage.upload({type: 'image', uri: workout.image})
            copiedDocument['image'] = attemptedUpload?.uri || workout['image']
        }
        let res = workout.id ? await dao.update('workout', workout.id, copiedDocument) : await dao.save('workout', copiedDocument)
        return res;
    }

    const saveWorkoutDetails = async (id: Tables['workout']['Row']['id'], details: WorkoutAdditions[]) => {
        await supabase.from('workout_details').delete().filter('workout_id', 'eq', id)
        let ingrs: Tables['workout_details']['Insert'][] = []
        for (var d of details) {
            let copy = {...d} //@ts-ignore
            delete copy['equiptment']  //@ts-ignore
            delete copy['img'] //@ts-ignore
            delete copy['name'] //@ts-ignore
            copy['exercise_id'] = copy['tempId']
            delete copy['tempId']
            copy['workout_id'] = id
            ingrs.push(copy)
        }
        console.log(ingrs)
        return await supabase.from('workout_details').insert(ingrs).select()
    }

    return {find, save, search, saveWorkoutDetails, find_eqipment}
}