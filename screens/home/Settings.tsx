import { Switch, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { Text, View } from '../../components/Themed'
import tw from 'twrnc'
import { useNavigation } from '@react-navigation/native'
import { ExpoIcon } from '../../components/ExpoIcon'
import { useCommonAWSIds } from '../../hooks/useCommonContext'
import { BackButton } from '../../components/BackButton'
import { useProgressValues } from '../../hooks/useProgressValues'
import { WorkoutMode } from '../../data'
import { DataStore } from 'aws-amplify'
import { User } from '../../aws/models'

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
    const { status, subscribed, userId } = useCommonAWSIds()
    const navigator = useNavigation()
    const {selectedWorkoutMode} = useProgressValues({metrics: true})
    React.useEffect(() => {
        setSettings([...settings].map(z => {
            if (z.title === 'Default Workout Mode') {
                return {...z, switchValue: !selectedWorkoutMode || (selectedWorkoutMode === WorkoutMode.default)}
            }
            return z
        }))
    }, [selectedWorkoutMode])
    const s: AppSetting[] = [
        { title: 'Manage Account', icon: 'unlock', screen: 'Account' },
        { title: 'Content Creator Hub', icon: 'briefcase', screen: 'Apply' },
        {title: 'Default Workout Mode', icon: 'grid', switch: true, switchValue: false, onSwitch: async (b) => {
            const ogUser = await DataStore.query(User, userId)
            if (ogUser){
                await DataStore.save(User.copyOf(ogUser, x=>{
                    x.workoutMode=(b === false ? WorkoutMode.player : WorkoutMode.default)
                }))
            }
        } },
        { title: 'Update Goal', icon: 'bar-chart', screen: 'Setup' },
        { title: subscribed ? 'Subscribe or Remove Ads' : 'Manage Subscription', icon: 'tag', screen: 'Subscription' },
        { title: 'Help', icon: 'file-text', screen: 'Help', payload: { personal: true } },
        { title: 'About', icon: 'info', screen: 'About', payload: { personal: true } }
    ]
    const [settings, setSettings] = useState<AppSetting[]>(s)
    return (
        <View style={{flex: 1}} includeBackground>
            <BackButton name='Settings' />
            <View style={tw`w-12/12 px-4 mt-4`}>
                {settings.map((setting, i) => {
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
                        }} value={setting.switchValue || false} onValueChange={(x) => {
                            setting.onSwitch && setting.onSwitch(x)
                        }} />}
                        {!setting.switch && <ExpoIcon name='chevron-right' iconName={'feather'} size={15} color='gray' />}
                    </TouchableOpacity>
                })}
            </View>
        </View>
    )
}