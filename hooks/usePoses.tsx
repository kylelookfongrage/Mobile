import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'

import * as posedetection from '@tensorflow-models/pose-detection';
import { useCameraPermissions } from 'expo-image-picker';
import type { io } from '@tensorflow/tfjs';

export default function usePoses(tf: any, config: io.IOHandler | null=null, score=0.3) {
    const [ready, setReady] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null);
    let [permissions, request_permissions] = useCameraPermissions()
    const [model, setModel] = useState<posedetection.PoseDetector>();
    useEffect(() => {
        (async () => {
            try {
                if (!permissions?.granted && permissions?.canAskAgain || !permissions) {
                    let res = await request_permissions()
                    if (!res.granted) throw Error('We need your camera access for this feature, please update your settings')
                } else if (!permissions?.granted) {
                    throw Error('We need your camera access for this feature, please update your settings')
                } 
                await tf.ready()
                const movenetModelConfig: posedetection.MoveNetModelConfig = {
                    modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
                    enableSmoothing: true,
                    trackerType: posedetection.TrackerType.Keypoint,
                    minPoseScore: score
                };
                if (config) {
                    movenetModelConfig.modelUrl = config
                }
                const model = await posedetection.createDetector(
                    posedetection.SupportedModels.MoveNet,
                    movenetModelConfig
                );
                setModel(model);
                setReady(true)
            } catch (error) {
                setError(error.toString())
            }
        })()
    }, [])
  
    return {ready, error, model, detector: posedetection}
}