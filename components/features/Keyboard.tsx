import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TouchableOpacity, ScrollView, Pressable, Dimensions, View as DView, useColorScheme } from 'react-native';
import { Keyboard } from 'react-native-ui-lib';
import { View, Text } from '../base/Themed';
import tw from 'twrnc'
import { _tokens } from '../../tamagui.config';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TextInput } from 'react-native-gesture-handler';
import { ConversionChart, FractionInput } from '../../data';
import { ExpoIcon } from '../base/ExpoIcon';
import { useFonts } from 'expo-font';
import Overlay, { TRefOverlay } from '../screens/Overlay';
import { HideView } from '../base/Selector';

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
    onOpen?: () => void;
    onClose?: () => void;
    onButtonPress?: (v: INutritionKeyboardButtonPress) => void;
    onDismissPress?: () => void;
    visible?: boolean;
}


export const LogFoodKeyboardAccessory = (props: INutritionKeyboardProps) => {
    let [open, setOpen] = useState<boolean>(false);
    let insets = useSafeAreaInsets()
    let ref = useRef<TextInput | null>(null);
    let overlayRef = useRef<TRefOverlay | null>(null);
    let [stringValue, setStringValue] = useState<string>('')
    let value = useMemo<number | null>(() => (FractionInput(stringValue)), [stringValue])
    let _dismiss = () => { overlayRef.current?.snapTo(0, true) }
    let _expand = () => { overlayRef?.current?.snapTo(0, true) }
    let onServingChange = (v: string) => {
        props.onServingChange && props.onServingChange(v)
    }
    let onEnterPress = () => {
        if (props.onEnterPress) props.onEnterPress();
        setOpen(false)
    }
    let servingSizes = useMemo(() => {
        return { ...(props.servingSizes || {}), ...ConversionChart }
    }, [props.servingSizes])
    let selectedServingSize = useMemo(() => {
        return props.selectedServingSize || Object.keys(ConversionChart)[0]
    }, [props.selectedServingSize])

    useEffect(() => {
        if (value && props.onNumberChange) { props.onNumberChange(value) }
    }, [value])

    useEffect(() => {
        if (props.initialValue) { setStringValue(`${props.initialValue}`) }
    }, [props.initialValue])

    let s = Dimensions.get('screen')
    let dm = useColorScheme() === 'dark'
    let selectedColor = _tokens.primary900
    let unselectedColor = dm ? _tokens.dark3 : _tokens.gray300

    let SpaceIcon = () => (<ExpoIcon iconName='material' name='space-bar' size={25} color={dm ? 'white' : 'black'} />)
    let BackIcon = () => (<ExpoIcon iconName='material' name='backspace' size={25} color={dm ? 'white' : 'black'} />)
    let LogButton = () => {
        return <DView style={[tw`items-center justify-center rounded-lg`, { width: (Dimensions.get('screen').width * 0.9) / (4), height: (Dimensions.get('screen').height * 0.26) / 4.5 }]}>
            <ExpoIcon iconName='material' name='keyboard-hide' size={25} color={'white'} />
        </DView>
    }

    let EnterButton = () => {
        return <DView style={[tw`items-center justify-center rounded-lg`, { backgroundColor: _tokens.primary900, width: (Dimensions.get('screen').width * 0.9) / (2), height: (Dimensions.get('screen').height * 0.26) / 4.5 }]}>
            <Text bold style={tw`text-white`} lg>Save</Text>
    </DView>
    }

    let ButtonMapping: { [k: keyof INutritionKeyboardButtonPress['buttonPress']]: () => React.JSXElementConstructor<any> } = {
        ' ': <SpaceIcon />,
        'BACK': <BackIcon />,
        'DISMISS': <LogButton />,
        'ENTER': <EnterButton />
    }


    useEffect(() => {
        if (open) {
            props.onOpen && props.onOpen()
        } else {
            props.onClose && props.onClose()
            _dismiss()
        }
    }, [open])
    let _index = useMemo(() => 0, [props.visible])
    console.log({visibile: props.visible})

    return <Overlay ignoreBackdrop id='nutrition-keyboard' index={_index} dialogueHeight={'15'} visible={props.visible === false ? false : true} disableClose snapPoints={open ? ['55%'] : undefined} excludeBanner style={{ flex: 1, backgroundColor: dm ? _tokens.dark1 : _tokens.gray100 }} >
        <View style={{ flex: 1, paddingTop: 16, paddingBottom: open ? 16 : insets.bottom + 10, ...tw`flex-row items-center justify-between -mt-3` }}>
            <Pressable style={[tw`w-9/12 rounded-lg px-2 flex-row items-center`, { backgroundColor: dm ? _tokens.dark2 : _tokens.gray300, height: s.height * 0.055 }]} onPress={() => {
                _expand(); setOpen(true)
            }}>
                <Text lg>{stringValue} {props.selectedServingSize && `(${props.selectedServingSize})`}</Text>
                <TextInput onFocus={() => {
                    _expand(); setOpen(true)
                }} style={{ width: 0 }} ref={ref} />
            </Pressable>
            <Pressable onPress={open ? () => setOpen(false) : onEnterPress} style={[tw`w-2.5/12 px-1 items-center justify-center rounded-lg`, { height: s.height * 0.055 }, !open && { backgroundColor: _tokens.primary900 }]}>
                {!open && <Text lg weight='bold' style={tw`text-${(open && !dm) ? 'black' : 'white'}`}>{open ? 'Done' : 'Save'}</Text>}
                {open && <ExpoIcon iconName='material' name='keyboard-hide' size={25} color={dm ? "white" : 'black'} />}
            </Pressable>
        </View>
        <HideView hidden={!open}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 40, marginBottom: 5 }}>
                {Object.keys(servingSizes).map(x => {
                    let selected = x == selectedServingSize

                    return <TouchableOpacity onPress={() => {
                        onServingChange(x)
                    }} key={x} style={{ ...tw`px-2 mx-1 items-center justify-center rounded-lg`, backgroundColor: selected ? selectedColor : unselectedColor, height: 40 }}>
                        {/* @ts-ignore */}
                        <Text white={selected} bold={selected}>{x} {`(${Math.round(servingSizes[x] || 1)}g)`}</Text>
                    </TouchableOpacity>
                })}
            </ScrollView>
            <ScrollView scrollEnabled={false} contentContainerStyle={[{ backgroundColor: dm ? _tokens.dark1 : _tokens.gray100, flex: 1 }]}>
            <DView style={{...tw`flex-wrap flex-row self-center`, width: Dimensions.get('screen').width}}>
                {[1, 2, 3, '/', 4, 5, 6, ' ', 7, 8, 9, 'BACK', '.', 0, 'ENTER'].map(x => {
                    return <TouchableOpacity onPress={() => {
                        if (x === 'ENTER') {
                            onEnterPress()
                        } else if (x === 'DISMISS'){
                           setOpen(false)
                        } else if (typeof x === 'string') {
                            if (x === 'BACK') {
                                setStringValue(p => {
                                    if (p.length === 0) return p;
                                    return p.slice(0, -1);
                                })
                            } else {
                                setStringValue(p => p + `${x}`)
                            }
                        } else {
                            setStringValue(p => p + `${x}`)
                        }
                    }} key={x} style={{ ...tw`items-center justify-center`, height: (Dimensions.get('screen').height * 0.3333333) / 4, width: (Dimensions.get('screen').width * 0.99) / (x === 'ENTER' ? 2 : 4) }}>
                        {/* @ts-ignore */}
                        {ButtonMapping[x] ? ButtonMapping[x] : <Text weight='bold' h5>{x}</Text>}
                    </TouchableOpacity>
                })}
            </DView>
        </ScrollView>
        </HideView>

    </Overlay>
}





export const RegisterKeyboard = () => console.log('hi');