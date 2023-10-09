import { useColorScheme, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'
import { View, Text } from '../../components/base/Themed'
import { useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import tw from 'twrnc'
import { ExpoIcon } from '../../components/base/ExpoIcon'
import { BackButton } from '../../components/base/BackButton'
import { useProgressValues } from '../../hooks/useProgressValues'
import { titleCase } from '../../data'

interface SummaryEditProps {
    progressId?: string | null;
    registration?: boolean;
}
export default function SummaryEdit(props: SummaryEditProps) {
    const navigator = useNavigation()
    const padding = useSafeAreaInsets()
    const {weight, fat, goal} = useProgressValues({metrics: true})
    const dm = useColorScheme() === 'dark'
    enum optionType {
        weight,
        fat,
        goal 
    }
    const options = [
        {name: 'Body Weight', icon: 'bar-chart-2', value: weight, unit: 'lbs', type: optionType.weight},
        {name: 'Body Fat', icon: 'percent', value: fat, unit: '%', type: optionType.fat},
        {name: 'Edit Goal', icon: 'award', value: `${titleCase(goal.toString())}`, unit: '', type: optionType.goal},
    ]
    return (
        <View includeBackground style={{ flex: 1, paddingTop: props.registration ? padding.top : 0 }}>
            {!props.registration && <BackButton />}
            <ScrollView contentContainerStyle={tw`pt-4 px-6`}>
                <Text style={tw`text-xl my-3`} weight='bold'>Personal Metrics</Text>
                {options.map(x => {
                    return <TouchableOpacity onPress={() => {
                        if (x.type === optionType.fat) {
                            //@ts-ignore
                            navigator.navigate('SummaryMetric', {weight: false})
                        }
                        if (x.type === optionType.weight) {
                            //@ts-ignore
                            navigator.navigate('SummaryMetric', {weight: true})
                        }
                        if (x.type === optionType.goal) {
                            navigator.navigate('Quiz')
                        }
                    }} style={tw`w-12/12 flex-row items-center justify-between p-4`} key={x.name}>
                        <View style={tw`flex-row items-center`}>
                            <ExpoIcon name={x.icon} iconName='feather' size={25} color='gray' style={tw`mr-2`} />
                        <Text>{x.name} ({x.value}{x.unit})</Text>   
                        </View>
                        <ExpoIcon name='chevron-right' iconName='feather' size={30} color='gray' />
                    </TouchableOpacity>
                })}
                {props.registration && <View style={tw`py-5 w-12/12 mt-4 items-center px-7 flex-row justify-center`}>
                    <TouchableOpacity onPress={() => {
                        navigator.navigate('Root')
                    }} style={tw`bg-${dm ? 'red-600' : "red-500"} mr-2 px-9 py-4 justify-center rounded-full`}>
                        <Text numberOfLines={1} style={tw`text-center text-white`} weight='semibold'>Finish</Text>
                    </TouchableOpacity>
                </View>}
            </ScrollView>
        </View>
    )
}