import React from 'react'
import { XStack } from 'tamagui';
import { Text } from './Themed';
import tw from 'twrnc'
import { Icon } from './ExpoIcon';
import { _tokens } from '../../tamagui.config';

export default function TopBar(props: {
    iconLeft?: string;
    title: string;
    Right?: React.JSXElementConstructor<any>
}) {
    let {iconLeft, title, Right} = props;
  return (
    <XStack w='100%' justifyContent='space-between' alignItems='center' paddingHorizontal={16}>
            {iconLeft ? <Icon name={iconLeft} size={26} weight='bold' color={_tokens.primary900} /> : <Text> </Text>}
            <Text h4 weight='bold' style={tw`text-center`}>{title}</Text>
            {Right ? <Right /> : <Text> </Text>}
        </XStack>
  )
}