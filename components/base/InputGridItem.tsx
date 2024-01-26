import { Dimensions } from "react-native";
import { XStack } from "tamagui";
import { View, Text } from "./Themed";
import React from "react";
import tw from 'twrnc'

export const ImpactGridItem = (props: {
    t1?: string; t2?: string; t3?: string; t4?: string; t2Color?: string | undefined; t3Color?: string | undefined; t4Color?: string | undefined; header?: boolean
}) => {
    let {t1, t2, t3, t4, t2Color, t3Color, t4Color, header} = props;
    let s = Dimensions.get('screen')
    return <XStack px='$4' mb='$2'>
    <View style={{width: s.width * 0.30}}><Text lg weight='bold'>{t1}</Text></View>
    <View style={{width: s.width * 0.22}}><Text lg style={[tw`text-center`, t2Color ? {color: t2Color} : {}]} weight={header ? 'bold' : undefined}>{t2}</Text></View>
    <View style={{width: s.width * 0.22}}><Text lg style={[tw`text-center`, t3Color ? {color: t3Color} : {}]} weight={header ? 'bold' : undefined}>{t3}</Text></View>
    <View style={{width: s.width * 0.22}}><Text lg style={[tw`text-center`, t4Color ? {color: t4Color} : {}]} weight={header ? 'bold' : undefined}>{t4}</Text></View>
</XStack>
}