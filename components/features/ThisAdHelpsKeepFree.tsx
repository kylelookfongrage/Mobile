import { Platform, View, useColorScheme } from 'react-native'
import React from 'react'
import tw from 'twrnc'
import { Text } from '../base/Themed';

import { BannerAd, TestIds } from 'react-native-google-mobile-ads';
import {Env} from '../../env'
import { useSelector } from '../../redux/store';
import { _tokens } from '../../tamagui.config';
import Spacer from '../base/Spacer';

const adUnitId = TestIds.BANNER // (Platform.OS === 'android' ? Env.GOOGLE_AD_UNIT : Env.APPLE_AD_UNIT) || TestIds.BANNER

export default function ThisAdHelpsKeepFree() {
    const {subscribed} = useSelector(x => x.auth)
    let dm = useColorScheme() === 'dark'
    if (subscribed) return <View />;
    return (
        <View style={{...tw`mx-4 items-center justify-center py-1 rounded-xl`, backgroundColor: dm ? _tokens.dark1 : _tokens.gray50 }}>
            <Text sm style={tw`text-gray-500 mt-2`}>This ad helps keep Rage free!</Text>
            <Spacer sm />
            <BannerAd
                unitId={adUnitId}
                size={'275x250'}
                requestOptions={{
                    requestNonPersonalizedAdsOnly: true,
                }}
            />
        </View>
    )
}