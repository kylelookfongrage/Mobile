import { supabase } from "../supabase";
import { Tables, useDao } from "../supabase/dao";
import { useStorage } from "../supabase/storage";

export function ExerciseDao(){
    const dao = useDao()
    const storage = useStorage()
    const find = async (id: string) => (await dao.find('exercise', id))
    const save = async (exercise: Tables['exercise']['Insert'], originalVideo?: string | undefined, originalPreview?: string | undefined): Promise<Tables['exercise']['Row'] | null> => {
        let copiedDocument = {...exercise}
        let {preview, video} = await storage.uploadWithPreview(exercise.video, exercise.preview, originalVideo, originalPreview)
        copiedDocument['preview'] = preview;
        copiedDocument['video'] = video
        return exercise.id ? await dao.update('exercise', exercise.id, copiedDocument) : await dao.save('exercise', copiedDocument)
    }
    const saveEquiptment = async (exercise: Tables['exercise']['Row'],equiptment: Tables['equiptment']['Row'][]) => {
        await supabase.from('exercise_equiptment').delete().filter('exercise_id', 'eq', exercise.id).filter('equiptment_id', 'in', equiptment.map(x => x.id))
        const res = await supabase.from('exercise_equiptment').insert(equiptment.map(x => ({exercise_id: exercise.id, equiptment_id: x.id})))
        return res
    }
    const search = async (options: {keyword?: string | null; belongsTo?: string; favorited?: boolean; selectString?: string}): Promise<Tables['exercise']['Row'][] | null> => {
        let {keyword, belongsTo, favorited, selectString} = options
        let q = supabase.from('exercise').select(selectString || '*')
        if (keyword) q = q.filter('name', 'ilike', `%${keyword}%`)
        if (belongsTo) q = q.filter('user_id', 'eq', belongsTo)
        let data = await q.range(0, 50)
        //@ts-ignore
        return data?.data || null
    }

    return {find, save, saveEquiptment, search}
}