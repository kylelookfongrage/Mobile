import { TouchableOpacity, useColorScheme, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text } from '../../components/Themed'
import tw from 'twrnc'
import AnimatedLottieView from 'lottie-react-native'
import trophy from '../../assets/animations/trophy.json'
import { useNavigation } from '@react-navigation/native'
import ThisAdHelpsKeepFree from '../../components/ThisAdHelpsKeepFree'

export default function FinishedExercise() {
    const dm = useColorScheme() === 'dark'
    const navigator = useNavigation()
    return (
        <SafeAreaView style={tw`px-4`}>
            <View style={tw`justify-between h-12/12 flex`}>
                <View>
                    <View style={tw`items-center justify-center w-12/12`}>
                        <AnimatedLottieView autoPlay
                            style={tw`h-50 w-50`}
                            // Find more Lottie files at https://lottiefiles.com/featured
                            source={trophy} />
                    </View>
                    <Text style={tw`mt-4 text-xl text-center`} weight='bold'>Congratulations!</Text>
                    <Text style={tw`text-center px-4`}>You have successfully completed a workout or run. Your progress has been saved!</Text>
                </View>
                <ThisAdHelpsKeepFree />
                <TouchableOpacity onPress={() => {
                    navigator.navigate('Root')
                }} style={tw`bg-${dm ? 'red-600' : "red-500"} px-5 mx-9 h-12 justify-center rounded-xl`}>
                    <Text numberOfLines={1} style={tw`text-center text-white`} weight='semibold'>Go Home</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}