import React from 'react'
import tw from 'twrnc'
import { TouchableOpacity, useColorScheme } from 'react-native'
import { Text, View } from './Themed'
import { ExpoIcon, Icon } from './ExpoIcon'
import { useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BackgroundGradient from '../screens/BackgroundGradient'



interface BackButtonProps {
    name?: string; 
    func?: () => void;
    inplace?: boolean;
    replacePop?: boolean;
    exlucdeSafeArea?: boolean;
    Right?: React.JSXElementConstructor<any>;
    style?: any;
}

export const BackButton = (props: BackButtonProps) => {
    const {func, Right} = props;
    const insets = props.exlucdeSafeArea ? 0 : useSafeAreaInsets().top
    const dm = useColorScheme() === 'dark';
    const navigator = useNavigation()
    return <View style={[tw`flex-row items-center justify-between pb-1 pl-2`, {paddingTop: insets, ...(props.Right && {width: '100%'}), ...(props.inplace && {position: 'absolute', top: 0, zIndex: 100})}]}>
    <View style={[tw`flex-row items-center`, props.style]}>
    <TouchableOpacity
        onPress={() => {
            func && func()
            if (!props.replacePop) {
                navigator.goBack()
            }
        }}
        >
            <Icon name='Arrow---Left' size={28} style={tw`mr-.5`} color={dm ? "white" : 'black'} />
    </TouchableOpacity>
    {props.name && <Text xl style={tw`ml-2`} weight='semibold'>{props.name}</Text>}
    </View>
    {Right && <Right />}
    </View>
}