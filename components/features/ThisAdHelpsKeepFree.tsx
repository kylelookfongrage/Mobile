import { Platform, View, useColorScheme } from 'react-native'
import React from 'react'
import tw from 'twrnc'
import { Text } from '../base/Themed';

import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import {Env} from '../../env'
import { useSelector } from '../../redux/store';
import { _tokens } from '../../tamagui.config';
import Spacer from '../base/Spacer';

const adUnitId = TestIds.BANNER // (Platform.OS === 'android' ? Env.GOOGLE_AD_UNIT : Env.APPLE_AD_UNIT) || TestIds.BANNER

export default function ThisAdHelpsKeepFree(props: {size?: string, disableAbsolute?: boolean, addedPb?: boolean}) {
    const {subscribed} = useSelector(x => x.auth)
    let dm = useColorScheme() === 'dark'
    if (subscribed) return <View />;
    return (
        <View style={{...tw`mx-2 items-center justify-center pt-1 pb-1 mb-${props.addedPb ? '6' : '3'} rounded-xl`, backgroundColor: dm ? _tokens.dark1 : _tokens.gray50 }}>
            <Text sm style={tw`text-gray-500 mt-2`}>This ad helps keep Rage free!</Text>
            <Spacer sm />
            <BannerAd
                unitId={adUnitId}
                size={props.size || BannerAdSize.LARGE_BANNER}
                requestOptions={{
                    requestNonPersonalizedAdsOnly: true,
                }}
            />
        </View>
    )
}