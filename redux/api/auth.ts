import { createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../../supabase";
import { Tables } from "../../supabase/dao";
import { User } from "@supabase/supabase-js";



export const fetchProfile = createAsyncThunk('auth/fetchProfile', async (uid: string): Promise<Tables['user']['Row']> => {
    let {data, error} = await supabase.from('user').select('*').filter('id', 'eq', uid).single()
    if (error) throw Error(error.message)
    return data;
})

export const fetchUser = createAsyncThunk('auth/fetchUser', async (): Promise<{user: User, profile: Tables['user']['Row'] | null}> => {
    let {data, error} = await supabase.auth.getSession()
    if (error) throw Error(error.message)
    if (!data?.session?.user) throw Error('No user found');
    let {data: profile, error: profileError} = await supabase.from('user').select('*').filter('id', 'eq', data.session.user.id).single()
    if (profileError) throw Error(profileError.message)
    return {user: data.session.user, profile}
}) 