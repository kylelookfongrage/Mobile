import { TouchableOpacity, KeyboardTypeOptions, Dimensions } from 'react-native';
import { Text, View } from '../../components/base/Themed';
import React from 'react';
import tw from 'twrnc';
import { TextInput } from 'react-native';
import { ExpoIcon } from '../../components/base/ExpoIcon';
import useColorScheme from '../../hooks/useColorScheme';
import Animated, {
    BounceInDown,
    FadeOut
} from 'react-native-reanimated';
import { defaultImage, EdamamNutrientsResponse, FetchEdamamNutrients, fractionStrToDecimal, GenerateMealResult, getMatchingNavigationScreen, isStorageUri, titleCase, uploadImageAndGetID } from '../../data';
import { useNavigation } from '@react-navigation/native';
import { ImagePickerView } from '../../components/inputs/ImagePickerView';
import { useCommonAWSIds } from '../../hooks/useCommonContext';
import { ErrorMessage } from '../../components/base/ErrorMessage';
import { BackButton } from '../../components/base/BackButton';
import AllergenAlert from '../../components/features/AllergenAlert';
import { DeleteButton, EditModeButton, ShareButton, ShowMoreButton, ShowMoreDialogue, ShowUserButton } from '../home/ShowMore';
import { FavoriteType } from '../../aws/models';
import ScrollViewWithDrag from '../../components/screens/ScrollViewWithDrag';
import { FoodDao } from '../../types/FoodDao';
import { FormReducer, useForm } from '../../hooks/useForm';
import { Tables } from '../../supabase/dao';
import Spacer from '../../components/base/Spacer';

import { ThemeManager } from 'react-native-ui-lib';
import { FlatList, Swipeable } from 'react-native-gesture-handler';
import Overlay from '../../components/screens/Overlay';
import InputAccessory from '../../components/base/InputAccessory';
import SpinSelect, { StyledWheelPicker } from '../../components/inputs/SpinSelect';
import SelectScreen from '../../components/inputs/SelectScreen';
import SaveButton from '../../components/base/SaveButton';
import SwipeWithDelete from '../../components/base/SwipeWithDelete';
import TitleInput from '../../components/inputs/TitleInput';
import UsernameDisplay from '../../components/features/UsernameDisplay';
import ManageButton from '../../components/features/ManageButton';
import { formToIngredient, useMultiPartForm } from '../../hooks/useMultipartForm';
import useAsync from '../../hooks/useAsync';
import { ProgressDao } from '../../types/ProgressDao';

interface FoodDetailProps {
    id?: string;
    upc?: string;
    src: 'new' | 'api' | 'ai' | 'backend' | 'edit';
    editable?: boolean;
    mealId?: string;
    progressId?: string;
    name?: string;
    img?: string;
    category?: string;
    foodContentsLabel?: string;
    grocery?: boolean;
    measures?: {
        uri: string;
        label: string;
        weight: number
        qualified?: {
            qualifiers?: {
                uri: string;
                label: string;
            }[]
            weight: number;
        }[]
    }[]
}

