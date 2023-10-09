import { TouchableOpacity, useColorScheme } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text, View } from '../../components/base/Themed'
import tw from 'twrnc'
import AnimatedLottieView from 'lottie-react-native'
import trophy from '../../assets/animations/trophy.json'
import { useNavigation } from '@react-navigation/native'
import ThisAdHelpsKeepFree from '../../components/features/ThisAdHelpsKeepFree'
import { useCommonAWSIds } from '../../hooks/useCommonContext'
import { sleep } from '../../data'

export default function FinishedExercise() {
    const dm = useColorScheme() === 'dark'
    const navigator = useNavigation()
    const {subscribed} = useCommonAWSIds()
    const [canMove, setCanMove] = useState<boolean>(false)
    let [time, setTime] = useState<number>(0)
    let waitTime = 5
    React.useEffect(() => {
        if (subscribed) {
            setCanMove(true)
        }
    }, [subscribed])
    React.useEffect(() => {
        setTimeout(() => {
            if (time < waitTime){
                setTime(time + 1)
            } else {
                setCanMove(true)
            }
        }, 1000);
    })
    let buttonColor = canMove ? (dm ? 'red-600' : "red-500") : (dm ? 'red-600/40' : 'red-500/40')
    return (
        <View style={[tw`px-4`, {flex: 1}]} includeBackground>
            <SafeAreaView style={tw`justify-between h-12/12 flex`}>
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
                <TouchableOpacity 
                disabled={!canMove}
                onPress={() => {
                    navigator.navigate('Root')
                }} style={tw`bg-${buttonColor} px-5 mx-9 h-12 justify-center rounded-xl`}>
                    <Text numberOfLines={1} style={tw`text-center text-white`} weight='semibold'>Go Home {(waitTime > time && !subscribed) && (waitTime - time)}</Text>
                </TouchableOpacity>
            </SafeAreaView>
        </View>
    )
}