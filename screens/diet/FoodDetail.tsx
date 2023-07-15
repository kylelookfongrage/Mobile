import { TouchableOpacity, ScrollView, KeyboardTypeOptions } from 'react-native';
import { Text, View } from '../../components/Themed';
import React from 'react';
import tw from 'twrnc';
import { TextInput } from 'react-native';
import { ExpoIcon } from '../../components/ExpoIcon';
import useColorScheme from '../../hooks/useColorScheme';
import Animated, {
    BounceInDown,
    FadeOut
} from 'react-native-reanimated';
import { defaultImage, EdamamNutrientsResponse, FetchEdamamNutrients, GenerateMealResult, getMatchingNavigationScreen, isStorageUri, uploadImageAndGetID } from '../../data';
import { useNavigation } from '@react-navigation/native';
import { ActivityIndicator } from 'react-native-paper';
import { MediaType } from '../../types/Media';
import { ImagePickerView } from '../../components/ImagePickerView';
import { Favorite, FoodProgress, Ingredient, PantryItem, User } from '../../aws/models';
import { DataStore } from 'aws-amplify';
import { useCommonAWSIds } from '../../hooks/useCommonContext';
import { ErrorMessage } from '../../components/ErrorMessage';
import { BackButton } from '../../components/BackButton';
import AllergenAlert from '../../components/AllergenAlert';
import { ShowMoreButton } from '../home/ShowMore';
import { FavoriteType } from '../../aws/models';

// export const SummaryFoodConverter: FirestoreDataConverter<FoodProgressProps> = {
//     toFirestore(post: WithFieldValue<FoodProgressProps>): DocumentData {
//         return post;
//     },
//     fromFirestore(
//         snapshot: QueryDocumentSnapshot,
//         options: SnapshotOptions
//     ): FoodProgressProps {
//         const data: DocumentData = snapshot.data(options);
//         //@ts-ignore
//         return {
//             ...data,
//             id: snapshot.id,
//         };
//     },
// };

/*
    TODO: 
    1. Author name
    2. Favoriting
    3. Getting food from BACKEND
    4. Dynamic functionality for add button
    5. Implement camera and camera roll
*/