export default function FoodDetail(props: FoodDetailProps) {
    const dm = useColorScheme() === 'dark'
    const { progressId, aiResult, currentIngredietId, setCurrentIngredietId, setAiResult, userId, username, profile } = useCommonAWSIds()
    const [editable, setEditable] = React.useState(props.editable === true)
    const src: 'new' | 'api' | 'ai' | 'backend' | 'edit' = props.src
    const [id, setId] = React.useState<string>(props.id || '')
    const dao = FoodDao()
    let pdao = ProgressDao(false)
    // passed in as param
    const [nutritionInfo, setNutritionInfo] = React.useState<FoodItemData[]>(NewFoodItemData())
    const [edamamId, setEdamamId] = React.useState<string | null>(null);
    const [author, setAuthor] = React.useState<string>('Edamam Nutrition')
    const [authorId, setAuthorId] = React.useState<string | null>(null)
    const [userAllergens, setUserAllergens] = React.useState<string[]>([])
    const screenState = useForm({
        editMode: props.src === 'new' || props.src === 'edit' || (props.src === 'api' && props.mealId),
        showServingSizes: false,
        showManageServingSizes: false,
        showNewServingSize: false,
        newServingSizeName: '',
        newServingSizeWeight: -1,
        currentMeasure: 'gram',
        uploading: false,
        showQuantity: false,
        mounted: false
    })
    let form = useForm<Tables['food']['Insert']>({
        name: props.name || '',
        image: props.img || null,
        ingredients: props.foodContentsLabel,
        barcode: props.upc || null,
        healthLabels: [],
        weight: 1,
        otherNutrition: {},
        calories: 0,
        carbs: 0,
        protein: 0,
        fat: 0,
        edamamId: props.src === 'api' ? props.id : null,
        tags: [],
        user_id: profile?.id,
        public: true,
        quantity: 1,
        servingSize: props.measures ? props.measures[0].label : 'gram',
        servingSizes: props.measures ? Object.fromEntries(props.measures?.map(x => {
            return [x.label, x.weight]
        })) : {
            'gram': 1,
        }
    }, async () => {
        if (props.id && props.src === 'backend' && Number(props.id)) {
            return await dao.find(Number(props.id))
        }
        return null
    })

    useAsync(async () => {
        if (src === 'api') {
            setEdamamId(id)
            form.setForm('public', false)
            let v = await FetchEdamamNutrients({
                ingredients: [
                    //@ts-ignore
                    { foodId: id, quantity: 1, measureURI: props.measures[0].uri }
                ]
            })
            form.setForm('healthLabels', v.healthLabels || [])
            form.setForm('weight', v.totalWeight)
            if (props.measures) {
                let measures: { [k: string]: number } = {}
                props.measures?.forEach((m) => {
                    measures[m.label] = m.weight
                    if (m.qualified) {
                        m.qualified.forEach((q) => {
                            (q.qualifiers || []).forEach((qual) => {
                                measures[qual.label] = q.weight
                            })
                        })
                    }
                })
                form.setForm('servingSizes', measures)
            }

            // get the nutrient values for calories, fat, sat fat, trans fat, cholesterol, sodium, carbs, fiber sugar, protein, then all of the other ones
            setNutritionInfo(EdamamFoodToFoodItemData(v))
        } else if (props.id && (props.src === 'edit' || props.src === 'backend')) {
            if (props.mealId) {
                let potentialData = multiPartForm.data['meals'][props.mealId]?.filter(x => x.tempId == props.id)?.[0]
                if (potentialData) {
                    console.log('setting nutrition info')
                    let newNutritionInfo = NewFoodItemData(potentialData.calories, potentialData.protein, potentialData.fat, potentialData.carbs, potentialData.otherNutrition)
                    setNutritionInfo(newNutritionInfo)
                    form.dispatch({ type: FormReducer.Set, payload: { ...potentialData, image: potentialData.img } })
                }
            } else if (props.grocery) {

            } else {
                if (!Number(props.id)) return;
                let potentialData = await dao.find(Number(props.id))
                console.log(potentialData)
                if (!potentialData) return;
                let newNutritionInfo = NewFoodItemData(potentialData.calories, potentialData.protein, potentialData.fat, potentialData.carbs, potentialData.otherNutrition)
                setNutritionInfo(newNutritionInfo)
                form.dispatch({ type: FormReducer.Set, payload: { ...potentialData, image: potentialData.image || defaultImage } })
            }
        }
    }, [])
    React.useEffect(() => {
        return;
        //@ts-ignore
        if (src === 'api') {
            setEdamamId(id)
            form.setForm('public', false)
            FetchEdamamNutrients({
                ingredients: [
                    //@ts-ignore
                    { foodId: id, quantity: 1, measureURI: props.measures[0].uri }
                ]
            }).then((v) => {
                // set the health labels if there

            }).catch((e) => console.log(`Error: ${e}`))
        } else if (props.src === 'edit') {
            if (props.mealId) {
                let potentialData = multiPartForm.data['meals'][props.mealId]?.filter(x => x.food_id === props.id)?.[0]
                if (potentialData) {
                    console.log('setting nutrition info')
                    let newNutritionInfo = NewFoodItemData(potentialData.calories, potentialData.protein, potentialData.fat, potentialData.carbs, potentialData.otherNutrition)
                    setNutritionInfo(newNutritionInfo)
                    form.dispatch({ type: FormReducer.Set, payload: { ...potentialData, image: potentialData.img } })
                }
            }
        }
        else if ((src === 'backend') && progressId && props.id && !props.mealId && !props.grocery) {
            // DataStore.query(FoodProgress, props.id).then(f => {
            //     //@ts-ignore
            //     const foodMeasures: {label: string, weight: number}[] = f?.measures && f.measures.length > 0 ? JSON.parse(f?.measures).map(x => JSON.parse(x)) : [{ label: 'g', weight: 1 }]
            //     let currentMeasureForFood = foodMeasures[0]
            //     if (f?.units) {
            //         const potentialFoodMatch = foodMeasures.filter(x => x.label === f.units)
            //         if (potentialFoodMatch.length > 0) {
            //             currentMeasureForFood = potentialFoodMatch[0]
            //         }
            //     }
            //     setName(f?.name || '')
            //     setImageSource(f?.img ? [{ uri: f.img, type: 'image' }] : [])
            //     setCategory(f?.category || undefined)
            //     setNutritionInfo(NewFoodItemData(f?.kcal, f?.protein, f?.fat, f?.carbs, f?.otherNutrition))
            //     setTotalWeight(f?.totalWeight || 1)
            //     setHealthLabels(f?.healthLabels || [])
            //     //@ts-ignore
            //     setMeasures(foodMeasures)
            //     setIngredients(f?.foodContentsLabel || undefined)
            //     setQuantity(f?.quantity ? f.quantity.toString() : '1')
            //     setCurrentMeasure(currentMeasureForFood)
            //     setIngredients(f?.foodContentsLabel || '')
            //     setAuthorId(f?.userID || null)
            //     setEdamamId(f?.edamamId || null)
            //     if (!f?.edamamId && f?.userID) {
            //         DataStore.query(User, f?.userID).then(x => {
            //             setAuthor(x?.username || 'Edamam Nutrition')
            //         })
            //     }
            // })
        } else if ((props.grocery || props.mealId) && props.id && (props.src === 'ai' || props.src === 'backend')) {
            // DataStore.query(Ingredient, props.id).then(f => {
            //     //@ts-ignore
            //     const foodMeasures: {label: string, weight: number}[] = f?.measures && f.measures.length > 0 ? JSON.parse(f?.measures).map(x => JSON.parse(x)) : [{ label: 'g', weight: 1 }]
            //     let currentMeasureForFood = foodMeasures[0]
            //     if (f?.units) {
            //         const potentialFoodMatch = foodMeasures.filter(x => x.label === f.units)
            //         if (potentialFoodMatch.length > 0) {
            //             currentMeasureForFood = potentialFoodMatch[0]
            //         }
            //     }
            //     setName(f?.name || '')
            //     setImageSource(f?.img ? [{ uri: f.img, type: 'image' }] : [])
            //     setCategory(f?.category || undefined)
            //     // TODO: add calories to ingredient schema
            //     setNutritionInfo(NewFoodItemData(f?.kcal, f?.protein, f?.fat, f?.carbs, f?.otherNutrition))
            //     setTotalWeight(f?.totalWeight || 1)
            //     //@ts-ignore
            //     setMeasures(foodMeasures)
            //     setHealthLabels(f?.healthLabels || new Array())
            //     setIngredients(f?.foodContentsLabel || undefined)
            //     setQuantity(f?.quantity ? f.quantity.toString() : '1')
            //     setCurrentMeasure(currentMeasureForFood)
            //     //TODO: Add edamam ID to ingredient
            //     setEdamamId(f?.edamamId || '')
            //     if (!f?.edamamId && f?.userID) {
            //         DataStore.query(User, f?.userID).then(x => {
            //             setAuthor(x?.username || 'Edamam Nutrition')
            //         })
            //     }
            // })
        } else {
            setNutritionInfo(NewFoodItemData())
            if (props.src !== 'api') {
                setAuthor(username)
                setAuthorId(userId)
            }
        }
        screenState.setForm('mounted', true)
    }, [])

    React.useEffect(() => {
        let sum = nutritionInfo.reduce((prev, curr) => prev + (Number(curr.value) || 0), 0)
        if (sum === 0) return;
        console.log('setting nutrition info pt 2')
        console.log({ weight: form.state.weight, quantity: form.state.quantity, ss: form.state.servingSize })
        if (!Number.isNaN(Number(form.state.quantity)) && Number(form.state.quantity) > 0 && form.state.weight && form.state.servingSize) {
            //@ts-ignore
            const newWeight = form.state.servingSizes?.[form.state.servingSize] as number
            if (!newWeight) return;
            const nutritionCopy = nutritionInfo
            const newNutrition = nutritionCopy.map((n) => {
                const newFraction = (Number(n.value) * newWeight) / (form.state.weight || 1)
                return { ...n, value: (newFraction * Number(form.state.quantity)).toFixed(2).toString() }
            })
            form.setForm('weight', newWeight * Number(form.state.quantity))
            setNutritionInfo(newNutrition)
        }
    }, [form.state.servingSize, form.state.quantity])

    const navigator = useNavigation()
    const [errors, setErrors] = React.useState<string[]>([])
    let multiPartForm = useMultiPartForm()


    const onAddPress = async () => {
        screenState.setForm('uploading', true)
        console.log(props)
        if (!props.id && src !== 'new') {
            setErrors(['There was a problem'])
            return
        }
        try {
            const otherNutrition: any = {}
            nutritionInfo.filter((x) => !['calories', 'protein', 'carbs', 'fat'].includes(x.name.toLowerCase())).forEach((x) => {
                otherNutrition[x.name] = { value: x.value, hidden: x.hidden }
            })
            let [calories, protein, carbs, fat] = ['calories', 'protein', 'carbs', 'fat'].map(name => {
                return Number(nutritionInfo.filter(x => x.name.toLowerCase() == name)[0].value)
            })
            if (props.src === 'new') { // new food
                let res = await dao.save({ ...form.state, calories, carbs, protein, fat, otherNutrition, user_id: undefined }, props.img === form.state.image)
                if (res) {
                    form.dispatch({ type: FormReducer.Set, payload: res })
                }
            } else if (props.src === 'api') { // food from edamam
                if (props.mealId) { // add to meal
                    console.log('adding to meal')
                    let existingIngredients = [...(multiPartForm.data.meals[props.mealId] || [])]
                    existingIngredients.push(formToIngredient({ ...form.state }, { calories, protein, carbs, fat, otherNutrition, tempId: props.id || '' }))
                    multiPartForm.upsert('meals', props.mealId, existingIngredients)
                    navigator.pop()
                } else if (props.grocery) { // add to grocery list

                } else { // add to progress

                }

            } else if (props.src === 'edit') {
                if (props.mealId) { // update meal ingredient
                    let existingIngredients = [...(multiPartForm.data.meals[props.mealId] || [])]
                    console.log(existingIngredients)
                    existingIngredients = existingIngredients.map(x => {
                        if (x.tempId === props.id) {
                            return formToIngredient({ ...form.state, id: (Number(props.id) || undefined) }, { calories, protein, carbs, fat, otherNutrition, tempId: props.id || '' })
                        }
                        return x
                    })
                    multiPartForm.upsert('meals', props.mealId, existingIngredients)
                    navigator.pop()
                } else if (props.grocery) { // update grocery item

                } else { // update progress

                }
            }
            else if (props.src === 'backend') { // comes from the database
                if (props.grocery) { // add to grocery list

                } else if (props.mealId) { // add to meal ingredients

                } else { // add to progress
                    let p = { ...form }
                    await pdao.saveProgress('food_progress', {
                        calories, carbs, protein, fat, otherNutrition, food_id: form.state.id || null, progress_id: '',
                        user_id: profile?.id, quantity: form.state.quantity, serving: form.state.servingSize, servingSizes: form.state.servingSizes,
                        weight: form.state.weight
                    })
                    navigator.pop()
                }
            } else if (props.src === 'ai') {
                // let newAiResult: GenerateMealResult = { ...aiResult }
                // if (newAiResult['ingredients']) {
                //     const key = newAiResult.ingredients.findIndex(x => x.name === currentIngredietId)
                //     if (key !== -1) {
                //         newAiResult.ingredients[key].ingredient = x.id
                //     }
                //     setAiResult(newAiResult)
                //     setCurrentIngredietId(null)
                // }
            }
            screenState.setForm('uploading', false)
        } catch (error: any) {
            setErrors([error.toString()])
            screenState.setForm('uploading', false)
        }

    }

    const userIsAllergic = userAllergens.filter(x => `${form.state.name} ${form.state.ingredients}`.toLowerCase().includes(x || 'nothing')).length > 0
    let saveButtonTitle = 'Log Food'
    if (screenState.state.editMode) saveButtonTitle = 'Save Food'
    if (props.grocery) saveButtonTitle = 'Save to List'
    if (props.mealId) saveButtonTitle = 'Save to Meal'
    if (props.mealId && props.src === 'edit') saveButtonTitle = 'Update Ingredient'
    const deleteFood = async () => {

    }
    return (
        <View style={{ flex: 1 }} includeBackground>
            <ScrollViewWithDrag
                rerenderTopView={[screenState.state.editMode == true, form.state.image]}
                TopView={() => <View>
                    <BackButton inplace Right={() => {
                        if (screenState.state.editMode) return <View />;
                        return <ShowMoreDialogue food_id={Number(id)} options={[
                            EditModeButton(screenState.state.editMode ? true : false, () => screenState.setForm('editMode', !screenState.state.editMode)),
                            DeleteButton('Food', deleteFood),
                            ShowUserButton(form.state.user_id, navigator),
                            ShareButton({ food_id: Number(id) })
                        ]} />
                    }} />
                    <ImagePickerView
                        editable={screenState.state.editMode ? true : false}
                        srcs={form.state.image ? [{ uri: form.state.image, type: 'image' }] : []}
                        onChange={x => form.setForm('image', x[0]?.uri)}
                        type='image' />
                </View>}
                showsVerticalScrollIndicator={false} >
                <View style={tw`py-4 px-6`}>
                    {errors.length > 0 && <ErrorMessage errors={errors} onDismissTap={() => setErrors([])} />}
                    {/* Title */}
                    <TitleInput
                        value={form.state.name}
                        editable={editable === true}
                        placeholder={'Something delicious'}
                        onChangeText={x => form.setForm('name', x)}
                    />
                    <Spacer sm />
                    <UsernameDisplay disabled={(!!edamamId || !authorId || screenState.state.editMode)} id={form.state.user_id} username={screenState.state.editMode ? profile?.username : null} />

                    {/* <View style={tw`justify-between flex-row items-center py-4`}>
                        <View style={tw`w-12/12`}>
                                                    </View>
                        {userIsAllergic && <AllergenAlert />}
                    </View> */}

                    {/* Nutrient Information */}
                    <View style={tw`flex-row justify-between items-center w-12/12 py-4`}>
                        <View>
                            <ManageButton vertical title='Servings' onPress={() => {
                                screenState.setForm('showManageServingSizes', true)
                            }} />
                            <Overlay style={tw`pb-90`} visible={screenState.state.showManageServingSizes} onDismiss={() => {
                                screenState.setForm('showManageServingSizes', false)
                                screenState.setForm('newServingSizeName', '')
                                screenState.setForm('newServingSizeWeight', -1)
                            }}>
                                <FlatList style={tw`pb-90`} keyboardDismissMode='interactive' data={Object.keys(form.state.servingSizes)} renderItem={(z) => {
                                    const weight = form.state.servingSizes[z.item]
                                    return <SwipeWithDelete disabled={!screenState.state.editMode} onDelete={() => {
                                        let copy = form.state.servingSizes || {}
                                        if (Object.keys(copy).length === 1) return;
                                        const name = z.item;
                                        const { [name]: removedProperty, ...remainingObject } = copy;
                                        console.log(z)
                                        console.log(remainingObject)
                                        form.setForm('servingSizes', remainingObject)
                                    }}>
                                        <View key={`ManageServings-` + z.item} style={tw`py-3`}>
                                            <Text>{titleCase(z.item)} ({weight.toFixed()}g)</Text>
                                        </View>
                                    </SwipeWithDelete>
                                }} />
                                {screenState.state.editMode && <InputAccessory title='New Serving Size'>
                                    <View style={{ ...tw`px-4 items-center flex-row justify-around`, paddingBottom: 4, paddingTop: 5 }}>
                                        <TextInput placeholder='Name' value={screenState.state.newServingSizeName} onChangeText={v => screenState.setForm('newServingSizeName', v)} style={tw`py-2 text-${dm ? 'white' : 'black'}`} />
                                        <TextInput keyboardType='number-pad' placeholder='Weight' style={tw`py-2 text-${dm ? 'white' : 'black'} items-center text-center`} value={screenState.state.newServingSizeWeight < 1 ? '' : screenState.state.newServingSizeWeight.toString()} onChangeText={(v) => {
                                            const newValue = v.replace(/[^0-9]/g, '')
                                            screenState.setForm('newServingSizeWeight', Number(newValue) || -1)

                                        }} />
                                        <TouchableOpacity style={{ zIndex: 1 }} onPress={() => {
                                            let copy = { ...form.state.servingSizes }
                                            copy[screenState.state.newServingSizeName] = screenState.state.newServingSizeWeight
                                            form.setForm('servingSizes', copy)
                                            screenState.setForm('newServingSizeName', '')
                                            screenState.setForm('newServingSizeWeight', -1)
                                        }}>
                                            <ExpoIcon name='checkmark-circle' iconName='ion' size={30} color={'red'} />
                                        </TouchableOpacity>
                                    </View>
                                </InputAccessory>}
                            </Overlay>

                        </View>
                        <View style={tw`flex-row`}>
                            <TouchableOpacity onPress={() => screenState.setForm('showQuantity', true)} style={tw`h-10 px-4 items-center justify-center bg-gray-${dm ? '800' : '200'} rounded-lg mr-4`}>
                                <Text>{form.state?.quantity}</Text>
                            </TouchableOpacity>
                            <Overlay dialogueHeight={40} excludeBanner visible={screenState.state.showQuantity} onDismiss={() => screenState.setForm('showQuantity', false)}>
                                <TouchableOpacity onPress={() => {
                                    screenState.setForm('showQuantity', false)
                                }} style={{ ...tw`items-end justify-center px-3 pt-2`, width: (Dimensions.get('screen').width * 0.95) }}>
                                    <Text style={tw`text-red-600`} weight='semibold'>Save</Text>
                                </TouchableOpacity>
                                <View style={tw`flex-row items-center justify-around`}>
                                    <StyledWheelPicker initialValue={Math.floor(form.state.quantity || 1).toFixed(0)} onSelect={v => {
                                        let str = Number(form.state.quantity || 1)?.toFixed(2)
                                        let fractionStr = str.split('.')[1]
                                        form.setForm('quantity', Number(`${v}.${fractionStr}`))
                                    }} width={Dimensions.get('screen').width * 0.40} items={Array(50).fill(0).map((x, i) => ({ label: (i + 1).toString(), value: `${i + 1}` }))} />
                                    <StyledWheelPicker initialValue={form.state.quantity ? Number(`.${form.state.quantity.toFixed(2).split('.')[1]}`) : 0} onSelect={v => {
                                        let str = Math.floor(form.state.quantity || 1)
                                        console.log(v)
                                        console.log(str)
                                        console.log(Number(str) + Number(v))
                                        form.setForm('quantity', Number(str) + Number(v))
                                    }} width={Dimensions.get('screen').width * 0.30} items={['-', '1/2', '1/3', '1/4', '1/5'].map(x => ({ label: x, value: fractionStrToDecimal(x) || 0 }))} />
                                </View>
                            </Overlay>
                            <TouchableOpacity onPress={() => screenState.setForm('showServingSizes', !screenState.state.showServingSizes)} style={tw`h-10 px-4 items-center justify-center bg-gray-${dm ? '800' : '200'} rounded-lg`}>
                                <Text>{titleCase(form.state?.servingSize || 'gram')}</Text>
                            </TouchableOpacity>
                            <Overlay dialogueHeight={30} excludeBanner visible={screenState.state.showServingSizes} onDismiss={() => screenState.setForm('showServingSizes', false)}>
                                <SpinSelect initialValue={form.state.servingSize} onSave={() => screenState.setForm('showServingSizes', false)} items={form.state.servingSizes} onSelect={(k) => {
                                    form.setForm('servingSize', k)
                                }} labelExtractor={(l) => (titleCase(l) + ` (${(form.state.servingSizes?.[l] || 1).toFixed()}g)`)} />
                            </Overlay>
                        </View>
                    </View>
                    <View style={tw`items-center justify-center`}>
                        <NutritionInfo
                            onNutrientsChanged={(x) => console.log(x)}
                            onAddNew={(x) => {
                                // setNutritionInfo(x)
                            }}
                            editable={screenState.state.editMode}
                            data={nutritionInfo}
                        />
                    </View>
                    <View style={tw`py-6 w-12/12`}>
                        <Text style={tw`text-lg my-2`} weight='bold'>Ingredients</Text>
                        <TextInput
                            multiline
                            editable={screenState.state.editMode}
                            numberOfLines={10}
                            value={form.state.ingredients || ''}
                            onChangeText={x => form.setForm('ingredients', x)}
                            style={tw`border rounded border-${dm ? 'white' : 'black'} text-${dm ? 'white' : 'black'} px-2 py-3`} />
                    </View>
                    <View style={tw`flex-row items-center justify-between`}>
                        <Text weight='bold' style={tw`text-lg`}>Health Labels</Text>
                        <SelectScreen
                            title='Health Labels'
                            multi
                            onSelect={v => form.setForm('healthLabels', v)}
                            options={Object.keys(healthLabelMapping)}
                            getLabel={k => {
                                //@ts-ignore
                                let obj = healthLabelMapping[k]
                                if (!obj) return 'error'
                                return obj?.name + obj?.emoji
                            }}
                            getSelected={(k) => {
                                return form.state?.healthLabels?.find(v => v === k) ? true : false
                            }}
                        />
                    </View>
                    <Spacer />
                    {(!form.state.healthLabels || form.state?.healthLabels?.length === 0) && <View>
                        <Text style={tw`text-center text-gray-500`}>No health labels</Text>
                    </View>}
                    <View style={tw`w-12/12 flex-row items-center justify-center flex-wrap`}>
                        {form.state.healthLabels?.map((l, i) => {
                            //@ts-ignore
                            let label = healthLabelMapping[l]
                            if (!label) return <View key={`health label ${l} at index ${i}`} />
                            return <View key={`health label ${l} at index ${i}`} style={tw`mx-2 my-1`}>
                                <Text style={tw`text-xs`}>{label.name} {label.emoji}</Text>
                            </View>
                        })}
                    </View>
                </View>
                <View style={tw`h-60`} />
            </ScrollViewWithDrag>
            <SaveButton
                // hidden={props.src==='backend' && props.mealId ? true : false}
                uploading={screenState.state.uploading}
                favoriteType='food'
                favoriteId={form.state.id}
                onSave={onAddPress}
                title={saveButtonTitle} />
        </View>
    )
}


