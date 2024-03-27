import { useMemo, useState } from "react";
import { View, Text } from "../base/Themed"
import DatePicker from "react-native-date-picker";
import { Pressable, TouchableOpacity } from "react-native";
import React from "react";
import tw from 'twrnc'
import moment, { min } from "moment";
import { Select as DSelect, TamaguiComponent } from "tamagui";
import Overlay from "../screens/Overlay";
import { useGet } from "../../hooks/useGet";
import { _tokens } from "../../tamagui.config";
import { TouchableWithoutFeedback } from "@gorhom/bottom-sheet";
import Spacer from "../base/Spacer";
import { ExpoIcon } from "../base/ExpoIcon";

type TPickerDate = {
    title?: string;
    value: Date | null | undefined | string;
    time?: boolean;
    dateTime?: boolean;
    onDateChange?: (d: Date) => void;
    children?: React.ReactNode;
    disabled?: boolean;
    placeholder?: string;
    momentFormat?: string;
    minDate?: Date; maxDate?: Date

}

export function getTwentyFourHourTime(amPmString: string) {
    var d = new Date("1/1/2013 " + amPmString);
    let res = { hour: d.getHours(), minutes: d.getMinutes(), seconds: d.getSeconds() }
    console.log(res)
    return res;
}

export function timeStringToMoment(amPmString: string){
    let d = getTwentyFourHourTime(amPmString)
    return moment({hour: d.hour, minutes: d.minutes, seconds: d.seconds})
}


const DateOrTimePicker = (props: TPickerDate) => {
    let [openDate, setOpenDate] = useState(false)
    let momentFormat = props.momentFormat || (props.dateTime ? 'MMM Do @ hhh:mm A' : (props.time ? 'hh:mm A' : 'MMM Do, YYYY'));

    let currentDate = (() => {
        console.log('props.value', props.value)
        if (!props.time) return moment(props.value || new Date());
        if (typeof props.value !== 'string') return moment();
        let m = moment()
        let { hour, minutes, seconds } = getTwentyFourHourTime(props.value)
        console.log(minutes)
        m.hour(hour); m.minutes(minutes); m.seconds(seconds);
        return m;
    })()

    return <View>
        <DatePicker minimumDate={props.minDate} maximumDate={props.maxDate} open={openDate} onConfirm={(d) => {
            console.log(d)
            setOpenDate(false)
            if (props.onDateChange) props.onDateChange(d || new Date())
        }} onCancel={() => setOpenDate(false)} title={props.title} modal mode={props.time ? 'time' : (props.dateTime ? 'datetime' : 'date')} date={currentDate.toDate()} />
        <TouchableOpacity disabled={props.disabled} onPress={props.disabled ? undefined : () => setOpenDate(p => !p)}>
            {!props.children && <Text style={tw`${(props.disabled || !props.value) ? 'text-gray-500' : ''}`}>
                {(props.placeholder && !props.value) ? props.placeholder : (props.value ? currentDate.format(momentFormat) : 'No ' + (props.title || 'date'))}
            </Text>}
            {props.children}
        </TouchableOpacity>
    </View>
}

type TSelector = {
    options: any[];
    title?: string;
    onSelect?: (v: TSelector['options'][number] | null | undefined) => void;
    onMultiSelect?: (v: TSelector['options'] | null | undefined) => void;
    selected?: TSelector['options'] | TSelector['options'][number] | null | undefined;
    formatValue?: (v: TSelector['options'][number] | null | undefined) => string;
    displayValue?: (v: TSelector['options'][number] | null | undefined) => string;
    disabled?: boolean;
    joinOptions?: string;
    placeholder?: string
}

const Select = (props: TSelector) => {
    let multiple = props.onMultiSelect || Array.isArray(props.selected) 
    console.log(props.selected)
    let displayValue: string = useMemo(() => {
        if (multiple && props.selected && props.selected.length > 0) { //@ts-ignore
            if (props.selected.length === props.options.length) return 'All'
            if (props.selected.length === 0) return 'N/A'
            return props.selected.map(x => (props.displayValue ? props.displayValue(x) : x.toString())).join(',')
        } else if (props.selected && !multiple)  {
            return props.displayValue ? props.displayValue(props.selected) : props.selected.toString()
        } else {
            return props.placeholder || 'N/A'
        }
    }, [props.selected])
    console.log(displayValue)
    let [showSelect, setShowSelect] = useState(false)
    let g = useGet()
    return <View>
        <TouchableOpacity style={{flex: 1, paddingLeft: 10, maxWidth: g.s.width * 0.7}} disabled={props.disabled} onPress={props.disabled ? undefined : () => setShowSelect(true)}>
        <Text style={{...tw`self-end text-right mr-1 ${(props.disabled || !props.selected) ? 'text-gray-500': ''}`, flex: 1}}>{displayValue}</Text>
        </TouchableOpacity>
        <Overlay bg={g.dm ? _tokens.dark3 : _tokens.gray300} dialogueHeight={45} visible={showSelect} onDismiss={() => setShowSelect(false)}>
            <Text xl weight="bold">{props.title || 'Select'}</Text>
            <Spacer sm />
            {props.options.map(x => {
                let selected = (multiple && props.selected) ? props.selected.includes(x) : (props.selected ? props.selected===x : false)
                return <Pressable onPress={() =>  {
                    if (multiple && props.selected && selected) {
                        props.onMultiSelect && props.onMultiSelect(props.selected.filter(fn => fn != x))
                    } else if (props.selected && selected) {
                        props.onSelect && props.onSelect(null)
                    } else if (multiple && !selected) {
                        props.onMultiSelect && props.onMultiSelect([...(props.selected || []), x])
                    } else if (!selected) {
                        props.onSelect && props.onSelect(x)
                    }
                }} style={tw`my-1 py-1.5 flex-row items-center justify-between`} key={x.toString()}>
                    <Text style={{...tw``, fontFamily: selected ? g.fontBold : g.fontThin, color: selected ? g.textColor : _tokens.gray500}}>{props.formatValue ? props.formatValue(x) : x.toString()}</Text>
                    {selected && <ExpoIcon name="checkbox" iconName="ion" size={22} color={_tokens.primary900} />}
                </Pressable>
            })}
            <Spacer xl/>
            <Spacer xl/>
        </Overlay>
    </View>
}


export const Picker = {
    DateOrTimePicker, Select
}