import { ActivityIndicator, ScrollView, TouchableOpacity, useColorScheme } from 'react-native'
import React, { useEffect, useState } from 'react'
import {View, Text} from '../../components/base/Themed'
import tw from 'twrnc'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { animationMapping } from '../../data'
import AnimatedLottieView from 'lottie-react-native'
import { UserQueries } from '../../types/UserDao'
import { useDispatch, useSelector } from '../../redux/store'
import { fetchUser } from '../../redux/api/auth'
import { Icon } from '../../components/base/ExpoIcon'
import { BackButton } from '../../components/base/BackButton'
import { XStack } from 'tamagui'
import SaveButton from '../../components/base/SaveButton'
import { _tokens } from '../../tamagui.config'
import Spacer from '../../components/base/Spacer'

export default function SelectSprite() {
    const dm = useColorScheme() === 'dark'
    const padding = useSafeAreaInsets()
    const {profile} = useSelector(x => x.auth)
    let dispatch = useDispatch()
    let setProfile = () => dispatch(fetchUser())
    let selectedAnimation = profile?.sprite
    let dao = UserQueries(false)
    const [newAnimation, setNewAnimation] = useState<string | null>(null)
    const [uploading, setUploading] = useState<boolean>(false)
    useEffect(() => {
        console.log('selected sprite')
        if(selectedAnimation) {
            setNewAnimation(selectedAnimation)
        }
    }, [selectedAnimation])
    const onFinish = async () => {
        setUploading(true)
        if (!profile) return;
        try {
            let res = await dao.update_profile({sprite: newAnimation}, profile)
            if (res) setProfile()
            //@ts-ignore
            navigator.pop()
        } catch (error) {
            setUploading(false)
            alert('There was a problem please try again')
        }
    }
    const navigator = useNavigation()
    
    return <View includeBackground style={[tw``, {flex: 1}]}>
        <BackButton name='Back' />
    <ScrollView>
        <Spacer />
    {animationMapping.map(x => {
        const selected = (newAnimation === x.name) || (!selectedAnimation && !x.animation && !newAnimation)
        const selectedTextColor = dm ? 'white' : 'black'
        return <TouchableOpacity key={x.name} style={{...tw`items-center flex-row mx-3 my-1 py-1 rounded-xl`, backgroundColor: selected ? _tokens.primary900 : undefined}} onPress={() => setNewAnimation(x.animation ? x.name : null)}>
            {x.animation && <AnimatedLottieView
                autoPlay
                style={tw`h-12 w-12 bg-transparent mr-2`}
                source={x.animation}
            />}
            {!x.animation && <Icon name='Image' size={38} style={tw`mx-2`} color={dm ? 'white' : 'black'}/>}
            <Text lg style={tw`text-${selected ? selectedTextColor : 'gray-500'}`} weight={selected ? 'semibold' : 'regular'}>{x.name}</Text>
        </TouchableOpacity>
      })}
    </ScrollView>
    <SaveButton uploading={uploading} safeArea title='Finish' onSave={onFinish} />
  </View>
}