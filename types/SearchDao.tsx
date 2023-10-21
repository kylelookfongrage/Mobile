import { supabase } from "../supabase";
import { Tables } from "../supabase/dao";



export function SearchDao(){
    const search = async <K extends keyof Tables>(table: K, options: { keyword?: string | null; keywordColumn?: keyof Tables[K]['Row']; belongsTo?: string; favorited?: boolean; selectString?: string; user_id?: string }): Promise<Tables[K]['Row'][] | null> => {
        let { keyword, belongsTo, favorited, selectString, user_id, keywordColumn } = options
        let str = selectString
        if (favorited && user_id) {
            str = str + ", favorites!inner(user_id)"
        }
        let q = supabase.from(table).select(str || '*')
        //@ts-ignore
        if (keyword && keywordColumn) q = q.filter(keywordColumn, 'ilike', `%${keyword}%`)
        if (belongsTo) q = q.filter('user_id', 'eq', belongsTo)
        if (favorited && user_id) q = q.filter('favorites.user_id', 'eq', user_id)
        let data = await q.range(0, 50)
        console.log(data)
        //@ts-ignore
        return data?.data || null
    }
    return {search}
}