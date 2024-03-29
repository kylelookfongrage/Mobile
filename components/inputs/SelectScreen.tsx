import { useColorScheme } from 'react-native'
import React from 'react'
import { Picker } from 'react-native-ui-lib'
import Colors from '../../constants/Colors'
import { ExpoIcon } from '../base/ExpoIcon';
import tw from 'twrnc'
import {View, Text} from '../base/Themed'
import { _tokens } from '../../tamagui.config';

export default function SelectScreen(props: {multi?: boolean; title?: string; options: string[], onSelect?: (s: string[] | string) => void; style?: any; getLabel?: (k: string) => string; getSelected?: (k: string) => boolean; hidden?: boolean}) {
    let dm = useColorScheme() === 'dark'
    let color = dm ? Colors.dark : Colors.light
    if (props.hidden) return <View />
    return (
        <Picker
            // @ts-ignore
            mode={props.multi ? 'MULTI' : undefined}
            // @ts-ignore
            fieldType='filter'
            topBarProps={{
                containerStyle: {
                    backgroundColor: color.background
                },
                title: props.title || undefined,
                titleStyle: {
                    color: color.text,
                    fontWeight: 'bold'
                },
                doneButtonProps: {
                    color: _tokens.primary900
                }
            }}
            renderItem={(value, x, itemLabel) => {
                return <View {...x} style={props.style || tw`px-4 py-2 my-1 flex-row items-center justify-between`}>
                    <Text lg weight={x.isSelected ? 'bold' : 'regular'}>{itemLabel}</Text>
                    {x.isSelected && <ExpoIcon name='checkmark' iconName='ion' size={23} color={_tokens.primary900} />}
                </View>
            }}
            listProps={{
                // @ts-ignore
                backgroundColor: color.background,
                showsVerticalScrollIndicator: false,
            }} onChange={(x) => {
                if (props.onSelect){
                    props.onSelect(x)
                }
            }} placeholder='Add New'>
            {props.options.map(x => {
                //@ts-ignore
                return <Picker.Item labelStyle={{ color: dm ? 'white' : 'black' }} selectedIconColor='red' isSelected={props.getSelected ? props.getSelected(x) : false} key={x} value={x} label={props.getLabel ? props.getLabel(x) : x} />
            })}
        </Picker>
    )
}