import React from 'react'
import { useColorScheme } from 'react-native'
import { YStack, YStackProps } from 'tamagui'
import { _tokens } from '../../tamagui.config'

export default function BaseScreen(props: YStackProps & {noPad?: boolean}) {
    let dm = useColorScheme() ==='dark'
    let tokens = _tokens
    let bgColor = dm ? tokens.darkBg : tokens.white
  return (
    <YStack {...props} backgroundColor={props.backgroundColor || bgColor} padding={props.noPad ? undefined : '$2'} flex={1}>
    {props.children}
    </YStack>
  )
}