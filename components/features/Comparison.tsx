import { useColorScheme, Dimensions } from 'react-native'
import { _tokens } from '../../tamagui.config'
import { View, Text } from '../base/Themed'
import React from 'react'
import ManageButton from './ManageButton'
import Spacer from '../base/Spacer'
import tw from 'twrnc'
import { XStack, YStack } from 'tamagui'

const Comparison = (props: {
    title: string;
    desc?: string;
    buttonText?: string;
    buttonOnPress?: () => void;
    baselineValue?: number | string;
    baselineDesc?: string;
    baselineSuffix?: string;
    secondaryValue?: number | string;
    secondaryDesc?: string;
    secondarySuffix?: string;
    tertiaryValue?: number | string;
    tertiaryDesc?: string;
    tertiarySuffix?: string;
    currentValue?: string | number;
    currentValueSuffix?: string

}) => {
    let dm = useColorScheme() === 'dark'
    let s = Dimensions.get('screen')
    let w = s.width - 10
  return (
    <View style={{width: w, marginHorizontal: 5, backgroundColor: dm ? _tokens.dark1 : _tokens.gray200, ...tw`rounded-xl`}}>
    <Spacer />
    <YStack px={'$4'}>
    <ManageButton title={props.title || 'Weight Goal'} buttonText={props.buttonText || 'Edit Goal'} onPress={props.buttonOnPress} />
    <Spacer xs />
    {props.desc && <Text style={tw`text-gray-500`}>{props.desc}</Text>}
    </YStack>
    <Spacer />
    <XStack justifyContent='space-around'>
        {(props.baselineDesc && props.baselineValue) && <Tile desc={props.baselineDesc} value={props.baselineValue} suffix={props.baselineSuffix} />}
        {(props.secondaryDesc && props.secondaryValue) && <Tile desc={props.secondaryDesc} value={props.secondaryValue} suffix={props.secondarySuffix} />}
        {(props.tertiaryDesc && props.tertiaryValue) && <Tile desc={props.tertiaryDesc} value={props.tertiaryValue} suffix={props.tertiarySuffix} />}
    </XStack>
    {props.currentValue && <Text weight='semibold' style={tw`text-center mt-4 text-gray-500`}>{props.currentValue} {props.currentValueSuffix ? `(${props.currentValueSuffix})` : ''}</Text>}
    <Spacer />
</View>
  )
}

const Tile = (props: {desc: string, value: number | string, suffix?: string}) => {
    return <YStack justifyContent='center' alignItems='center'>
        <Text h3 weight='bold'>{props.value} {<Text style={tw`text-gray-500`}>{props.suffix}</Text>}</Text>
        <Text style={tw`text-gray-500`}>{props.desc}</Text>
    </YStack>
}

export default Comparison