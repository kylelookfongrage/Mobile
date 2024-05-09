import React, { useRef, useState } from 'react'
import tw from 'twrnc'
import { BackButton } from '../../components/base/BackButton'
import { View, Text } from '../../components/base/Themed'
// import {Camera, useCameraDevice} from 'react-native-vision-camera'
import { NothingToDisplay } from '../base/Toast'

export default function AICamera() {
    // let device = useCameraDevice('front')
    // if (!device) return <View style={{flex: 1}} includeBackground>
    //     <BackButton />
    //     <NothingToDisplay text='No devices to use for camera' />
    // </View>
    return (
        <View includeBackground style={{ flex: 1 }}>
            <BackButton inplace />
            {/* <Camera device={device} isActive={false} /> */}
        </View>
    )
}