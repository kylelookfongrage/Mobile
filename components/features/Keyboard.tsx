import React, {Component, useEffect, useMemo, useRef, useState} from 'react';
import PropTypes, { string } from 'prop-types';
import {TouchableOpacity, ScrollView, StyleSheet, Pressable, Dimensions, View as DView} from 'react-native';
import { Keyboard } from 'react-native-ui-lib';
import KeyboardAccessoryView from 'react-native-ui-lib/lib/components/Keyboard/KeyboardInput/KeyboardAccessoryView';
import { View, Text } from '../base/Themed';
const KeyboardRegistry = Keyboard.KeyboardRegistry
import tw from 'twrnc'
import Input from '../base/Input';
import { _tokens } from '../../tamagui.config';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TextInput } from 'react-native-gesture-handler';
import { ConversionChart, FractionInput } from '../../data';
import Spacer from '../base/Spacer';
import { ExpoIcon } from '../base/ExpoIcon';

export enum EButton {
    SLASH, PERIOD, SPACE, BACK, ENTER
}



interface INutritionKeyboardButtonPress {
    servingSizePress?: string;
    numberPress?: number;
    buttonPress?: '/' | ' ' | '.' | 'BACK' | 'ENTER';
}

interface INutritionKeyboardProps {
    onServingChange?: (selectedServing: string) => void;
    servingSizes?: object | null | undefined, 
    selectedServingSize?: string | null | undefined;
    value?: number;
    onNumberChange?: (v: number) => void;
    onEnterPress?: () => void;
    initialValue?: number;
}

export function KeyboardView(props: INutritionKeyboardProps) {
  const onButtonPress = (p: INutritionKeyboardButtonPress) => {
    KeyboardRegistry.onItemSelected('KeyboardView', p);
  }
  
  let SpaceIcon = () => (<ExpoIcon iconName='material' name='space-bar' size={25} color='white' />)
  let BackIcon = () => (<ExpoIcon iconName='material' name='backspace' size={25} color='white'  />)
  let LogButton = () => {
    return <DView style={[tw`items-center justify-center rounded-lg`, {backgroundColor: _tokens.primary900, width: (Dimensions.get('screen').width * 0.99) / (2.5), height: (Dimensions.get('screen').height * 0.26) / 4.5}]}>
    <Text xl weight='bold' style={tw`text-white`}>Finish</Text>
</DView>
  }
  let ButtonMapping: {[k: keyof INutritionKeyboardButtonPress['buttonPress'] ]: () => React.JSXElementConstructor<any>} = {
    ' ': <SpaceIcon />,
    'BACK': <BackIcon />,
    'ENTER': <LogButton />
  }
  
    return (
      <ScrollView scrollEnabled={false} contentContainerStyle={[{backgroundColor: _tokens.dark1, flex: 1}]}>
        <DView style={tw`flex-wrap flex-row`}>
            {[1,2,3,'/',4,5,6,' ',7,8,9,'BACK','.', 0, 'ENTER'].map(x => {
                return <TouchableOpacity onPress={() => {
                    if (typeof x === 'string') {
                        //@ts-ignore
                        onButtonPress({buttonPress: x})
                    } else {
                        //@ts-ignore
                        onButtonPress({numberPress: x})
                    }
                }} key={x} style={{...tw`items-center justify-center`, height: (Dimensions.get('screen').height * 0.30) / 4, width: (Dimensions.get('screen').width * 0.99) / (x === 'ENTER' ? 2 : 4)}}>
                    {/* @ts-ignore */}
                    {ButtonMapping[x] ? ButtonMapping[x] : <Text weight='bold' h5>{x}</Text>}
                </TouchableOpacity>
            })}
        </DView>
      </ScrollView>
    );
}



