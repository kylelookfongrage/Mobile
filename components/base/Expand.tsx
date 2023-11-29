import { TouchableOpacity, useColorScheme, View } from 'react-native'
import React, { useState } from 'react'
import { Text } from './Themed'
import tw from 'twrnc'
import { ExpoIcon, Icon } from './ExpoIcon'
import Animated, { BounceInDown, FadeOut } from 'react-native-reanimated'
import { Accordion, Square, XStack } from 'tamagui'
import { _tokens } from '../../tamagui.config'

export function Expand(props: {header: string, body?: string, Component?: React.JSXElementConstructor<any>;}) {
    const {body, header, Component} = props;
    const dm = useColorScheme() === 'dark'
    const [showResult, setShowResult] = React.useState<boolean>(false);
    let [value, setValue] = useState<string | undefined>(undefined)
    if (!Component)return <Accordion value={value} type="single" collapsible margin='$0'>
    <Accordion.Item value="item-1">
    <Accordion.Header>
        <Accordion.Trigger flexDirection="row" padding='$0' backgroundColor={'$colorTransparent'} borderColor={'$colorTransparent'} margin='$0'>
          {({ open }) => (
            <XStack w='100%' justifyContent='space-between' backgroundColor={dm ? _tokens.dark2 : _tokens.gray200} paddingHorizontal='$2' paddingVertical='$3' alignItems='center'>
        <Text lg weight='bold'>{header}</Text>
              <Icon name={open!! ? 'Arrow---Up' : 'Arrow---Down'} size={25} color='gray' />
              </XStack>
          )}
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content>
        <Text>{body}</Text>
        </Accordion.Content>
    </Accordion.Item>
  </Accordion>
    return (
        <View style={tw`w-12/12 mt-6 mb-4 border border-2 border-${dm ? "white" : "black"}`}>
            <TouchableOpacity style={tw`flex-row justify-between items-center px-7`} onPress={() => setShowResult(!showResult)}>
                <Text style={tw`py-2`} weight='semibold'>{header}</Text>
                <ExpoIcon name={`${showResult ? 'chevron-up' : 'chevron-down'}`} iconName='feather' size={25} color={`${dm ? 'white' : 'black'}`} />
            </TouchableOpacity>
            {showResult && <Animated.View entering={BounceInDown} exiting={FadeOut} style={tw`w-12/12 flex-row flex-wrap px-7 py-2`}>
               <View>
               {(body && !Component) && <Text>{body}</Text>}
                {Component && <Component />}
               </View>
            </Animated.View>}
        </View>
    )
}