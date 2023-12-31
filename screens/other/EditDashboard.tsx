import { ScrollView } from 'react-native'
import { BackButton } from '../../components/base/BackButton'
import Spacer from '../../components/base/Spacer'
import { View, Text } from '../../components/base/Themed'
import React from 'react'
import tw from 'twrnc'
import { useSelector } from '../../redux/store'
import { useNavigation } from '@react-navigation/native'
import presetDashboardComponents from '../../components/features/PresetSummaryListItems'
import ManageButton from '../../components/features/ManageButton'


export default function EditDashboard() {
    let {today, runProgress, mealProgress, foodProgress, workoutProgress} = useSelector(x => x.progress)
    let {profile} = useSelector(x => x.auth)
    let weight = today?.weight || profile?.weight || 100
    let waterGoal = Number(weight * 0.5);
    let tdee = profile?.tdee || 2000
    const totalProteinGrams = profile?.proteinLimit || (tdee * 0.4) / 4
    const totalFatGrams = profile?.fatLimit || (tdee * 0.3) / 9
    const totalCarbsGrams = profile?.carbLimit || (tdee * 0.3) / 4
    let navigator = useNavigation()
    let requiredKeys: (keyof typeof presetDashboardComponents)[] = ['Water', 'Nutrition']
    //@ts-ignore
    let keys: (keyof typeof presetDashboardComponents)[] = Object.keys(presetDashboardComponents)
    let obj = {
        water: today?.water || 0,
        waterGoal: waterGoal,
        tdee: tdee,
        proteinGoal: totalProteinGrams,
        carbGoal: totalCarbsGrams,
        fatGoal: totalFatGrams,
        navigator: navigator,
        foodProgress: foodProgress,
        mealProgress: mealProgress,
        workoutProgress: workoutProgress,
        runProgress: runProgress
    }
    return (
        <View includeBackground style={{ flex: 1 }}>
            <BackButton name='Back' />
            <Spacer />
            <ScrollView>
                <Text h4 weight='bold' style={tw`px-2`}>Customize Your Dashboard</Text>
                <Spacer sm />
                <Text lg style={tw`pl-2 pr-4`}>Select the metrics most important to you, and how you want them presented. You can also reorder them! Required metrics are indicated with a checkbox.</Text>
                <Spacer sm/>
                
            </ScrollView>
        </View>
    )
}