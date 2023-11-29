import { ActivityIndicator, useColorScheme } from 'react-native'
import React from 'react'
import { Button as TamaguiButton, Text, XStack } from 'tamagui';
import { _tokens } from '../../tamagui.config';
import { ExpoIcon, Icon } from './ExpoIcon';


interface ButtonProps {
    width?: any;
    height?: any;
    type?: 'primary' | 'light' | 'outline' | 'dark' | 'darkOutline' | 'secondary'
    icon1?: string;
    icon2?: string;
    title?: string;
    pill?: boolean;
    hidden?: boolean;
    disabled?: boolean;
    uploading?: boolean;
    onPress?: () => void;
}
export default function Button(props: ButtonProps) {
    let dm = useColorScheme() === 'dark'
    let s = getButtonStyle(props.type || 'primary', dm, (props.disabled === true || props.uploading === true))
    if (props.hidden) return <></>
    return (
        <TamaguiButton disabled={props.uploading || props.disabled} width={props.width || undefined} onPress={props.onPress} borderRadius={props.pill ? "$11" : undefined} height={props.height || undefined} backgroundColor={s.bg} flexDirection='row' alignItems='center' justifyContent='center' borderWidth={s.border ? 2 : 0} borderColor={s.border || undefined}>
            <XStack flexDirection='row' alignItems='center' gap='$3'>
                {props.icon1 && <Icon name={props.icon1} weight='bold' size={20} color={s.text} />}
                {props.title && (props.uploading ? <ActivityIndicator /> : <Text color={s.text} fontSize={16} fontWeight={'$h3'}>{props.title}</Text>)}
                {props.icon2 && <Icon name={props.icon2} weight='bold' size={20} color={s.text} />}
            </XStack>
        </TamaguiButton>
    )
}


export const SignInButton = (props: {
    email?: boolean;
    google?: boolean;
    apple?: boolean;
    onPress?: () => void;
}) => {
    let dm = useColorScheme() === 'dark'
    let s = {
        bg: dm ? _tokens.dark1 : _tokens.white,
        border: dm ? _tokens.dark2 : _tokens.gray200,
        text: dm ? _tokens.white : _tokens.black
    }
    let name = 'Email'
    let icon = 'mail'
    if (props.apple) {
        name = 'Apple'
        icon = 'logo-apple'
    }
    if (props.google) {
        name = 'Google'
        icon = 'logo-google'
    }
    return <TamaguiButton onPress={props.onPress} paddingVertical={20} height={70} borderRadius={'$11'} backgroundColor={s.bg} borderWidth={s.border ? 2 : 0} borderColor={s.border || undefined}>
        <XStack w={'100%'} h={'100%'} flexDirection='row' alignItems='center' justifyContent='space-between' paddingHorizontal={20}>
            <ExpoIcon name={icon} iconName='ion' size={25} color={dm ? 'white' : 'black'} />
            <Text color={s.text} textAlign='center' fontWeight={'$h3'} fontSize={16}>Sign in with {name}</Text>
            <Text> </Text>
        </XStack>
    </TamaguiButton>
}



export const IconButton = (props: {
    iconName?: string;
    type?: 'primary' | 'light' | 'outline' | 'dark' | 'darkOutline' | 'secondary'
    iconSize?: number,
    size?: any,
    circle?: boolean;
    onPress?: () => void;
    disabled?: boolean
}) => {
    let dm = useColorScheme() === 'dark'
    let s = getButtonStyle(props.type || 'primary', dm, props.disabled || false)
    return <TamaguiButton onPress={props.onPress} padding='$-0.5' borderRadius={props.circle ? '$12' : undefined} w={props.size || '$5'} h={props.size || '$5'} backgroundColor={s.bg} borderWidth={s.border ? 2 : 0} borderColor={s.border || undefined} icon={(p) => <Icon name={props.iconName || 'Discovery'} color={s.text} size={props.iconSize || p.size} weight='bold'/>} />
}



const getButtonStyle = (type: string, dm: boolean=false, disabled?: boolean): {bg: string, text: string, border: string | null} => {
    const mapping = {
        'primary': {
            bg: disabled ? _tokens.secondary900 : _tokens.primary900,
            text: _tokens.white,
            border: null
        },
        'light': {
            bg: disabled ? _tokens.gray500 : _tokens.tBlue,
            text: _tokens.primary900,
            border: null
        },
        'secondary': {
            bg: disabled ? _tokens.gray500 : _tokens.secondary900,
            text: _tokens.white,
            border: null,
        },
        'outline': {
            bg: dm ? _tokens.darkBg : _tokens.white,
            border: _tokens.primary900,
            text: disabled ? _tokens.gray500 : _tokens.primary900
        },
        'darkOutline': {
            bg: dm ? _tokens.darkBg : _tokens.white,
            border: dm ? _tokens.lightBg : _tokens.darkBg,
            text: dm ? _tokens.lightBg : _tokens.darkBg
        },
        'dark': {
            bg: dm ? _tokens.dark2 : _tokens.gray300,
            border: null,
            text: dm ? _tokens.lightBg : _tokens.darkBg
        }
    }
    //@ts-ignore
    return mapping[type];
}