interface FoodDetailProps {
    id?: string;
    upc?: string;
    src: 'new' | 'api' | 'backend' | 'existing';
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
    const { progressId, aiResult, currentIngredietId, setCurrentIngredietId, setAiResult, userId, username } = useCommonAWSIds()
    const [editable, setEditable] = React.useState(props.editable === true)
    const [healthLabels, setHealthLabels] = React.useState<string[]>([])
    const [imageSource, setImageSource] = React.useState<MediaType[]>(props.img ? [{ uri: props.img, type: 'image' }] : [])
    const src: 'new' | 'api' | 'backend' | 'existing' = props.src
    const [id, setId] = React.useState<string>(props.id || '')
    // passed in as param
    const defaultMeasurements: { label: string, weight: number }[] = []
    if (!props.measures) {
        defaultMeasurements.push({ label: 'grams', weight: 1 })
    } else {
        props.measures?.forEach((m) => {
            defaultMeasurements.push({ label: m.label, weight: m.weight })
            if (m.qualified) {
                m.qualified.forEach((q) => {
                    (q.qualifiers || []).forEach((qual) => {
                        defaultMeasurements.push({ label: qual.label, weight: q.weight })
                    })
                })
            }

        })
    }
    const [measures, setMeasures] = React.useState<{ label: string, weight: number }[]>(defaultMeasurements)
    const [showMeasures, setShowMeasures] = React.useState<boolean>(false)
    const [name, setName] = React.useState<string>(props.name || '')
    const [ingredients, setIngredients] = React.useState<string | undefined>(props.foodContentsLabel)
    const [newMeasureLabel, setNewMeasureLabel] = React.useState('')
    const [newMeasureWeight, setNewMeasureWeight] = React.useState('')
    const [currentMeasure, setCurrentMeasure] = React.useState<{ label: string, weight: number }>(measures[0])
    const [nutritionInfo, setNutritionInfo] = React.useState<FoodItemData[]>(NewFoodItemData())
    const [quantity, setQuantity] = React.useState('1')
    const [totalWeight, setTotalWeight] = React.useState<number>(1)
    const [category, setCategory] = React.useState<string | undefined>(props.category)
    const [uploading, setUploading] = React.useState(false);
    const [edamamId, setEdamamId] = React.useState<string | null>(null);
    const [author, setAuthor] = React.useState<string>('Edamam Nutrition')
    const [authorId, setAuthorId] = React.useState<string | null>(null)
    const [userAllergens, setUserAllergens] = React.useState<string[]>([])
    React.useEffect(() => {
        //@ts-ignore
        if (src === 'api') {
            setEdamamId(id)
            FetchEdamamNutrients({
                ingredients: [
                    //@ts-ignore
                    { foodId: id, quantity: 1, measureURI: props.measures[0].uri }
                ]
            }).then((v) => {
                // set the health labels if there
                setHealthLabels(v.healthLabels || [])
                setTotalWeight(v.totalWeight)

                // get the nutrient values for calories, fat, sat fat, trans fat, cholesterol, sodium, carbs, fiber sugar, protein, then all of the other ones
                setNutritionInfo(EdamamFoodToFoodItemData(v))
            }).catch((e) => console.log(`Error: ${e}`))
        }
        if ((src === 'backend' || src === 'existing') && progressId && props.id && !props.mealId && !props.grocery) {
            DataStore.query(FoodProgress, props.id).then(f => {
                //@ts-ignore
                const foodMeasures: {label: string, weight: number}[] = f?.measures && f.measures.length > 0 ? JSON.parse(f?.measures).map(x => JSON.parse(x)) : [{ label: 'g', weight: 1 }]
                let currentMeasureForFood = foodMeasures[0]
                if (f?.units) {
                    const potentialFoodMatch = foodMeasures.filter(x => x.label === f.units)
                    if (potentialFoodMatch.length > 0) {
                        currentMeasureForFood = potentialFoodMatch[0]
                    }
                }
                setName(f?.name || '')
                setImageSource(f?.img ? [{ uri: f.img, type: 'image' }] : [])
                setCategory(f?.category || undefined)
                setNutritionInfo(NewFoodItemData(f?.kcal, f?.protein, f?.fat, f?.carbs, f?.otherNutrition))
                setTotalWeight(f?.totalWeight || 1)
                setHealthLabels(f?.healthLabels || [])
                //@ts-ignore
                setMeasures(foodMeasures)
                setIngredients(f?.foodContentsLabel || undefined)
                setQuantity(f?.quantity ? f.quantity.toString() : '1')
                setCurrentMeasure(currentMeasureForFood)
                setIngredients(f?.foodContentsLabel || '')
                setAuthorId(f?.userID || null)
                setEdamamId(f?.edamamId || null)
                if (!f?.edamamId && f?.userID) {
                    DataStore.query(User, f?.userID).then(x => {
                        setAuthor(x?.username || 'Edamam Nutrition')
                    })
                }
            })
        } else if ((props.grocery || props.mealId) && props.id && (props.src === 'backend' || props.src === 'existing')) {
            DataStore.query(Ingredient, props.id).then(f => {
                //@ts-ignore
                const foodMeasures: {label: string, weight: number}[] = f?.measures && f.measures.length > 0 ? JSON.parse(f?.measures).map(x => JSON.parse(x)) : [{ label: 'g', weight: 1 }]
                let currentMeasureForFood = foodMeasures[0]
                if (f?.units) {
                    const potentialFoodMatch = foodMeasures.filter(x => x.label === f.units)
                    if (potentialFoodMatch.length > 0) {
                        currentMeasureForFood = potentialFoodMatch[0]
                    }
                }
                setName(f?.name || '')
                setImageSource(f?.img ? [{ uri: f.img, type: 'image' }] : [])
                setCategory(f?.category || undefined)
                // TODO: add calories to ingredient schema
                setNutritionInfo(NewFoodItemData(f?.kcal, f?.protein, f?.fat, f?.carbs, f?.otherNutrition))
                setTotalWeight(f?.totalWeight || 1)
                //@ts-ignore
                setMeasures(foodMeasures)
                setHealthLabels(f?.healthLabels || new Array())
                setIngredients(f?.foodContentsLabel || undefined)
                setQuantity(f?.quantity ? f.quantity.toString() : '1')
                setCurrentMeasure(currentMeasureForFood)
                //TODO: Add edamam ID to ingredient
                setEdamamId(f?.edamamId || '')
                if (!f?.edamamId && f?.userID) {
                    DataStore.query(User, f?.userID).then(x => {
                        setAuthor(x?.username || 'Edamam Nutrition')
                    })
                }
            })
        } else {
            setNutritionInfo(NewFoodItemData())
            if (props.src !== 'api') {
                setAuthor(username)
                setAuthorId(userId)
            }
        }
    }, [])

