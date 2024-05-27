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
import { Tables } from '../supabase/dao'
import { calculateBodyFat } from '../data'

export type BlazePoseStandardizedResults = {x: number, y: number, z: number, confidence: number}
export type BlazePoseStandardResultObject = {[key: typeof blazePoseKeypoints[number]] : BlazePoseStandardizedResults}

export const standardKeypointsToBlazeposeKeypoints = (data: {[k: typeof blazePoseKeypoints[number]] : BlazePoseStandardizedResults}): poseDetection.Keypoint[] => {
    'worklet'
    let arr = [] as poseDetection.Keypoint[]
    for (var keypoint of Object.keys(data)) {
        let point = data[keypoint]
        arr.push({score: point.confidence, x: point.x, y: point.y, z: point.z, name: keypoint})
    }
    return arr
}

export const blazePoseKeypointsToStandard = (data: poseDetection.Keypoint[]): {[k: typeof blazePoseKeypoints[number]] : BlazePoseStandardizedResults} => {
    'worklet'
    let obj: {[k: typeof blazePoseKeypoints[number]] : BlazePoseStandardizedResults} = {}
    for (var keypoint of data) {
        //@ts-ignore
        obj[keypoint.name] = {confidence: keypoint.score, x: keypoint.x, y: keypoint.y, z: keypoint.z}
    }
    return obj
}

export const calculateEuclideanDistance = (to: BlazePoseStandardizedResults, from: BlazePoseStandardizedResults, width=1, height=1) => {
    'worklet'
    let diff_x = ((from.x * width) - (to.x * width)) ** 2
    let diff_y = ((from.y * height) - (to.y * height)) ** 2
    return Math.sqrt(diff_x + diff_y)
}   

export const estimateBlazePoseBodyFat = (detections: BlazePoseStandardResultObject, profile: Tables['user']['Row']) => {
    'worklet'
    if (!profile) return;
    let fingers = [
        ['right_wrist', 'right_thumb'],// ['right_wrist', 'right_thumb'], ['right_wrist', 'right_thumb'], 
        ['left_wrist', 'left_thumb'], // ['left_wrist', 'left_thumb'], ['left_wrist', 'left_thumb']
    ]
    let max_confidence = undefined as undefined | number
    let corresponding_dist = undefined as undefined | number
    for (var f of fingers) {
        let [from, to] = [detections?.[f[0]], detections?.[f[1]]]
        if (!from || !to) continue;
        let {x: x1, y: y1, z: z1, confidence: c1} = from
        let {x: x2, y: y2, z: z2, confidence: c2} = to
        if (c2 < (max_confidence || 0)) continue;
        max_confidence = c2;
        corresponding_dist = calculateEuclideanDistance(to, from)
    }
    if (!max_confidence || !corresponding_dist) return;
    let fx = (2.5/corresponding_dist) * Math.PI // average length of thumb
    let waist = calculateEuclideanDistance(detections['right_shoulder'], detections['left_shoulder']) * fx 
    let hip = calculateEuclideanDistance(detections['right_hip'], detections['left_hip']) * fx 
    let neck = calculateEuclideanDistance(detections['right_ear'], detections['left_ear']) * fx
    let h = (profile.height || 0)
    if (profile.metric) {
        h = h/2.54
    }
    console.log({waist, hip, neck, fx, height: profile.height})
    let fat = calculateBodyFat(profile.gender || 'male', 'USC', waist, neck, h, hip)
    console.log(fat)
    return fat
}

export const sigmoid = (z: number) => {
    'worklet'
    return 1 / (1 + Math.exp(-z));
}
export const blazePoseKeypoints = [
    'nose','right_inner_eye','right_eye','right_outer_eye','left_inner_eye',
    'left_eye','left_outer_eye','right_ear','left_ear','mouth_right',
    'mouth_left','right_shoulder','left_shoulder','right_elbow',
    'left_elbow','right_wrist','left_wrist','right_pinky',
    'left_pinky','right_index','left_index',
    'right_thumb','left_thumb','right_hip','left_hip',
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
    ['left_knee', 'left_ankle'],
    ['right_wrist', 'right_thumb'],
    ['right_wrist', 'right_index'],
    ['right_wrist', 'right_pinky'],
    ['left_wrist', 'left_thumb'],
    ['left_wrist', 'left_index'],
    ['left_wrist', 'left_pinky'],
    ['right_ear', 'left_ear'],
    
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
    let [isReady, setIsReady] = useState(false)
    


    useAsync(async () => {
        try {
            await tf.ready()
            let _detector = await poseDetection.createDetector(model, detectorConfig);
            setDetector(_detector)
            setIsReady(true)
        } catch (error) {
            console.log(error)
        }
    }, [])
    
    return {model, detector, helpers: poseDetection, decodeJpeg, isReady: detector ? false : isReady}
}

