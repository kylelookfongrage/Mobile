import { ScrollView, TextInput, TouchableOpacity, Image, Alert, Dimensions } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { Text, View } from '../../components/base/Themed'
import { SafeAreaView } from 'react-native-safe-area-context';
//@ts-ignore
import { v4 as uuidv4 } from 'uuid';
import tw from 'twrnc'
import useColorScheme from '../../hooks/useColorScheme';
import { ExpoIcon } from '../../components/base/ExpoIcon';
import { useNavigation } from '@react-navigation/native';
import { healthLabelMapping, NewFoodItemData, NutritionInfo } from './FoodDetail';
import { ActivityIndicator, Divider, ProgressBar, Switch } from 'react-native-paper';
import { defaultImage, getMacrosFromIngredients, getMatchingNavigationScreen, isStorageUri, MediaType, uploadMedias, validate } from '../../data';
import { Category } from '../../types/Media';
import { ImagePickerView } from '../../components/inputs/ImagePickerView';
import { ErrorMessage } from '../../components/base/ErrorMessage';
import { Auth, DataStore, Storage } from 'aws-amplify';
import { Meal, Ingredient, User, MealProgress, PantryItem, Favorite, FavoriteType } from '../../aws/models';
import { useCommonAWSIds } from '../../hooks/useCommonContext';
import { BackButton } from '../../components/base/BackButton';
import { useDateContext } from '../home/Calendar';
import AllergenAlert from '../../components/features/AllergenAlert';
import { DeleteButton, EditModeButton, ShareButton, ShowMoreButton, ShowMoreDialogue, ShowUserButton } from '../home/ShowMore';
import { BadgeType, useBadges } from '../../hooks/useBadges';
import * as VT from 'expo-video-thumbnails'
import ScrollViewWithDrag from '../../components/screens/ScrollViewWithDrag';
import Reviews from '../../components/features/Reviews';
import { FormReducer, useForm } from '../../hooks/useForm';
import { Tables } from '../../supabase/dao';
import TitleInput from '../../components/inputs/TitleInput';
import SaveButton from '../../components/base/SaveButton';
import Spacer from '../../components/base/Spacer';
import UsernameDisplay from '../../components/features/UsernameDisplay';
import ManageButton from '../../components/features/ManageButton';
import { IngredientAdditions, useMultiPartForm } from '../../hooks/useMultipartForm';
import SwipeWithDelete from '../../components/base/SwipeWithDelete';
import { useStorage } from '../../supabase/storage';
import { MealDao } from '../../types/MealDao';
import SupabaseImage from '../../components/base/SupabaseImage';
import BarProgress from '../../components/base/BarProgress';
import MacronutrientBar from '../../components/features/MacronutrientBar';
import useOnLeaveScreen from '../../hooks/useOnLeaveScreen';
import { ProgressDao } from '../../types/ProgressDao';
import Overlay from '../../components/screens/Overlay';


export interface MealDetailProps {
    id: string;
    editable: boolean;
    grocery?: boolean;
    idFromProgress?: string;
}

interface IngredientDisplay extends Ingredient {
    userIsAllergic?: boolean;
}

