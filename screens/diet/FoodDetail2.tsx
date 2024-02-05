import { View, Text } from '../../components/base/Themed'
import React, { useEffect, useMemo, useState } from 'react'
import { Tables } from '../../supabase/dao'
import { FormReducer, useForm } from '../../hooks/useForm';
import useAsync from '../../hooks/useAsync';
import { supabase } from '../../supabase';
import { useSelector } from '../../redux/store';
import { USDAFoodCategories, USDAFoodDetails, USDAMacroMapping, USDAMacroMappingKeys, USDANutrientToOtherNutrition, getEmojiByCategory } from '../../types/FoodApi';
import { ConversionChart, ExpandedConversionChart, MenuStatOtherNutritionToUSDANutrition, foodToFoodProgressAndMealIngredients, getMacroTargets, getMacrosFromIngredients, titleCase } from '../../data';
import { XStack, YStack } from 'tamagui';
import Spacer from '../../components/base/Spacer';
import tw from 'twrnc'
import { ScrollView, TextInput, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { Dimensions, Keyboard, Pressable, useColorScheme } from 'react-native';
import ManageButton from '../../components/features/ManageButton';
import { TextArea } from '../../components/base/Input';
import { LogFoodKeyboardAccessory } from '../../components/features/Keyboard';
import { TouchableOpacity } from 'react-native-ui-lib';
import { ExpoIcon } from '../../components/base/ExpoIcon';
import { useNavigation } from '@react-navigation/native';
import Selector from '../../components/base/Selector';
import { MacronutrientBarProgress } from '../../components/features/MacronutrientBar';
import { aggregateFoodAndMeals } from '../../redux/reducers/progress';
import { _tokens } from '../../tamagui.config';
import { ProgressDao } from '../../types/ProgressDao';
import { ImpactGridItem } from '../../components/base/InputGridItem';
import { formToIngredient, useMultiPartForm } from '../../redux/api/mpf';
//@ts-ignore
import { v4 as uuidv4 } from 'uuid';
import NutritionLabel from '../../components/features/NutritionLabel';
import Overlay from '../../components/screens/Overlay';
import { MealDao } from '../../types/MealDao';

export default function FoodDetail2(props: {
  id?: Tables['food']['Row']['id'];
  progress_id?: Tables['food_progress']['Row']
  ingredient_id?: Tables['meal_ingredients']['Row'];
  tempId?: string;
  mealId?: string;
  api_id?: string;
  category?: string;
  meal?: Tables['meal']['Insert'];
  meal_progress_id: Tables['meal_progress']['Row']['id'] | null | undefined;
  meal_name?: string;
  meal_author?: Tables['user']['Row']['id'];
  meal_id?: number;
}) {
  let { profile } = useSelector(x => x.auth)
  let { foodProgress, mealProgress } = useSelector(x => x.progress)
  let { protein: proteinConsumed, carbs: carbsConsumed, fat: fatConsumed, calories: caloriesConsumed } = aggregateFoodAndMeals(foodProgress, mealProgress)
  let { tdee, totalCarbsGrams, totalFatGrams, totalProteinGrams } = getMacroTargets(profile);
  let [initialized, setInitialized] = useState<boolean>(false)
  let isNewFood = (!props.id && !props.mealId && !props.api_id && !props.ingredient_id && !props.meal_progress_id)
  let multiPartForm = useMultiPartForm('meals', props.mealId || '')

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
    let obj = { ...ConversionChart }
    let data = form.servingSizes
    if (data) {
      if (data && typeof data === 'string') {
        data = JSON.parse(data)
      }
      //@ts-ignore
      obj = { ...data, ...obj }
    }
    return obj
  }, [form.servingSizes])

  let [author, setAuthor] = useState('@' + profile?.username)
  let [initialValue, setInitialValue] = useState<number>(1)
  let [shouldShowKeyboard, setShouldShowKeyboard] = useState<boolean>(true)
  let [keyboardOpen, setKeyboardOpen] = useState<boolean>(false)
  useAsync(async () => {
    console.log(props)
    if ((props.id || props.ingredient_id || props.progress_id)) {
      console.log('condition 1')
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
        if (data.serving) { data.servingSize = data.serving }
        if (data.servingSizes && typeof data.servingSizes === 'string') { data.servingSizes = JSON.parse(data.servingSizes) }
        data.otherNutrition = MenuStatOtherNutritionToUSDANutrition(data.otherNutrition)
        formDispatch({ type: FormReducer.Set, payload: data })
      }
    } else if (props.api_id) {
      console.log('condition 2')
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
    } else if (props.mealId && props.tempId) {
      console.log('fetching data')
      let potentialData = (multiPartForm.data || []).filter(x => x.tempId == props.tempId)?.[0]
      console.log('potential data', potentialData)
      if (potentialData) {
        //@ts-ignore
        if (potentialData.serving) { potentialData.servingSize = potentialData.serving }
        if (potentialData.servingSizes && typeof potentialData.servingSizes === 'string') { potentialData.servingSizes = JSON.parse(potentialData.servingSizes) }
        console.log('setting form')
        formDispatch({ type: FormReducer.Set, payload: potentialData })
        console.log('form set to', potentialData)
        setInitialValue(potentialData.quantity || 1,)
      }
    } else if (props.mealId) {
      console.log(props.meal_name)
      console.log(multiPartForm.data)
      let potentialData = (multiPartForm.data || []).filter(x => x.meal_id == props.meal_id)
      let _quantity = 1;
      let _weight = 100;
      let _servingSizes = { 'Serving': 100 }
      if (props.meal_progress_id) {
        // get weight and quantity
        let existingProgress = await supabase.from('meal_progress').select('*').filter('id', 'eq', props.meal_progress_id).single()
        if (existingProgress.data) {
          let _data = existingProgress.data as Tables['meal_progress']['Row']
          _quantity = (_data.consumed_weight || 1) / (_data.total_weight || 1)
          _weight = _data.consumed_weight || 100
        }

      }
      let _nutrients = getMacrosFromIngredients(potentialData, _quantity)
      let payload = {
        name: props.meal_name,
        otherNutrition: _nutrients?.otherNutrition || {},
        calories: _nutrients?.calories || 0,
        protein: _nutrients?.protein || 0,
        carbs: _nutrients?.carbs || 0,
        fat: _nutrients?.fat || 0,
        weight: _weight,
        quantity: _quantity,
        servingSize: 'Serving',
        servingSizes: _servingSizes,
        category: '',
        ingredients: potentialData.map(x => x.name).join('; ')
      }
      console.log('setting form to', payload)
      formDispatch({ type: FormReducer.Set, payload: payload })
      setAuthor('Meal')
      setInitialValue(Math.round(_quantity) < _quantity ? Number(_quantity.toFixed(2)) : _quantity)
    }
    setInitialized(true)
    return () => { setInitialized(false) }
  }, [])
  let dm = useColorScheme() === 'dark'
  let s = Dimensions.get('screen')
  let [shouldShowInput, setShouldShowInput] = useState<boolean>(true);
  let searchOptions = (isNewFood) ? [] : (props.meal_id ? ['Overview'] : ['Overview', 'Nutrition Facts'])
  let [selectedOption, setSelectedOption] = useState<typeof searchOptions[number]>(searchOptions[0])
  console.log('protein', form.protein)
  useEffect(() => {
    let sub = Keyboard.addListener('keyboardWillShow', () => {
      setShouldShowInput(false)
    })
    let sub2 = Keyboard.addListener('keyboardWillHide', () => {
      setShouldShowInput(true)
    })
    return () => { Keyboard.removeAllListeners('keyboardWillShow') }
  }, [])

  useEffect(() => {
    if (!initialized) return;
    let { weight, quantity, servingSize } = form;
    //@ts-ignore
    let newWeight = servingSizes[servingSize] || 0
    if (!newWeight) return;
    if (!quantity) return;
    const newValue = (old: number) => (old * newWeight) / (weight || 1) * quantity
    //@ts-ignore
    let obj = { ...form.otherNutrition || {} }
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
    console.log('updating form with ', payload)
    formDispatch({ type: FormReducer.Update, payload: payload })
  }, [form.servingSize, form.quantity])


  let n = useNavigation()
  let pdao = ProgressDao(false)
  let mdao = MealDao()
  let [showCategory, setShowCategory] = useState(false)

  const duplicateMeal = async () => {
    if (!props.meal) return;
    let meal_id = props.meal_id
    console.log('edited', multiPartForm.edited)
    if (multiPartForm.edited === true) { 
      let {data: copy, error} = await supabase.from('meal').select('*').filter('id', 'eq', props.meal_id).single()
      if (error) throw Error(error.message)
      // Want to duplicate meal, setting it to private, when we update the ingredients
      // If it's already duplicated (aka original meal is already filled out), we want to UPDATE it
      // If the meal is not already duplicated, we want to make a new duplication
      let obj = { ...copy, public: false, price: 0, original_meal: copy.original_meal ? copy.original_meal : meal_id, id: copy.original_meal ? copy.id : undefined }
      console.log('obj', obj)
      let res = await mdao.save(obj)
      if (res && res.id) {
        meal_id = res.id
        await mdao.saveIngredients(res, multiPartForm.data.filter(x => x.meal_id === props.meal_id))
      }
    }
    return meal_id;
  }



  const onSubmit = async () => {
    let logging = props.progress_id || ((props.api_id || props.id) && !props.mealId)
    if (logging) {
      //@ts-ignore -- Will create or update a food progress
      let obj: Tables['food_progress']['Insert'] = foodToFoodProgressAndMealIngredients(form, profile)
      if (props.progress_id) { obj.id = props.progress_id }
      let res = await pdao.saveProgress('food_progress', obj)
      if (res) {
        n.pop()
      }

    } else if (props.mealId && !props.meal_id) {
      let existingIngredients = [...(multiPartForm.data || [])]
      if (props.tempId) {
        // update existing meal ingredient
        existingIngredients = existingIngredients.map(x => {
          if (x.tempId === props.tempId) {
            return {
              ...formToIngredient({
                ...form,
                id: (Number(props.id) || undefined)
              },
                { calories: form.calories || 0, 
                  protein: form.protein || 0, 
                  carbs: form.carbs || 0, 
                  fat: form.fat || 0, 
                  otherNutrition: form.otherNutrition || {}, 
                  tempId: props.tempId || '' }
              ),
            }
          }
          return x
        })
      } else {
        existingIngredients.push(formToIngredient({ ...form }, { calories: form.calories || 0, protein: form.protein || 0, carbs: form.carbs || 0, fat: form.fat || 0, otherNutrition: form.otherNutrition || {}, tempId: uuidv4() }))
      }
      multiPartForm.upsert(existingIngredients)
      n.pop()
    } else if (props.meal_id) {
      let meal_id = await duplicateMeal()
      await pdao.saveProgress('meal_progress', {
        meal_id: meal_id,
        progress_id: null,
        total_weight: 100,
        consumed_weight: form.weight,
        servingSize: form.servingSize,
        id: Number(props.meal_progress_id) || undefined
      })
      n.pop(2)

    } else {
      let { data, error } = await supabase.from('food').insert(form).select().single()
      if (data) {
        n.pop()
      }
    }
  }

  return (
    <View includeBackground style={{ flex: 1 }}>
      <Spacer />
      <XStack alignItems='flex-start' justifyContent='space-between' px='$3'>
        <XStack alignItems='flex-start' w='93%'>
          <Text disabled={props.meal_id ? true : false} onPress={() => {
            setShowCategory(true)
          }} h2>{props.meal_id ? '🍽️' : getEmojiByCategory(form?.category || undefined)}</Text>
          <YStack ml='$2'>
            <TextInput placeholderTextColor={'gray'} value={form.name} multiline numberOfLines={3} onChangeText={v => setForm('name', v)} placeholder='New Food' style={{ ...tw`text-${dm ? 'white' : "black"}`, fontFamily: 'Urbanist_700Bold', fontSize: 18, width: Dimensions.get('screen').width * 0.7 }} />
            <Text style={tw`text-gray-500`}>{author}</Text>
          </YStack>
        </XStack>
        <TouchableOpacity onPress={() => n.pop()} style={tw`h-7 w-7 rounded-full bg-gray-500/50 items-center justify-center`}>
          <ExpoIcon name='close' iconName='ion' color='black' size={20} />
        </TouchableOpacity>
      </XStack>
      <Spacer />
      <Selector searchOptions={searchOptions} selectedOption={selectedOption} onPress={setSelectedOption} />
      <Spacer />
      {(selectedOption === 'Overview') && <ScrollView showsVerticalScrollIndicator={false}>
        <ManageButton viewStyle={tw`px-4`} title='Nutrition Overview' buttonText=' ' />
        <Spacer sm />
        <XStack justifyContent='space-between' alignItems='center' px='$4'>
          <YStack alignItems='center'>
            <Text h1={(form.calories || 0) < 10000} h2={(form.calories || 0) > 9999} weight='bold'>{form.calories?.toFixed()}</Text>
            <Text lg weight='semibold' style={tw`text-gray-500`}>Calories</Text>
          </YStack>
          <YStack px='$2'>
            <MacronutrientBarProgress protein weight={(form.protein) || 0} totalEnergy={form.calories || 1} />
            <MacronutrientBarProgress carbs weight={(form.carbs) || 0} totalEnergy={(form.calories) || 1} />
            <MacronutrientBarProgress fat weight={(form.fat) || 0} totalEnergy={(form.calories) || 1} />
          </YStack>
        </XStack>
        <Spacer divider />
        <ManageButton viewStyle={tw`px-4`} title='Impact to Progress' buttonText=' ' />
        <Spacer sm />
        <ImpactGridItem header t2='Limit' t3='Old' t4='New' />
        <ImpactGridItem t1='Calories (kcal)' t2={(tdee || 0).toFixed()} t3={(caloriesConsumed || 0).toFixed()} t3Color={caloriesConsumed > tdee ? _tokens.red : undefined} t4={((caloriesConsumed || 0) + (form.calories || 0)).toFixed()} t4Color={((caloriesConsumed || 0) + (form.calories || 0)) > tdee ? _tokens.red : _tokens.green} />
        <ImpactGridItem t1='Protein (g)' t2={(totalProteinGrams || 0).toFixed()} t3={(proteinConsumed || 0).toFixed()} t3Color={proteinConsumed > totalProteinGrams ? _tokens.red : undefined} t4={((proteinConsumed || 0) + (form.protein || 0)).toFixed()} t4Color={((proteinConsumed || 0) + (form.protein || 0)) > totalProteinGrams ? _tokens.red : _tokens.green} />
        <ImpactGridItem t1='Carbs (g)' t2={(totalCarbsGrams || 0).toFixed()} t3={(carbsConsumed || 0).toFixed()} t3Color={carbsConsumed > totalCarbsGrams ? _tokens.red : undefined} t4={((carbsConsumed || 0) + (form.carbs || 0)).toFixed()} t4Color={((carbsConsumed || 0) + (form.carbs || 0)) > totalCarbsGrams ? _tokens.red : _tokens.green} />
        <ImpactGridItem t1='Fats (g)' t2={(totalFatGrams || 0).toFixed()} t3={(fatConsumed || 0).toFixed()} t3Color={fatConsumed > totalFatGrams ? _tokens.red : undefined} t4={((fatConsumed || 0) + (form.fat || 0)).toFixed()} t4Color={((fatConsumed || 0) + (form.fat || 0)) > totalFatGrams ? _tokens.red : _tokens.green} />
        <Spacer />
      </ScrollView>}
      {(selectedOption === 'Nutrition Facts' || isNewFood) && <ScrollView style={tw`px-4`} showsVerticalScrollIndicator={false}>
        <NutritionLabel
          calories={form.calories}
          protein={form.protein}
          carbs={form.carbs}
          fat={form.fat}
          otherNutrition={form.otherNutrition}
          onCaloriesChange={v => setForm('calories', v)}
          onProteinChange={v => setForm('protein', v)}
          onCarbsChange={v => setForm('carbs', v)}
          onFatChange={v => setForm('fat', v)}
          onOtherNutritionChange={v => setForm('otherNutrition', v)}
          disabled={props.meal_id ? true : false}
        />
        <Spacer />
        <ManageButton title='Ingredients' buttonText=' ' />
        <TextArea editable={!props.meal_id ? true : false} value={form.ingredients || ''} height={'$9'} textSize={16} id='ingredients' />
        <View style={tw`h-90`} />
      </ScrollView>}
      <Overlay excludeBanner visible={showCategory} onDismiss={() => setShowCategory(false)}>
        <ManageButton buttonText='Done' title='Food Category' onPress={() => setShowCategory(false)} />
        <Spacer sm />
        <ScrollView showsVerticalScrollIndicator={false}>
          {Object.keys(USDAFoodCategories).map(x => {
            let selected = form.category === x
            return <Pressable onPress={() => {
              setForm('category', x)
            }} style={tw`py-1 flex-row items-center justify-between`} key={x}>
              <XStack alignItems='center'>
                <Text lg>{USDAFoodCategories[x]}</Text>
                <Spacer horizontal sm />
                <Text weight={selected ? 'bold' : 'regular'}>{x}</Text>
              </XStack>
              {selected && <ExpoIcon name='check' iconName='feather' size={20} color={_tokens.primary900} />}
            </Pressable>
          })}
          <Spacer xl />
          <Spacer xl />
        </ScrollView>
      </Overlay>
      {(shouldShowInput || keyboardOpen) && <LogFoodKeyboardAccessory onEnterPress={onSubmit} onOpen={() => setKeyboardOpen(true)} onClose={() => {
        let amt = form.quantity || 0
        setInitialValue(Math.round(amt) < amt ? Number(amt.toFixed(2)) : amt)
        setKeyboardOpen(false)
      }} initialValue={initialValue} onNumberChange={(v) => {
        console.log(keyboardOpen, v)
        if (!keyboardOpen) return;
        setForm('quantity', v)
      }} value={form.quantity || 1} servingSizes={servingSizes} selectedServingSize={form.servingSize} onServingChange={(v) => setForm('servingSize', v)} />}
      {/* <SaveButton discludeBackground title='Save Food' safeArea /> */}
    </View>
  )
} 