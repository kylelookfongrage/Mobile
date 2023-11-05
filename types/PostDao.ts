import { MediaType } from "../data";
import { supabase } from "../supabase";
import { Tables, useDao } from "../supabase/dao";
import { useStorage } from "../supabase/storage";

export function PostDao() {
    const dao = useDao()
    const storage = useStorage()
    const remove = async (id: Tables['post']['Row']['id']) => (await dao.remove('post', id))
    const find = async (id: Tables['post']['Row']['id']) => (await dao.find('post', id))
    const save = async (document: Tables['post']['Insert']): Promise<Tables['post']['Row'] | null> => {
        let copiedDocument = { ...document }
        if (document.media) {
            //@ts-ignore
            let attemptedUpload = await storage.uploadBulk(document.media)
            copiedDocument['media'] = attemptedUpload
        }
        return await dao.save('post', copiedDocument)
    }
    
    const get_feed = async (user_id: string): Promise<TFeed[] | null> => {
        let res = await supabase.rpc('fn_feed', { query_id: user_id })
        return res?.data || null
    }

    const on_like_press = async (post_id: Tables['post']['Row']['id'], liked: boolean) => {
        await supabase.from('feed').update({'liked': !liked}).filter('post_id', 'eq', post_id)

    }

    return { find, save, remove, get_feed, on_like_press }
}




export type TFeed = {
    post_id: number,
    description: string,
    media?: MediaType[],
    workout_id?: number,
    exercise_id?: number,
    run_id?: number,
    meal_id?: number,
    plan_id?: number,
    user_id: string,
    username: string,
    name?: string,
    pfp?: string,
    created_at: string
    likes: number,
    liked: boolean,
    feed_id: number
}