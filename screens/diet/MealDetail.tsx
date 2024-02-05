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
import { getEmojiByCategory } from '../../types/FoodApi';
import { _tokens } from '../../tamagui.config';
import Selector, { HideView } from '../../components/base/Selector';
import NutritionLabel from '../../components/features/NutritionLabel';


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
                    tempId: z.id,
                    meal_id: props.id
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
    const [imageSource, setImageSource] = React.useState<MediaType[]>([])
    const canViewDetails = !props.id || form.user_id === profile?.id || !form.price || false // if user purchased meal or subscribed to user
    const dm = useColorScheme() === 'dark'
    let pdao = ProgressDao(false)
    const { logProgress } = useBadges(false)
    let [uuid, setUuid] = useState<string>(uuidv4())
    let searchOptions = screen.editMode ? [] : ['Overview', 'Nutrition Label']
    let [selectedOption, setSelectedOption] = useState<typeof searchOptions[number]>(searchOptions[0])
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
            }
            setScreen('uploading', true)
            let copiedForm = {...form}
            let media = imageSource?.[0]
            if (media) {
                if (media.type === 'video') {
                    copiedForm['video'] = media.uri
                } else { copiedForm['preview'] = media.uri }
            }
            try {
                let res = await dao.save(copiedForm, form.video || undefined, form.preview || undefined)
                if (res && res?.id) {
                    MealForm.dispatch({ type: FormReducer.Set, payload: res })
                    let savedIngredients = await dao.saveIngredients(res, ingredients)
                    if (!savedIngredients) {
                        throw Error('There was an error saving your ingredients.')
                    }
                }
                setSelectedOption('Overview')
                setScreen('editMode', false)
            } catch (error) { //@ts-ignore
                setScreen('errors', [error.toString()])
            }
            setScreen('uploading', false)
        } else if (canViewDetails) {
            if (props.grocery) { // add to grocery list

            } else if (props.planId) {
                let c = ingrs.q('plans', props.planId)
                let copy: PlanAdditions[] = [...c, { meal_id: form.id, name: form.name || '', image: form.preview || defaultImage, day_of_week: props.dow || 0, id: -(c.length + 1) }]
                ingrs.upsert_other('plans', props.planId, copy)
                navigator.pop()
            } else { // add to progress
                ingrs.upsert(ingrs.data.map(x => ({...x, meal_id: form.id})))
                // let meal_id = await duplicateMeal()
                let s = getMatchingNavigationScreen('FoodDetail',navigator)
                //@ts-ignores
                navigator.navigate(s, {mealId: uuid, meal_progress_id: props.idFromProgress, meal_name: form.name, meal_id: form.id, meal: form})
            }

        } else { // redirect to subscription page
            navigator.navigate('Subscription')
        }
    }

    return (
        <View style={{ flex: 1 }} includeBackground>
            {/* @ts-ignore */}
            <ScrollViewWithDrag keyboardDismissMode='interactive' disableRounding rerenderTopView={[screen.editMode, (form.vi || []), form.user_id]} TopView={() => <View>
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
                    console.log(x)
                    setImageSource(x)
                }} type='all' />
            </View>} style={{ flex: 1, }} showsVerticalScrollIndicator={false}>

                <View style={[tw`pt-4 pb-60`]}>
                    <View style={tw`px-2`}>
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
                    </View>
                    <Selector searchOptions={searchOptions} selectedOption={selectedOption} onPress={setSelectedOption} />
                    <Spacer />
                    <HideView hidden={selectedOption !== 'Overview' && !screen.editMode} style={tw`px-2`}>
                        <Description editable={screen.editMode} placeholder='The description of your meal' value={form.description || ''} onChangeText={x => setForm('description', x)} />
                        <Spacer divider />
                        <ManageButton title='Ingredients' buttonText='Add New' hidden={!screen.editMode} onPress={() => {
                            const screen = getMatchingNavigationScreen('ListFood', navigator)
                            //@ts-ignore
                            navigator.navigate(screen, {
                                mealId: uuid
                            })
                        }} />
                        <Spacer sm />
                        {(ingredients).map((ingr, i) => {
                            return <SwipeWithDelete onDelete={() => {
                                let copy = [...ingredients]
                                copy.splice(i, 1)
                                ingrs.upsert(copy)
                            }} key={`${ingr.food_id} - ${i}`}>
                                <TouchableOpacity onPress={() => {
                                    const s = getMatchingNavigationScreen('FoodDetail', navigator)
                                    //@ts-ignore
                                    navigator.navigate(s, { tempId: ingr.tempId, mealId: uuid, src: 'edit' })
                                }}>
                                    <View card style={{ ...tw`px-3 py-2 flex-row items-center rounded-xl mb-2` }}>
                                        <Text h3>{getEmojiByCategory(ingr.category)}</Text>
                                        <Spacer horizontal />
                                        <View style={tw`w-10/12`}>
                                            <View style={tw`flex-row items-center justify-between`}>
                                                <Text lg weight='semibold' style={tw``}>{ingr.name?.substring(0, 25)}{ingr.name?.length > 24 ? '...' : ''}</Text>
                                                <Text style={tw`text-gray-500`}>{ingr?.quantity ? (Math.round(ingr.quantity) < ingr.quantity ? ingr.quantity?.toFixed(2) : ingr.quantity?.toFixed()) : 0} {ingr.servingSize}</Text>
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
                        <ManageButton title='Directions' buttonText=' ' />
                        <Spacer sm />
                        {(form.steps || []).map((x, i) => {
                            return <SwipeWithDelete key={`step ${x} ${i}`} disabled={!screen.editMode} onDelete={() => {
                                let copy = [...form.steps || []]
                                copy.splice(i, 1)
                                setForm('steps', copy)
                            }}>
                                <View style={tw`flex-row items-center mb-3`}>
                                    <View style={{ ...tw`h-8 w-8 items-center justify-center rounded-full mr-2`, backgroundColor: _tokens.primary900 }}>
                                        <Text lg style={tw`text-white`} weight='bold'>{i + 1}</Text>
                                    </View>
                                    <Text lg style={tw`max-w-10/12`}>{x}</Text>
                                </View>
                            </SwipeWithDelete>
                        })}
                        {screen.editMode && <Spacer sm />}
                        {screen.editMode && <View style={tw`flex-row items-center mb-2`}>
                            <View style={{ ...tw`h-8 w-8 items-center justify-center rounded-full mr-2`, backgroundColor: _tokens.primary900 + '80' }}>
                                <Text lg style={tw`text-white`} weight='bold'>{(form.steps || []).length + 1}</Text>
                            </View>
                            <TextInput multiline numberOfLines={3} onSubmitEditing={() => {
                                if (!screen.newStep!!) return;
                                setForm('steps', [...(form.steps || []), screen.newStep])
                                setScreen('newStep', '')
                            }} placeholder='Your new step (press enter to add)' placeholderTextColor={'gray'} style={tw`text-${dm ? 'white' : 'black'} max-w-10/12`} value={screen.newStep} onChangeText={(v) => setScreen('newStep', v)} />
                        </View>}
                        <Spacer />
                    </HideView>

                    <HideView style={tw`px-2`} hidden={selectedOption !== 'Nutrition Label' || screen.editMode}>
                        <NutritionLabel
                            calories={calories}
                            protein={protein}
                            carbs={carbs}
                            fat={fat}
                            otherNutrition={otherNutrition}
                            disabled
                        />

                    </HideView>
                </View>
            </ScrollViewWithDrag>
            <Overlay visible={screen.showLogProgress} onDismiss={() => setScreen('showLogProgress', false)}>

            </Overlay>
            <SaveButton discludeBackground favoriteId={form.id} title={screen.editMode ? 'Save Meal' : (canViewDetails ? (props.planId ? 'Save to Plan' : (props.idFromProgress ? 'Update Progress' : 'Log Meal')) : 'Purchase Meal')} favoriteType='meal' uploading={screen.uploading} onSave={saveMeal} />
        </View>
    )
}



