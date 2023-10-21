import { View, Text } from 'react-native'
import React from 'react'
import { supabase } from '../supabase'

export type FavoriteOption = 'food' | 'meal' | 'exercise' | 'workout' | 'plan' | 'post' | 'comment'
export default function FavoritesDao() {
  const favorited = async (id: any, type: FavoriteOption, user_id: string): Promise<boolean> => {
    let column = type + '_id'
    let potential = await supabase.from('favorites').select('*').filter(column, 'eq', id).filter('user_id', 'eq', user_id)
    let f = false
    if (potential.data && potential.data.length > 0) f=true;
    return f;
  }
  const onLike = async (id: any, type: FavoriteOption, user_id: string, favorited: boolean): Promise<boolean> => {
    let column = type + '_id'
    if (favorited) {
        await supabase.from('favorites').delete().filter('user_id', 'eq', user_id).filter(column, 'eq', id)
        return false
    } else {
        await supabase.from('favorites').insert({user_id, [column]: id})
        return true
    }
  }
  return {favorited, onLike}
}