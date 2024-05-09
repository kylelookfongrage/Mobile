import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useCameraPermissions } from 'expo-image-picker';
import pose from '@mediapipe/pose'

export default function usePoses() {
    let model = new pose.Pose()
    useEffect(() => {
        model.initialize()
        model.setOptions({smoothLandmarks: true, smoothSegmentation: true, minDetectionConfidence: 0.3, minTrackingConfidence: 0.3})
    }, [])
    return {model}
}