import React, { useState } from 'react';
import { StyleSheet, Button, View, Image, Text } from 'react-native';
import * as VideoThumbnails from 'expo-video-thumbnails';
import tw from 'twrnc'

interface VideoThumbailProps {
    uri: string;
}
export const VideoThumbail = (props: VideoThumbailProps) => {
    
  const [image, setImage] = useState<string | null>(null);
  React.useEffect(() => {
    VideoThumbnails.getThumbnailAsync(props.uri).then((x) => {
        setImage(x.uri)
    }).catch((e) => {
        console.log(e)
    })
  }, [props.uri])

  return (
    <View>
      {image && <Image source={{ uri: image }} style={tw`h-30 w-30`} />}
    </View>
  );
}

