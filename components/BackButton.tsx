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
    return <View style={[tw`flex-row items-center justify-between px-4 pb-2`, {paddingTop: insets}]}>
    <TouchableOpacity
        onPress={() => {
            func && func()
             //@ts-ignore
            navigator.pop()
        }}
        style={[tw`flex flex-row flex-row items-center justify-center`, {
        }]}>
        <ExpoIcon name='chevron-left' iconName='feather' size={25} color={dm ? 'white' : 'black'} />
        <Text weight='semibold' style={tw``}>{props.name || 'Back'}</Text>
    </TouchableOpacity>
    {Right && <Right />}
    </View>
}