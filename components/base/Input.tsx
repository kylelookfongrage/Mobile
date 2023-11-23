import { View, Text, useColorScheme, TextInput } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { Label, Spacer, Input as TamaguiInput, XStack, TextArea as TamaguiTextArea } from 'tamagui'
import { _tokens } from '../../tamagui.config';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { ExpoIcon, Icon } from './ExpoIcon';
import Toast from './Toast';


interface InputProps {
    id: string,
    name?: string;
    placeholder?: string;
    editable?: boolean;
    value?: string | number;
    number?: boolean;
    onValueChange?: (v: string | number) => void;
    error?: string;
    alert?: string;
    width?: number;
    height?: number;
    textSize?: number;
    leftOnPress?: () => void;
    rightOnPress?: () => void;
    iconLeft?: string;
    iconRight?: string;
    otherProps?: TextInput['props'],
    password?: boolean;
    canClear?: boolean;
}

export default function Input(props: InputProps) {
    let dm = useColorScheme() === 'dark'
    let tokens = _tokens
    let [borderColor, setBorderColor] = useState('transparent');
    let [obscureText, setObscureText] = useState<boolean>(props.password === true)
    let ref = useRef<TextInput | null>(null);
    useEffect(() => {
        if (props.error) {
            setBorderColor(_tokens.error)
        } else {
            setBorderColor('transparent')
        }
    }, [props.error])
    return (
        <>
            {props.name && <Label size={'$1'} fontWeight={'500'}>{props.name}</Label>}
            <Spacer size='$2' />
            <XStack alignItems='center' borderWidth={borderColor === 'transparent' ? '0' : '$0.5'} borderColor={borderColor} borderRadius={'$4'} space='$2' alignSelf='center' height={props.height || '$5.5'}
                width={props.width || '100%'} backgroundColor={dm ? tokens.dark1 : tokens.gray200} paddingHorizontal={20}
                paddingVertical={18} >
                {(props.iconLeft) && <TouchableOpacity disabled={!props.leftOnPress} onPress={props.leftOnPress}>
                    <Icon name={props.iconLeft} size={20} color={_tokens.gray500} />
                </TouchableOpacity>}
                {/* @ts-ignore */}
                <TamaguiInput
                    height={'100%'}
                    width={'85%'}
                    ref={ref}
                    value={props.value?.toString() || undefined}
                    onChangeText={v => {
                        if (props.number) {
                            let nv = v.replace(/^\d*\.?\d*$/g, '')
                            props.onValueChange && props.onValueChange(nv)
                        } else {
                            props.onValueChange && props.onValueChange(v)
                        }
                    }}
                    onFocus={() => setBorderColor(_tokens.primary900 + '60')}
                    onBlur={() => setBorderColor('transparent')}
                    borderColor={'transparent'}
                    borderWidth={0}
                    editable={props.editable !== false}
                    backgroundColor={'$colorTransparent'}
                    fontSize={props.textSize || 18}
                    placeholder={props.placeholder}
                    color={dm ? _tokens.white : _tokens.black}
                    secureTextEntry={obscureText}
                    {...props.otherProps}
                />
                {(props.iconRight && !props.password && !props.canClear) && <TouchableOpacity disabled={!props.rightOnPress} onPress={props.rightOnPress}>
                    <Icon name={props.iconRight} size={20} color={_tokens.gray500} />
                </TouchableOpacity>}
                {(props.password && !props.canClear) && <TouchableOpacity onPress={() => setObscureText(p => !p)}>
                    <Icon name={obscureText ? 'Unlock' : 'Lock'} size={22} color={_tokens.gray500} />
                </TouchableOpacity>}
                {(props.canClear) && <TouchableOpacity onPress={() => ref?.current?.clear()}>
                    <ExpoIcon name='close-circle-outline' iconName='ion' size={22} color={_tokens.gray500} />
                </TouchableOpacity>}
            </XStack>
            <Spacer size='$2' />
       {(props.error || props.alert) &&  <Toast message={props.error || props.alert} type={props.error ? 'error' : 'warning'} />}
        </>
    )
}



export function TextArea(props: InputProps) {
    let dm = useColorScheme() === 'dark'
    let tokens = _tokens
    let [borderColor, setBorderColor] = useState('transparent');
    let ref = useRef<TextInput | null>(null);
    return (
        <>
            {props.name && <Label size={'$1'} fontWeight={'500'}>{props.name}</Label>}
            <Spacer size='$2' />
            <XStack alignItems='center' borderWidth={borderColor === 'transparent' ? '0' : '$0.5'} borderColor={borderColor} borderRadius={'$4'} space='$2' alignSelf='center' height={props.height || '$5.5'}
                width={props.width || '100%'} backgroundColor={dm ? tokens.dark1 : tokens.gray200} paddingHorizontal={20}
                paddingVertical={10} >
                {(props.iconLeft) && <TouchableOpacity disabled={!props.leftOnPress} onPress={props.leftOnPress}>
                    <Icon name={props.iconLeft} size={20} color={_tokens.gray500} />
                </TouchableOpacity>}
                {/* @ts-ignore */}
                <TamaguiTextArea
                    height={'100%'}
                    width={'85%'}
                    ref={ref}
                    backgroundColor={'$colorTransparent'}
                    onFocus={() => setBorderColor(_tokens.primary900+'60')}
                    onBlur={() => setBorderColor('transparent')}
                    borderColor={'transparent'}
                    borderWidth={0}
                    editable={props.editable !== false}
                    value={props.value?.toString() || undefined}
                    onChangeText={v => {
                        if (props.number) {
                            let nv = v.replace(/^\d*\.?\d*$/g, '')
                            props.onValueChange && props.onValueChange(nv)
                        } else {
                            props.onValueChange && props.onValueChange(v)
                        }
                    }}
                    placeholder={props.placeholder}
                    color={dm ? _tokens.white : _tokens.black}
                    fontSize={props.textSize || 18}
                    {...props.otherProps}
                />
                {(props.iconRight) && <TouchableOpacity disabled={!props.rightOnPress} onPress={props.rightOnPress}>
                    <Icon name={props.iconRight} size={20} color={_tokens.gray500} />
                </TouchableOpacity>}
            </XStack>
            <Spacer size='$2' />
            {(props.error || props.alert) &&  <Toast message={props.error || props.alert} type={props.error ? 'error' : 'warning'} />}
        </>
    )
}