interface FoodItemData {
    name: string;
    hidden?: boolean
    value: string;
    unit: string | null;
    indent?: boolean;
    box?: boolean;
    boxColor?: string
}


interface NutritionInfoProps {
    data: FoodItemData[]
    onNutrientsChanged: (v: FoodItemData) => void
    editable?: boolean;
    hidden?: boolean;
    onAddNew?: (v: FoodItemData[]) => void;
    onDelete?: (v: FoodItemData) => void
    collapsable?: boolean;
}

export const NutritionInfo = (props: NutritionInfoProps) => {
    const { editable, onNutrientsChanged, onAddNew, onDelete } = props
    const [form, setForm] = React.useState<FoodItemData[]>([])
    // get where label not in props.data's labels
    const missingLabels: { name: string, unit: string }[] = props.data.filter(x => x.hidden).map(x => ({ name: x.name, unit: x.unit || 'g' }))
    const updateForm = (field: FoodItemData, value: string) => {
        const currentIndex = props.data.findIndex(fx => fx.name === field.name && fx.hidden !== true)
        if (currentIndex === -1) return;
        const data = [...props.data]
        data[currentIndex].value = value
        setForm(data)
        onNutrientsChanged && onNutrientsChanged(data[currentIndex])
    }
    React.useEffect(() => {
        setForm(props.data)
    }, [props.data])
    const onPressNewNutrition = (label: { label: string, value: string }) => {
        if (label.value) {
            const data = [...props.data]
            const dataRemoveHidden = data.findIndex(x => x.name === label.value)
            if (dataRemoveHidden === -1) return;
            data[dataRemoveHidden].hidden = false
            onAddNew && onAddNew([...data])
        }
    }
    const [newLabel, setNewLabel] = React.useState<{ label: string } | null>(missingLabels.length > 0 ? { label: missingLabels[0].name } : null)
    const [show, setShow] = React.useState<boolean>(true)
    const dm = useColorScheme() === 'dark'
    return <View style={tw`w-12/12 rounded-xl border border-${dm ? 'white' : 'black'} p-3`}>
        <TouchableOpacity disabled={!props.collapsable} style={tw`flex-row justify-between items-center`} onPress={() => setShow(!show)}>
            <Text style={tw`text-lg`} weight='semibold'>Nutrition Facts</Text>
            {props.collapsable && <ExpoIcon name={`${show ? 'chevron-up' : 'chevron-down'}`} iconName='feather' size={25} color={`${dm ? 'white' : 'black'}`} />}
        </TouchableOpacity>
        {show && <Animated.View>
            {form.filter(x => !x.hidden).map((f, i) => {
                return <NutritionInfoField
                    key={`nutrientItem ${f.name} at ${i}`}
                    name={f.name}
                    value={f.value}
                    unit={f.unit || ""}
                    box={f.box || false}
                    boxColor={f.boxColor || ""}
                    editable={editable || false}
                    indent={f.indent || false}
                    onEdit={(v) => updateForm(f, v)}
                    onDelete={onDelete}
                />
            })}

        </Animated.View>}
    </View>
}

