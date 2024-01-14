import { ActivityIndicator, Dimensions, PixelRatio, Platform, Image } from 'react-native'
import React, { useEffect, useLayoutEffect, useRef, useState, createElement } from 'react'
import { isStorageUri } from '../../data'
import { useStorage } from '../../supabase/storage'
import tw from 'twrnc'
import usePoses from '../../hooks/usePoses'
import { BackButton } from '../../components/base/BackButton'
// import * as tf from '@tensorflow/tfjs';
// import {
//     decodeJpeg, bundleResourceIO, fetch
// } from '@tensorflow/tfjs-react-native';
import { Camera, CameraType } from 'expo-camera'
import useOnLeaveScreen from '../../hooks/useOnLeaveScreen'
// import type { Keypoint, Pose } from '@tensorflow-models/pose-detection'
import Svg, { Circle, Line } from 'react-native-svg'
import { View, Text } from '../../components/base/Themed'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { ExpoIcon } from '../../components/base/ExpoIcon'
import { ExpoWebGLRenderingContext, GLView } from 'expo-gl'
import { runOnUI } from 'react-native-reanimated'
import { ResizeMode, Video } from 'expo-av'
import { supabase } from '../../supabase'


export default function VideoScreen(props: { uri: string }) {
   return <View />
}