    React.useEffect(() => {
        const prepare = async () => {
          const user = await DataStore.query(User, userId)
          if (user) {
            //@ts-ignore
            setUserAllergens(user.allergens || [])
          }
        }
        prepare()
      }, [])

    React.useEffect(() => {
        if (!Number.isNaN(Number(quantity)) && Number(quantity) > 0 && totalWeight && currentMeasure) {
            const newWeight = currentMeasure.weight
            const nutritionCopy = nutritionInfo
            const newNutrition = nutritionCopy.map((n) => {
                const newFraction = (Number(n.value) * newWeight) / totalWeight
                return { ...n, value: (newFraction * Number(quantity)).toFixed(2).toString() }
            })
            setTotalWeight(newWeight * Number(quantity))
            setNutritionInfo(newNutrition)
        }
    }, [currentMeasure, quantity])
    const missingHealthLabels = (): { label: string, value: string }[] => {
        const allLabels = Object.keys(healthLabelMapping)
        const currentLabels = healthLabels || []
        let missing: { label: string, value: string }[] = []
        allLabels.forEach((label) => {
            //@ts-ignore
            if (!currentLabels.includes(label)) missing.push({ label: `${healthLabelMapping[label].name} ${healthLabelMapping[label].emoji}`, value: label })
        })
        return missing
    }

    const [missingLabels, setMissingLabels] = React.useState<{ label: string, value: string }[]>(missingHealthLabels())

