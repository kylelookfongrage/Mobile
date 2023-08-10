import React from 'react'
import tw from 'twrnc'
import { TouchableOpacity, useColorScheme } from 'react-native'
import { Text, View } from './Themed'
import { ExpoIcon } from './ExpoIcon'
import { useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BackgroundGradient from './BackgroundGradient'



interface BackButtonProps {
    name?: string; 
    func?: () => void;
    Right?: React.JSXElementConstructor<any>;
}

export const BackButton = (props: BackButtonProps) => {
    const {func, Right} = props;
    const insets = useSafeAreaInsets().top
    const dm = useColorScheme() === 'dark';
    const navigator = useNavigation()
    return <View style={[tw`flex-row items-center justify-between px-4 pb-2 w-12/12`, {paddingTop: insets, position: 'absolute', top: 0, zIndex: 1}]}>
    <TouchableOpacity
        onPress={() => {
            func && func()
             //@ts-ignore
            navigator.pop()
        }}
        style={[tw`p-2.5 bg-gray-500 rounded-xl`, {
        }]}>
        <ExpoIcon name='chevron-left' iconName='feather' size={25} color={'white'} />
    </TouchableOpacity>
    {Right && <Right />}
    </View>
}