import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useResizePlugin } from 'vision-camera-resize-plugin'
import { useTensorflowModel } from 'react-native-fast-tflite'
import { DrawableFrame, Frame } from 'react-native-vision-camera'
let movenetThunder = require('../assets/ai_models/movenet2.tflite')
let movenetLightning = require('../assets/ai_models/movenet.tflite')
let posenet = require('../assets/ai_models/posenet.tflite')
let blazePose = require('../assets/ai_models/blaze_pose.tflite')
import useAsync from './useAsync'
import * as tf from '@tensorflow/tfjs-core'
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@mediapipe/pose'
import { decodeJpeg } from '@tensorflow/tfjs-react-native'

export const standardKeypointsToBlazeposeKeypoints = (data: {[k: typeof blazePoseKeypoints[number]] : {x: number, y: number, z: number, confidence: number}}): poseDetection.Keypoint[] => {
    'worklet'
    let arr = [] as poseDetection.Keypoint[]
    for (var keypoint of Object.keys(data)) {
        let point = data[keypoint]
        arr.push({score: point.confidence, x: point.x, y: point.y, z: point.z, name: keypoint})
    }
    return arr
}

export const blazePoseKeypointsToStandard = (data: poseDetection.Keypoint[]): {[k: typeof blazePoseKeypoints[number]] : {x: number, y: number, z: number, confidence: number}} => {
    'worklet'
    let obj: {[k: typeof blazePoseKeypoints[number]] : {x: number, y: number, z: number, confidence: number}} = {}
    for (var keypoint of data) {
        //@ts-ignore
        obj[keypoint.name] = {confidence: keypoint.score, x: keypoint.x, y: keypoint.y, z: keypoint.z}
    }
    return obj
}

export const sigmoid = (z: number) => {
    'worklet'
    return 1 / (1 + Math.exp(-z));
}
export const blazePoseKeypoints = [
    'nose','right_inner_eye','right_eye','right_outer_eye','left_inner_eye',
    'left_eye','left_outer_eye','right_ear','left_ear','mouth_right',
    'mouth_left','right_shoulder','left_shoulder','right_elbow',
    'left_elbow','right_wrist','left_wrist','right_pinky_finger',
    'left_pinky_finger','right_index_finger','left_index_finger',
    'right_thumb_finger','left_thumb_finger','right_hip','left_hip',
    'right_knee','left_knee','right_ankle','left_ankle',
    'right_heel','left_heel','right_foot', 'left_foot'
]

let movenetKeypoints = [
    'nose', 
    'left_eye', 
    'right_eye', 
    'left_ear', 
    'right_ear',
    'left_shoulder', 
    'right_shoulder', 
    'left_elbow', 
    'right_elbow',
    'left_wrist', 
    'right_wrist', 
    'left_hip', 
    'right_hip', 
    'left_knee',
    'right_knee', 
    'left_ankle', 
    'right_ankle'
]

export const skeleton_points = [
    ['nose', 'left_eye'],
    ['nose', 'right_eye'],
    ['left_shoulder', 'right_shoulder'],
    ['left_shoulder', 'left_elbow'],
    ['right_shoulder', 'right_elbow'],
    ['left_elbow', 'left_wrist'],
    ['right_elbow', 'right_wrist'],
    ['left_shoulder', 'left_hip'],
    ['right_shoulder', 'right_hip'],
    ['left_hip', 'left_knee'],
    ['left_hip', 'right_hip'],
    ['right_hip', 'right_knee'],
    ['right_knee', 'right_ankle'],
    ['left_knee', 'left_ankle']
]

function onlyUnique(value: any, index: number, array: any[]) {
    return array.indexOf(value) === index;
  }
  

export const _keypoints = skeleton_points.flat().filter(onlyUnique)


const process_movenet_keypoints = (res: any[]): {[k: typeof movenetKeypoints[number]] : {x: number, y: number, confidence: number}} => {
    'worklet'
    let obj: {[k: typeof movenetKeypoints[number]] : {x: number, y: number, confidence: number}} = {}
    let arr = movenetKeypoints
    for (let i = 0; i<arr.length; i+=1){
        let from = i * 3
        let landmark = arr[i]
        let [y,x,c1] = [res[from], res[from+1], res[from+2]]
        obj[landmark] = {x,y, confidence: c1}
    }
    return obj
}



let AIModels: {[k: string]: {model: any, width: number; height: number; dataType: 'float32' | 'uint8', keypoints?: any[], process_keypoints?: any}} = {
    "posenet": {model: posenet, width: 245, height: 245, dataType: 'float32' as 'float32' | 'uint8'},
    "blazePose": {
        model: blazePose, 
        width: 256, 
        height: 256, 
        dataType: 'float32' as 'float32' | 'uint8',
        keypoints: blazePoseKeypoints,
        process_keypoints: (res: any[]): {[k: typeof blazePoseKeypoints[number]] : {x: number, y: number, z: number, confidence: number}} => {
            'worklet'
            let obj: {[k: typeof blazePoseKeypoints[number]] : {x: number, y: number, z: number, confidence: number}} = {}
            let arr = blazePoseKeypoints
            for (let i = 0; i<arr.length; i+=1){
                let from = i * 5
                let landmark = arr[i]
                let [x,y,z] = [res[from], res[from+1], res[from+2]]
                let [c1,c2] = [res[from+3], res[from+4]]
                obj[landmark] = {x,y,z,confidence: sigmoid(Math.min(c1,c2))}
            }
            return obj
        }

    },
    'movenet': {
        model: movenetLightning, 
        width: 192, 
        height: 192, 
        dataType: 'uint8' as 'float32' | 'uint8',
        keypoints: movenetKeypoints,
        process_keypoints: process_movenet_keypoints
    },
    'movenetThunder': {
        model: movenetThunder, 
        width: 256, 
        height: 256,
        dataType: 'uint8' as 'float32' | 'uint8',
        keypoints: movenetKeypoints, 
        process_keypoints: process_movenet_keypoints
    }
}

export default function usePoses(_model: keyof typeof AIModels='movenetThunder') {
    const { resize: _resize } = useResizePlugin()
    const options = AIModels[_model]
    const plugin = useTensorflowModel(options.model)
    const model = plugin?.state === "loaded" ? plugin?.model : undefined
    const resize = (frame: Frame | DrawableFrame) => {
        'worklet'
        const data = _resize(frame, {
            scale: {
                width: options.width,
                height: options.height,
            },
            pixelFormat: 'rgb',
            dataType: options.dataType
        })
        return data;
    }
    return {model, loaded: plugin?.state === "loaded", resize, keypoints: options?.keypoints, process_keypoints: options?.process_keypoints, tensorWidth: options.width, tensorHeight: options.height}
    
}


export const useBlazePose = () => {
    const { resize: _resize } = useResizePlugin()
    const model = poseDetection.SupportedModels.BlazePose;
    const detectorConfig = {
        runtime: 'tfjs',
        modelType: 'full'
    };
    let [detector, setDetector] = useState<poseDetection.PoseDetector | null>(null)
    


    useAsync(async () => {
        try {
            await tf.ready()
            let _detector = await poseDetection.createDetector(model, detectorConfig);
        setDetector(_detector)
        } catch (error) {
            console.log(error)
        }
    }, [])
    
    return {model, detector, helpers: poseDetection, decodeJpeg}
}

