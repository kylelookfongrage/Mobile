import { View, Text, TextInput, useColorScheme } from 'react-native'
import React from 'react'
import tw from 'twrnc'
import { _tokens } from '../../tamagui.config';

export default function Description(props: {
  value?: string | null | undefined;
  onChangeText?: (s: string) => void;
  editable?: boolean;
  placeholder?: string
  style?: any;
}) {
  let dm = useColorScheme() === 'dark'
  return <TextInput
  value={props.value || ''}
  multiline
  numberOfLines={20}
  scrollEnabled={false}
  onChangeText={props.onChangeText}
  editable={!(props.editable === false)}
  placeholder={props.placeholder}
  enablesReturnKeyAutomatically
  placeholderTextColor={'gray'}
  style={[{
    color: dm ? _tokens.gray400 :_tokens.gray700,
    fontSize: 16,
    letterSpacing: 0.2,
    fontFamily: 'Urbanist_400Regular'
  }, props.style]}
/>
}