    React.useEffect(() => {
        setMissingLabels(missingHealthLabels())
    }, [healthLabels])
    const navigator = useNavigation()
    const [errors, setErrors] = React.useState<string[]>([])
    React.useEffect(() => {
        if (errors.length > 0) setUploading(false)
    }, [errors])
    const onAddPress = async () => {
        setUploading(true)
        if (!props.id && src !== 'new') {
            setErrors(['There was a problem'])
            return
        }
        try {
            const otherNutrition: any = {}
            nutritionInfo.filter((x) => !['Calories', 'Protein', 'Carbs', 'Fat'].includes(x.name)).forEach((x) => {
                otherNutrition[x.name] = {value: x.value, hidden: x.hidden}
                
            })
            let img = imageSource.length === 0 ? '' : imageSource[0].uri
            if (img && !isStorageUri(img) && img !== props.img) {
                img = await uploadImageAndGetID({uri: img, type:'image'})
            }
            //@ts-ignore
            const document: FoodProgress = {
                name: name,
                kcal: Number(nutritionInfo.filter(x => x.name == 'Calories')[0].value),
                units: currentMeasure.label,
                userID: userId,
                quantity: Number(quantity),
                protein: Number(nutritionInfo.filter(x => x.name == 'Protein')[0].value),
                carbs: Number(nutritionInfo.filter(x => x.name == 'Carbs')[0].value),
                fat: Number(nutritionInfo.filter(x => x.name == 'Fat')[0].value),
                otherNutrition: JSON.stringify(otherNutrition) || '',
                img: img,
                measures: measures.map(x => JSON.stringify(x)) || [],
                healthLabels: healthLabels || [],
                totalWeight: totalWeight || 1,
                category: props.category || 'Generic foods',
                foodContentsLabel: ingredients || '',
                edamamId: edamamId
            }
            if (progressId && !props.mealId && !currentIngredietId && !aiResult && !props.grocery) {
                //@ts-ignore
                if (src === 'api' || src === 'new' || src === undefined || src === 'existing') {
                    DataStore.save(new FoodProgress({ ...document, progressID: progressId || '', public: src==='new' })).then(x => {
                        //@ts-ignore
                        navigator.pop()
                    })
                }else {
                    const x = await DataStore.query(FoodProgress, props.id || '')
                    if (!x) {
                        setErrors(['There was a problem finding the food to update'])
                        return;
                    }
                    await DataStore.save(FoodProgress.copyOf(x, original => {
                        Object.keys(document).forEach(k => {
                            //@ts-ignore
                            original[k] = document[k]
                        })
                    }))
                    //@ts-ignore
                    navigator.pop()
                }

            } else if (props.mealId || (aiResult && currentIngredietId) || props.grocery) {
                if (props.grocery) {
                    DataStore.save(new Ingredient({ ...document })).then(doc => {
                        if (doc) {
                            DataStore.save(new PantryItem({userID: userId, ingredientID: doc.id, purchased: false, inCart: false})).then(x => {
                                //@ts-ignore
                                navigator.pop()
                            })
                        }
                    })
                }else if (props.src !== 'backend') {
                    DataStore.save(new Ingredient({ ...document, mealID: props.mealId })).then((x) => {
                        //@ts-ignore
                        let newAiResult: GenerateMealResult = {...aiResult}
                        if (newAiResult['ingredients']) {
                            const key = newAiResult.ingredients.findIndex(x => x.name === currentIngredietId)
                            if (key !== -1) {
                                newAiResult.ingredients[key].ingredient = x.id
                            }
                            setAiResult(newAiResult)
                            setCurrentIngredietId(null)
                        }
                        //@ts-ignore
                        navigator.pop()
                    })
                } else if (props.id) {
                    DataStore.query(Ingredient, props.id).then(f => {
                        if (f) {
                            DataStore.save(Ingredient.copyOf(f, x => {
                                //@ts-ignore
                                x.mealID = props.mealId
                                Object.keys(document).forEach(k => {
                                    //@ts-ignore
                                    x[k] = document[k]
                                })
                                //@ts-ignore
                            })).then(_ => navigator.pop())
                        }

                    })
                }
            } else {
                setErrors(['There was a problem'])
            }
        } catch (error: any) {
            setErrors([error.toString()])
        }

    }

