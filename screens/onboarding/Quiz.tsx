import { View, Text } from '../../components/base/Themed'
import React, { useEffect, useState } from 'react'
import { BackButton } from '../../components/base/BackButton'
import { ScrollView, TextInput } from 'react-native-gesture-handler'
import tw from 'twrnc'
import { Goal, User } from '../../aws/models'
import { useProgressValues } from '../../hooks/useProgressValues'
import { Checkbox } from 'react-native-paper'
import { getTdee } from '../home/Profile'
import { ActivityIndicator, TouchableOpacity, useColorScheme } from 'react-native'
import { DataStore } from 'aws-amplify'
import { useCommonAWSIds } from '../../hooks/useCommonContext'
import { useNavigation } from '@react-navigation/native'

export default function Quiz() {
    const goalOptions = [
        {value: Goal.DEFICIT, desc: 'I would like to lose weight or body fat while also trying to build muscle!'},
        {value: Goal.MAINTENANCE, desc: 'I would like keep my same weight and fat, or I would like to replace my fat with muscle while keeping the same weight!'},
        {value: Goal.SURPLUS, desc: 'I would like to gain weight by gaining fat or gaining muscle!'}
    ]
    const [proteinMultiplier, carbsMultiplier, fatMultiplier] = [4, 4, 9]
    const dm = useColorScheme() === 'dark'
    const dietPrograms: {name: string, carbs: number, fat: number, protein: number, icon: string, iconName?: string;}[] = [
        {name: 'Ketosis', carbs: .10, protein: .20, fat: .70, icon: '🧈'},
        {name: 'Low Fat', carbs: .50, protein: .35, fat: .15, icon: '🌽'},
        {name: 'Low Carbs', carbs: .15, protein: .30, fat: .55, icon: '🍗'},
        {name: 'High Protein', carbs: .25, protein: .40, fat: .35, icon: '🥩'},
        {name: 'Paleo', carbs: .30, protein: .30, fat: .40, icon: '🍖'},
    ]
    const [newGoal, setNewGoal] = useState<Goal | null>(null)
    const {goal, fat, weight, carbGoal, fatGoal, proteinGoal, presetMacros} = useProgressValues({metrics: true})
    const [newCarbs, setNewCarbs] = useState<number | null>(null)
    const [newFats, setNewFats] = useState<number | null>(null)
    const [newProtein, setNewProtein] = useState<number | null>(null)
    const [newPreset, setNewPreset] = useState<string | null>(null)
    const tdee = getTdee(newGoal || goal, weight, fat)
    useEffect(() => {
        setNewGoal(goal)
        setNewPreset(presetMacros)
    }, [goal, presetMacros])

    const [uploading, setUploading] = useState<boolean>(false)
    const {userId} = useCommonAWSIds()
    const navigator = useNavigation()
    const onFinish = async () => {
        const user = await DataStore.query(User, userId)
        if (!user) {
            alert('There was a problem, please try again')
            return;
        }
        try {
            await DataStore.save(User.copyOf(user, x => {
                x.carbGoal=newCarbs;
                x.fatGoal=newFats;
                x.proteinGoal=newProtein;
                if (newGoal) {
                    x.goal=newGoal
                };
                x.selectedGoal=newPreset;
            }))
            //@ts-ignore
            navigator.pop()
        } catch (error) {
            alert('There was a problem, please try again')
            return;
        }
        
    }

    useEffect(() => {
        const selectedPreset = newPreset === null ? null : dietPrograms.filter(x => x.name === newPreset)?.[0]
        if (carbGoal && !selectedPreset) {
            setNewCarbs(carbGoal)
        } else {
            setNewCarbs((tdee * (selectedPreset ? selectedPreset.carbs : 0.3)) / 4)
        }
        if (proteinGoal && !selectedPreset) {
            setNewProtein(proteinGoal)
        } else {
            setNewProtein((tdee * (selectedPreset ? selectedPreset.protein : 0.4)) / 4)
        }
        if (fatGoal && !selectedPreset) {
            setNewFats(fatGoal)
        } else {
            setNewFats((tdee * (selectedPreset ? selectedPreset.fat : 0.3)) / 9)
        }
    }, [newPreset, carbGoal, fatGoal, proteinGoal])
    
  return (
    <View includeBackground style={{flex: 1}}>
        <BackButton />
      <ScrollView contentContainerStyle={tw`px-6 pt-4`} showsVerticalScrollIndicator={false}>
      <Text style={tw`text-xl`} weight='bold'>Personalize Rage</Text>
      <Text style={tw`my-3 text-gray-500`}>Use this quiz to personalize how Rage will measure your eating and workout habits. These values will reflect in your total calories, grams of fat, carbs, and protein.</Text>
      <View style={tw`flex-row items-center justify-between mt-3 mb-2`}>
      <Text>What is your goal?</Text>
      <Text>{Math.round(tdee)} kcal limit</Text>
      </View>
      {goalOptions.map(goalOption => {
        const selected = goalOption.value === newGoal
        return <View key={goalOption.value} style={tw`flex-row items-center max-w-12/12 my-2`}>
            <Checkbox.Android status={selected ? 'checked' : 'unchecked'} color='red' uncheckedColor='gray' onPress={() => {
                setNewGoal(goalOption.value)
            }} />   
            <Text onPress={() => {
                setNewGoal(goalOption.value)
            }} style={tw`max-w-10/12 ml-2 ${selected ? '' : 'text-gray-500'}`} weight={selected ? 'bold' : 'regular'}>{goalOption.desc}</Text>
        </View>
      })}
      <Text style={tw`mt-6`}>Diet Program</Text>
      <Text style={tw`mb-3 text-gray-500`}>Choose a popular program or set your own</Text>
      <View style={tw`flex-row items-center justify-around w-12/12 bg-gray-${dm ? '700' : '400'}/50 rounded-xl px-4 py-4 mb-4`}>
        <View style={tw`items-center justify-center`}>
            <TextInput 
                keyboardType='number-pad'
                placeholder='g'
                placeholderTextColor={'gray'}
                style={tw`text-${dm ? 'white' : 'black'} text-lg p-1 mb-2`} 
                value={newCarbs?.toFixed()?.toString() || ''} 
                onChangeText={(v) => {
                    setNewPreset(null)
                    const newValue = v.replace(/[^0-9]/g, '')
                    setNewCarbs(Number(newValue) || null)
                }} 
            />
            <Text style={tw`text-gray-500 text-xs`} weight='semibold'>Carbs (g)</Text>
        </View>
        <View style={tw`items-center justify-center`}>
        <TextInput 
                keyboardType='number-pad'
                placeholder='g'
                placeholderTextColor={'gray'}
                style={tw`text-${dm ? 'white' : 'black'} text-lg p-1 mb-2`} 
                value={newProtein?.toFixed()?.toString() || ''} 
                onChangeText={(v) => {
                    setNewPreset(null)
                    const newValue = v.replace(/[^0-9]/g, '')
                    setNewProtein(Number(newValue) || null)
                }} 
            />
            <Text style={tw`text-gray-500 text-xs`} weight='semibold'>Protein (g)</Text>
        </View>
        <View style={tw`items-center justify-center`}>
        <TextInput 
                keyboardType='number-pad'
                placeholder='g'
                placeholderTextColor={'gray'}
                style={tw`text-${dm ? 'white' : 'black'} text-lg p-1 mb-2`} 
                value={newFats?.toFixed()?.toString() || ''} 
                onChangeText={(v) => {
                    setNewPreset(null)
                    const newValue = v.replace(/[^0-9]/g, '')
                    setNewFats(Number(newValue) || null)
                }} 
            />
            <Text style={tw`text-gray-500 text-xs`} weight='semibold'>Fats (g)</Text>
        </View>
      </View>
        <View style={tw`flex-row items-center justify-center flex-wrap max-w-12/12`}>
            {dietPrograms.map(program => {
                const unselectedColor = `bg-gray-${dm ? '500' : '300'}`
                const selectedColor = `bg-red-500`
                const selected = newPreset === program.name
                return <TouchableOpacity onPress={() => {
                    selected ? setNewPreset(null) : setNewPreset(program.name)
                }} style={tw`w-3.5/12 my-3 py-4 ${selected ? selectedColor : unselectedColor} mx-1.5 items-center justify-center rounded-2xl`} key={program.name}>
                    <Text>{program.icon}</Text>
                    <Text style={tw`${selected ? 'text-white' : ''}`} weight={selected ? 'bold' : 'regular'}>{program.name}</Text>
                </TouchableOpacity>
            })}
        </View>
        <View style={tw`py-5 w-12/12 mt-4 items-center px-7 flex-row justify-center`}>
                    <TouchableOpacity onPress={onFinish} style={tw`bg-${dm ? 'red-600' : "red-500"} mr-2 px-9 py-4 justify-center rounded-full`}>
                        {!uploading && <Text numberOfLines={1} style={tw`text-center text-white`} weight='semibold'>Finish</Text>}
                        {uploading && <ActivityIndicator />}
                    </TouchableOpacity>
                </View>
      <View style={tw`h-90`} />
      </ScrollView>
    </View>
  )
}