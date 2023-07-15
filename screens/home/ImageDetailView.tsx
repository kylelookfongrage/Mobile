import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react'
import { View, TouchableOpacity } from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExpoIcon } from '../../components/ExpoIcon';
import tw from 'twrnc'
import useColorScheme from '../../hooks/useColorScheme';
import { isStorageUri } from '../../data';
import { Storage } from 'aws-amplify';

export default function ImageDetailView(props: {uris: string[]; defaultIndex: number | undefined}) {
    const {uris, defaultIndex} = props;
    let [imgs, setImgs] = useState<string[]>([])

    const getImages = useCallback(async () => {
      let newImages = await Promise.all(uris.map(async x => {
        if (isStorageUri(x)) {
          return await Storage.get(x)
        }
        return x
      }))
      return newImages
  }, [props.uris])

    useEffect(() => {
      //@ts-ignore
      getImages().then(x => setImgs(x))
  }, [getImages])

    const navigator = useNavigation()
    const dm = useColorScheme() === 'dark'
  return (
    <SafeAreaView edges={['top']} style={[{flex: 1}]}>
      {/* @ts-ignore */}
      {imgs.length !== 0 && <ImageViewer saveToLocalByLongPress={false} onSwipeDown={() => navigator.pop()} backgroundColor={dm ? 'black' : 'rgb(248 250 252)'} flipThreshold={10} enableImageZoom imageUrls={imgs.map(x => ({url: x}))} index={defaultIndex || 0} />}
      <View style={[tw`w-12/12 justify-center items-center mb-10`]}>
         {/* @ts-ignore */}
        <TouchableOpacity onPress={() => navigator.pop()} style={tw`h-10 w-10 rounded-full bg-${dm ? 'white' : 'black'} items-center justify-center`}>
            <ExpoIcon name='x' iconName='feather' color={dm ? 'black' : 'white'} size={25} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}