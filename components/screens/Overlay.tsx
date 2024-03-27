import { View as DefaultView, useColorScheme } from 'react-native'
import React, { ForwardedRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { Incubator } from 'react-native-ui-lib'
import { Portal, PortalHost } from '@gorhom/portal';

import Colors from '../../constants/Colors';
import tw from 'twrnc'
import { View } from '../base/Themed';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { _tokens } from '../../tamagui.config';
import { forwardRef } from 'react';
import { useGet } from '../../hooks/useGet';

export type TRefOverlay = {
    expand(): void;
    close(): void;
    snapTo(position: string | number, index?: boolean): void;
    minimize(): void;
    minimizeAndDisable(): void;
    disable(v: boolean): void;

}

export default forwardRef(function Overlay(props: {bg?: string; disableClose?: boolean; id?: string; visible?: boolean; snapPoints?: string[]; disablePadding?: boolean; onDismiss?: (b?: boolean) => void, excludeBanner?: boolean, dialogueHeight?: number | string, dynamicHeight?: boolean} & DefaultView['props'], ref: ForwardedRef<TRefOverlay>) {
    let g = useGet()
    let h = g.s.height
    const getTotalHeight = (x: string | number) => {
        if (typeof x === 'string' && x.includes('%')) {
            return h * ((parseFloat(x) || 0) / 100)
        } else if (typeof x === 'string') {
            return parseFloat(x) || 0
        } else {return x}

    }
    const color = props.bg || g.modalBg;
    const bottomSheetRef = useRef<BottomSheet>(null);
    let dismiss = () => (props.onDismiss && props.onDismiss(false));
    let [disabled, setDisabled] = useState(false)
    const snapPoints = useMemo(() => {
        if (props.snapPoints) {
            console.log('props.snapPoints', props.snapPoints, '-', props.id)
            return props.snapPoints.sort((a,b) => getTotalHeight(a) - getTotalHeight(b))
        } else if (props.dialogueHeight) {
            console.log('props.dialogueHeight', props.dialogueHeight, '-', props.id)
            return [`${props.dialogueHeight}%`]
        } else {
            console.log('no height provided, default 70%','-', props.id)
            return ['70%']
        }
    }, [props.snapPoints, props.dialogueHeight, props.disableClose])

    useEffect(() => {
        if (props.visible) {
            bottomSheetRef.current?.expand();
            setDisabled(false)
        } else {
            bottomSheetRef.current?.close();
            // setDisabled(true)
        }
    }, [props.visible])

    useImperativeHandle(ref, () => {
        return {
            expand(){
                bottomSheetRef.current?.expand();
            },
            close(){
                bottomSheetRef.current?.close();
                dismiss();
            },
            snapTo(position: string | number, index: boolean=false){
                if (index && typeof position === 'number') {
                    bottomSheetRef.current?.snapToIndex(position)
                } else {
                    bottomSheetRef?.current?.snapToPosition(position);
                }
            },
            minimize(){
                bottomSheetRef.current?.collapse()
            }, 
            minimizeAndDisable(){
                console.log('minimizing')
                bottomSheetRef.current?.collapse();
                setDisabled(true);
            },
            disable(v=false){
                setDisabled(v);
            }
        }
    }, [snapPoints, disabled, props.disableClose])
    console.log('snapPoints', snapPoints, '-', props.id)
    return (
        <Portal>
        <BottomSheet
            ref={bottomSheetRef}
            snapPoints={snapPoints}
            index={-1}
            handleIndicatorStyle={props.excludeBanner ? {opacity: 0} : {backgroundColor: g.dm ? _tokens.gray500 : _tokens.dark1}}
            enableHandlePanningGesture={!disabled}
            enableContentPanningGesture={!disabled}
            backgroundStyle={{backgroundColor: color}}
            bottomInset={0}
            style={{paddingHorizontal: 10}}
            enablePanDownToClose={!props.disableClose}
            onChange={(e) => {
                if (e === -1 && props.onDismiss) {props.onDismiss(false)}
            }}
        >
           <View style={[props.style, {flex: 1}]} >
                <BottomSheetScrollView showsVerticalScrollIndicator={false} keyboardDismissMode={'interactive'}>
                {props.children}
                </BottomSheetScrollView>
            </View>
        </BottomSheet>
        {props.id && <PortalHost name={props.id} />}
        </Portal>
    )
})