    const userIsAllergic = userAllergens.filter(x => `${name} ${ingredients}`.toLowerCase().includes(x || 'nothing')).length > 0
    const firstImage = imageSource.filter(x => x.type === 'image')
    return (
        <View style={{flex: 1}} includeBackground>
            <BackButton Right={() => {
                return <ShowMoreButton name={name} desc={'@'+author} img={firstImage.length === 0 ? defaultImage : firstImage[0].uri} id={id} type={FavoriteType.FOOD} userId={authorId || ''} />
            }} />
            <ScrollView bounces={false} contentContainerStyle={[tw`items-center`]} showsVerticalScrollIndicator={false} >
                <ImagePickerView
                    editable={editable === true}
                    srcs={imageSource}
                    onChange={setImageSource}
                    type='image' />
                <View includeBackground style={tw`w-12/12 h-12/12 items-center pb-5`}>
                    {errors.length > 0 && <ErrorMessage errors={errors} onDismissTap={() => setErrors([])} />}
                    {/* Title */}
                    <View style={tw`justify-between flex-row items-center w-12/12 px-4 py-4`}>
                        <View>
                            <TextInput
                                style={tw`text-2xl font-bold text-${dm ? 'white' : "black"}`}
                                value={name}
                                multiline
                                numberOfLines={2}
                                editable={editable === true}
                                placeholder={'Your food name'}
                                placeholderTextColor={'gray'}
                                onChangeText={setName}
                            />
                            <View style={tw`flex-row`}>
                                <Text>by </Text>
                                <TouchableOpacity disabled={(!!edamamId || !authorId)} onPress={() => {
                                    const screen = getMatchingNavigationScreen('User', navigator)
                                    //@ts-ignore
                                    navigator.navigate(screen, {id: authorId})

                                }} >
                                <Text style={tw`text-red-600`}>{author}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        {userIsAllergic && <AllergenAlert />}
                    </View>
                    <View style={tw`items-start justify-start w-12/12 px-4 py-4`}>
                        <View style={tw`flex-row items-center justify-between w-12/12`}>
                            <Text weight='bold' style={tw`text-2xl`}>Health Labels</Text>
                            {(healthLabels || []).length != Object.keys(healthLabelMapping).length && <View style={tw`flex-row items-center`}>
                                <Picker
                                    width='40'
                                    data={missingLabels}
                                    editable={editable}
                                    defaultIndex={1}
                                    onChange={(d: PickerItemData): void => {
                                        setHealthLabels([...healthLabels, d.value])
                                    }} />
                            </View>}
                        </View>
                    </View>
                    {healthLabels.length !== 0 && <View style={tw`h-15 px-4 mb-3`}>
                        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                            {healthLabels.map((l, i) => {
                                if (!Object.keys(healthLabelMapping).includes(l)) return null
                                return <View key={i} style={tw`bg-${dm ? 'red-700' : 'red-300'} px-1 rounded items-center justify-center flex-row h-9 mx-2`}>
                                    {/* @ts-ignore */}
                                    <Text>{healthLabelMapping[l].emoji} </Text>
                                    {/* @ts-ignore */}
                                    <Text weight='bold'>{healthLabelMapping[l].name}</Text>
                                    {props.editable && <TouchableOpacity style={tw`px-1`} onPress={() => {
                                        setHealthLabels(healthLabels.filter(x => x !== l))
                                    }}>
                                        <ExpoIcon name='x' iconName='feather' size={18} color={dm ? "white" : 'black'} />
                                    </TouchableOpacity>}
                                </View>
                            })}
                        </ScrollView>
                    </View>}
                    {/* Nutrient Information */}
                    <View style={tw`w-11/12 border border-2 border-${dm ? "white" : "black"}`}>
                        <TouchableOpacity style={tw`flex-row justify-between items-center px-7`} onPress={() => setShowMeasures(!showMeasures)}>
                            <Text style={tw`text-xl py-2`} weight='semibold'>Serving Sizes</Text>
                            <ExpoIcon name={`${showMeasures ? 'chevron-up' : 'chevron-down'}`} iconName='feather' size={25} color={`${dm ? 'white' : 'black'}`} />
                        </TouchableOpacity>
                        {showMeasures && <Animated.View entering={BounceInDown} exiting={FadeOut} style={tw`w-12/12 flex-row flex-wrap px-7 py-2`}>
                            {measures.map((m, i) => {
                                return <Text key={i} style={tw`w-6/12 pt-1 ${editable ? 'mb-4' : ''}`}>{m.label} ({Math.round(m.weight)}g)</Text>
                            })}
                        </Animated.View>}
                        {showMeasures && editable && <View style={tw`p-4`}>
                            <Text style={tw`text-lg w-12/12 items-start px-7 mt-3`} weight='bold'>New Serving Size</Text>
                            <View style={tw`flex-row justify-evenly items-center`}>
                                <TextInput
                                    style={tw`w-4/12 h-10 my-2 border-${dm ? "white" : "black"} text-${dm ? "white" : "black"} border text-center`}
                                    placeholder="label"
                                    value={newMeasureLabel}
                                    onChangeText={setNewMeasureLabel}
                                />
                                <TextInput
                                    style={tw`w-4/12 h-10 my-2 border-${dm ? "white" : "black"} text-${dm ? "white" : "black"} border text-center`}
                                    placeholder='weight (g)'
                                    value={newMeasureWeight}
                                    onChangeText={setNewMeasureWeight}
                                    keyboardType={'number-pad'}
                                />
                                <TouchableOpacity onPress={() => {
                                    const newMeasure = { label: newMeasureLabel, weight: Number(newMeasureWeight) }
                                    setMeasures([...measures, newMeasure])
                                    setNewMeasureLabel('')
                                    setNewMeasureWeight('')
                                }}>
                                    <Text>Enter</Text>
                                </TouchableOpacity>
                            </View>
                        </View>}
                    </View>
                    <View style={tw`flex-row justify-between w-12/12 px-4 py-6 mt-4`}>
                        <Text weight='bold' style={tw`text-2xl`}>Nutrition</Text>
                        <View style={tw`flex-row`}>
                            <TextInput
                                style={tw`border rounded border-${dm ? 'white' : 'black'} w-15 h-10 mr-2 text-center text-${dm ? "white" : "black"}`}
                                placeholder={'qty'}
                                placeholderTextColor='gray'
                                keyboardType='decimal-pad'
                                value={quantity}
                                onChangeText={(v) => {
                                    setQuantity(v)
                                }}
                            />
                            <Picker editable={editable === true} onChange={function (d: PickerItemData): void {
                                const selectedMeasure = { label: d.label, weight: d.value }
                                setCurrentMeasure(selectedMeasure)
                                //@ts-ignore
                            }} defaultIndex={measures.findIndex(x => x.label === currentMeasure.label && x.weight == currentMeasure.weight)} data={measures.map((m) => ({ label: m.label, value: m.weight }))} />
                        </View>
                    </View>
                    <NutritionInfo
                        onNutrientsChanged={(x) => console.log(x)}
                        onAddNew={(x) => {
                            setNutritionInfo(x)
                        }}
                        editable={editable === true}
                        data={nutritionInfo}
                    />
                    <View style={tw`px-4 py-6 w-12/12`}>
                        <Text style={tw`text-2xl my-2`} weight='bold'>Ingredients</Text>
                        <TextInput
                            multiline
                            editable={props.editable === true}
                            numberOfLines={10}
                            value={ingredients}
                            onChangeText={setIngredients}
                            style={tw`border rounded border-${dm ? 'white' : 'black'} text-${dm ? 'white' : 'black'} px-2 py-3`} />
                    </View>
                </View>
                <View style={tw`h-60`} />
            </ScrollView>
            {editable && <View style={[
                {
                    position: 'absolute',
                    bottom: 0,
                    flex: 1
                },
                tw`w-12/12`
            ]}>
                {/* Add Food Button */}
                <View style={tw`py-5 w-12/12 items-center px-7 flex-row justify-center`}>
                    <TouchableOpacity disabled={uploading === true} onPress={onAddPress} style={tw`bg-${dm ? 'red-600' : "red-500"} mr-2 px-5 h-12 justify-center rounded-full`}>
                        {!uploading && <Text numberOfLines={1} style={tw`text-center text-white`} weight='semibold'>{props.src === 'backend' ? 'Save' : (props.grocery ? 'Add to List' : 'Add Food')}</Text>}
                        {uploading && <ActivityIndicator />}
                    </TouchableOpacity>
                </View>
            </View>}
        </View>
    )
}


