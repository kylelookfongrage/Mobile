import { View, Text } from '../../components/base/Themed'
import React from 'react'
import { Tables } from '../../supabase/dao'
import { FormReducer, useForm } from '../../hooks/useForm';
import { BackButton } from '../../components/base/BackButton';
import useAsync from '../../hooks/useAsync';
import { supabase } from '../../supabase';
import { useSelector } from '../../redux/store';
import { USDAFoodDetails } from '../../types/FoodApi';
import { titleCase } from '../../data';

export default function FoodDetail2(props: {
    id?: Tables['food']['Row']['id'];
    progress_id?: Tables['food_progress']['Row']
    ingredient_id?: Tables['meal_ingredients']['Row']
    api_id?: string;
}) {
    let {id, progress_id, ingredient_id, api_id} = props;
    let {profile} = useSelector(x => x.auth)
    let {state: form, setForm, dispatch: formDispatch} = useForm<Tables['food']['Insert']>({
      name: '',
      calories: 0,
      carbs: 0,
      category: '',
      fat: 0,
      ingredients: '',
      otherNutrition: {},
      protein: 0,
      quantity: 1,
      servingSize: 'gram',
      servingSizes: {'gram': 1},
      user_id: profile?.id,
      weight: 1
    })
    useAsync(async () => {
      if (props.id || props.ingredient_id || props.progress_id) {
        // fetch food from database
        let selectString = '*'
        if (props.ingredient_id) {}
        if (props.progress_id) {}
        let {data, error} = await supabase.from(props.id ? "food" : props.ingredient_id ? 'meal_ingredients' : 'food_progress').select(selectString).filter('id', 'eq', props.id || props.ingredient_id || props.progress_id).single().throwOnError()
        if (data) {
          if (props.ingredient_id) {}
          if (props.progress_id) {}
          formDispatch({type: FormReducer.Set, payload: data})
        }
      } else if (props.api_id) {
        // use USDA Database to collect all info needed for food 
        let res = await USDAFoodDetails(props.api_id)
        if (res) {
          let y = res;
          let payload = {
            name: titleCase(`${y.brandOwner ? (y.brandOwner.toLowerCase() === 'not a branded item' ? '' : y.brandOwner + ' ') : ''}${y.commonNames || y.description}`),
            calories: 
          }
        }
      }
    }, [])
    console.log(form)
  return (
    <View>
        <BackButton />
      <Text>{id || api_id}</Text>
    </View>
  )
}