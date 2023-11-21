import { ActivityIndicator, Dimensions, PixelRatio, Platform, Image } from 'react-native'
import React, { useEffect, useLayoutEffect, useRef, useState, createElement } from 'react'
import { isStorageUri } from '../../data'
import { useStorage } from '../../supabase/storage'
import tw from 'twrnc'
import usePoses from '../../hooks/usePoses'
import { BackButton } from '../../components/base/BackButton'
import * as tf from '@tensorflow/tfjs';
import {
    decodeJpeg, bundleResourceIO, fetch
} from '@tensorflow/tfjs-react-native';
import { Camera, CameraType } from 'expo-camera'
import useOnLeaveScreen from '../../hooks/useOnLeaveScreen'
import type { Keypoint, Pose } from '@tensorflow-models/pose-detection'
import Svg, { Circle, Line } from 'react-native-svg'
import { View, Text } from '../../components/base/Themed'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { ExpoIcon } from '../../components/base/ExpoIcon'
import { ExpoWebGLRenderingContext, GLView } from 'expo-gl'
import { runOnUI } from 'react-native-reanimated'
import { ResizeMode, Video, MediaStream } from 'expo-av'
import { supabase } from '../../supabase'


export default function VideoScreen(props: { uri: string }) {
    const modelJson = require('../../offline_model/model.json');
    const modelWeights1 = require('../../offline_model/group1-shard1of2.bin');
    const modelWeights2 = require('../../offline_model/group1-shard2of2.bin');
    let m = bundleResourceIO(modelJson, [
        modelWeights1,
        modelWeights2,
    ]);
    let { ready, model, error, detector } = usePoses(tf, m)
    let [src, setSrc] = useState<string | null>(null);
    let [buffer, setBuffer] = useState<ArrayBuffer | null>(null)
    let s = useStorage()
    console.log(buffer === null)
    let videoRef = useRef<Video | null>(null)

    const detectPose = async () => {
        if (model && videoRef.current) {
            const videoTexture = new THREE.VideoTexture(videoRef.current);

    
          // Create a tensor from video frames
          const { uri, positionMillis } = videoStatus;
          const videoFrame = tf.image.resizeBilinear(tf.browser.fromPixels(videoRef.current), [camera.height, camera.width]);
          const pose = await model.estimatePoses(videoRef.current);
    
        //   setPredictions(pose);
    
          requestAnimationFrame(detectPose);
        }
      };
    

    console.log(src)
    useEffect(() => {
        (async () => {
            await detectPose()

            // let _src = props.uri
            // if (isStorageUri(props.uri)) {
            //     _src = s.constructUrl(props.uri)?.data?.publicUrl
            // }
            // let res = await fetch(_src, {}, { isBinary: true })
            // let arrayBuffer = await res.arrayBuffer();
            // setBuffer(arrayBuffer)
            // let res = await fetch(src)
            // let blob = await res.blob()
            // console.log(typeof blob)
            // tf.util.fetch()
            // let z = new tf.data.FileDataSource(blob)
            // let s = await z.iterator()
            // let json = []
            // await s.forEachAsync(f => json.push(decodeJpeg(f)))
            // console.log(json)
            // const req = new XMLHttpRequest();
            // req.open("GET", src, true);
            // req.responseType = "arraybuffer";

            // req.onload = (event) => {
            //     const arrayBuffer = req.response; // Note: not req.responseText
            //     if (arrayBuffer) {
            //         const byteArray = new Uint8Array(arrayBuffer);
            //         const imageTensor = decodeJpeg(byteArray);
            //         model?.estimatePoses(imageTensor).then(x => console.log(x));

            //     }
            // };
            // req.send(null);
        })()
    }, [src])


    useLayoutEffect(() => {
        let _src = props.uri
        if (isStorageUri(props.uri)) {
            _src = s.constructUrl(props.uri)?.data?.publicUrl
        }
        if (_src) setSrc(_src)
    }, [])
    return <View style={{ flex: 1, ...tw`items-center justify-center` }}>
        <BackButton inplace />
        {src && <Video style={tw`h-100 w-100`} ref={videoRef} source={{ uri: src }} rate={1.0}
            volume={1.0}
            isMuted={false}
            resizeMode={ResizeMode.COVER}
            useNativeControls
            isLooping
            onReadyForDisplay={() => {
                if (!videoRef.current) return;
                videoRef.current.playAsync();
            }}
             />}
    </View>
}