interface NutritionInfoFieldProps {
    name: string;
    value: string;
    unit: string;
    editable: boolean;
    indent: boolean;
    keyboardType?: KeyboardTypeOptions;
    box: boolean,
    boxColor: string
    onEdit?: (value: string) => void
    onDelete?: (value: any) => void
}
const NutritionInfoField = (props: NutritionInfoFieldProps) => {
    const { name, value, unit, editable, onEdit, indent, keyboardType, box, boxColor } = props;
    const dm = useColorScheme() === 'dark'
    return <View style={tw`flex-row justify-between items-center py-1`}>
        <View style={tw`flex-row items-center w-6/12`}>
            {box && <View style={tw`h-4 w-4 mr-2 rounded bg-${boxColor}-400`} />}
            <Text weight={`${indent ? 'regular' : 'semibold'}`}>{indent && "      "}{name}</Text>
        </View>
        {editable && <View style={tw`flex-row items-center`}>
            <TextInput
                keyboardType={keyboardType || 'decimal-pad'}
                style={tw`rounded py-2 mx-2 border-b ${dm ? "border-white" : 'border-black'} px-4 ${dm ? "text-white" : 'text-black'}`}
                value={value} onChangeText={(v) => {
                    onEdit && onEdit(v)
                }} />
            <Text>{unit}</Text>
        </View>
        }
        {!editable && <Text style={tw`py-1`}>{value}{unit}</Text>}
    </View>
}