export const LogFoodKeyboardAccessory = (props: INutritionKeyboardProps) => {
    let [open, setOpen] = useState<boolean>(false);
    let insets = useSafeAreaInsets()
    let ref = useRef<TextInput | null>(null);
    let [stringValue, setStringValue] = useState<string>('')
    let value = useMemo<number | null>(() => (FractionInput(stringValue)), [stringValue])
    let onServingChange = (v: string) => {
        props.onServingChange && props.onServingChange(v)
    }
    let onEnterPress = () => {
        if (props.onEnterPress) props.onEnterPress();
        Keyboard.KeyboardUtils.dismiss()
    }
    let servingSizes = useMemo(() => {
        return {...(props.servingSizes || {}), ...ConversionChart}
      }, [props.servingSizes])
      let selectedServingSize = useMemo(() => {
        return props.selectedServingSize || Object.keys(ConversionChart)[0]
      }, [props.selectedServingSize])

    useEffect(() => {
        if (value && props.onNumberChange) {props.onNumberChange(value)}
    }, [value])

    useEffect(() => {
        if (props.initialValue) {setStringValue(`${props.initialValue}`)}
    }, [props.initialValue])
    let s = Dimensions.get('screen')
    
    return <KeyboardAccessoryView
    renderContent={() => {
       
        return <View style={{flex: 1, backgroundColor: _tokens.dark1, ...tw`px-2`}}>
            <View style={{flex: 1, paddingTop: 16, paddingBottom: open ? 16 : insets.bottom + 10, ...tw`flex-row items-center justify-between`}}>
        <Pressable style={[tw`w-9/12 rounded-lg px-2 flex-row items-center`, {backgroundColor: _tokens.dark2, height: s.height * 0.055}]} onPress={() => {
            setOpen(true)
        }}>
            <Text>{stringValue} {props.selectedServingSize && `(${props.selectedServingSize})`}</Text>
            <TextInput style={{width: 0}} ref={ref} />
        </Pressable>
        <Pressable onPress={open ? Keyboard.KeyboardUtils.dismiss :  onEnterPress} style={[tw`w-2.5/12 px-1 items-center justify-center rounded-lg`, {height: s.height * 0.055}, !open && {backgroundColor: _tokens.primary900}]}>
            <Text xl weight='bold' style={tw`text-white`}>{open ? 'Done' : 'Log'}</Text>
        </Pressable>
    </View>
    {open && <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{maxHeight: 40, marginBottom: 5}}>
            {Object.keys(servingSizes).map(x => {
                let selected = x == selectedServingSize
                return <TouchableOpacity onPress={() => {
                    onServingChange(x)
                }} key={x} style={{...tw`px-2 mx-1 items-center justify-center rounded-2xl`, backgroundColor: selected ? _tokens.dark3 : _tokens.dark5, height: 40}}>
                    {/* @ts-ignore */}
                    <Text weight='semibold'>{x} {`(${Math.round(servingSizes[x] || 1)}g)`}</Text>
                </TouchableOpacity>
            })}
        </ScrollView>}
    </View>
    }}
    kbInputRef={ref}
    kbComponent={open ? 'KeyboardView' : undefined}
    kbInitialProps={props}
    onKeyboardResigned={() => setOpen(false)}
    onRequestShowKeyboard={() => setOpen(true)}
    onItemSelected={(item, args: INutritionKeyboardButtonPress) => {
        if (args.buttonPress) {
            if (args.buttonPress === 'ENTER') {
                onEnterPress()
            } else if (args.buttonPress !== 'BACK') {
                setStringValue(p => p + args.buttonPress)
            } else if (args.buttonPress === 'BACK') {
                setStringValue(p => {
                    if (p.length === 0) return p;
                    return p.slice(0, -1); 
                })
            }
        } else if (args.servingSizePress) {
            onServingChange(args.servingSizePress)
        } else if (args.numberPress || args.numberPress === 0) {
            setStringValue(p => p + args.numberPress?.toString())
        }
    }}
    revealKeyboardInteractive
    useSafeArea={false}

 />
}