interface PickerItemData {
    label: string;
    value: any
}

interface PickerProps {
    data: PickerItemData[]
    onChange: (d: PickerItemData) => void
    defaultIndex: number;
    width?: string;
    editable?: boolean
}

export const Picker = (props: PickerProps) => {
    const defaultData: PickerItemData[] = [
        { label: 'Item 1', value: 1 },
        { label: 'Item 2', value: 1 },
        { label: 'Item 3', value: 1 }
    ]
    const [data, setData] = React.useState<PickerItemData[]>(defaultData)
    React.useEffect(() => {
        setData(props.data)
    }, [props.data])
    const { width } = props;
    const [selectedTab, setSeletedTab] = React.useState<PickerItemData>(data[props.defaultIndex || 0])
    React.useEffect(() => {
        if (props.defaultIndex < data.length) {
            setSeletedTab(props.data[props.defaultIndex])
        }
    }, [props.defaultIndex])
    const [showItems, setShowItems] = React.useState<boolean>(false)
    const darkMode = useColorScheme() === 'dark'
    return <View style={tw`flex items-start`}>
        <View style={tw`border border-${darkMode ? 'white' : "black"} w-${width || '30'} h-10 rounded justify-center`}>
            <TouchableOpacity
                disabled={props.editable !== true}
                onPress={() => {
                    setShowItems(!showItems)
                }}
                style={tw`flex-row justify-between px-3 items-center`}
            >
                <Text>{selectedTab?.label}</Text>

                {props.editable === true && <ExpoIcon name='chevron-down' iconName='feather' color={`${darkMode ? 'white' : 'black'}`} />}
            </TouchableOpacity>
        </View>
        {showItems && <Animated.View entering={BounceInDown} style={tw`border border-${darkMode ? 'white' : "black"} w-${width || '30'} mt-2 p-4 rounded ${props.width == '12/12' ? 'flex-row flex-wrap max-w-12/12' : ''}`}>
            {data.map((d, i) => {
                return <TouchableOpacity key={i}
                    style={tw`${props.width == '12/12' ? 'w-6/12' : ''}`}
                    onPress={() => {
                        setSeletedTab(d)
                        setShowItems(false)
                        props.onChange(d)
                    }} >
                    <Text>{d.label}</Text>
                </TouchableOpacity>
            })}
        </Animated.View>
        }
    </View>
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
    onAddNew: (v: FoodItemData[]) => void;
    onDelete?: (v: FoodItemData) => void
}

