import { View, Text } from '../../components/base/Themed'
import React, { useEffect, useMemo, useState } from 'react'
import { Tables } from '../../supabase/dao'
import { FormReducer, useForm } from '../../hooks/useForm';
import { BackButton } from '../../components/base/BackButton';
import useAsync from '../../hooks/useAsync';
import { supabase } from '../../supabase';
import { useSelector } from '../../redux/store';
import { USDAFoodDetails, USDAMacroMapping, USDAMacroMappingKeys, USDANutrientToOtherNutrition, getEmojiByCategory } from '../../types/FoodApi';
import { ConversionChart, ExpandedConversionChart, titleCase } from '../../data';
import { XStack, YStack } from 'tamagui';
import Spacer from '../../components/base/Spacer';
import tw from 'twrnc'
import UsernameDisplay from '../../components/features/UsernameDisplay';
import SaveButton from '../../components/base/SaveButton';
import { ScrollView, TextInput, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { Dimensions, Keyboard, useColorScheme } from 'react-native';
import ManageButton from '../../components/features/ManageButton';
import { TextArea } from '../../components/base/Input';
import { KeyboardView, LogFoodKeyboardAccessory } from '../../components/features/Keyboard';
import KeyboardAccessoryView from 'react-native-ui-lib/lib/components/Keyboard/KeyboardInput/KeyboardAccessoryView';

export default function FoodDetail2(props: {
  id?: Tables['food']['Row']['id'];
  progress_id?: Tables['food_progress']['Row']
  ingredient_id?: Tables['meal_ingredients']['Row']
  api_id?: string;
  category?: string
}) {
  let { id, progress_id, ingredient_id, api_id } = props;
  let { profile } = useSelector(x => x.auth)
  let { state: form, setForm, dispatch: formDispatch } = useForm<Tables['food']['Insert']>({
    name: '',
    calories: 0,
    carbs: 0,
    category: props.category || '',
    fat: 0,
    ingredients: '',
    otherNutrition: {},
    protein: 0,
    quantity: 1,
    servingSize: 'gram',
    servingSizes: { 'gram': 1 },
    user_id: profile?.id,
    weight: 1
  })
  
  let servingSizes = useMemo(() => {
    let obj = {...ConversionChart}
    let data = form.servingSizes
    if (data) {
      if (data && typeof data === 'string') {
        data = JSON.parse(data)
      }
      //@ts-ignore
      obj = {...data, ...obj}
    }
    return obj
  }, [form.servingSizes])
  
  let [author, setAuthor] = useState('@' + profile?.username)
  let [initialValue, setInitialValue] = useState<number>(0)
  let [shouldShowKeyboard, setShouldShowKeyboard] = useState<boolean>(true)
  let [keyboardOpen, setKeyboardOpen] = useState<boolean>(false)
  useAsync(async () => {
    if (props.id || props.ingredient_id || props.progress_id) {
      // fetch food from database
      let selectString = '*, author:user_id(username)'
      if (props.ingredient_id) { }
      if (props.progress_id) { }
      let { data, error } = await supabase.from(props.id ? "food" : props.ingredient_id ? 'meal_ingredients' : 'food_progress').select(selectString).filter('id', 'eq', props.id || props.ingredient_id || props.progress_id).single().throwOnError()
      if (data) {
        if (props.ingredient_id) { }
        if (props.progress_id) { }
        //@ts-ignore
        setAuthor(data?.author?.username ? `@${data?.author?.username}` : "Menustat.org")
        setInitialValue(data?.quantity)
        if (data.servingSizes && typeof data.servingSizes === 'string') {data.servingSizes = JSON.parse(data.servingSizes)}
        if (data.otherNutrition && typeof data.otherNutrition === 'string') {data.otherNutrition = JSON.parse(data.otherNutrition)}
        formDispatch({ type: FormReducer.Set, payload: data })
      }
    } else if (props.api_id) {
      // use USDA Database to collect all info needed for food 
      let res = await USDAFoodDetails(props.api_id)
      if (res) {
        let y = res;
        let _nutrients = USDANutrientToOtherNutrition(res.foodNutrients)
        //@ts-ignore
        let _weight = ExpandedConversionChart[y.servingSizeUnit] || 1
        let servingSizes = {}
        if (y.servingSizeUnit) {
          servingSizes[y.servingSizeUnit] = _weight
        } else if (y.householdServingFullText) {
          servingSizes[y.householdServingFullText] = _weight
        }
        let payload = {
          name: titleCase(`${y.brandOwner ? (y.brandOwner.toLowerCase() === 'not a branded item' ? '' : y.brandOwner + ' ') : ''}${y.commonNames || y.description}`),
          otherNutrition: _nutrients?.otherNutrition || {},
          calories: _nutrients?.calories || 0,
          protein: _nutrients?.protein || 0,
          carbs: _nutrients?.carbs || 0,
          fat: _nutrients?.fat || 0,
          weight: (_weight) * y.servingSize,
          quantity: y.servingSize || 1,
          servingSize: y.servingSizeUnit,
          servingSizes: servingSizes,
          category: props.category || '',
          ingredients: y.ingredients

        }
        formDispatch({ type: FormReducer.Set, payload: payload })
        setAuthor('USDA Food Database')
        setInitialValue(y.servingSize || 1,)

      }
    }
  }, [])
  let dm = useColorScheme() === 'dark'
  let [shouldShowInput, setShouldShowInput] = useState<boolean>(true);

  useEffect(() => {
    let sub = Keyboard.addListener('keyboardWillShow', () => {
      setShouldShowInput(false)
    })
    let sub2 = Keyboard.addListener('keyboardWillHide', () => {
      setShouldShowInput(true)
    })
    return () => {Keyboard.removeAllListeners('keyboardWillShow'); Keyboard.removeAllListeners('keyboardWillHide');}
  }, [])

  useEffect(() => {
  
    let {weight, quantity, servingSize} = form;
    //@ts-ignore
    let newWeight = servingSizes[servingSize] || 0
    if (!newWeight) return;
    if (!quantity) return;
    const newValue = (old: number) => (old * newWeight) / (weight || 1) * quantity
    //@ts-ignore
    let obj = {...form.otherNutrition || {}}
    Object.keys(obj).forEach((k) => {
      obj[k] = newValue(obj[k])
    })
    let payload = {
      calories: newValue(form.calories || 0),
      carbs: newValue(form.carbs || 0),
      fat: newValue(form.fat || 0),
      protein: newValue(form.protein || 0),
      otherNutrition: obj,
      weight: newWeight * quantity
    }
    formDispatch({type: FormReducer.Update, payload: payload})
  }, [form.servingSize, form.quantity])

  return (
    <View includeBackground style={{ flex: 1 }}>
      <Spacer />
      <XStack alignItems='flex-start' w={'100%'} px='$3'>
        <Text h2>{getEmojiByCategory(form?.category || undefined)}</Text>
        <YStack ml='$2'>
          <TextInput value={form.name} multiline numberOfLines={3} onChangeText={v => setForm('name', v)} placeholder='New Food' style={{ ...tw`text-${dm ? 'white' : "black"}`, fontFamily: 'Urbanist_700Bold', fontSize: 20, width: Dimensions.get('screen').width * 0.8 }} />
          <Text style={tw`text-gray-500`}>{author}</Text>
        </YStack>
      </XStack>
      <Spacer />
      <Text>{form.quantity}</Text>
      <ScrollView style={tw`px-4`} showsVerticalScrollIndicator={false}>
        <YStack>
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
            let border = obj.border ? `border-b-${obj.border} ` + (dm ? "border-white" : 'border-black') : ''
            return <View key={x} style={tw`${border} py-1 flex-row items-center justify-between`}>
              <Text h4={obj.xl} xl={!obj.xl} weight={obj.bolded ? 'bold' : 'thin'}>{Array((obj.indented || 0) * 5).fill(' ').join('')}{obj.name} </Text>
              <XStack alignItems='center' justifyContent='flex-start'>
                <TextInput onChangeText={(_v) => {
                  let v = _v.replace(/[^0-9]/g, '')
                  let nv = Number(v) || undefined
                  if (x == 208) { setForm('calories', nv) }
                  else if (x == 204) { setForm('fat', nv) }
                  else if (x == 205) { setForm('carbs', nv) }
                  else if (x == 203) { setForm('protein', nv) }
                  else {
                    let obj = form.otherNutrition ? {...form.otherNutrition} : {}
                    obj[x] = nv 
                    setForm('otherNutrition', obj)
                  }
                }} placeholder='0' value={amount ? amount.toFixed() : ''} keyboardType='numeric' style={{ ...tw`p-.5 text-${dm ? 'white' : 'black'}`, fontFamily: 'Urbanist_700Bold', fontSize: obj.xl ? 24 : 18 }} />
                <Text lg={obj.xl} style={tw`text-gray-500`}> {obj.unit}</Text>
              </XStack>
            </View>
          })}

        </YStack>
        <Spacer />
        <ManageButton title='Ingredients' buttonText=' ' />
        <TextArea value={form.ingredients || ''} height={'$9'} textSize={16} id='ingredients' />
        <View style={tw`h-90`} />
      </ScrollView>
      {(shouldShowInput || keyboardOpen) && <LogFoodKeyboardAccessory onOpen={() => setKeyboardOpen(true)} onClose={() => setKeyboardOpen(false)} initialValue={initialValue} onNumberChange={(v) => {
        if (!keyboardOpen) return;
        setForm('quantity', v)
      }} value={form.quantity || 1} servingSizes={servingSizes} selectedServingSize={form.servingSize} onServingChange={(v) => setForm('servingSize', v)} />}
      {/* <SaveButton discludeBackground title='Save Food' safeArea /> */}
    </View>
  )
}