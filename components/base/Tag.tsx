import React from 'react'
import { _tokens } from '../../tamagui.config'
import { YStack, Text } from 'tamagui';
import { useColorScheme } from 'react-native';

export default function Tag(props: {
    color?: string;
    type?: 'primary' | 'light' | 'outline' | 'none';
    children?: any,
    textSize?: any
    width?: any
    pill?: any
}) {
    let dm = useColorScheme() === 'dark'
    let s = getTagStyle(props.type || 'primary', props.color || 'success', dm)
  return (
    <YStack maxWidth={props.width} minHeight={42} alignItems='center' justifyContent='center' backgroundColor={s.bg} paddingHorizontal='$4' borderRadius={'$11'} borderColor={s.border ? s.border : undefined} borderWidth={s.border ? 1 : 0}>
      <Text fontSize={props.textSize || 16} fontWeight={'600'} textAlign='center' color={s.text}>
      {props.children}
      </Text>
    </YStack>
  )
}


const getTagStyle = (type: string, color: string, dm: boolean=false): {bg: string, text: string, border: string | null} => {
    let border = null;
    //@ts-ignore
    let text = _tokens[color]
    let bg = 'transparent'
    if (type === 'primary') { //@ts-ignore
        bg = _tokens[color]
        text = _tokens.white
    }
    if (type === 'none') {
        bg = 'transparent'
    }
    if (type === 'outline') { //@ts-ignore
        border = _tokens[color] + '10'
    }
    if (type === 'light') {
        bg = dm ? _tokens.dark2 : _tokens.gray300
    }
    return {bg, text, border};
}