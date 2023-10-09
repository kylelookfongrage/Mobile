import { Platform, View } from 'react-native'
import React from 'react'
import tw from 'twrnc'
import { Text } from '../base/Themed';

import { BannerAd, TestIds } from 'react-native-google-mobile-ads';
import { useCommonAWSIds } from '../../hooks/useCommonContext';
import {Env} from '../../env'

const adUnitId = (Platform.OS === 'android' ? Env.GOOGLE_AD_UNIT : Env.APPLE_AD_UNIT) || TestIds.BANNER

export default function ThisAdHelpsKeepFree() {
    const {subscribed} = useCommonAWSIds()
    if (subscribed) return <View />;
    return (
        <View style={tw`mx-4 items-center justify-center border rounded-xl border-gray-500`}>
            <Text style={tw`text-xs text-gray-500 mt-2`}>This ad helps keep Rage free!</Text>
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