import { ScrollView, View, TextInput, useColorScheme, TouchableOpacity, ActivityIndicator } from 'react-native'
import React from 'react'
import { Text } from '../../components/Themed'
import { BackButton } from '../../components/BackButton'
import tw from 'twrnc'
import { ErrorMessage } from '../../components/ErrorMessage'
import { completePrompt } from '../../constants/OpenAI'
import { Ingredient, Meal } from '../../aws/models'
import { ExpoIcon } from '../../components/ExpoIcon'
import { defaultImage, exampleResult, GenerateIngredientResult, getIngredientsAndSteps, getMatchingNavigationScreen } from '../../data'
import { useCommonAWSIds } from '../../hooks/useCommonContext'
import { useNavigation } from '@react-navigation/native'
import { DataStore } from 'aws-amplify'
import { Expand } from '../../components/Expand'
import AnimatedLottieView from 'lottie-react-native'
import cooking from '../../assets/animations/cooking.json'


export default function GenerateMeal() {
    const defaultPromptText = 'Create a numbered list of ingredients and steps for a recipe that is '
    const [prompt, setPrompt] = React.useState<string>(defaultPromptText)
    const dm = useColorScheme() === 'dark'
    const [errors, setErrors] = React.useState<string[]>([])
    const [result, setResult] = React.useState<string>('')
    const [uploading, setUploading] = React.useState<boolean>(false)
    const navigator = useNavigation()
    const onGenerateTap = async () => {
        setErrors([])
        setResult('')
        if (prompt === defaultPromptText || prompt === defaultPromptText + ' ') {
            setErrors(['You must input a prompt'])
            return;
        }
        setUploading(true)
        const res = await completePrompt(prompt + ' put ingredients first')
        setUploading(false)
        if (!res) {
            setErrors(['There was a problem completing your prompt, please try a shorter prompt.'])
            return;
        }
        setResult(res)
    }
    const { aiResult, setAiResult, setCurrentIngredietId, userId, subscribed } = useCommonAWSIds()
    const { ingredients, steps } = aiResult ? aiResult : { ingredients: [], steps: [] }

    const onCreateMealPress = async () => {
        setUploading(true)
        if (!ingredients || ingredients.filter(x => !x.ingredient).length > 0) {
            setErrors(['All of your ingredients must be linked'])
            return
        }
        if (!name) {
            setErrors(['Your meal must have a name'])
            return;
        }
        const m = await DataStore.save(new Meal({
            steps: steps,
            userID: userId,
            name: name,
            isAiGenerated: true,
            description: prompt,
            //@ts-ignore
            media: [{type: 'image', uri: defaultImage}]
        }))

        for (var ingr of ingredients) {
            if (!ingr.ingredient) return;
            const original = await DataStore.query(Ingredient, ingr.ingredient)
            if (original) {
                await DataStore.save(Ingredient.copyOf(original, x => {
                    x.mealID = m.id
                }))
            }
        }
        //map all 
        setAiResult(null)
        setCurrentIngredietId(null)
        const screen = getMatchingNavigationScreen('MealDetail', navigator)
        setResult('')
        setUploading(false)
        //@ts-ignore
        navigator.navigate(screen, { id: m.id, editable: true })
    }

    React.useEffect(() => {
        if (errors.length > 0) {
            setUploading(false)
        }
    }, [errors])

    React.useEffect(() => {
        if (result) {
            const res = getIngredientsAndSteps(result)
            setAiResult(res)
        }
    }, [result])

    const [showResult, setShowResult] = React.useState<boolean>(false)
    const [name, setName] = React.useState<string>('')
    const [editIngredients, setEditIngredients] = React.useState<boolean>(false)
    const [newStep, setNewStep] = React.useState<string>('')
    const [newIngredientQty, setNewIngredientQty] = React.useState<string>('')
    const [newIngredientName, setNewIngredientName] = React.useState<string>('')
    const [editSteps, setEditSteps] = React.useState<boolean>(false)

    if (!subscribed) {
        return <View>
            <BackButton name='Generate Meal' />
            <View style={tw`items-center justify-center px-4`}>
                <AnimatedLottieView autoPlay loop source={cooking} style={tw`h-70 w-70`} />
                <Text style={tw`text-center`} weight='semibold'>Please subscibe to Rage to unlock this feature!</Text>
                <TouchableOpacity onPress={() => {
                    navigator.navigate('Subscription')
                }} style={tw`w-8/12 rounded-xl bg-red-500 items-center mt-6 py-3`}>
                    <Text style={tw`text-white`} weight='bold'>Subscribe</Text>
                </TouchableOpacity>
            </View>
        </View>
    }


    return (
        <View style={{ flex: 1 }}>
            <BackButton name='Generate Meal' func={() => {
                setAiResult(null)
                setCurrentIngredietId(null)
            }} />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[tw`px-4 pt-6 pb-40`]}>
                {errors.length > 0 && <View style={tw`pb-6`}>
                    <ErrorMessage errors={errors} onDismissTap={() => setErrors([])} /></View>}
                <TextInput style={tw`px-4 py-4 rounded-lg border border-${dm ? 'white' : 'black'} rounded-xl text-${dm ? 'white' : 'black'}`} multiline numberOfLines={10} value={prompt} onChangeText={(x) => {
                    if (!x.includes(defaultPromptText)) {
                        setPrompt(defaultPromptText)
                    } else {
                        setPrompt(x)
                    }
                }} placeholder='...' />
                <TouchableOpacity onPress={onGenerateTap} disabled={uploading} style={tw`w-12/12 items-center mt-9 py-2 rounded-lg bg-red-${dm ? '700' : '500'}`}>
                    {uploading && <ActivityIndicator />}
                    {!uploading && <Text style={tw`text-white`} weight='semibold'>{result ? 'Regenerate' : 'Generate'} 🪄</Text>}
                </TouchableOpacity>
                {result && <Expand header='Chat GPT Says:' body={result} />}
                {result && <View style={tw`flex-row items-center mt-4`}>
                    <Text style={tw`text-lg`} weight='semibold'>Name:</Text>
                    <TextInput
                        style={tw`w-9/12 px-2 py-4 rounded-lg border-b border-${dm ? 'white' : 'black'} rounded-xl text-${dm ? 'white' : 'black'}`}
                        value={name} onChangeText={setName} placeholder='...' />
                </View>}
                {(result) && <View style={tw`mt-6`}>
                    <View style={tw`flex-row items-center justify-between`}>
                        <Text style={tw`text-lg`} weight='semibold'>Ingredients:</Text>
                        <TouchableOpacity onPress={() => setEditIngredients(!editIngredients)}>
                            <Text>{editIngredients ? 'Cancel' : 'Edit'}</Text>
                        </TouchableOpacity>
                    </View>
                    {editIngredients && <View style={tw`my-4`}>
                        <Text weight='semibold'>New Ingredient</Text>
                        <View style={tw`flex-row mt-2 items-center justify-between w-12/12`}>
                            <View style={tw`flex-row items-center`}>
                            <TextInput style={tw`w-3/12 px-4 py-2 text-${dm ? 'white' : 'black'} rounded-xl mr-2 border border-${dm ? 'white' : 'black'}`} numberOfLines={3} multiline value={newIngredientQty} onChangeText={setNewIngredientQty} />
                            <Text>of</Text>
                            <TextInput style={tw`w-7/12 px-4 py-2 text-${dm ? 'white' : 'black'} rounded-xl ml-2 border border-${dm ? 'white' : 'black'}`} numberOfLines={3} multiline value={newIngredientName} onChangeText={setNewIngredientName} />
                            </View>
                            <TouchableOpacity onPress={() => {
                                if (!newIngredientName && !newIngredientQty) {
                                    return;
                                }
                                let newIngredient: GenerateIngredientResult = {qty: newIngredientQty, unit: '', name: newIngredientName}
                                const originalIngredients = aiResult?.ingredients
                                originalIngredients?.push(newIngredient)
                                ///@ts-ignore
                                if (newIngredient) setAiResult({ ...aiResult, ingredients: originalIngredients })
                                setNewIngredientName('')
                                setNewIngredientQty('')
                            }} style={tw``}>
                                <Text weight='semibold'>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>}
                    {(ingredients || []).map(x => {
                        return <TouchableOpacity
                            key={x.name}
                            onPress={() => {
                                setCurrentIngredietId(x.name)
                                const screen = getMatchingNavigationScreen('ListFood', navigator)
                                console.log(`screen: ${screen}`)
                                //@ts-ignore
                                navigator.navigate(screen, { defaultSearch: x.name })
                            }} disabled={(editIngredients || !!x.ingredient)} style={tw`w-12/12 rounded-xl flex-row my-2 bg-gray-${dm ? '700' : '300'} px-3 py-4 justify-between`}>
                            <View style={tw`flex-row max-w-11/12`}>
                                <TouchableOpacity onPress={() => {
                                    const newIngredients = aiResult?.ingredients?.filter(ingr => x.name !== ingr.name)
                                    //@ts-ignore
                                    setAiResult({ ...aiResult, ingredients: newIngredients || [] })
                                }} disabled={!editIngredients}>
                                    <ExpoIcon iconName='feather' name={(editIngredients ? 'trash' : (!!x.ingredient ? 'check-circle' : 'alert-circle'))} size={20} color={!!x.ingredient ? 'green' : 'red'} />
                                </TouchableOpacity>
                                <Text style={tw`ml-2`}>{x.qty} {x.unit} of {<Text weight='semibold' style={tw`text-${!!x.ingredient ? 'green' : 'red'}-500`}>{x.name}</Text>} </Text>
                            </View>
                            <ExpoIcon name='chevron-right' iconName='feather' size={20} color='gray' />
                        </TouchableOpacity>
                    })}
                </View>}
                {result && <View style={tw`w-12/12 mt-9`}>
                    <View style={tw`flex-row items-center justify-between`}>
                        <Text style={tw`text-lg`} weight='semibold'>Steps:</Text>
                        <TouchableOpacity onPress={() => setEditSteps(!editSteps)}>
                            <Text>{editSteps ? 'Cancel' : 'Edit'}</Text>
                        </TouchableOpacity>
                    </View>
                    {editSteps && <View style={tw`my-4`}>
                        <Text weight='semibold'>New Step</Text>
                        <View style={tw`flex-row mt-2 items-center justify-between w-12/12`}>
                            <TextInput style={tw`w-9/12 px-4 py-2 text-${dm ? 'white' : 'black'} rounded-xl mr-2 border border-${dm ? 'white' : 'black'}`} numberOfLines={3} multiline value={newStep} onChangeText={setNewStep} />
                            <TouchableOpacity onPress={() => {
                                if (!newStep) {
                                    return;
                                }
                                let newSteps = aiResult?.steps
                                newSteps?.push(newStep)
                                ///@ts-ignore
                                setAiResult({ ...aiResult, steps: newSteps || [] })
                                setNewStep('')
                            }} style={tw``}>
                                <Text weight='semibold'>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>}
                    {(steps || []).map((s, i) => {
                        return <View style={tw`my-3 flex-row items-center w-10/12`} key={`step: ${i}`}>
                            <TouchableOpacity
                                onPress={() => {
                                    const newSteps = aiResult?.steps.filter(x => x !== s)
                                    ///@ts-ignore
                                    setAiResult({ ...aiResult, steps: newSteps || [] })
                                }}
                                disabled={editSteps !== true}
                                style={tw`bg-red-${dm ? '600' : '400'} h-8 w-8 items-center justify-center rounded-full mr-4`}>
                                {!editSteps && <Text style={tw`text-lg text-white`} weight='semibold'>{i + 1}</Text>}
                                {editSteps && <ExpoIcon name='trash' iconName='feather' color={dm ? 'white' : 'black'} size={20} />}
                            </TouchableOpacity>
                            <Text>{s}</Text>
                        </View>
                    })}
                </View>}
                {result && <View style={tw`w-12/12 items-center justify-center mt-4`}>
                    <TouchableOpacity disabled={uploading} onPress={onCreateMealPress} style={tw`bg-red-${dm ? '700' : '300'} rounded-xl items-center justify-center w-4/12 p-3`}>
                        {!uploading && <Text weight='bold'>Create Meal</Text>}
                        {uploading && <ActivityIndicator />}
                    </TouchableOpacity></View>}
            </ScrollView>
        </View>
    )
}