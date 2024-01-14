import { ActivityIndicator, Dimensions, PixelRatio, Platform } from 'react-native'
import React, { useRef, useState } from 'react'
import tw from 'twrnc'
import usePoses from '../../hooks/usePoses'
import { BackButton } from '../../components/base/BackButton'
// import * as tf from '@tensorflow/tfjs';
// import {
//     cameraWithTensors, bundleResourceIO
// } from '@tensorflow/tfjs-react-native';
import { Camera, CameraType } from 'expo-camera'
import useOnLeaveScreen from '../../hooks/useOnLeaveScreen'
// import type { Keypoint, Pose } from '@tensorflow-models/pose-detection'
import Svg, { Circle, Line } from 'react-native-svg'
import { View, Text } from '../../components/base/Themed'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { ExpoIcon } from '../../components/base/ExpoIcon'

// let TensorCamera = cameraWithTensors(Camera)
const IS_ANDROID = Platform.OS === 'android';
const IS_IOS = Platform.OS === 'ios';

export default function VideoScreen() {
    const modelJson = require('../../offline_model/model.json');
    const modelWeights1 = require('../../offline_model/group1-shard1of2.bin');
    const modelWeights2 = require('../../offline_model/group1-shard2of2.bin');
    // let m = bundleResourceIO(modelJson, [
    //     modelWeights1,
    //     modelWeights2,
    //   ]);
    // let { ready, model, error, detector } = usePoses(tf, m)
    const CAM_PREVIEW_WIDTH = Dimensions.get('window').width;
    const CAM_PREVIEW_HEIGHT = CAM_PREVIEW_WIDTH / (IS_IOS ? 9 / 16 : 3 / 4);
    const OUTPUT_TENSOR_WIDTH = 180;
    const OUTPUT_TENSOR_HEIGHT = OUTPUT_TENSOR_WIDTH / (IS_IOS ? 9 / 16 : 3 / 4);
    let [cameraType, setCameraType] = useState<CameraType>(CameraType.back)
    const textureDims = {
        height: PixelRatio.getPixelSizeForLayoutSize(IS_IOS ? CAM_PREVIEW_WIDTH : CAM_PREVIEW_HEIGHT),
        width: PixelRatio.getPixelSizeForLayoutSize(IS_IOS ? CAM_PREVIEW_HEIGHT : CAM_PREVIEW_WIDTH)
    }
    const rafId = useRef<number | null>(null);
    useOnLeaveScreen(() => {
        if (rafId.current != null && rafId.current !== 0) {
            cancelAnimationFrame(rafId.current);
            rafId.current = 0;
        }
    })
    const outputTensorWidth = IS_ANDROID
        ? OUTPUT_TENSOR_WIDTH
        : OUTPUT_TENSOR_HEIGHT
    const outputTensorHeight = IS_ANDROID
        ? OUTPUT_TENSOR_HEIGHT
        : OUTPUT_TENSOR_WIDTH;

    const drawSkeleton = () => {
        // const keypoints = poses?.[0]?.keypoints
        // if (!keypoints) return <></>
        // const fillStyle = 'white';
        // const strokeStyle = 'white';
        // const lineWidth = 3;
        // let lines: {moveTo: [number, number], lineTo: [number, number], keypoint: Keypoint}[] = []
        // detector.util.getAdjacentPairs(detector.SupportedModels.MoveNet)
        //     .forEach(([i, j]) => {
        //   const kp1 = keypoints[i];
        //   const kp2 = keypoints[j];
    
        //   // If score is null, just show the keypoint.
        //   const score1 = kp1.score != null ? kp1.score : 1;
        //   const score2 = kp2.score != null ? kp2.score : 1;
        //   const scoreThreshold = 0.3;
    
        //   if (score1 >= scoreThreshold && score2 >= scoreThreshold) {
        //     const flipX = IS_ANDROID || cameraType === CameraType.back;
        //     const x1 = ((flipX ? outputTensorWidth - kp1.x : kp1.x) / outputTensorWidth) * CAM_PREVIEW_WIDTH;
        //     const x2 = ((flipX ? outputTensorWidth - kp2.x : kp2.x) / outputTensorWidth) * CAM_PREVIEW_WIDTH;
        //     const y1 = (kp1.y / outputTensorHeight) * (CAM_PREVIEW_HEIGHT);
        //     const y2 = (kp2.y / outputTensorHeight) * (CAM_PREVIEW_HEIGHT);
            
        //     lines.push({moveTo: [x1, y1], lineTo: [x2, y2], keypoint: kp1})
        //   }
        // });
        // return <Svg style={{
        //     width: '100%',
        //     height: '100%',
        //     position: 'absolute',
        //     zIndex: 30,
        // }}>
        //     {lines.map((x, i) => {
        //     return <Line 
        //         key={`skeleton-line-${x.keypoint.name} - ${i}`} 
        //         fill={fillStyle} 
        //         stroke={strokeStyle} 
        //         strokeWidth={lineWidth} 
        //         x1={x.moveTo[0]} 
        //         x2={x.lineTo[0]}
        //         y1={x.moveTo[1]} 
        //         y2={x.lineTo[1]} 
        //         />
        // })}
        // </Svg>
      }
    
    const renderPose = () => {
        // if (poses != null && poses.length > 0) {
        //     const keypoints = poses?.[0]?.keypoints
        //         .map((k, i) => {
        //             // Flip horizontally on android or when using back camera on iOS.
        //             const flipX = IS_ANDROID || cameraType === CameraType.back;
        //             const x = flipX ? outputTensorWidth - k.x : k.x;
        //             const y = k.y;
        //             const cx = (x / outputTensorWidth) * CAM_PREVIEW_WIDTH;
        //             const cy = (y / outputTensorHeight) * (CAM_PREVIEW_HEIGHT);
        //             return (
        //                 <Circle
        //                     key={`skeletonkp_${k.name}`}
        //                     cx={cx}
        //                     cy={cy}
        //                     r='10'
        //                     strokeWidth='2'
        //                     fill='#00AA00'
        //                     stroke='white'
        //                 />
        //             );
        //         });

        //     return <Svg style={{
        //         width: '100%',
        //         height: '100%',
        //         position: 'absolute',
        //         zIndex: 30,
        //     }}>{keypoints}</Svg>;
        // } else {
        //     return <View></View>;
        // }
    };
    // const [poses, setPoses] = useState<Pose[]>();
    // const handleCameraStream = async (
    //     images: IterableIterator<tf.Tensor3D>,
    //     updatePreview: () => void,
    // ) => {
    //     const loop = async () => {
    //         // Get the tensor and run pose detection.
    //         const imageTensor = images.next().value as tf.Tensor3D;
    //         const startTs = Date.now();
    //         const poses = await model!.estimatePoses(
    //             imageTensor,
    //             undefined,
    //             Date.now()
    //         );
    //         const latency = Date.now() - startTs;
    //         setPoses(poses);
    //         tf.dispose([imageTensor]);
    //         if (rafId.current === 0) {
    //             return;
    //         }
    //         rafId.current = requestAnimationFrame(loop);
    //     };
    //     loop();
    // };
    // if (!ready || error || !model || !detector) {
    //     return <View style={{ ...tw`self-center items-center justify-center`, flex: 1 }}>
    //         <BackButton  inplace/>
    //         <Text>Loading...</Text>
    //         <ActivityIndicator />
    //     </View>
    // }
    return (
        <View style={{ flex: 1 }}>
            <BackButton inplace Right={() => {
                return <View />
                // return <TouchableOpacity onPress={()=>{setCameraType(prev => prev === CameraType.back ? CameraType.front : CameraType.back)}}>
                //     <View card style={tw`rounded-lg p-2`}>
                //     <ExpoIcon name='camera-reverse-outline' iconName='ion' size={25} color='gray' />
                //     </View>
                // </TouchableOpacity>
            }} />
            {/* <TensorCamera
                style={{ flex: 1, height: CAM_PREVIEW_WIDTH, width: CAM_PREVIEW_WIDTH }}
                resizeWidth={outputTensorWidth}
                resizeHeight={outputTensorHeight}
                resizeDepth={3}
                rotation={0}
                type={cameraType}
                // zoom={0}
                ratio={Platform.OS === 'ios' ? '16:9' : '16:9'}
                autorender={true}
                onReady={handleCameraStream} 
                useCustomShadersToResize={false} 
                cameraTextureWidth={textureDims.width} 
                cameraTextureHeight={textureDims.height} /> */}
            {/* {renderPose()} */}
            {/* {drawSkeleton()} */}
        </View>
    )
}