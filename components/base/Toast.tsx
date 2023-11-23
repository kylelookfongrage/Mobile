import React from 'react'
import { XStack, Text } from 'tamagui'
import { Icon } from './ExpoIcon'
import { _tokens } from '../../tamagui.config'

export default function Toast(props: {type?: 'warning' | 'error' | 'info' | 'success', message?: string}) {
    let toastMapping = {
        'warning' : _tokens.tYellow,
        'error' : _tokens.tRed,
        'info' : _tokens.tBlue,
        'success' : _tokens.tGreen
    }
  return (
    <XStack alignItems='center' gap='$2' borderRadius={'$4'} backgroundColor={toastMapping[props.type || 'success']} w={'100%'} paddingHorizontal={10} paddingVertical={'$1.5'}>
        <Icon name='Info-Circle' weight='light' size={20} color={_tokens[props.type || 'success']} />
      <Text color={_tokens[props.type || 'success']}>{props.message}</Text>
    </XStack>
  )
}