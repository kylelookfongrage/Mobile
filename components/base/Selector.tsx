import { useColorScheme, Dimensions } from 'react-native'
import React from 'react'
import { XGroup } from 'tamagui'
import tw from 'twrnc'
import { TouchableOpacity, View as DView } from 'react-native'
import { Text, View } from './Themed'
import { _tokens } from '../../tamagui.config'

export default function Selector(props: {searchOptions: string[], onPress?: (o: string) => void, selectedOption?: string; px?: number}) {
    let dm = useColorScheme() === 'dark'
    let w = Dimensions.get('screen').width
    let {searchOptions, selectedOption, onPress} = props
    let p = props.px || 12
  return (
    <XGroup w={'100%'} minWidth={'100%'} justifyContent='space-around' alignItems='center' paddingHorizontal={p}>
    {searchOptions.map((o, i) => {
            const selected = selectedOption === o
            return <XGroup.Item key={i}>
                <TouchableOpacity
                style={{...tw`items-center justify-center`, height: 40, width: ((w - p) / searchOptions.length), backgroundColor: selected ? _tokens.primary900: (dm ? _tokens.dark1 : _tokens.gray300)}}
                key={`Search option ${o} at idx ${i}`}
                onPress={() => {
                    if (onPress) {
                        onPress(o)
                    }
                }}>
                <Text lg
                    weight={selected ? 'bold' : 'semibold'} style={tw`${selected ? 'text-white' : ''}`}>{o}</Text>
            </TouchableOpacity>
            </XGroup.Item>
        })}
    </XGroup>
  )
}

export const HideView = (props: {hidden?: boolean; visible?: boolean} & DView['props']) => {
    if (props.hidden || (props.visible === false)) return <View aria-hidden={true} />
    return <View {...props} />
}