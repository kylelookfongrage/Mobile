import { TouchableOpacity } from 'react-native'
import React from 'react'
import { Text, View } from '../../components/Themed'
import tw from 'twrnc'
import { useNavigation } from '@react-navigation/native'
import { ExpoIcon } from '../../components/ExpoIcon'
import { useCommonAWSIds } from '../../hooks/useCommonContext'
import { BackButton } from '../../components/BackButton'

export interface AppSetting {
    title: string;
    icon: string;
    iconName?: "line" | "feather" | "material" | "ion" | "oct" | "fa5";
    size?: number;
    screen: string;
    payload?: any;
}

export default function Settings() {
    const { status, subscribed } = useCommonAWSIds()
    const navigator = useNavigation()
    const settings: AppSetting[] = [
        { title: 'Manage Account', icon: 'unlock', screen: 'Account' },
        { title: 'Content Creator Hub', icon: 'briefcase', screen: 'Apply' },
        { title: subscribed ? 'Subscribe or Remove Ads' : 'Manage Subscription', icon: 'tag', screen: 'Subscription' },
        { title: 'Help', icon: 'file-text', screen: 'Help', payload: { personal: true } },
        { title: 'About', icon: 'info', screen: 'About', payload: { personal: true } }
    ]
    return (
        <View style={{flex: 1}} includeBackground>
            <BackButton name='Settings' />
            <View style={tw`w-12/12 px-4 mt-4`}>
                {settings.map((setting, i) => {
                    return <TouchableOpacity
                        onPress={() => {
                            //@ts-ignore
                            navigator.push(setting.screen, setting.payload || {})
                        }}
                        key={i} style={tw`w-12/12 p-2 my-2 flex-row items-center justify-between`}>
                        <View style={tw`flex-row`}>
                            <ExpoIcon name={setting.icon} iconName={setting.iconName || 'feather'} size={setting.size || 25} color='gray' />
                            <Text style={tw`max-w-11/12 ml-3`}>{setting.title}</Text>
                        </View>
                        <ExpoIcon name='chevron-right' iconName={'feather'} size={20} color='gray' />
                    </TouchableOpacity>
                })}
            </View>
        </View>
    )
}