import { TextInput, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { Text, View } from '../../components/base/Themed'
//@ts-ignore
import { v4 as uuidv4 } from 'uuid';
import tw from 'twrnc'
import useColorScheme from '../../hooks/useColorScheme';
import { useNavigation } from '@react-navigation/native';
import { defaultImage, getMacrosFromIngredients, getMatchingNavigationScreen, MediaType, validate } from '../../data';
import { ImagePickerView } from '../../components/inputs/ImagePickerView';
import { ErrorMessage } from '../../components/base/ErrorMessage';
import { BackButton } from '../../components/base/BackButton';
import { DeleteButton, EditModeButton, ShareButton, ShowMoreDialogue, ShowUserButton } from '../home/ShowMore';
import { useBadges } from '../../hooks/useBadges';
import ScrollViewWithDrag from '../../components/screens/ScrollViewWithDrag';
import { FormReducer, useForm } from '../../hooks/useForm';
import { Tables } from '../../supabase/dao';
import TitleInput from '../../components/inputs/TitleInput';
import SaveButton from '../../components/base/SaveButton';
import Spacer from '../../components/base/Spacer';
import UsernameDisplay from '../../components/features/UsernameDisplay';
import ManageButton from '../../components/features/ManageButton';
import SwipeWithDelete from '../../components/base/SwipeWithDelete';
import { MealDao } from '../../types/MealDao';
import SupabaseImage from '../../components/base/SupabaseImage';
import MacronutrientBar from '../../components/features/MacronutrientBar';
import useOnLeaveScreen from '../../hooks/useOnLeaveScreen';
import { ProgressDao } from '../../types/ProgressDao';
import Overlay from '../../components/screens/Overlay';
import { supabase } from '../../supabase';
import QuantitySelect from '../../components/inputs/QuantitySelect';
import { useSelector } from '../../redux/store';
import { IngredientAdditions, PlanAdditions } from '../../redux/reducers/multiform';
import { useMultiPartForm } from '../../redux/api/mpf';
import Description from '../../components/base/Description';
import { XStack } from 'tamagui';


export interface MealDetailProps {
    id: string;
    editable: boolean;
    grocery?: boolean;
    idFromProgress?: string;
    planId?: string;
    dow?: number
}

export default function MealDetailScreen(props: MealDetailProps) {
    const { profile } = useSelector(x => x.auth)
    let MealForm = useForm<Tables['meal']['Insert']>({
        ai: false,
        description: '',
        video: null,
        name: '',
        preview: null,
        price: 0,
        public: true,
        steps: [],
        tags: [],
        user_id: profile?.id
    }, async () => {
        if (props.id && Number(props.id)) {
            let res = await dao.find(Number(props.id))
            if (!res) return null;
            setImageSource(res.video ? [{ type: 'video', uri: res.video, supabaseID: res.video }] : [{ type: 'image', uri: res.preview || defaultImage, supabaseID: res.preview || undefined }])
            let fetchedIngredients = await dao.getIngredients(Number(props.id))
            let ing: IngredientAdditions[] = fetchedIngredients.map(z => {
                let copy = { ...z }
                delete copy['food']
                return {
                    ...copy,
                    tempId: z.food_id,
                    name: z.food.name,
                    img: z.food.image,
                    servingSizes: z.food.servingSizes || {}
                }
            })
            ingrs.upsert(ing)
            return res;
        }
        return null
    })
    let [form, setForm] = [MealForm.state, MealForm.setForm]
    const ScreenForm = useForm({
        uploading: false,
        editMode: !props.id,
        newStep: '',
        errors: [],
        showLogProgress: false
    })
    let [screen, setScreen] = [ScreenForm.state, ScreenForm.setForm]
    let ProgressForm = useForm<Tables['meal_progress']['Insert']>({ consumed_weight: null, servingSize: null, total_weight: null }, async () => {
        if (props.idFromProgress && Number(props.idFromProgress)) {
            let res = await supabase.from('meal_progress').select('*').filter('id', 'eq', Number(props.idFromProgress)).maybeSingle()
            return res?.data
        }
        return null
    })
    let [consumed, setConsumed] = [ProgressForm.state, ProgressForm.setForm]
    const [imageSource, setImageSource] = React.useState<MediaType[]>([])
    const canViewDetails = !props.id || form.user_id === profile?.id || !form.price || false // if user purchased meal or subscribed to user
    const dm = useColorScheme() === 'dark'
    let pdao = ProgressDao(false)
    const { logProgress } = useBadges(false)
    let [uuid, setUuid] = useState<string>(uuidv4())
    let ingrs = useMultiPartForm('meals', uuid)
    let ingredients = ingrs.data
    const { protein, carbs, calories, fat, otherNutrition } = getMacrosFromIngredients(ingredients)
    const navigator = useNavigation()
    const dao = MealDao()
    useOnLeaveScreen(() => ingrs.remove())

    const deleteMeal = async () => {
        if (!props.id || !Number(props.id)) return;
        await dao.remove(Number(props.id))
        navigator.pop()
    }



    const saveMeal = async () => {
        if (screen.editMode) { // updating or creating
            let e = validate([
                { name: "Your meal's name", value: form.name, options: { required: true } },
                { name: "Your meal's description", value: form.description, options: { required: true } },
                { name: "Ingredients", value: ingredients.length, options: { validate: (v) => v > 0, errorMessage: 'You must have at least one ingredient' } },
            ])
            if (e !== true) {
                let message = e[0]
                //@ts-ignore
                setScreen('errors', [message])
                return;
            } else {
                setScreen('uploading', true)
                try {
                    let res = await dao.save(form)
                    if (res && res?.id) {
                        MealForm.dispatch({ type: FormReducer.Set, payload: res })
                        let savedIngredients = await dao.saveIngredients(res, ingredients)
                        if (!savedIngredients) {
                            throw Error('There was an error saving your ingredients.')
                        }
                    }
                    setScreen('editMode', false)
                } catch (error) { //@ts-ignore
                    setScreen('errors', [error.toString()])
                }
                setScreen('uploading', false)
            }
        } else if (canViewDetails) {
            if (props.grocery) { // add to grocery list

            } else if (props.planId) {
                let c = ingrs.q('plans', props.planId)
                let copy: PlanAdditions[] = [...c, { meal_id: form.id, name: form.name || '', image: form.preview || defaultImage, day_of_week: props.dow || 0, id: -(c.length + 1) }]
                ingrs.upsert_other('plans', props.planId, copy)
                navigator.pop()
            } else { // add to progress
                let meal_id = form.id
                if (ingrs.edited === true) { // make new meal & ingredients, linking old meal to new, then log progress
                    let copy = { ...form }
                    delete copy['id']
                    let res = await dao.save({ ...copy, public: false, price: 0 })
                    if (res && res.id) {
                        await dao.saveIngredients(res, ingredients)
                        meal_id = res.id
                    }
                }
                await pdao.saveProgress('meal_progress', {
                    meal_id,
                    progress_id: null,
                    total_weight: consumed.total_weight,
                    consumed_weight: consumed.consumed_weight,
                    servingSize: consumed.servingSize,
                    id: Number(props.idFromProgress) || undefined
                })
                navigator.pop()
            }

        } else { // redirect to subscription page
            navigator.navigate('Subscription')
        }
    }

    let fx = (consumed.consumed_weight || 1) / (consumed.total_weight || 1)

    return (
        <View style={{ flex: 1 }} includeBackground>

            {/* @ts-ignore */}
            <ScrollViewWithDrag disableRounding rerenderTopView={[screen.editMode, (imageSource || []), form.user_id]} TopView={() => <View>
                <BackButton inplace Right={() => {
                    if (screen.editMode || !props.id || !Number(props.id) || props.idFromProgress || props.planId) return <View />
                    return <ShowMoreDialogue meal_id={Number(props.id)} options={[
                        EditModeButton(screen.editMode, () => setScreen('editMode', !screen.editMode), form.user_id, profile?.id),
                        DeleteButton('Meal', deleteMeal, form.user_id, profile?.id),
                        // ShowUserButton(form.user_id, navigator),
                        ShareButton({ meal_id: Number(props.id) })
                    ]} />
                }} />
                <ImagePickerView editable={screen.editMode} srcs={canViewDetails ? imageSource : imageSource.filter(x => x.type === 'image')} onChange={x => {
                    setImageSource(x)
                }} type='all' />
            </View>} style={{ flex: 1, }} showsVerticalScrollIndicator={false}>

                <View style={[tw`pt-4 px-6 pb-60`]}>
                    <ErrorMessage errors={screen.errors} onDismissTap={() => setScreen('errors', [])} />
                    <TitleInput
                        value={form.name || ''}
                        editable={screen.editMode}
                        onChangeText={x => setForm('name', x)}
                        placeholder='My Meal'
                    />
                    <Spacer />
                    <UsernameDisplay image disabled={(screen.editMode || screen.uploading || (props.idFromProgress ? true : false))} id={form.user_id} username={form.id ? null : profile?.username} />
                    {/* @ts-ignore */}
                    <Spacer />
                    <Description editable={screen.editMode} placeholder='The description of your meal' value={form.description || ''} onChangeText={x => setForm('description', x)}  />

                    <Spacer divider />
                    {(canViewDetails && props.id && !props.planId) && <View>
                        <ManageButton title='Log Meal Details' buttonText=' ' />
                        <Spacer />
                        <QuantitySelect initialServingSize={consumed.servingSize} qty={consumed.consumed_weight} onQuantityChange={(x, y) => {
                            setConsumed('consumed_weight', x)
                            setConsumed('servingSize', y)
                        }} title='Consumed' />
                        <Spacer />
                        {((consumed.servingSize && consumed.consumed_weight) ?
                            <QuantitySelect selectedServingSize={consumed.servingSize} qty={consumed.total_weight} onQuantityChange={(x, y) => setConsumed('total_weight', x)} title='Total Servings' />
                            : <View />)
                        }
                        <Spacer divider />
                    </View>}
                    <View>
                        <ManageButton title='Nutrition' buttonText=' ' />
                        <Spacer />
                        <XStack alignItems='center' justifyContent='space-evenly'>
                        <MacronutrientBar calories weight={(calories * fx) || 0} totalEnergy={(calories * fx) || 1} />
                        <MacronutrientBar protein weight={(protein * fx) || 0} totalEnergy={(calories * fx) || 1} />
                        <MacronutrientBar carbs weight={(carbs * fx) || 0} totalEnergy={(calories * fx) || 1} />
                        <MacronutrientBar fat weight={(fat * fx) || 0} totalEnergy={(calories * fx) || 1} />
                        </XStack>
                        
                        <Spacer lg />
                    </View>
                    <ManageButton title='Ingredients' buttonText='Add New' hidden={!screen.editMode} onPress={() => {
                        const screen = getMatchingNavigationScreen('ListFood', navigator)
                        //@ts-ignore
                        navigator.navigate(screen, {
                            mealId: uuid
                        })
                    }} />
                    <Spacer sm />
                    {(ingredients).map((ingr, i) => {
                        return <SwipeWithDelete disabled={!screen.editMode} onDelete={() => {
                            let copy = [...ingredients]
                            copy.splice(i, 1)
                            ingrs.upsert(copy)
                        }} key={`${ingr.food_id} - ${i}`}>
                            <TouchableOpacity disabled={!screen.editMode} onPress={() => {
                                if (!screen.editMode) return
                                const s = getMatchingNavigationScreen('FoodDetail', navigator)
                                //@ts-ignore
                                navigator.navigate(s, { id: ingr.tempId, mealId: uuid, src: 'edit' })
                            }}>
                                <View card style={{ ...tw`px-4 py-2 flex-row items-center rounded-xl mb-2` }}>
                                    {ingr.img && <SupabaseImage uri={ingr.img} style='h-15 w-15 rounded-lg' />}
                                    {!ingr.img && <View style={tw`h-15 w-15 rounded-lg bg-gray-${dm ? '800' : '200'} items-center justify-center`}>
                                        <Text style={tw`text-2xl`}>{'🍎'}</Text>
                                    </View>}
                                    <Spacer horizontal sm />
                                    <View style={tw`w-9/12`}>
                                        <View style={tw`flex-row items-center justify-between`}>
                                            <Text lg weight='semibold' style={tw`max-w-9/12`}>{ingr.name.substring(0, 30)}{ingr.name.length > 29 ? '...' : ''}</Text>
                                            <Text style={tw`text-gray-500`}>{ingr.quantity?.toFixed(0)} {ingr.servingSize}</Text>
                                        </View>
                                        <Spacer xs />
                                        <View style={tw`flex-row items-center justify-between`}>
                                            <Text style={tw`text-gray-500`}>{ingr.calories?.toFixed(0)} kcal</Text>
                                            <Text style={tw`text-gray-500`}>P: {ingr.protein?.toFixed(0)}g</Text>
                                            <Text style={tw`text-gray-500`}>C: {ingr.carbs?.toFixed(0)}g</Text>
                                            <Text style={tw`text-gray-500`}>F: {ingr.fat?.toFixed(0)}g</Text>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </SwipeWithDelete>
                    })}
                    <Spacer divider />
                    <ManageButton title='Directions' buttonText=' '  />
                    <Spacer sm />
                    {(form.steps || []).map((x, i) => {
                        return <SwipeWithDelete key={`step ${x} ${i}`} disabled={!screen.editMode} onDelete={() => {
                            let copy = [...form.steps || []]
                            copy.splice(i, 1)
                            setForm('steps', copy)
                        }}>
                            <View style={tw`flex-row items-center mb-2`}>
                                <View style={tw`bg-red-${dm ? '600' : '500'} h-10 w-10 items-center justify-center rounded-full mr-2`}>
                                    <Text style={tw`text-white`} weight='semibold'>{i + 1}</Text>
                                </View>
                                <Text>{x}</Text>
                            </View>
                        </SwipeWithDelete>
                    })}
                    {screen.editMode && <Spacer sm />}
                    {screen.editMode && <View style={tw`flex-row items-center`}>
                        <View style={tw`bg-red-${dm ? '600' : '500'}/50 h-10 w-10 items-center justify-center rounded-full mr-2`}>
                            <Text style={tw`text-white`} weight='semibold'>{(form.steps || []).length + 1}</Text>
                        </View>
                        <TextInput onSubmitEditing={() => {
                            if (!screen.newStep!!) return;
                            setForm('steps', [...(form.steps || []), screen.newStep])
                            setScreen('newStep', '')
                        }} placeholder='Your new step (press enter to add)' placeholderTextColor={'gray'} style={tw`text-${dm ? 'white' : 'black'}`} value={screen.newStep} onChangeText={(v) => setScreen('newStep', v)} />
                    </View>}
                    <Spacer />
                </View>
            </ScrollViewWithDrag>
            <Overlay visible={screen.showLogProgress} onDismiss={() => setScreen('showLogProgress', false)}>

            </Overlay>
            <SaveButton favoriteId={form.id} title={screen.editMode ? 'Save Meal' : (canViewDetails ? (props.planId ? 'Save to Plan' : (props.idFromProgress ? 'Update Progress' : 'Log Meal')) : 'Purchase Meal')} favoriteType='meal' uploading={screen.uploading} onSave={saveMeal} />
        </View>
    )
}



