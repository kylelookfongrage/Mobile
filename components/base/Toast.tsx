import React, { useMemo } from 'react'
import { XStack, Text, Dialog } from 'tamagui'
import { Icon } from './ExpoIcon'
import { _tokens } from '../../tamagui.config'
import { useGet } from '../../hooks/useGet'
import { Incubator } from 'react-native-ui-lib'
import { View, Text as DText } from './Themed'
import Spacer from './Spacer'
import AnimatedLottieView from 'lottie-react-native'
import { animationMapping, animations } from '../../data'
import { ActivityIndicator } from 'react-native-paper'

export default function Toast(props: { type?: 'warning' | 'error' | 'info' | 'success', message?: string }) {
  let toastMapping = {
    'warning': _tokens.tYellow,
    'error': _tokens.tRed,
    'info': _tokens.tBlue,
    'success': _tokens.tGreen
  }
  return (
    <XStack alignItems='center' gap='$2' borderRadius={'$4'} backgroundColor={toastMapping[props.type || 'success']} w={'100%'} paddingHorizontal={10} paddingVertical={'$1.5'}>
      <Icon name='Info-Circle' weight='light' size={20} color={_tokens[props.type || 'success']} />
      <Text color={_tokens[props.type || 'success']} marginLeft={4}>{props.message}</Text>
    </XStack>
  )
}



export const ToastView = (props: { 
  type?: 'warning' | 'error' | 'info' | 'success', 
  message?: string, 
  visible?: boolean; 
  onDismiss?: () => void; 
  safeArea?: boolean; 
  top?: boolean; 
  bottom?: boolean 
}) => {

}


export const GlobalToastView = () => {
  let g = useGet();
  let visible = (g.error || g.msg) ? true : false;
  let message = (g.error || g.msg || '')
  let isError = g.error ? true : false;
  let onDismiss = () => {
    g.setFn(prev => {
      let copy = {...prev}
      copy.error = null;
      copy.msg = null;
      return copy;
    })
  }
  return <Incubator.Toast 
      swipeable 
      message={message}  
      visible={visible} 
      backgroundColor={isError ? _tokens.error : _tokens.info}
      messageStyle={{fontFamily: g.fontBold, fontSize: 15, color: 'white'}} 
      position={'top'} 
      autoDismiss={2500} 
      enableHapticFeedback
      // @ts-ignore 
      icon={() => <Icon name={isError ? 'Danger' : 'Info-Circle'} size={25} color='white' />}
      onDismiss={onDismiss}>
  </Incubator.Toast>
}


export const GlobalLoader = () => {
  let g = useGet();
  // let animationsArr = animationMapping.filter(x => (x.animation!!))
  // let n = useMemo(() => {
  //   return getRandomInt(0, animationsArr.length - 1)
  // }, [g.loading])
  return <Dialog open={g.loading} size='$12'>
  <Dialog.Trigger />
  <Dialog.Portal>
    <Dialog.Overlay />
    <Dialog.Content w={g.s.width * 0.80} justifyContent='center' alignItems='center' borderRadius={10} backgroundColor={g.dm ? _tokens.dark1 : _tokens.gray300}>
      <Spacer sm />
      <ActivityIndicator size={80} color={_tokens.primary900} />
      {/* <AnimatedLottieView style={{height: 100}} source={animationsArr[n].animation} autoPlay /> */}
      <Spacer lg />
      <DText h5 weight='bold'>Loading...</DText>
      <Spacer sm/>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog>
 

}


function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

import tw from 'twrnc'
export const NothingToDisplay = (props: {text: string}) => {
  return <DText style={tw`my-4 text-gray-500 text-center`} lg weight='semibold'>{props.text}</DText>
}