export const healthLabelMapping = {
    'VEGETARIAN': {
        emoji: '🌽',
        name: 'Vegetarian'
    },
    'PESCATARIAN': {
        emoji: '🐠',
        name: 'Pescatarian'
    },
    'PEANUT_FREE': {
        emoji: '🥜',
        name: 'Peanut Free'
    },
    'TREE_NUT_FREE': {
        emoji: '🌳',
        name: 'Tree Nut Free'
    },
    'SOY_FREE': {
        emoji: '🌱',
        name: 'Soy Free'
    },
    'FISH_FREE': {
        emoji: '🐟',
        name: 'Fish Free'
    },
    'SHELLFISH_FREE': {
        emoji: '🦐',
        name: 'Shellfish Free'
    },
    'PORK_FREE': {
        emoji: '🐷',
        name: 'Pork Free'
    },
    'RED_MEAT_FREE': {
        emoji: '🐮',
        name: 'Red Meat Free'
    },
    'ALCOHOL_FREE': {
        emoji: '🍾',
        name: 'Alcohol Free'
    },
    'KOSHER': {
        emoji: '🆗',
        name: 'Kosher'
    },
    'DAIRY_FREE': {
        emoji: '🥛',
        name: 'Dairy Free'
    },
    'GLUTEN_FREE': {
        emoji: '🆗',
        name: 'Gluten Free'
    },
    'KETO_FRIENDLY': {
        emoji: '🥓',
        name: 'Keto'
    },
    'LOW_SUGAR': {
        emoji: '🎂',
        name: 'Low Sugar'
    },
    'NO_OIL_ADDED': {
        emoji: '🧈',
        name: 'No Oil Added'
    },
    'PALEO': {
        emoji: '🏕️',
        name: 'Paleo'
    },
    'VEGAN': {
        emoji: '🍎',
        name: 'Vegan'
    }
}


