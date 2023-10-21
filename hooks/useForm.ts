import { SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useReducer, useState } from "react";
import { Predicate, useDao } from "../supabase/dao";
import { useImmerReducer } from "use-immer";
import { Immutable } from "immer";



export enum FormReducer {
    Field, Reset, Fetch, Update, Set
}



export function useForm<T extends object>(initialState: T, fetch?: () => Promise<T | null>){
    type DispatchAction = {type: FormReducer; payload: T | T[keyof T], field?: keyof T}
    const resetWithValue = (state: T, initialized=false) => {
        return {didInitialize: initialized, state}
    }
    let fetchedState: T | null = null
    const reducer = (draft: {state: T, didInitialize: boolean}, action: DispatchAction) => {
        switch (action.type) {
            case FormReducer.Fetch: {
                if (draft.didInitialize) break;
                //@ts-ignore
                fetchedState=action.payload
                //@ts-ignore
                return resetWithValue(action.payload)
            }
            case FormReducer.Field: {
                if (!action.field) break;
                //@ts-ignore
                draft.state[action.field] = action.payload
                return void draft;
            }
            case FormReducer.Reset: {
                return resetWithValue(fetchedState || initialState)
            }
            case FormReducer.Set: {
                //@ts-ignore
                return resetWithValue(action.payload)
            }
            default: {
                break;
            }
        }
    }
    //@ts-ignore
    const [state, dispatch] = useImmerReducer<{state: T, didInitialize: boolean}, DispatchAction>(reducer, {state: initialState, didInitialize: false})
    const setForm = <K extends keyof T>(fieldID: K, value: T[K]) => {
        dispatch({type: FormReducer.Field, payload: value, field: fieldID})
    }
    const fetchFromSupabase = async () => {
        if (!fetch) return;
        const res = await fetch(); 
        if (!res) return;
        dispatch({payload: res, type: FormReducer.Fetch})
        
    }
    const [hasFetchedBefore, setHasFetchedBefore] = useState<boolean>(false)

    useEffect(() => {
        if (!hasFetchedBefore && fetch) {
            fetchFromSupabase().then(x => setHasFetchedBefore(true))
        }
    }, [])

    return {state: state.state, setForm, dispatch}
}