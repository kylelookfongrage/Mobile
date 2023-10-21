import { User } from "@supabase/supabase-js"
import { supabase } from "../supabase"
import { Tables, useDao } from "../supabase/dao"
import { useEffect, useState } from "react"
import { useStorage } from "../supabase/storage"
import { MediaType, isStorageUri } from "../data"
import moment from "moment"

export const usernameRegex = /^(?=[a-zA-Z0-9._]{4,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/
export type TSubscriber = Tables['subscription']['Row'] & {user?: {name: string | null, pfp: string | null, username: string}}


export function UserQueries(realtime: boolean=false){
    type UserType = Tables['user']['Row']
    const dao = useDao<UserType>()
    let s = useStorage()
    const save = async (document: Tables['user']['Insert']) => (await dao.save('user', document))
    const upsert = async (document: Tables['user']['Insert']) => (await dao.upsert('user', document))
    const update = async (id: string, document: Tables['user']['Update']) => (await dao.update('user', id, document))
    const remove = async (id: string) => (await dao.remove('user', id))
    const fetchProfile = async (id: string): Promise<UserType | null> => {
        const res = await dao.find('user', id)
        return res
    }
    const fetchProfileByUsername = async (username: string): Promise<UserType | null> => {
        const res = await dao.query(x => x.from('user').select('*').filter('username', 'eq', username))
        if (res && res[0]) {
            return res[0]
        }
        return null;
    }
    const validateUsername = async (newUsername: string, currentUsername?: string | null): Promise<string | null> => {
        if (newUsername === '' || !newUsername) return 'You must input a username'
        if (!newUsername.match(usernameRegex)) {
            return 'Your username must be between 4 and 20 characters without special characters. Underscores and periods are allowed once'
        }
        if (currentUsername === newUsername) return null;
        const potentialMatches = await fetchProfileByUsername(newUsername)
        if (potentialMatches) {
            return 'This username is already taken'
        }
        return null
    }

    const update_profile = async (newProfile: Tables['user']['Update'], oldProfile: Tables['user']['Row']): Promise<Tables['user']['Row'] | null> => {
        let newPfp: string | null | undefined = newProfile.pfp
        if (newProfile.pfp) {
            let imgToUpload: MediaType = {uri: newProfile.pfp, type: 'image'}
            if (oldProfile.pfp && isStorageUri(oldProfile.pfp)) {
                imgToUpload.supabaseID=oldProfile.pfp
            }
            let res = await s.upload(imgToUpload)
            if (res?.uri) newPfp=res?.uri
        }
        let newUser = await dao.update('user', oldProfile.id, {...newProfile, pfp: newPfp})
        return newUser
        
    }

    const fetch_subscribers = async (id: Tables['user']['Row']['id']): Promise<{subscribers: number, subscribees: number, user_id: string}> => {
        let res = await supabase.rpc('fn_get_subscription_count', {query_id: id})
        console.log(res)
        let result = {subscribees: 0, subscribers: 0, user_id: id}
        if (res?.data) {
            result.subscribees = res?.data?.[0]?.subscribees || 0
            result.subscribers = res?.data?.[0]?.subscribers || 0
        }
        return result
    }

    type TExcludeUserChild = 'workout' | 'meal' | 'food' | 'fitness_plan' | 'exercise';
    type TUserChildren = {
        workout: Tables['workout']['Row'][];
        meal: Tables['meal']['Row'][];
        food: Tables['food']['Row'][];
        fitness_plan: Tables['fitness_plan']['Row'][];
        exercise: Tables['exercise']['Row'][];
    }
    const fetch_user_children = async (user_id: Tables['user']['Row']['id'], exclude: TExcludeUserChild[]=[]): Promise<TUserChildren> => {
        let result: TUserChildren = {workout: [], meal: [], food: [], fitness_plan: [], exercise: []}
        let tables = ['workout', 'meal', 'food', 'fitness_plan', 'exercise']
        for (var table of tables) {
            if (!exclude.includes(table)) {
                let res = await supabase.from(table).select('*').filter('user_id', 'eq', user_id).order('created_at', {ascending: false}).range(0, 20)
                if (res.data) {
                    //@ts-ignore
                    result[table] = res.data
                }
            }
        }
        
        return result
    }

    const isFollowing = async (from: Tables['user']['Row']['id'], to: Tables['user']['Row']['id']): Promise<Tables['subscription']['Row'] | null> => {
        let now = moment().utc().format()
        let potential = await supabase.from('subscription').select('*').filter('subscribed_from', 'eq', from).filter('user_id', 'eq', to)
        if (potential && potential.data && potential.data.length > 0) {
            return potential.data[0] 
        }
        return null
    }


    const fetch_following_users = async (id: Tables['user']['Row']['id'], keyword: string | null, followers=true): Promise<TSubscriber[] | null> => {
        let q = supabase.from('subscription').select(`*, user: ${followers ? 'subscribed_from' : 'user_id'}(name, pfp, username)`)
        q = q.filter(followers ? 'user_id' : 'subscribed_from', 'eq', id)
        if (keyword) {
            q = q.filter(`user.username`, 'ilike', `%${keyword}%`)
        }
        let res = await q.order('start_date', {'ascending': false}).range(0, 40) // @ts-ignore
        console.log(res)
        return res?.data || null
    }

    const onFollowPress = async (from: Tables['user']['Row']['id'], to: Tables['user']['Row']['id'], following: boolean): Promise<Tables['subscription']['Row'] | null> => {
        let now = moment().utc().format()
        if (following) {
            let res = await supabase.from('subscription').delete().filter('subscribed_from', 'eq', from).filter('user_id', 'eq', to)
            return null 
        } else {
            let res = await dao.save('subscription', {user_id: to, subscribed_from: from})
            return res
        }
    }

    return {fetchProfile, fetchProfileByUsername, validateUsername, save, upsert, update, remove, update_profile, fetch_subscribers, fetch_user_children, isFollowing, onFollowPress, fetch_following_users}
}