const EdamamFoodToFoodItemData = (data: EdamamNutrientsResponse): FoodItemData[] => {
    const totalNutrients = data.totalNutrients
    const defaultMeasures = {
        'ENERC_KCAL': {
            box: true,
            boxColor: 'red',
            name: "Calories",
            unit: 'kcal'
        },
        'FAT': {
            box: true,
            boxColor: 'blue',
            name: "Fat"
        },
        'FASAT': {
            indent: true,
            name: "Sat Fat"
        },
        'FATRN': {
            indent: true,
            name: "Trans Fat"
        },
        'CHOLE': {
            name: 'Cholesterol'
        },
        'NA': {
            name: 'Sodium'
        },
        'CHOCDF': {
            box: true,
            boxColor: 'green',
            name: 'Carbs'
        },
        'FIBTG': {
            indent: true,
            name: 'Fiber'
        },
        'SUGAR': {
            indent: true,
            name: 'Sugar'
        },
        'PROCNT': {
            box: true,
            boxColor: 'orange',
            name: 'Protein'
        },

    }
    let defaultItems: FoodItemData[] = [
    ]
    Object.keys(defaultMeasures).forEach((k) => {
        //@ts-ignore
        if (totalNutrients[k]) {
            //@ts-ignore
            defaultItems.push({ name: defaultMeasures[k].name, unit: defaultMeasures[k].unit || 'g', value: totalNutrients[k].quantity.toFixed(2).toString(), box: defaultMeasures[k].box, indent: defaultMeasures[k].indent, boxColor: defaultMeasures[k].boxColor })
        } else {
            //@ts-ignore
            defaultItems.push({ name: defaultMeasures[k].name, unit: defaultMeasures[k].unit || 'g', value: '0', box: defaultMeasures[k].box, indent: defaultMeasures[k].indent, boxColor: defaultMeasures[k].boxColor })
        }
    })
    const defaultKeys = Object.keys(defaultMeasures)
    Object.keys(totalNutrients).forEach((k) => {
        if (!defaultKeys.includes(k)) {
            //@ts-ignore
            defaultItems.push({ name: totalNutrients[k].label, value: Math.round(totalNutrients[k].quantity).toString(), unit: totalNutrients[k].unit, hidden: true })
        }
    })
    return defaultItems
}


