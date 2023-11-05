import { Switch, TouchableOpacity } from 'react-native'
import React, { useMemo, useState } from 'react'
import { Text, View } from '../../components/base/Themed'
import tw from 'twrnc'
import { useNavigation } from '@react-navigation/native'
import { ExpoIcon } from '../../components/base/ExpoIcon'
import { useCommonAWSIds } from '../../hooks/useCommonContext'
import { BackButton } from '../../components/base/BackButton'
import { UserQueries } from '../../types/UserDao'

export interface AppSetting {
    title: string;
    icon: string;
    iconName?: "line" | "feather" | "material" | "ion" | "oct" | "fa5";
    size?: number;
    screen?: string;
    payload?: any;
    switch?: boolean;
    switchValue?: boolean;
    onSwitch?: (b: boolean) => void;
}

export default function Settings() {
    const { status, subscribed, userId, profile, setProfile } = useCommonAWSIds()
    const navigator = useNavigation()
    let dao = UserQueries()
    let settings = useMemo(() => {
        console.log(profile?.workoutMode)
        return [
            { title: 'Manage Account', icon: 'unlock', screen: 'Account' },
            { title: 'Content Creator Hub', icon: 'briefcase', screen: 'Apply' },
            {title: 'Video Workout Mode', icon: 'grid', switch: true, switchValue: (profile?.workoutMode === 'MUSIC')  ? true : false, onSwitch: async (b) => {
                if (!profile) return;
                let res = await dao.update(profile.id, {workoutMode: b ? 'MUSIC' : 'DEFAULT'})
                if (res) setProfile(res)
            } },
            { title: 'Update Goal', icon: 'bar-chart', screen: 'Setup' },
            // { title: 'My Pantry', icon: 'cart', iconName: 'ion', screen: 'Pantry' },
            // { title: 'Manage Allergies', icon: 'warning', iconName: 'ion', screen: 'Allergens' },
            { title: subscribed ? 'Subscribe or Remove Ads' : 'Manage Subscription', icon: 'tag', screen: 'Subscription' },
            { title: 'Help', icon: 'file-text', screen: 'Help', payload: { personal: true } },
            { title: 'About', icon: 'info', screen: 'About', payload: { personal: true } }
        ]
    }, [profile])
    return (
        <View style={{flex: 1}} includeBackground>
            <BackButton name='Settings' />
            <View style={tw`w-12/12 px-4 mt-4`}>
                {settings.map((setting, i) => {
                    if (setting.switch) console.log(setting)
                    return <TouchableOpacity
                        onPress={() => {
                            if (setting.screen) {
                                //@ts-ignore
                                navigator.push(setting.screen, setting.payload || {})
                            }
                        }}
                        key={i} disabled={!setting.screen!!} style={tw`w-12/12 p-2 my-2 flex-row items-center justify-between`}>
                        <View style={tw`flex-row`}>
                            <ExpoIcon name={setting.icon} iconName={setting.iconName || 'feather'} size={setting.size || 20} color='gray' />
                            <Text style={tw`max-w-11/12 ml-3`}>{setting.title}</Text>
                        </View>
                        {setting.switch && <Switch trackColor={{
                            true: 'red'
                        }} value={setting.switchValue} onValueChange={(x) => {
                            setting.onSwitch && setting.onSwitch(x)
                        }} />}
                        {!setting.switch && <ExpoIcon name='chevron-right' iconName={'feather'} size={15} color='gray' />}
                    </TouchableOpacity>
                })}
            </View>
        </View>
    )
}