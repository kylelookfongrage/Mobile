import { View, Text } from '../base/Themed'
import React from 'react'
import { XStack, YStack } from 'tamagui';
import { USDAMacroMapping, USDAMacroMappingKeys } from '../../types/FoodApi';
import tw from 'twrnc'
import { TextInput, useColorScheme } from 'react-native';

interface NutritionLabelProps {
    disabled?: boolean;
    calories?: number | undefined | null;
    protein?: number | undefined | null;
    carbs?: number | undefined | null;
    fat?: number | undefined | null
    otherNutrition?: Object | undefined | null;
    onOtherNutritionChange?: (v: NutritionLabelProps['otherNutrition']) => void;
    onFatChange?: (v: NutritionLabelProps['fat']) => void;
    onCarbsChange?: (v: NutritionLabelProps['carbs']) => void;
    onProteinChange?: (v: NutritionLabelProps['protein']) => void;
    onCaloriesChange?: (v: NutritionLabelProps['calories']) => void;
}
export default function NutritionLabel(props: NutritionLabelProps) {
    let {disabled, calories, protein, carbs, fat, onCaloriesChange, onCarbsChange, onFatChange, onOtherNutritionChange, onProteinChange, otherNutrition} = props;
    let form = {calories, protein, carbs, fat, otherNutrition}
    let dm = useColorScheme() === 'dark'
    let setForm = (str: string, nv: number | object | null | undefined) => {
        //@ts-ignore
        if (str === 'calories' && onCaloriesChange) {onCaloriesChange(nv)}
         //@ts-ignore
        if (str === 'protein' && onCaloriesChange) {onProteinChange(nv)}
         //@ts-ignore
        if (str === 'carbs' && onCaloriesChange) {onCarbsChange(nv)}
         //@ts-ignore
        if (str === 'fat' && onCaloriesChange) {onFatChange(nv)}
         //@ts-ignore
        if (str === 'otherNutrition' && onCaloriesChange) {onOtherNutritionChange(nv)}
    }
  return <YStack>
  {USDAMacroMappingKeys.map(x => {
    let obj = USDAMacroMapping.get(x)
    if (!obj) return <View key={x} />
    let amount: number | null | undefined = null
    if (x == 208) { amount = form.calories }
    else if (x == 204) { amount = form.fat }
    else if (x == 205) { amount = form.carbs }
    else if (x == 203) { amount = form.protein }
    else {
      //@ts-ignore
      amount = (form?.otherNutrition || {})[x]
    }
    let border = (obj.border ? `border-b-${obj.border} ` + (dm ? "border-white" : 'border-black') : 'border-b border-gray-500/10') 
    return <View key={x} style={tw`${border} py-1 flex-row items-center justify-between`}>
      <Text h5={obj.xl} lg={!obj.xl} weight={obj.bolded ? 'bold' : 'semibold'}>{Array((obj.indented || 0) * 5).fill(' ').join('')}{obj.name} {<Text lg={obj.xl} style={tw`text-gray-500`}> ({obj.unit})</Text>}</Text>
      <XStack alignItems='center' justifyContent='flex-start'>
        <TextInput editable={!disabled} onChangeText={(_v) => {
          let v = _v.replace(/[^0-9]/g, '')
          let nv = Number(v) || undefined
          if (x == 208) { setForm('calories', nv) }
          else if (x == 204) { setForm('fat', nv) }
          else if (x == 205) { setForm('carbs', nv) }
          else if (x == 203) { setForm('protein', nv) }
          else {
            let obj = form.otherNutrition ? {...form.otherNutrition} : {}
             //@ts-ignore
            obj[x] = nv 
            setForm('otherNutrition', obj)
          }
        }} placeholder='0' value={amount && amount.toFixed ? amount.toFixed() : ''} keyboardType='numeric' style={{ ...tw`p-.5 text-${dm ? 'white' : 'black'}`, fontFamily: 'Urbanist_700Bold', fontSize: obj.xl ? 24 : 18 }} />
      </XStack>
    </View>
  })}

</YStack>
}