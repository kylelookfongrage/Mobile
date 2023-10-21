import React from 'react'
import tw from 'twrnc'
import { TouchableOpacity, useColorScheme } from 'react-native'
import { Text, View } from './Themed'
import { ExpoIcon } from './ExpoIcon'
import { useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BackgroundGradient from '../screens/BackgroundGradient'



interface BackButtonProps {
    name?: string; 
    func?: () => void;
    inplace?: boolean;
    replacePop?: boolean;
    Right?: React.JSXElementConstructor<any>;
}

export const BackButton = (props: BackButtonProps) => {
    const {func, Right} = props;
    const insets = useSafeAreaInsets().top
    const dm = useColorScheme() === 'dark';
    const navigator = useNavigation()
    return <View style={[tw`flex-row items-center justify-between px-4 pb-2 w-12/12`, {paddingTop: insets, ...(props.inplace && {position: 'absolute', top: 0, zIndex: 1})}]}>
    <View style={tw`flex-row items-center`}>
    <TouchableOpacity
        onPress={() => {
            func && func()
            if (!props.replacePop) {
                navigator.goBack()
            }
        }}
        >
            <View card style={[tw`p-2 flex-row items-center rounded-lg`, {}]}>
                <ExpoIcon name='chevron-left' iconName='feather' size={25} style={tw`mr-.5`} color={'gray'} />
            </View>
    </TouchableOpacity>
    {props.name && <Text style={tw`ml-2`} weight='semibold'>{props.name}</Text>}
    </View>
    {Right && <Right />}
    </View>
}