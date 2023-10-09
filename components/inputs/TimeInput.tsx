import React, { useRef } from 'react'
import { pad } from '../../data';
import { MaskedInput } from 'react-native-ui-lib';
import { Text } from '../base/Themed';
import tw from 'twrnc'

export default function TimeInput(props: {value?: string; onChange?: (v: string) => void;}) {
    const minInput = useRef<any>();
    return <MaskedInput
        migrate
        ref={minInput}
        renderMaskedText={renderTimeText}
        formatter={(value: string) => value?.replace(/\D/g, '')}
        keyboardType={'numeric'}
        maxLength={6}
        initialValue={props.value || ''}
        onChangeText={props.onChange}
    />
}


export function valueToHoursMinutesSeconds(value: string): {hours: string, minutes: string, seconds: string}{
    let str = pad('000000', value, true)
    const hours = str.substring(0, 2);
    const minutes = str.substring(2, 4);
    const seconds = str.substring(4);
    return {hours, minutes, seconds}
}

export function valueToSeconds(value: string): number {
    let {hours, minutes, seconds} = valueToHoursMinutesSeconds(value)
    return ((Number(hours) || 0) * 3600) + ((Number(minutes) || 0) * 60) + ((Number(seconds) || 0))
}


function renderTimeText(value: string) {
    let {hours, minutes, seconds} = valueToHoursMinutesSeconds(value)

    return (
        <Text style={tw`text-center`}>
            {hours}
            <Text style={tw`text-gray-500`}> : </Text>
            {minutes}
            <Text style={tw`text-gray-500`}> : </Text>
            {seconds}
        </Text>
    );
}
