import { SectionsWheelPicker, WheelPickerAlign, WheelPickerProps } from 'react-native-ui-lib'
import { View, Text } from '../base/Themed'
import React, { useEffect, useState } from 'react'
import { TouchableOpacity, useColorScheme } from 'react-native'
import tw from 'twrnc'
import Overlay from '../screens/Overlay'
import { fractionStrToDecimal } from '../../data'
import Colors from '../../constants/Colors'
import ManageButton from '../features/ManageButton'

export default function QuantitySelect<S extends string[]>(props: {
    onQuantityChange: (q: number, s: string) => void;
    servingSizes?: S
    hideFractions?: boolean;
    selectedServingSize?: S[number];
    qty?: number | null | undefined;
    initialServingSize?: S[number] | string | undefined | null;
    onSavePress?: () => void;
    title?: string;
}) {
    const [showConsumed, setShowConsumed] = useState<boolean>(false)
    const [value, setValue] = useState<{ v: number, s: S[number] }>({
        v: props.qty || 0,
        s: props.servingSizes?.[0] || props.selectedServingSize || 'gram'
    })
    
    useEffect(() => {
        props.onQuantityChange && props.onQuantityChange(value.v, value.s)
    }, [value])
    let dm = useColorScheme() === 'dark'
    let c = dm ? Colors.dark : Colors.light

    let sections: WheelPickerProps[] = [
        {
            items: Array(51).fill(0).map((x, i) => ({ label: (i).toString(), value: `${i}` })),
            initialValue: `${Math.floor(props.qty || 0)}`,
            onChange: (i) => {
                let str = Number(value.v || 0)?.toFixed(3)
                let fractionStr = str.split('.')[1]
                setValue({ ...value, v: Number(`${i}.${fractionStr}`) })
            },
            style: { backgroundColor: c.background, paddingHorizontal: 20 },
            align: WheelPickerAlign.LEFT,
            faderProps: { tintColor: c.background },
            separatorsStyle: { backgroundColor: c.card + '70', ...tw`py-2 rounded-l-lg`, borderColor: 'transparent' }
        },
        {
            items: ['-', '1/2', '1/3', '1/4', '1/5', '1/6', '1/7', '1/8', '1/9', '1/10', '1/12', '1/16'].filter(x => {
                if (!props.hideFractions) return x
            }).map(x => ({ label: x, value: fractionStrToDecimal(x, 3) || 0 })),
            style: { backgroundColor: c.background },
            onChange: (i) => {
                let str = Math.floor(value.v || 0)
                let dec = `${i}`.split('.')?.[1]
                setValue({ ...value, v: Number(`${str}.${dec || 0}`) })
            },
            align: WheelPickerAlign.CENTER,
            initialValue: props.qty ? Number(`.${props.qty.toFixed(3).split('.')[1]}`) : 0,
            faderProps: { tintColor: c.background },
            separatorsStyle: { backgroundColor: c.card + '70', ...tw`py-2`, borderColor: 'transparent' }
        },
        {
            items: (props.servingSizes ? props.servingSizes : ['grams', 'cups', 'oz', 'fl oz', 'lbs', 'kg']).filter(x => {
                if (props.selectedServingSize && props.selectedServingSize === x) {
                    return x
                } else if (!props.selectedServingSize) return x 
            }).map((x, i) => ({ label: x, value: x })),
            style: { backgroundColor: c.background, paddingHorizontal: 20 },
            align: WheelPickerAlign.RIGHT,
            faderProps: { tintColor: c.background },
            initialValue: props.initialServingSize || props.selectedServingSize,
            onChange: (i) => { //@ts-ignore
                setValue({ ...value, s: i })
            },
            separatorsStyle: { backgroundColor: c.card + '70', ...tw`py-2 rounded-r-lg`, borderColor: 'transparent' }
        },
    ]
    return (
        <TouchableOpacity onPress={() => {
            setShowConsumed(true)
        }} style={tw`flex-row items-center justify-between`}>
            <View card style={tw`px-4 py-2 rounded-xl flex-row items-center`}>
                <Text style={{ fontSize: 16 }}>{props.qty || 0}</Text>
                <Text style={tw`text-gray-500 ml-2`}> {props.selectedServingSize || props.initialServingSize}</Text>
            </View>
            {props.title && <Text style={tw`text-gray-500`}>{props.title}</Text>}
            <Overlay dialogueHeight={30} style={tw``} visible={showConsumed} onDismiss={() => setShowConsumed(false)} excludeBanner>
                <ManageButton title=' ' buttonText='Save' onPress={() => {
                    props.onSavePress && props.onSavePress()
                    setShowConsumed(false)
                }} />
                <View style={tw`items-center justify-center h-12/12`}>
                    <SectionsWheelPicker numberOfVisibleRows={3} sections={sections} />
                </View>
            </Overlay>
        </TouchableOpacity>

    )
}