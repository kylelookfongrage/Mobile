import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../types/Database";
import moment from "moment";


export type Tables = Database['public']['Tables'];
export type Predicate = <T>(db: SupabaseClient<Database>) => T
export type DbResult<T> = T extends PromiseLike<infer U> ? U : never;
export type DbResultOk<T> = T extends PromiseLike<{ data: infer U }> ? Exclude<U, null> : never


export function useDao<T>(predicate: Predicate | null = null, fetch: boolean=false) {
    const [loading, setLoading] = useState<boolean>(false)
    const [results, setResults] = useState<T[]>([])
    const now = moment()
    let timeFilter = now.utc().format('YYYY-MM-DD HH:MM:SS.SSSSSSZZ')

    useEffect(() => {
        if (predicate && fetch) {
            query(predicate, true, true)
        }
    }, [])

    const find = async <T extends keyof Tables>(table: T, id: string | number): Promise<Tables[T]['Row'] | null> => {
        try {
            const res = await supabase.from(table).select('*').filter('id', 'eq', id).maybeSingle<Tables[T]['Row']>()
            if (res.data) {
                return res.data
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    const save = async <T extends keyof Tables>(table: T, document: Tables[T]['Insert']): Promise<Tables[T]['Row'] | null> => {
        try {
            const res = await supabase.from(table).insert(document).select()
            if (res.error) {
                throw Error(res.error.message)
            }
            if (res.data?.[0]) {
                return res.data?.[0]
            } return null
        } catch (error: any) {
            throw Error(error.toString())
        }
    }

    const filter = async <T extends keyof Tables, K extends Tables[T]['Row'], C extends keyof Tables[T]['Row']>(table: T, filters: [C, string, Tables[T]['Row'][C]][], selectString='*'): Promise<K[] | null> => {
        let q = supabase.from(table).select(selectString)
        for (var f in filters) {
            q = q.filter(f[0], f[1], f[2])
        }
        try {
            let res = await q 
            if (res.error) {
                throw Error(res.error.message)
            }
            //@ts-ignore
            return res.data || null
        } catch (error) {
            return null
        }
    }

    const upsert = async <T extends keyof Tables, K extends Tables[T]['Insert']>(table: T, document: K | K[]): Promise<(K extends Array<K> ? K[] : K) | null> => {
        try {
            const res = await supabase.from(table).upsert(document, {
                ignoreDuplicates: true
            }).select()
            if (res.error) {
                throw Error(res.error.message)
            }
            if (res.data?.[0]) {
                return (Array.isArray(document) ? res.data : res.data?.[0])
            }
            return null
        } catch (error: any) {
            throw Error(error.toString())
        }
    }

    const update = async <T extends keyof Tables, K extends Tables[T]['Update']>(table: T, id: Tables[T]['Update']['id'], document: K): Promise<Tables[T]['Row'] | null> => {
        try {
            const res = await supabase.from(table).update(document).filter('id', 'eq', id).select('*')
            if (res.error) {
                throw Error(res.error.message)
            }
        if (res.data?.[0]) {
            return res.data?.[0]
        }
        return null
        } catch (error: any) {
            throw Error(error.toString())
        }
    }

    const remove = async <T extends keyof Tables, K extends Tables[T]['Update']>(table: T, id: Tables[T]['Row']['id']): Promise<K | null> => {
        try {
            const res = await supabase.from(table).delete().filter('id', 'eq', id).select()
            if (res.error) {
                throw Error(res.error.message)
            }
        if (res.data?.[0]) {
            return res.data?.[0]
        }
        return null
        } catch (error: any) {
            throw Error(error.toString())
        }
    }

    const downwardsPaginate = async<T extends keyof Tables>(p: Predicate, pageNumber = 0, limit = 50, ascending = true): Promise<Tables[T]['Row'][] | null> => {
        try {
            // 0 - 50, 51 - 100, 101 - 150
            let predicate = p
            let lowerBound = pageNumber === 0 ? 0 : ((pageNumber * limit) + 1) // 0 -> 0, 1 -> 51, 2 -> 101
            let upperBound = (limit * (pageNumber + 1)) // 0 -> 50, 1 -> 100, 2 -> 150
            //@ts-ignore
            let res = await predicate.filter('createdAt', 'gt', timeFilter)
                .order('createdAt', { ascending: ascending })
                .limit(limit)
                .range(lowerBound, upperBound);
            if (res.data) {
                return res.data
            }
            return null;
        } catch (error) {
            return null
        }

    }


    const query = async (p: (db: SupabaseClient<Database>) => any, shouldSetResults = true, shouldDisplayError = true): Promise<typeof p extends Predicate ? ReturnType<typeof p> : null> => {
        try {
            setLoading(true)
            const { data, error } = await p(supabase)
            if (data) {
                if (shouldSetResults) setResults(data)
                setLoading(false)
                return data as DbResult<typeof p>
            }
            throw Error(error.toString())
        } catch (error: any) {
            setLoading(false)
            throw Error((error.toString() || 'There was a problem, please try again.'))
        }

    }

    const from = supabase.from



    return { loading, query, results, find, downwardsPaginate, save, upsert, update, remove, filter, from }
}


export function useRealtimeChannel<T>(payloads: { options: { table?: string; schema?: string; event: string; filter?: string; }, onPayload: (payload: T) => void; }[], onSubscribe?: (status: any, channel: RealtimeChannel) => (Promise<void> | void), type: "broadcast" | "presence" | "postgres_changes" = 'postgres_changes') {
    let channel = supabase.channel('any')
    useEffect(() => {
        for (var option of payloads) {
            //@ts-ignore
            channel = channel.on(type, { ...option.options }, option.onPayload)
        }
        channel.subscribe(async (status) => {
            onSubscribe && onSubscribe(status, channel)
        })
        return () => {
            channel.unsubscribe()
        }
    }, [])
    return { channel }
}


export function useRealtime<T>(table: keyof Tables, filter?: string, event: string = '*', schema: string = 'public', callback?: ((x: any) => void) | null) {
    let channel = supabase.channel('any')
    const [results, setResults] = useState<T[]>([])
    useEffect(() => {
        //@ts-ignore
        channel.on('postgres_changes', { table, event, schema, filter }, (x: any) => {
            callback && callback(x)
        }).subscribe()
        return () => {
            channel.unsubscribe()
        }
    }, [filter])
    return { results }
}