import { supabase } from "../supabase";
import { Tables } from "../supabase/dao";



export function SearchDao(){
    const search = async <K extends keyof Tables, C extends Tables[K]['Row']>(table: K, options: { keyword?: string | null; keywordColumn?: keyof C; belongsTo?: string; favorited?: boolean; selectString?: string; user_id?: string, filters?: {column: keyof C, value: any}[] }): Promise<C[] | null> => {
        let { keyword, belongsTo, favorited, selectString, user_id, keywordColumn, filters } = options
        let str = selectString
        if (favorited && user_id) {
            str = str + ", favorites!inner(user_id)"
        }
        let q = supabase.from(table).select(str || '*')
        //@ts-ignore
        if (keyword && keywordColumn) q = q.filter(keywordColumn, 'ilike', `%${keyword}%`)
        if (belongsTo) q = q.filter('user_id', 'eq', belongsTo)
        if (favorited && user_id) q = q.filter('favorites.user_id', 'eq', user_id)
        if (filters) {
            for (var f of filters) {
                q = q.filter(f.column, 'eq', f.value)
            }
        }
        let data = await q.range(0, 50)
        //@ts-ignore
        return data?.data || null
    }
    const find = async <T extends keyof Tables, K extends Tables[T]['Row']['id']>(table: T, id: K, select="*"): Promise<Tables[T]['Row'] | null> => {
        let res = await supabase.from(table).select(select).filter('id', 'eq', id).maybeSingle()
        //@ts-ignore
        return res.data || null
    }
    return {search, find}
}