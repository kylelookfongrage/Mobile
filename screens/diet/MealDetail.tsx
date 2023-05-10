import { ScrollView, TextInput, TouchableOpacity, View, Image, Alert, Dimensions } from 'react-native'
import React, { useRef } from 'react'
import { Text } from '../../components/Themed'
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc'
import useColorScheme from '../../hooks/useColorScheme';
import { ExpoIcon } from '../../components/ExpoIcon';
import { useNavigation } from '@react-navigation/native';
import { healthLabelMapping, Picker } from './FoodDetail';
import { ActivityIndicator, Switch } from 'react-native-paper';
import { defaultImage, getMatchingNavigationScreen, isStorageUri, uploadMedias } from '../../data';
import { Category, MediaType } from '../../types/Media';
import { ImagePickerView } from '../../components/ImagePickerView';
import { ErrorMessage } from '../../components/ErrorMessage';
import { Auth, DataStore, Storage } from 'aws-amplify';
import { Meal, Ingredient, User, MealProgress, PantryItem, Favorite } from '../../aws/models';
import { useCommonAWSIds } from '../../hooks/useCommonContext';
import { BackButton } from '../../components/BackButton';
import { useDateContext } from '../home/Calendar';

export const foodCategories: Category[] = [{ name: 'N/A', emoji: '🚫' }, ...Object.values(healthLabelMapping)].map(h => {
    return { name: h.name, emoji: h.emoji }
}).filter(x => !x.name.includes('Free')).filter(x => !x.name.includes('No'))

export interface MealDetailProps {
    id: string;
    editable: boolean;
    grocery?: boolean;
    idFromProgress?: string;
}

