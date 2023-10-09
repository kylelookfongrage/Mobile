import { useColorScheme } from 'react-native'
import React from 'react'
import { Picker } from 'react-native-ui-lib'
import Colors from '../../constants/Colors'
import { ExpoIcon } from '../base/ExpoIcon';
import tw from 'twrnc'
import {View, Text} from '../base/Themed'

export default function SelectScreen(props: {multi?: boolean; title?: string; options: string[], onSelect?: (s: string[] | string) => void; style?: any; getLabel?: (k: string) => string; getSelected?: (k: string) => boolean}) {
    let dm = useColorScheme() === 'dark'
    let color = dm ? Colors.dark : Colors.light
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
                    fontWeight: '600'
                },
                doneButtonProps: {
                    color: 'red'
                }
            }}
            renderItem={(value, x, itemLabel) => {
                return <View {...x} style={props.style || tw`px-4 py-2 my-1 flex-row items-center justify-between border-b border-gray-${dm ? '800' : '300'}`}>
                    <Text>{itemLabel}</Text>
                    {x.isSelected && <ExpoIcon name='checkmark-circle' iconName='ion' size={23} color='red' />}
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