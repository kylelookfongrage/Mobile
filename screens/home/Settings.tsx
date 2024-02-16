import { Switch, TouchableOpacity, useColorScheme } from 'react-native'
import React, { useMemo, useState } from 'react'
import { Text, View } from '../../components/base/Themed'
import tw from 'twrnc'
import { useNavigation } from '@react-navigation/native'
import { ExpoIcon, Icon } from '../../components/base/ExpoIcon'
import { BackButton } from '../../components/base/BackButton'
import { useSelector } from '../../redux/store'
import { _tokens } from '../../tamagui.config'
import Spacer from '../../components/base/Spacer'

export interface AppSetting {
    title: string;
    icon?: string;
    iconName?: "line" | "feather" | "material" | "ion" | "oct" | "fa5";
    size?: number;
    screen?: string;
    payload?: any;
    switch?: boolean;
    description?: string;
    switchValue?: boolean;
    onSwitch?: (b: boolean) => void;
    onPress?: (navigator?: any) => void;
    dangerous?: boolean
}

export default function Settings() {
    let {profile, subscribed} = useSelector(x => x.auth)
    let settings = useMemo(() => {
        return [
            { title: 'Account & Security', icon: 'Shield-Done', screen: 'Account' },
            { title: 'Edit Profile', icon: 'Edit-Square', screen: 'UserBio' },
            { title: 'Rage Premium', icon: 'Star', screen: 'Subscription' },
            { title: 'Content Creator Hub', icon: 'Wallet', screen: 'Apply', description: (profile?.stripeId ? 'View and manage your business on Rage' : 'Sign up for the Content Creator Program at Rage') },
            // {title: 'Video Workout Mode', icon: 'grid', switch: true, switchValue: (profile?.workoutMode === 'MUSIC')  ? true : false, onSwitch: async (b) => {
            //     if (!profile) return;
            //     let res = await dao.update(profile.id, {workoutMode: b ? 'MUSIC' : 'DEFAULT'})
            //     if (res) setProfile()
            // } },
            // { title: 'My Pantry', icon: 'cart', iconName: 'ion', screen: 'Pantry' },
            // { title: 'Manage Allergies', icon: 'warning', iconName: 'ion', screen: 'Allergens' },
            
            { title: 'Help', icon: 'Document', description: 'FAQ\'s about the app!', screen: 'Help', payload: { personal: true } },
            { title: 'About', icon: 'Info-Square', description: 'Attributions and credits', screen: 'About', payload: { personal: true } },
            // { title: 'Test AI Camera', icon: 'info', screen: 'AICamera', payload: { personal: true } }
        ]
    }, [profile, subscribed])
    return (
        <View style={{flex: 1}} includeBackground>
            <BackButton name='Settings' />
            <View style={tw`w-12/12 px-4 mt-4`}>
                {settings.map((setting, i) => {
                    return <SettingItem setting={setting} key={i} />
                })}
            </View>
        </View>
    )
}


export const SettingItem = (props: {setting: AppSetting, hideCarat?: boolean, disableMargin?: boolean}) => {
    let setting = useMemo(() => props.setting, [props.setting])
    let navigator = useNavigation()
    let dm = useColorScheme() === 'dark'
    return <TouchableOpacity
    onPress={() => {
        if (setting.screen) {
            //@ts-ignore
            navigator.push(setting.screen, setting.payload || {})
        }
        if (setting.onPress){
            setting.onPress(navigator)
        }
    }}
     disabled={!setting.screen!! && !setting.onPress} style={{...tw` pt-2 pb-1 ${props.disableMargin ? '' : 'my-2'} flex-row items-center justify-between`}}>
    <View style={tw`flex-row ${(setting.description ? '' : 'items-center')}`}>
        {setting.icon && <Icon name={setting.icon} size={25} color={dm ? _tokens.white : _tokens.black}/>}
        {setting.icon && <Spacer horizontal/>}
        <View style={tw`${setting.icon ? 'w-9/12' : 'w-10.5/12'}`}>
        <Text lg weight='bold' style={tw`max-w-11/12 ${setting.dangerous ? 'text-red-500' : ''}`}>{setting.title}</Text>
        {setting.description && <Text style={tw`max-w-11/12 mt-1 text-gray-${dm ? '400' : '500'}`}>{setting.description}</Text>}
        </View>
    </View>
    {(setting.switch || setting.onSwitch) && <Switch style={{...tw`pr-10`}} trackColor={{false: undefined, true: _tokens.primary900}} value={setting.switchValue} onValueChange={setting.onSwitch} />}
    {!(props.hideCarat || setting.switch) && <ExpoIcon name='chevron-right' iconName={'feather'} size={25} color='gray' />}
</TouchableOpacity>
}