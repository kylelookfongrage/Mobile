import { View, Text } from 'react-native'
import React from 'react'
import { Tables } from '../../supabase/dao'
import { useForm } from '../../hooks/useForm';
import { BackButton } from '../../components/base/BackButton';

export default function FoodDetail2(props: {
    id?: Tables['food']['Row']['id'];
    progress_id?: Tables['food_progress']['Row']
    ingredient_id?: Tables['meal_ingredients']['Row']
    api_id?: string;
}) {
    let {id, progress_id, ingredient_id, api_id} = props;
    console.log(props)
    let {state: form, setForm} = useForm<Tables['food']['Insert']>({name: ''})
  return (
    <View>
        <BackButton />
      <Text>{id || api_id}</Text>
    </View>
  )
}