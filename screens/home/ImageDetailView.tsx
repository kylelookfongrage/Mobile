import { useNavigation } from '@react-navigation/native';
import React from 'react'
import { View, TouchableOpacity } from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExpoIcon } from '../../components/ExpoIcon';
import tw from 'twrnc'
import useColorScheme from '../../hooks/useColorScheme';

export default function ImageDetailView(props: {uris: string[]; defaultIndex: number | undefined}) {
    const {uris, defaultIndex} = props;
    const navigator = useNavigation()
    const dm = useColorScheme() === 'dark'
  return (
    <SafeAreaView edges={['top']} style={[{flex: 1}]}>
      {/* @ts-ignore */}
      <ImageViewer saveToLocalByLongPress={false} onSwipeDown={() => navigator.pop()} backgroundColor={dm ? 'black' : 'rgb(248 250 252)'} flipThreshold={10} enableImageZoom imageUrls={uris.map(x => ({url: x}))} index={defaultIndex || 0} />
      <View style={[tw`w-12/12 justify-center items-center mb-10`]}>
         {/* @ts-ignore */}
        <TouchableOpacity onPress={() => navigator.pop()} style={tw`h-10 w-10 rounded-full bg-${dm ? 'white' : 'black'} items-center justify-center`}>
            <ExpoIcon name='x' iconName='feather' color={dm ? 'black' : 'white'} size={25} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}