export default function MealDetailScreen(props: MealDetailProps) {
    const { id, editable, idFromProgress } = props;
    const { userId, sub, progressId, username, subscribed, profile } = useCommonAWSIds()
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
            ingrs.upsert('meals', uuid, ing)
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
    const { AWSDate } = useDateContext();
    const [imageSource, setImageSource] = React.useState<MediaType[]>([])
    const [author, setAuthor] = React.useState<string>(props.editable === true ? '' : '')
    const [name, setName] = React.useState<string>('')
    const canViewDetails = !props.id || form.user_id === profile?.id || !form.price || false // if user purchased meal or subscribed to user
    const [mealId, setMealId] = React.useState(id)
    const dm = useColorScheme() === 'dark'
    let pdao = ProgressDao(false)
    const { logProgress } = useBadges(false)
    let ingrs = useMultiPartForm()
    let [uuid, setUuid] = useState<string>(uuidv4())
    let ingredients = ingrs['data']['meals'][uuid] || []
    const { protein, carbs, calories, fat, otherNutrition } = getMacrosFromIngredients(ingredients)
    const navigator = useNavigation()
    const dao = MealDao()
    useOnLeaveScreen(() => ingrs.remove('meals', uuid))

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

            } else { // add to progress
                let meal_id = form.id
                if (ingrs.data.edited[uuid] === true) { // make new meal & ingredients, linking old meal to new, then log progress
                    let copy = { ...form }
                    delete copy['id']
                    let res = await dao.save({ ...copy, public: false, price: 0 })
                    if (res && res.id) {
                        await dao.saveIngredients(res, ingredients)
                        meal_id = res.id
                    }
                }
                await pdao.saveProgress('meal_progress', { meal_id, progress_id: null })
                navigator.pop()
            }

        } else { // redirect to subscription page
            navigator.navigate('Subscription')
        }

    }


    const firstImage = imageSource.filter(x => x.type === 'image')

    return (
        <View style={{ flex: 1 }} includeBackground>

            {/* @ts-ignore */}
            <ScrollViewWithDrag rerenderTopView={[screen.editMode, (imageSource || [])]} TopView={() => <View>
                <BackButton inplace Right={() => {
                    if (screen.editMode || !id || !Number(id)) return <View />
                    return <ShowMoreDialogue meal_id={Number(id)} options={[
                        EditModeButton(screen.editMode, () => setScreen('editMode', !screen.editMode)),
                        DeleteButton('Meal', deleteMeal),
                        ShowUserButton(form.user_id, navigator),
                        ShareButton({meal_id: Number(id)})
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
                    <Spacer sm />
                    <UsernameDisplay disabled={(!screen.editMode || screen.uploading)} id={form.user_id} username={form.id ? null : profile?.username} />
                    {/* @ts-ignore */}
                    <Spacer />
                    <TextInput
                        value={form.description || ''}
                        multiline
                        numberOfLines={4}
                        onChangeText={x => setForm('description', x)}
                        editable={screen.editMode}
                        placeholder='The description of your meal'
                        placeholderTextColor={'gray'}
                        style={tw`max-w-10/12 text-${dm ? 'white' : 'black'}`}
                    />
                    <Spacer divider />
                    <View>
                        <Text h3>Macros</Text>
                        <MacronutrientBar protein weight={protein || 0} totalEnergy={calories || 1} />
                        <MacronutrientBar carbs weight={carbs || 0} totalEnergy={calories || 1} />
                        <MacronutrientBar fat weight={fat || 0} totalEnergy={calories || 1} />

                        <Spacer divider />
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
                        return <SwipeWithDelete onDelete={() => {
                            let copy = [...ingredients]
                            copy.splice(i, 1)
                            ingrs.upsert('meals', uuid, copy)
                        }} key={`${ingr.food_id} - ${i}`}>
                            <TouchableOpacity onPress={() => {
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
                                            <Text weight='semibold' style={tw`max-w-9/12`}>{ingr.name.substring(0, 30)}{ingr.name.length > 29 ? '...' : ''}</Text>
                                            <Text xs style={tw`text-gray-500`}>{ingr.quantity?.toFixed(0)} {ingr.servingSize}</Text>
                                        </View>
                                        <Spacer xs />
                                        <View style={tw`flex-row items-center justify-between`}>
                                            <Text xs style={tw`text-gray-500`}>{ingr.calories?.toFixed(0)} kcal</Text>
                                            <Text xs style={tw`text-gray-500`}>P: {ingr.protein?.toFixed(0)}g</Text>
                                            <Text xs style={tw`text-gray-500`}>C: {ingr.carbs?.toFixed(0)}g</Text>
                                            <Text xs style={tw`text-gray-500`}>F: {ingr.fat?.toFixed(0)}g</Text>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </SwipeWithDelete>
                    })}
                    <Spacer divider />
                    <Text h3>Directions</Text>
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
            <SaveButton favoriteId={form.id} title={screen.editMode ? 'Save Meal' : (canViewDetails ? (false ? 'Save to Plan' : 'Log Meal') : 'Purchase Meal')} favoriteType='meal' uploading={screen.uploading} onSave={saveMeal} />
        </View>
    )
}