export default function MealDetailScreen(props: MealDetailProps) {
    const { id, editable, idFromProgress } = props;
    const {AWSDate} = useDateContext();
    const { userId, sub, progressId, username, subscribed } = useCommonAWSIds()
    const [imageSource, setImageSource] = React.useState<MediaType[]>([])
    const [author, setAuthor] = React.useState<string>(props.editable === true ? '' : '')
    const [name, setName] = React.useState<string>('')
    const [description, setDescription] = React.useState<string>('')
    const [ingredients, setIngredients] = React.useState<Ingredient[]>([])
    const [steps, setSteps] = React.useState<string[]>([])
    const [originalPremium, setOriginalPremium] = React.useState<boolean>(true)
    const [premium, setPremium] = React.useState<boolean>(true)
    const [canViewDetails, setCanViewDetails] = React.useState<boolean>(props.editable === true)
    const [mealId, setMealId] = React.useState(id)
    const dm = useColorScheme() === 'dark'
    const color = dm ? 'white' : 'black'
    const [editMode, setEditMode] = React.useState<boolean>(false);
    const [editSteps, setEditSteps] = React.useState<boolean>(false)
    const [addNewStep, setAddNewStep] = React.useState<boolean>(false);
    const [newStep, setNewStep] = React.useState<string>('')
    const [mealCategory, setMealCategory] = React.useState<Category>(foodCategories[0])
    const [uploading, setUploading] = React.useState<boolean>(false)
    const [errors, setErrors] = React.useState<string[]>([])
    const [mealUserId, setMealUserId] = React.useState<string>('')
    const scrollRef = useRef<ScrollView | null>()
    const [isAIGenerated, setIsAIGenerated] = React.useState<boolean>(false)
    const [editMealMode, setEditMealMode] = React.useState<boolean>(props.editable!!)
    const borderStyle = editMealMode ? `border-b border-gray-500` : ''

    React.useEffect(() => {
        if (subscribed) {
            setCanViewDetails(true)
        }
    }, [subscribed])

    React.useEffect(() => {
        if (!mealId) {
            setAuthor(username)
            setMealUserId(userId)
            DataStore.save(new Meal({ description: ' ', userID: userId, name: '', sub: sub })).then(x => {
                setMealId(x.id)
            })
        }
    }, [id])

    const [favorite, setFavorite] = React.useState<boolean>(false);
    React.useEffect(() => {
        const subscription = DataStore.observeQuery(Favorite, f => f.and(fav => [
            fav.potentialID.eq(mealId), fav.type.eq('MEAL'), fav.userID.eq(userId)
        ])).subscribe(ss => {
            const {items} = ss;
            if (items.length > 0) {
                setFavorite(true)
            }else {
                setFavorite(false)
            }
        })
        return () => subscription.unsubscribe()
    }, [])
    React.useEffect(() => {
        if (!mealId) return;
        let subscription: { unsubscribe: () => any; } | null = null;
        DataStore.query(Meal, id).then((m) => {
            if (m) {
                setIsAIGenerated(m.isAiGenerated || false)
                if (m.media && m.media.length > 0) {
                    if (m.isAiGenerated) {
                        setImageSource([{ type: 'image', uri: defaultImage }])
                    } else {
                        //@ts-ignore
                        setImageSource(m.media)
                    }

                }
                setMealUserId(m.userID)
                setName(m.name)
                const potentialMealCateogry = foodCategories.filter(x => x.name === m.category)
                setMealCategory(potentialMealCateogry.length > 0 ? potentialMealCateogry[0] : foodCategories[0])

                setPremium(m.premium || false)
                setOriginalPremium(m.premium || false)
                setSteps(m.steps || new Array())
                if (!m.premium || m.userID === userId) {
                    setCanViewDetails(true)
                }
                setDescription(m.description || '')
                if (m.isAiGenerated) {
                    setAuthor('Open AI')
                }
                else if (m.userID) DataStore.query(User, m.userID).then(u => setAuthor(u?.username || ''))
                subscription = DataStore.observeQuery(Ingredient, ingr => ingr.mealID.eq(mealId)).subscribe(ss => {
                    const { items } = ss
                    Promise.all(items.map(async ingr => {
                        if (isStorageUri(ingr.img || '')) {
                            return { ...ingr, img: ingr.img ? await Storage.get(ingr.img) : '' }
                        } else return ingr
                    })).then(x => setIngredients(x))
                })
            }
        })


        return () => { subscription && subscription.unsubscribe() }
    }, [mealId])
    const getMacrosFromIngredients = (ingrs: Ingredient[]): { protein: number, carbs: number; calories: number; fat: number } => {
        let protein: number = 0;
        let calories: number = 0;
        var carbs: number = 0;
        var fat: number = 0;
        ingrs.forEach((i) => {
            calories += Number(i.kcal)
            protein += Number(i.protein)
            carbs += Number(i.carbs)
            fat += Number(i.fat)
        })
        return { protein, carbs, calories, fat }

    }
    const { protein, carbs, calories, fat } = getMacrosFromIngredients(ingredients)

    const navigator = useNavigation()

    React.useEffect(() => {
        if (originalPremium === premium) return;
        if (editMode === true) return;
        setPremium(originalPremium)
    }, [editMode])

    const saveMeal = async () => {
        if (editMealMode) {
            let mediaToUpload = imageSource
            if (name === '') {
                setErrors(['Your meal must have a name'])
                return -1
            } else if (description === '') {
                setErrors(['Your meal must have a description'])
                return -1
            } else if (ingredients.length === 0) {
                setErrors(['Your meal must at least one ingredient'])
                return -1
            } else if (imageSource.filter(x => x.type === 'image').length === 0) {
                setImageSource([{ type: 'image', uri: defaultImage }])
                mediaToUpload = [{ type: 'image', uri: defaultImage }]
            }
            setUploading(true)

            try {
                const imgs = await uploadMedias(mediaToUpload)
                const imgJson = imgs
                setOriginalPremium(premium)
                const original = await DataStore.query(Meal, mealId)
                if (original) {
                    await DataStore.save(Meal.copyOf(original, x => {
                        x.media = imgJson;
                        x.name = name;
                        x.description = description;
                        x.premium = premium;
                        x.steps = steps;
                        x.public=true;
                        x.category = mealCategory.name;
                    }))
                } else {
                    throw Error("There was a problem saving your meal")
                }

            } catch (error) {
                setErrors([String(error)])
                setUploading(false)
                return -1
            }



        } else if (canViewDetails) {
            if (props.grocery) {
                for (var ingr of ingredients) {
                    await DataStore.save(new PantryItem({ userID: userId, purchased: false, inCart: false, ingredientID: ingr.id }))
                }
            } else {
                let mealProgressId = idFromProgress
                if (!idFromProgress) {
                    const newMealProgress = await DataStore.save(new MealProgress({ progressID: progressId, progressDate: AWSDate, name: name, mealID: mealId, totalWeight: 100, consumedWeight: 100, userID: userId }))
                    mealProgressId=newMealProgress.id
                }
                const screen = getMatchingNavigationScreen('ProgressMeal', navigator)
                //@ts-ignore
                navigator.navigate(screen, {id: mealProgressId})
                return -1;
            }
        } else {
            // send to purchase screen
            navigator.navigate('Subscription')
            return -1
        }
    }

    React.useEffect(() => {
        if (isAIGenerated) {
            setPremium(false)
        }
    }, [isAIGenerated])
    return (
        <View style={{ flex: 1 }}>
            <BackButton Right={() => {
                if (!editMealMode || !id) {
                    return null;
                }
                return <TouchableOpacity onPress={() => {
                    Alert.alert("Are you sure you want to delete this meal?", "You cannot undo this action later, and all progress associated with this meal will be deleted.", [
                        {
                            text: 'Yes', onPress: async () => {
                                if (!mealId) return
                                await DataStore.delete(Meal, mealId)
                                //@ts-ignore
                                navigator.pop()
                            }
                        }, { text: 'Cancel' }
                    ])
                }}>
                    <Text style={tw`text-red-500`} weight='semibold'>Delete Meal</Text>
                </TouchableOpacity>
            }} />
            {/* @ts-ignore */}
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} ref={scrollRef}>
                <ImagePickerView multiple editable={editMealMode === true} srcs={canViewDetails ? imageSource : [{type: 'image', uri: defaultImage}]} onChange={setImageSource} type='all' />
                <SafeAreaView edges={['left', 'right']} style={tw`px-4 pt-4`}>
                    {errors.length > 0 && <ErrorMessage errors={errors} onDismissTap={() => setErrors([])} />}
                    <View style={tw`flex-row w-12/12 items-center justify-between`}>
                        <View style={tw`max-w-8/12 w-8/12`}>
                            <TextInput
                                style={tw`text-2xl max-w-11/12 w-11/12 font-bold text-${dm ? 'white' : "black"} ${borderStyle}`}
                                value={name}
                                multiline
                                numberOfLines={2}
                                editable={editMealMode === true}
                                placeholder={'Your meal'}
                                placeholderTextColor={'gray'}
                                onChangeText={setName}
                            />
                            <TouchableOpacity
                                disabled={isAIGenerated}
                                onPress={() => {
                                    const screen = getMatchingNavigationScreen('User', navigator)
                                    //@ts-ignore
                                    navigator.navigate(screen, { id: mealUserId })
                                }} style={tw`flex-row`}>
                                <Text>by </Text>
                                <Text style={tw`text-red-600`}>{author}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={tw`flex-row items-center`}>
                        {props.editable && <TouchableOpacity style={tw`p-5 mr-4`} onPress={() => setEditMealMode(!editMealMode)}>
                            <Text>{editMealMode ? 'Cancel' : "Edit"}</Text>
                        </TouchableOpacity>}
                       {(!editMealMode && !idFromProgress) &&  <TouchableOpacity onPress={async () => {
                            const isFavorited = await DataStore.query(Favorite, f => f.and(fav => [
                                fav.potentialID.eq(mealId), fav.userID.eq(userId), fav.type.eq('MEAL')
                            ]))
                            if (isFavorited.length > 0) {
                                await DataStore.delete(Favorite, isFavorited[0].id)
                            } else {
                                await DataStore.save(new Favorite({userID: userId, potentialID: mealId, type: 'MEAL'}))
                            }
                       }}>
                            <ExpoIcon name={favorite ? 'heart' : 'heart-outline'} iconName='ion' color={'red'} size={25} />
                        </TouchableOpacity>}
                        </View>
                    </View>
                    {(editMealMode) && <View style={tw`py-4 flex-row items-center`}>
                        <Text style={tw`text-xl mr-4`} weight='semibold'>Premium</Text>
                        <Switch value={premium} onValueChange={setPremium} disabled={(editMealMode !== true || isAIGenerated)} />
                    </View>}
                    <View style={tw`py-5`}>
                        <Text style={tw`text-xl mb-2`} weight='semibold'>Category</Text>
                        <Picker width='12/12' data={foodCategories.map((w, i) => ({ label: `${w.name} ${w.emoji}`, value: i }))} onChange={function (d): void {
                            setMealCategory(foodCategories[d.value])
                        }} defaultIndex={foodCategories.findIndex(x => x.name === mealCategory.name) || 0} editable={editMealMode} />
                    </View>
                    <View style={tw`py-5`}>
                        <Text style={tw`text-xl`} weight='semibold'>Description</Text>
                        <TextInput
                            value={description}
                            multiline
                            numberOfLines={4}
                            onChangeText={setDescription}
                            editable={editMealMode === true}
                            placeholder='The description of your meal'
                            placeholderTextColor={'gray'}
                            style={tw`max-w-10/12 text-${dm ? 'white' : 'black'}`}
                        />
                    </View>
                    {/* CALORIE BREAKDOWN */}
                    <View>
                        <Text style={tw`text-xl`} weight='semibold'>Total Macros</Text>
                        <View style={tw`flex-row flex-wrap max-w-12/12 px-4 py-3 rounded my-3 w-12/12 bg-gray-${dm ? '700' : '300'}`}>
                            <View style={tw`flex-row w-6/12 items-center`}>
                                <Text style={tw`text-lg`} weight='semibold'>Calories: </Text>
                                <Text>{calories.toFixed()}kcal</Text>
                            </View>
                            <View style={tw`flex-row w-6/12 items-center`}>
                                <Text style={tw`text-lg`} weight='semibold'>Protein: </Text>
                                <Text>{protein.toFixed()}g</Text>
                            </View>
                            <View style={tw`flex-row w-6/12 items-center`}>
                                <Text style={tw`text-lg`} weight='semibold'>Carbs: </Text>
                                <Text>{carbs.toFixed()}g</Text>
                            </View>
                            <View style={tw`flex-row w-6/12 items-center`}>
                                <Text style={tw`text-lg`} weight='semibold'>Fat: </Text>
                                <Text>{fat.toFixed()}g</Text>
                            </View>
                        </View>
                    </View>
                    {/* FOOD */}
                    {canViewDetails && <View>
                        <View>
                            <View style={tw`flex-row justify-between items-center`}>
                                <Text style={tw`text-xl`} weight='semibold'>Ingredients</Text>
                                {editMealMode && <View style={tw`flex-row items-center w-5/12 justify-end`}>
                                    {ingredients.length > 0 && <TouchableOpacity style={tw`p-3`} onPress={() => setEditMode(!editMode)}>
                                        <Text>{editMode ? 'Cancel' : 'Edit'}</Text>
                                    </TouchableOpacity>}
                                    <TouchableOpacity style={tw`p-3`} onPress={() => {
                                        const screen = getMatchingNavigationScreen('ListFood', navigator)
                                        //@ts-ignore
                                        navigator.navigate(screen, {
                                            mealId: mealId
                                        })
                                    }}>
                                        <Text>Add New</Text>
                                    </TouchableOpacity>
                                </View>}
                            </View>
                            {ingredients.map((ingr, i) => {
                                return <TouchableOpacity
                                    onPress={() => {
                                        const screen = getMatchingNavigationScreen('FoodDetail', navigator)
                                        console.log('navigating to food')
                                        console.log(editMealMode)
                                        //@ts-ignore
                                        navigator.navigate(screen, {
                                            mealId: mealId, src: 'backend', id: ingr.id, editable: editMealMode===true
                                        })
                                    }}
                                    key={`food item ${ingr.name} at index ${i}`}
                                    style={tw`flex-row items-center px-2 my-3`}>
                                    {!editMode && ingr.img && <Image source={{ uri: ingr.img }} style={tw`h-20 w-20 rounded-full`} resizeMode='cover' />}
                                    {!editMode && !ingr.img && <View style={tw`h-20 w-20 rounded-full bg-gray-300 items-center justify-center`}>
                                        {/* @ts-ignore */}
                                        {ingr.healthLabels && ingr.healthLabels.length > 0 && <Text style={tw`text-xl`}>{healthLabelMapping[ingr.healthLabels[0]].emoji}</Text>}
                                        {!ingr.healthLabels && <Text style={tw`text-xl`}>🍔</Text>}
                                    </View>}
                                    {editMode && <TouchableOpacity
                                        onPress={() => { }}
                                        style={[tw`items-center justify-center h-20 w-20`]}>
                                        <ExpoIcon name='trash' iconName='feather' color={dm ? 'white' : 'black'} size={25} />
                                    </TouchableOpacity>}
                                    <View style={tw`px-2`}>
                                        <Text style={tw`text-lg max-w-10/12`} weight='bold'>{ingr.name}</Text>
                                        <Text style={tw``}>{ingr.quantity} {ingr.units}</Text>
                                        <Text>{Number(ingr.kcal).toFixed()} kcal | P: {Number(ingr.protein).toFixed()}g | C: {Number(ingr.carbs).toFixed()}g | F: {Number(ingr.fat).toFixed()}g</Text>
                                    </View>
                                </TouchableOpacity>
                            })}
                        </View>
                        {/* STEPS */}
                        <View style={tw`flex-row justify-between items-center pt-7`}>
                            <Text style={tw`text-xl`} weight='semibold'>Steps</Text>
                            {editMealMode && <View style={tw`flex-row items-center w-5/12 justify-end`}>
                                {steps.length > 0 && <TouchableOpacity onPress={() => setEditSteps(!editSteps)} style={tw`p-3`}>
                                    <Text>{editSteps ? 'Cancel' : 'Edit'}</Text>
                                </TouchableOpacity>}
                                <TouchableOpacity
                                    style={tw`p-3`}
                                    onPress={() => {
                                        setAddNewStep(!addNewStep)
                                    }}>
                                    <Text>{addNewStep ? 'Cancel' : 'Add New'}</Text>
                                </TouchableOpacity>
                            </View>}
                        </View>
                        {addNewStep && <View style={tw`w-12/12`}>
                            <Text style={tw``} weight='semibold'>New Step</Text>
                            <View style={tw`flex-row items-center w-12/12 justify-around`}>
                                <TextInput
                                    value={newStep}
                                    multiline
                                    numberOfLines={4}
                                    onChangeText={setNewStep}
                                    editable={editMealMode}
                                    placeholder='Your new step'
                                    placeholderTextColor={dm ? 'white' : 'gray'}
                                    style={tw`w-7/12 text-${dm ? 'white' : 'black'} ${borderStyle}`}
                                />
                                <TouchableOpacity onPress={() => {
                                    setSteps([...steps, newStep])
                                    setNewStep('')
                                    setAddNewStep(false)
                                }} style={tw`p-2 bg-${dm ? 'red-600' : "red-500"} items-center w-3/12 justify-center`}>
                                    <Text style={tw`text-white`}>Finish</Text>
                                </TouchableOpacity>
                            </View>
                        </View>}
                        {steps.length > 0 && <View style={tw`py-2 mt-2 rounded px-4 w-12/12 border border-${color}`}>
                            {steps.map((s, i) => {
                                return <View style={tw`my-3 flex-row items-center w-10/12`} key={`step: ${i}`}>
                                    <TouchableOpacity disabled={editSteps !== true} style={tw`bg-red-${dm ? '600' : '400'} h-8 w-8 items-center justify-center rounded-full mr-4`}>
                                        {!editSteps && <Text style={tw`text-lg text-white`} weight='semibold'>{i + 1}</Text>}
                                        {editSteps && <ExpoIcon name='trash' iconName='feather' color={dm ? 'white' : 'black'} size={20} />}
                                    </TouchableOpacity>
                                    <Text>{s}</Text>
                                </View>
                            })}
                        </View>}
                    </View>}
                </SafeAreaView>
                <View style={tw`pb-60`} />
            </ScrollView>
            <View style={[
                {
                    position: 'absolute',
                    bottom: 0,
                    flex: 1
                },
                tw`w-12/12`
            ]}>
                {/* Add Food Button */}
                <View style={tw`py-5 w-12/12 items-center px-7 flex-row justify-center`}>
                    <TouchableOpacity onPress={() => {
                        saveMeal().then(x => {
                            if (x !== -1) {
                                //@ts-ignore
                                navigator.pop()
                            }
                        })

                    }} style={tw`bg-${dm ? 'red-600' : "red-500"} mr-2 px-5 h-12 justify-center rounded-full`}>
                        {!uploading && <Text numberOfLines={1} style={tw`text-center text-white`} weight='semibold'>{editMealMode ? 'Save Meal' : canViewDetails ? (props.grocery ? 'Add to List' : (idFromProgress ? 'Update Meal' : 'Add to Progress')) : 'Purchase Meal'}</Text>}
                        {uploading && <ActivityIndicator />}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}