export const NewFoodItemData = (calories: null | number = null, protein: null | number = null, fat: null | number = null, carbs: null | number = null, otherNutrition: any = null): FoodItemData[] => {
    const defaultMeasures = {
        'ENERC_KCAL': {
            box: true,
            boxColor: 'red',
            name: "Calories",
            unit: 'kcal',
            value: calories?.toString()
        },
        'FAT': {
            box: true,
            boxColor: 'blue',
            name: "Fat",
            value: fat?.toString()
        },
        'FASAT': {
            indent: true,
            name: "Sat Fat"
        },
        'FATRN': {
            indent: true,
            name: "Trans Fat"
        },
        'CHOLE': {
            name: 'Cholesterol'
        },
        'NA': {
            name: 'Sodium'
        },
        'CHOCDF': {
            box: true,
            boxColor: 'green',
            name: 'Carbs',
            value: carbs?.toString()
        },
        'FIBTG': {
            indent: true,
            name: 'Fiber'
        },
        'SUGAR': {
            indent: true,
            name: 'Sugar'
        },
        'PROCNT': {
            box: true,
            boxColor: 'orange',
            name: 'Protein',
            value: protein?.toString()
        },

    }
    let defaultItems: FoodItemData[] = [
    ]
    Object.keys(defaultMeasures).forEach((k) => {
        //@ts-ignore
        defaultItems.push({ name: defaultMeasures[k].name, unit: defaultMeasures[k].unit || 'g', value: defaultMeasures[k].value || "0", box: defaultMeasures[k].box, indent: defaultMeasures[k].indent, boxColor: defaultMeasures[k].boxColor })
    })
    Object.keys(nutritionAndUnits).forEach(k => {
        //@ts-ignore
        defaultItems.push({ name: nutritionAndUnits[k].name, unit: nutritionAndUnits[k].unit, value: '0.00', hidden: true })
    })

    if (otherNutrition) {
        Object.keys(otherNutrition).forEach((key) => {
            const i = defaultItems.findIndex(x => x.name === key)
            if (i !== -1) {
                defaultItems[i].value = otherNutrition[key]['value'].toString()
                defaultItems[i].hidden = otherNutrition[key]['hidden']
            }
        })
    }
    return defaultItems
}

