import { supabase } from "../supabase";
import { Tables, useDao } from "../supabase/dao";
import { useStorage } from "../supabase/storage";

export function EquiptmentDao(){
    const dao = useDao()
    const storage = useStorage()
    const find = async (id: string) => (await dao.find('equiptment', id))
    const search = async (keyword: string | undefined, exercise_equipment=true) => {
        // console.log('searching for ' + keyword)
        if (!keyword) return (await supabase.from('equiptment').select('*').filter('exercise_equipment', exercise_equipment ? 'eq' : 'neq', true).order('name', {ascending: true}).range(0, 55))?.data || null
        let res = await supabase.from('equiptment').select('*').filter('name', 'ilike', `%${keyword}%`).filter('exercise_equipment', exercise_equipment ? 'eq' : 'neq', true).order('name', {ascending: true}).range(0, 55)
        return res?.data || null
    }
    const save = async (document: Tables['equiptment']['Insert']): Promise<Tables['equiptment']['Insert'] | null> => {
        let copiedDocument = {...document}
        if (document.image) {
            let attemptedUpload = await storage.upload({type: 'image', uri: document.image})
            copiedDocument['image'] = attemptedUpload?.uri || document['image']
        }
        return await dao.save('equiptment', copiedDocument)
    }

    type TByExercise = {equiptment: Tables['equiptment']['Row'] } & Tables['exercise_equiptment']['Row'] 
    const byExercise = async (exerciseId: Tables['exercise']['Row']['id']) : Promise<TByExercise[] | null> => {
        let q = await supabase.from('exercise_equiptment').select('*, equiptment(*)').filter('exercise_id', 'eq', exerciseId)
        return q?.data || null;
    }

    return {find, save, search, byExercise}
}