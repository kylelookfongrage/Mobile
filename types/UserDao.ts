import { User } from "@supabase/supabase-js"
import { supabase } from "../supabase"
import { Tables, useDao } from "../supabase/dao"
import { useEffect, useState } from "react"

export const usernameRegex = /^(?=[a-zA-Z0-9._]{4,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/

export function UserQueries(realtime: boolean=false){
    type UserType = Tables['user']['Row']
    const dao = useDao<UserType>()
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
    const validateUsername = async (newUsername: string, currentUsername: string | null): Promise<string | null> => {
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

    return {fetchProfile, fetchProfileByUsername, validateUsername, save, upsert, update, remove}
}