export const NutritionInfo = (props: NutritionInfoProps) => {
    const { editable, onNutrientsChanged, onAddNew, onDelete } = props
    const [form, setForm] = React.useState<FoodItemData[]>([])
    // get where label not in props.data's labels
    const missingLabels: { name: string, unit: string }[] = props.data.filter(x => x.hidden).map(x => ({ name: x.name, unit: x.unit || 'g' }))
    const updateForm = (field: FoodItemData, value: string) => {
        const currentIndex = props.data.findIndex(fx => fx.name===field.name && fx.hidden!==true)
        if (currentIndex === -1) return;
        const data = [...props.data]
        data[currentIndex].value = value
        setForm(data)
        onNutrientsChanged && onNutrientsChanged(data[currentIndex])
    }
    React.useEffect(() => {
        setForm(props.data)
    }, [props.data])
    const onPressNewNutrition = (label: {label: string, value: string}) => {
        if (label.value) {
            const data = [...props.data]
            const dataRemoveHidden = data.findIndex(x => x.name === label.value)
            if (dataRemoveHidden === -1) return;
            data[dataRemoveHidden].hidden = false
            onAddNew([...data])
        }
    }
    const [newLabel, setNewLabel] = React.useState<{ label: string } | null>(missingLabels.length > 0 ? { label: missingLabels[0].name } : null)
    const [show, setShow] = React.useState<boolean>(true)
    const dm = useColorScheme() === 'dark'
    return <View style={tw`w-11/12 rounded border border-2 border-${dm ? 'white' : 'black'} p-3`}>
        <TouchableOpacity style={tw`flex-row justify-between items-center`} onPress={() => setShow(!show)}>
            <Text style={tw`text-xl`} weight='semibold'>Nutrition Facts</Text>
            <ExpoIcon name={`${show ? 'chevron-up' : 'chevron-down'}`} iconName='feather' size={25} color={`${dm ? 'white' : 'black'}`} />
        </TouchableOpacity>
        {show && <Animated.View entering={BounceInDown} exiting={FadeOut}>
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
            {missingLabels.length !== 0 && <View>
                <Text style={tw`text-lg mt-3`}>New Nutrition</Text>
                <View style={tw`flex-row w-12/12 justify-evenly py-4 items-start`}>
                    <Picker
                        editable={editable === true}
                        width='12/12'
                        data={missingLabels.map((x => ({ label: `${x.name} (${x.unit})`, value: x.name })))}
                        onChange={function (d: PickerItemData): void {
                            onPressNewNutrition(d)
                            missingLabels.length > 0 && setNewLabel({label: missingLabels[0].name})
                        }}
                        defaultIndex={0} />
                    {/* <TouchableOpacity style={tw`px-3 ml-2 mt-2`} onPress={}>
                        <Text weight='bold'>Add Nutrition</Text>
                    </TouchableOpacity> */}
                </View>
            </View>}
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


const NewFoodItemData = (calories: null | number = null, protein: null | number = null, fat: null | number = null, carbs: null | number = null, otherNutrition: any = null): FoodItemData[] => {
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

