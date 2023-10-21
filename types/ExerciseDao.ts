import { ChartMapping } from "../data";
import { supabase } from "../supabase";
import { Tables, useDao } from "../supabase/dao";
import { useStorage } from "../supabase/storage";
import moment from 'moment';

export function ExerciseDao() {
    const dao = useDao()
    const storage = useStorage()
    const find = async (id: string) => (await dao.find('exercise', id))
    const save = async (exercise: Tables['exercise']['Insert'], originalVideo?: string | undefined, originalPreview?: string | undefined): Promise<Tables['exercise']['Row'] | null> => {
        let copiedDocument = { ...exercise }
        let { preview, video } = await storage.uploadWithPreview(exercise.video, exercise.preview, originalVideo, originalPreview)
        copiedDocument['preview'] = preview;
        copiedDocument['video'] = video
        return exercise.id ? await dao.update('exercise', exercise.id, copiedDocument) : await dao.save('exercise', copiedDocument)
    }
    const saveEquiptment = async (exercise: Tables['exercise']['Row'], equiptment: Tables['equiptment']['Row'][]) => {
        await supabase.from('exercise_equiptment').delete().filter('exercise_id', 'eq', exercise.id).filter('equiptment_id', 'in', equiptment.map(x => x.id))
        const res = await supabase.from('exercise_equiptment').insert(equiptment.map(x => ({ exercise_id: exercise.id, equiptment_id: x.id })))
        return res
    }
    const search = async (options: { keyword?: string | null; belongsTo?: string; favorited?: boolean; selectString?: string; user_id?: string }): Promise<Tables['exercise']['Row'][] | null> => {
        let { keyword, belongsTo, favorited, selectString, user_id } = options
        let str = selectString
        if (favorited && user_id) {
            str = str + ", favorites!inner(user_id)"
        }
        console.log(str)
        let q = supabase.from('exercise').select(str || '*')
        if (keyword) q = q.filter('name', 'ilike', `%${keyword}%`)
        if (belongsTo) q = q.filter('user_id', 'eq', belongsTo)
        if (favorited && user_id) q = q.filter('favorites.user_id', 'eq', user_id)
        let data = await q.range(0, 50)
        console.log(data)
        //@ts-ignore
        return data?.data || null
    }

    const exercise_progress = async (id: Tables['exercise']['Row']['id'], user_id: Tables['user']['Row']['id'] | null | undefined): Promise<{ [k: string]: ChartMapping } | null> => {
        if (!id || !user_id) return null;
        let now = moment().utc()
        let dateStart = now.subtract(60, 'days')
        let res = await supabase.from('workout_play_details').select('*').match({ 'user_id': user_id, 'exercise_id': id }).filter('created_at', 'gte', dateStart.format())
        let sets: Tables['workout_play_details']['Row'][] | null = res.data || null
        if (!sets) return sets;
        let dateMapping: { [k: string]: ChartMapping } = {}
        for (var wo of sets) {
            let woDate = moment(wo.created_at).utc().format('L')
            let data = dateMapping[woDate]
            dateMapping[woDate] = {
                secs: Math.max((data?.secs || 0), (wo.time || 0)),
                weight: Math.max((data?.weight || 0), (wo.weight || 0)),
                reps: Math.max((data?.reps || 0), (wo.reps || 0)),
                date: woDate
            }
        }
        return dateMapping
    }

    return { find, save, saveEquiptment, search, exercise_progress }
}