import { View, Text } from '../base/Themed'
import React, { useEffect } from 'react'
import tw from 'twrnc'
import Spacer from '../base/Spacer';
import BarProgress from '../base/BarProgress';
import { Dimensions } from 'react-native';
import { _tokens } from '../../tamagui.config';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { useGet } from '../../hooks/useGet';
import { formatCash } from '../../data';

export default function MacronutrientBar(props: { protein?: boolean; carbs?: boolean; fat?: boolean; calories?: boolean; totalEnergy: number; weight: number }) {
    let name = 'Protein'
    let multiplier = 4
    let color = tw`bg-orange-500`.backgroundColor as string
    if (props.carbs) {
        name = 'Carbs'
        color = tw`bg-green-500`.backgroundColor as string
    } else if (props.fat) {
        name = 'Fats'
        color = tw`bg-red-600`.backgroundColor as string
        multiplier = 9
    } else if (props.calories) {
        name = 'Calories'
        color = tw`bg-gray-700`.backgroundColor as string
    }
    let caloriesFromValue = props.weight * multiplier
    let percentage = caloriesFromValue / props.totalEnergy
    if (props.calories) percentage = 1
    if (props.totalEnergy === 1) percentage = 0
    let s = Dimensions.get('screen')
    return <View>
        <Text weight='thin' lg style={tw`text-gray-500`}>{name}</Text>
        <Text h5>{props.weight.toFixed(0)}{<Text> {props.calories ? 'kcal' : 'g'}</Text>}</Text>
    </View>
}


// REMADE: No progress bar

export const MacronutrientBarProgress = (props: { protein?: boolean; carbs?: boolean; fat?: boolean; calories?: boolean; totalEnergy: number; weight: number; disableMultiplier?: boolean }) => {
    let name = 'Protein'
    let multiplier = 4
    let color = _tokens.purple
    if (props.carbs) {
        name = 'Carbs'
        color = _tokens.red
    } else if (props.fat) {
        name = 'Fat'
        color = _tokens.orange
        multiplier = 9
    } else if (props.calories) {
        name = 'Calories'
        color = tw`bg-gray-700`.backgroundColor as string
    }
    if (props.disableMultiplier) multiplier = 1
    let caloriesFromValue = props.weight * multiplier
    let percentage = caloriesFromValue / props.totalEnergy
    if (props.calories) percentage = 1
    if (props.totalEnergy === 1) percentage = 0
    let s = Dimensions.get('screen')
    return <View style={{ ...tw`self-end flex-row justify-between items-end mb-3`, width: s.width * 0.60 }}>
        <View style={tw`items-start`}>
            <Text weight='semibold'>{name} ({props.weight.toFixed(0)}{props.calories ? 'kcal' : 'g'}) </Text>
            <Spacer sm />
            <BarProgress height={7} progressColor={color} widthOfScreen={0.5} progress={percentage * 100 > 100 ? 100 : percentage * 100} />
        </View>
        <Spacer horizontal lg />
        <Text weight='bold' style={tw`text-gray-500`}>{(percentage * 100 > 100 ? 100 : percentage * 100).toFixed(0)}%</Text>
    </View>
}


export const MacronutrientCircleProgress = (props: { protein?: boolean; carbs?: boolean; fat?: boolean; calories?: boolean; totalEnergy: number; weight: number; goal?: number; disableMultiplier?: boolean }) => {
    let name = 'Protein'
    let multiplier = 4
    let color = _tokens.purple
    if (props.carbs) {
        name = 'Carbs'
        color = _tokens.red
    } else if (props.fat) {
        name = 'Fat'
        color = _tokens.orange
        multiplier = 9
    } else if (props.calories) {
        name = 'Calories'
        color = tw`bg-gray-700`.backgroundColor as string
    }
    if (props.disableMultiplier) multiplier = 1
    let caloriesFromValue = props.weight * multiplier
    let percentage = caloriesFromValue / props.totalEnergy
    if (props.calories) percentage = 1
    if (props.totalEnergy === 1) percentage = 0
    const cpRef = React.useRef<AnimatedCircularProgress | null>(null);
    let g = useGet()
    let { s, dm } = g
    useEffect(() => {
        let _per = (props.weight || 0) / (props.goal || 1)
        cpRef.current?.animate(_per * 100, 800)
    }, [props.weight])
    return <View style={{ ...tw`justify-between items-center mb-3` }}>
        <AnimatedCircularProgress size={s.height * 0.08}
            width={s.height * 0.006}
            rotation={270}
            fill={0}
            style={tw`self-center items-center justify-center`}
            lineCap="round"
            tintColor={color}
            backgroundColor={dm ? _tokens.dark2 : _tokens.gray300}
            ref={cpRef} >
            {(fill) => (
                <View style={tw`items-center self-center`}>
                    <Text weight="black" lg>
                        {(props.weight || 0 > 9999 ? formatCash(props.weight) : Math.round(props.weight || 0).toFixed())}{<Text gray sm>{props.calories ? '' : ' g'}</Text>}
                    </Text>
                </View>
            )}
        </AnimatedCircularProgress>
        <Spacer sm />
        <Text bold lg>{name}</Text>
        <Text center gray sm>{props.disableMultiplier ? '' : ((percentage * 100 > 100 ? 100 : percentage * 100) || 0).toFixed(0) + '%'}</Text>
    </View>
}


