import { View, Text } from '../base/Themed'
import React from 'react'
import tw from 'twrnc'
import Spacer from '../base/Spacer';
import BarProgress from '../base/BarProgress';
import { Dimensions } from 'react-native';

export default function MacronutrientBar(props: {protein?: boolean; carbs?: boolean; fat?: boolean; calories?: boolean; totalEnergy: number; weight: number}) {
    let name = 'Protein'
    let multiplier = 4
    let color=tw`bg-orange-500`.backgroundColor as string
    if (props.carbs) {
        name='Carbs'
        color=tw`bg-green-500`.backgroundColor as string
    } else if (props.fat) {
        name='Fats'
        color=tw`bg-red-600`.backgroundColor as string
        multiplier=9
    } else if (props.calories) {
        name='Calories'
        color=tw`bg-gray-700`.backgroundColor as string
    }
    let caloriesFromValue = props.weight * multiplier
    let percentage = caloriesFromValue / props.totalEnergy
    if (props.calories) percentage = 1
    if (props.totalEnergy === 1) percentage = 0
    let s = Dimensions.get('screen')
    return <View style={{...tw`self-end flex-row justify-between items-end mb-3`, width: s.width * 0.60}}>
        <View style={tw`items-start`}>
            <Text weight='semibold'>{name} ({props.weight.toFixed(0)}{props.calories ? 'kcal' : 'g'}) </Text>
            <Spacer sm />
            <BarProgress progressColor={color} widthOfScreen={0.5} progress={percentage*100 > 100 ? 100 : percentage*100} />
        </View>
        <Spacer horizontal lg />
        <Text weight='bold'>{(percentage * 100 > 100 ? 100 : percentage * 100).toFixed(0)}%</Text>
    </View>
}