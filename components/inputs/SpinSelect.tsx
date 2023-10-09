import { View, Text } from '../base/Themed'
import React from 'react'
import { Dimensions, TouchableOpacity, useColorScheme } from 'react-native'
import { WheelPicker } from 'react-native-ui-lib'
import tw from 'twrnc'
import Colors from '../../constants/Colors'
import { ItemProps } from 'react-native-ui-lib/src/components/WheelPicker/Item'

export default function SpinSelect<T extends Object>(props: { items: T, onSelect?: (k: keyof T) => void; onSave?: () => void; disableSave?: boolean; labelExtractor?: (label: keyof T) => string; initialValue?: any; width?: number }) {
    const dm = useColorScheme() === 'dark'
    const s = Dimensions.get('screen')
    const color = dm ? Colors.dark : Colors.light
    console.log(Object.keys((props.items || {})).map(x => ({ label: props.labelExtractor ? props.labelExtractor(x as keyof T) : x, value: x })))
    return (
        <View includeBackground style={{...tw`-mb-9 items-center justify-between`}}>
            {!props.disableSave && <TouchableOpacity onPress={() => {
                props.onSave && props.onSave()
            }} style={{ ...tw`items-end justify-center px-3 pt-2`, width: (props.width || s.width) }}>
                <Text style={tw`text-red-600`} weight='semibold'>Save</Text>
            </TouchableOpacity>}
            <View includeBackground style={tw`items-center justify-end mt-5`}>
                <WheelPicker
                    separatorsStyle={{ ...tw`bg-gray-500/20 self-center w-9/12 rounded-lg`, width: (props.width || s.width) * 0.90, borderColor: 'transparent' }}
                    style={{ ...tw`bg-transparent` }}
                    activeTextColor='red'
                    faderProps={{ tintColor: color.background }}
                    inactiveTextColor='gray'
                    initialValue={props.initialValue || undefined}
                    //@ts-ignore
                    onChange={x => {
                        //@ts-ignore
                        if (props.onSelect && props.items[x]) {
                            //@ts-ignore
                            props.onSelect(x)
                        }
                    }}
                    //@ts-ignore
                    items={Object.keys((props.items || {})).map(x => ({ label: props.labelExtractor ? props.labelExtractor(x) : x, value: x }))}
                />
            </View>
        </View>
    )
}


export const MultiWheelPicker = (props: {items: [ItemProps[], ItemProps[]]}) => {
    return <View style={{flex: 1}}>
        <Text>hi</Text>
    </View>
}

export const StyledWheelPicker = (props: {items: ItemProps[], onSelect?: (k: string) => void; initialValue?: any; width?: number}) => {
    const s = Dimensions.get('screen')
    const dm = useColorScheme() === 'dark'
    const color = dm ? Colors.dark : Colors.light
    return <WheelPicker
        separatorsStyle={{ ...tw`bg-gray-500/20 self-center rounded-lg`, width: (props.width || s.width) * 0.90, borderColor: 'transparent' }}
        style={{ ...tw`bg-transparent` }}
        activeTextColor='red'
        faderProps={{ tintColor: color.background }}
        inactiveTextColor='gray'
        initialValue={props.initialValue || undefined}
        onChange={x => {
            //@ts-ignore
            if (props.onSelect) {
                //@ts-ignore
                props.onSelect(x)
            }
        }}
        items={props.items}
    />
}