import { View, Text } from '../../components/base/Themed'
import React, { useEffect, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import tw from 'twrnc'
import AnimatedLottieView from 'lottie-react-native'
import loadingFruit from '../../assets/animations/loading_fruit.json'
import { sleep } from '../../data'
import Animated, { FadeOut } from 'react-native-reanimated'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { useColorScheme } from 'react-native'
import { useNavigation } from '@react-navigation/native'

export default function OnboardingComplete() {
    const p = useSafeAreaInsets()
    const [loading, setLoading] = useState<boolean>(true)
    const navigator = useNavigation()
    const dm = useColorScheme() === 'dark'
    useEffect(() => {
        sleep(3000).then(x => setLoading(false))
    }, [])
  return (
    <View includeBackground style={[{flex: 1, paddingTop: p.top}, tw`px-6 items-center justify-center`]}>
      <Text style={tw`text-center text-2xl`} weight='bold'>{loading ? 'Welcome' : 'Congratulations'}</Text>
      <Text style={tw`mt-6 text-gray-500 text-center text-xs`}>{loading ? 'We have recieved your information, please wait while we personalize Rage based on your preferences. This may take some time.' : "You are all set!"}</Text>
      {loading && <Animated.View exiting={FadeOut} style={tw`items-center justify-center`}>
        <AnimatedLottieView source={loadingFruit} autoPlay loop style={tw`h-90`} />
      </Animated.View>}
      {!loading && <View style={tw`h-90 items-center justify-center`}>
        <TouchableOpacity onPress={() => {
            navigator.navigate('Root')
        }} style={tw`h-15 w-40 rounded-2xl items-center justify-center bg-red-${dm ? '600' : '500'}`}>
            <Text style={tw`text-white`} weight='semibold'>Finish</Text>
        </TouchableOpacity>
        </View>}
    </View>
  )
}