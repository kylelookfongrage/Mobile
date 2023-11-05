import { ActivityIndicator, ScrollView, TouchableOpacity, useColorScheme } from 'react-native'
import React, { useEffect, useState } from 'react'
import {View, Text} from '../../components/base/Themed'
import tw from 'twrnc'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { animationMapping } from '../../data'
import AnimatedLottieView from 'lottie-react-native'
import { useCommonAWSIds } from '../../hooks/useCommonContext'
import { UserQueries } from '../../types/UserDao'

export default function SelectSprite() {
    const dm = useColorScheme() === 'dark'
    const padding = useSafeAreaInsets()
    const {userId, profile, setProfile} = useCommonAWSIds()
    let selectedAnimation = profile?.sprite
    let dao = UserQueries(false)
    const [newAnimation, setNewAnimation] = useState<string | null>(null)
    const [uploading, setUploading] = useState<boolean>(false)
    useEffect(() => {
        if(selectedAnimation) {
            setNewAnimation(selectedAnimation)
        }
    }, [selectedAnimation])
    const onFinish = async () => {
        setUploading(true)
        if (!profile) return;
        try {
            let res = await dao.update_profile({sprite: newAnimation}, profile)
            if (res) setProfile(res)
            //@ts-ignore
            navigator.pop()
        } catch (error) {
            setUploading(false)
            alert('There was a problem please try again')
        }
    }
    const navigator = useNavigation()
    return <View style={[tw`bg-gray-${dm ? '800' : '200'}/95`, {paddingTop: padding.top, flex: 1}]}>
    <ScrollView>
      <View style={tw`flex-row items-center justify-center flex-wrap w-12/12 mt-12`}>
      {animationMapping.map(x => {
        const selected = (newAnimation === x.name || (!newAnimation && x.name === 'Dog Run'))
        const selectedTextColor = dm ? 'white' : 'black'
        return <TouchableOpacity key={x.name} style={tw`items-center justify-center mx-3 my-2`} onPress={() => setNewAnimation(x.name)}>
            <AnimatedLottieView
                autoPlay
                style={tw`h-25 w-25 bg-transparent`}
                source={x.animation}
            />
            <Text style={tw`text-${selected ? selectedTextColor : 'gray-500'}`} weight={selected ? 'semibold' : 'regular'}>{x.name}</Text>
        </TouchableOpacity>
      })}
      </View>
      {(newAnimation && newAnimation !== selectedAnimation) && <View style={tw`w-12/12 items-center justify-center mt-4`}>
        <TouchableOpacity onPress={onFinish} style={tw`px-9 py-3 rounded-2xl bg-red-500 items-center justify-center`}>
            <Text weight='bold' style={tw`text-white`}>Finish</Text>
        </TouchableOpacity>
        </View>}
    </ScrollView>
    {/* @ts-ignore */}
    <TouchableOpacity disabled={uploading} onPress={() => navigator.pop()} style={[{paddingBottom: padding.bottom + 20}, tw`px-3 pt-3`]}>
      {!uploading && <Text style={tw`text-center text-gray-500 text-lg`} weight='bold'>Close</Text>}
      {uploading && <ActivityIndicator />}
    </TouchableOpacity>
  </View>
}