const nutritionAndUnits = [
    { name: 'Fatty acids, total monounsaturated', unit: 'g' },
    { name: 'Fatty acids, total polyunsaturated', unit: 'g' },
    { name: 'Carbohydrate, by difference', unit: 'g' },
    { name: 'Carbohydrates (net)', unit: 'g' },
    { name: 'Magnesium, Mg', unit: 'mg' },
    { name: 'Potassium, K', unit: 'mg' },
    { name: 'Iron, Fe', unit: 'mg' },
    { name: 'Zinc, Zn', unit: 'mg' },
    { name: 'Phosphorus, P', unit: 'mg' },
    { name: 'Vitamin A, RAE', unit: 'µg' },
    { name: 'Vitamin C, total ascorbic acid', unit: 'mg' },
    { name: 'Thiamin', unit: 'mg' },
    { name: 'Riboflavin', unit: 'mg' },
    { name: 'Niacin', unit: 'mg' },
    { name: 'Vitamin B-6', unit: 'mg' },
    { name: 'Folate, DFE', unit: 'µg' },
    { name: 'Folate, food', unit: 'µg' },
    { name: 'Folic acid', unit: 'µg' },
    { name: 'Vitamin B-12', unit: 'µg' },
    { name: "Vitamin D (D2 + D3)", unit: 'µg' },
    { name: 'Vitamin E (alpha-tocopherol)', unit: 'mg' },
    { name: 'Vitamin K (phylloquinone)', unit: 'µg' },
    { name: 'Water', unit: 'g' },
]



