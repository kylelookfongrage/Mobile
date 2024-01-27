import React from 'react'
import { XStack } from 'tamagui';
import { Text } from './Themed';
import tw from 'twrnc'
import { Icon } from './ExpoIcon';
import { _tokens } from '../../tamagui.config';
import { Pressable } from 'react-native';

export default function TopBar(props: {
    iconLeft?: string;
    iconLeftColor?: string;
    iconLeftOnPress?: () => void;
    iconLeftWeight?: string;
    title: string;
    Right?: React.JSXElementConstructor<any>;
    children?: any;
    px?: number;
}) {
    let {iconLeft, title, Right} = props;
  return (
    <XStack w='100%' justifyContent='space-between' alignItems='center' paddingHorizontal={props.px !== undefined ? props.px : 16}>
            {iconLeft ? <Pressable disabled={!props.iconLeftOnPress} onPress={props.iconLeftOnPress}>
              {/* @ts-ignore */}
              <Icon name={iconLeft} size={26} weight={props.iconLeftWeight || 'bold'} color={props.iconLeftColor || _tokens.primary900} />
            </Pressable> : <Text> </Text>}
            {props.children ? props.children : <Text h4 weight='bold' style={tw`text-center`}>{title}</Text>}
            {Right ? <Right /> : <Text> </Text>}
        </XStack>
  )
}