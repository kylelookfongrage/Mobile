import { View, Text } from '../base/Themed'
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Dimensions, Image, ImageBackground, TouchableOpacity } from 'react-native'
import { isStorageUri } from '../../data'
import usePoses, { skeleton_points, useBlazePose, blazePoseKeypointsToStandard, BlazePoseStandardResultObject } from '../../hooks/usePoses'
import { Circle, Svg, Text as SVGText, G, Line } from 'react-native-svg'
import { _tokens } from '../../tamagui.config'
import { useGet } from '../../hooks/useGet'
import tw from 'twrnc'
import * as tf from '@tensorflow/tfjs-react-native'
import * as _tf from '@tensorflow/tfjs-core'
import * as ImagePicker from 'expo-image-picker'
import Spacer from '../base/Spacer'

const AIImage = (props: {
    src?: string
    onDetect?: (d: BlazePoseStandardResultObject) => void;
}) => {
    let bp = useBlazePose()
    let g = useGet()
    let imageRef = useRef<Image>(null)
    let [src, setSrc] = useState(null)
    let [h,w] = [Dimensions.get('window').height * 0.45, Dimensions.get('window').width]
    let [detections, setDetections] = useState<BlazePoseStandardResultObject>({})
    let [loading, setLoading] = useState(null as null | string)
    const currentMediaPermissions = ImagePicker.useMediaLibraryPermissions();
    let selectMedia = async () => {
      let [_permission, requestPermission] = currentMediaPermissions
      try {
        setDetections({})
          if (_permission?.granted) {
              let res = await requestPermission()
              if (!res.granted) throw Error(`We need your permission to access your ${"Media Library"}`)
              const settings = {
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  aspect: [9, 16],
                  allowsEditing: true,
                  quality: 1,
              };
              //@ts-ignore
              const result = await ImagePicker.launchImageLibraryAsync({ ...settings });
              if (result && result.assets && result.assets.length > 0) {
                  setSrc(result.assets[0].uri)
                  
              }
          }
      } catch (error) {
          g.setFn(p => ({ ...p, error: error?.toString() || 'There was a problem', loading: false }))
      }
  }
    useEffect(() => {
      (async () => {
        try {
          if (bp.detector === null) {
            setLoading('waiting for model')
            return;
          }
          if (Object.keys(detections).length) throw Error('Already detected');
          setLoading(p => 'Getting image information')
          if (!src || isStorageUri(src)) throw Error('No source');
          let res = await tf.fetch(src, {}, {isBinary: true})
          if (!res) {console.log('no res'); throw Error('No image found');}
          let arr = await res.arrayBuffer()
          let _arr = new Uint8Array(arr)

          setLoading(p => 'Transforming image')
          let z = bp.decodeJpeg(_arr)
          let shape = z.shape

          setLoading(p => 'Estimating poses')
          let outputs = await bp.detector?.estimatePoses(z)
          if (!outputs || !outputs.length) throw Error('No outputs from model');
          let output = outputs[0]
          if (!output || (output?.score || 0) < 0.7) throw Error('Output does not have a high enough score');
          console.log('output')
          let results = blazePoseKeypointsToStandard(output.keypoints.map(_x => ({..._x, x: _x.x/shape[0], y: _x.y/shape[1], z: (_x.z || 0)/shape[0]})))
          setDetections(results)
          props.onDetect && props.onDetect(results)
          setLoading(p => null)
        } catch (error) {
          console.log(error)
        }
        setLoading(p => null)
      })()
    }, [src, bp.detector === null])

    let fx = (_x: number) => `${Math.round(100 * (_x))}%`
    let fy = (_y: number) => `${Math.round(100 * (_y))}%`
  return (
    <View style={{flex: 1, width: w, height: h}}>
      {(loading) && <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: _tokens.tRed, zIndex: 10000, width: w, height: h, position: 'absolute'}}>
          <Text center bold h4 white>{loading}</Text>
          <Spacer />
          <ActivityIndicator size={'large'} />
        </View>}
      
      <TouchableOpacity style={src ? undefined : {width: w, height: h, justifyContent: 'center', backgroundColor: g.dm ? _tokens.dark1 : _tokens.gray500}} disabled={src ? (loading != null) : false} onPress={selectMedia}>
      {(!src && !loading) && <Text center bold h3>Select Image</Text>}

      {src && <Image ref={imageRef} resizeMode='contain' source={{uri: src}} style={{width: w, height: h}} />}
      <Svg width={w} height={h} style={{position: 'absolute'}}>
        {skeleton_points.map((x, i) => {
            let [from, to] = [detections?.[x[0]], detections?.[x[1]]]
            if (!from || !to) return <View key={`not found ${i} ${x[0]} ${x[1]}`} />
            let {x: x1, y: y1, z: z1, confidence: c1} = from
            let {x: x2, y: y2, z: z2, confidence: c2} = to
            if (c1 < 0.4 || c2 < 0.4) return <View key={`not found ${i} ${x[0]} ${x[1]}`} />
            return <G key={`found ${i} ${x[0]} ${x[1]}`} >
              <Circle cx={fx(x1)} cy={fy(y1)} r={z1 * 20} stroke={_tokens.white} fill={_tokens.white} />
              <Line 
                strokeWidth={4}
                stroke={_tokens.primary900}
                x1={fx(x1)} 
                x2={fx(x2)} 
                y1={fy(y1)}
                y2={fy(y2)}
            />
            </G>
        })}
            
        </Svg>
      </TouchableOpacity>
        
    </View>
  )
}

export default AIImage



export function resize(frame: ArrayBuffer, inputWidth: number, inputHeight: number, width: number, height: number): Float32Array {
    'worklet'
    const arrayData = frame
   
    const outputSize = width * height * 3 // 3 for RGB
    const outputFrame = new Uint8Array(outputSize)
   
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Find closest pixel from the source image
        const srcX = Math.floor((x / width) * inputWidth)
        const srcY = Math.floor((y / height) * inputHeight)
   
        // Compute the source and destination index
        const srcIndex = (srcY * inputWidth + srcX) * 4 // 4 for BGRA
        const destIndex = (y * width + x) * 3           // 3 for RGB
   
        // Convert from BGRA to RGB
        outputFrame[destIndex] = arrayData[srcIndex + 2]     // R
        outputFrame[destIndex + 1] = arrayData[srcIndex + 1] // G
        outputFrame[destIndex + 2] = arrayData[srcIndex]     // B
      }
    }
   
    return new Float32Array(outputFrame)
  }