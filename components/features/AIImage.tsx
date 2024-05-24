import { View, Text } from '../base/Themed'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Dimensions, Image, ImageBackground, TouchableOpacity } from 'react-native'
import { isStorageUri } from '../../data'
import usePoses, { skeleton_points, useBlazePose, blazePoseKeypointsToStandard } from '../../hooks/usePoses'
import { Circle, Svg, Text as SVGText, G, Line } from 'react-native-svg'
import { _tokens } from '../../tamagui.config'
import { useGet } from '../../hooks/useGet'
import tw from 'twrnc'
import * as tf from '@tensorflow/tfjs-react-native'
import * as ImagePicker from 'expo-image-picker'
import { useResizePlugin } from 'vision-camera-resize-plugin'
import { Frame } from 'react-native-vision-camera'
import Spacer from '../base/Spacer'

const AIImage = (props: {
    src: string
}) => {
    let bp = useBlazePose()
    let g = useGet()
    let [src, setSrc] = useState(null)
    let [h,w] = [Dimensions.get('window').height * 0.45, Dimensions.get('window').width]
    let [detections, setDetections] = useState<any>({})
    let {model, process_keypoints, loaded} = usePoses('blazePose')
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
          if (Object.keys(detections).length) return;
          setLoading(p => 'Getting image information')
          if (!src || isStorageUri(src) || !model) return;
          let res = await tf.fetch(src, {}, {isBinary: true})
          if (!res) {console.log('no res'); return;}
          let arr = await res.arrayBuffer()
          let _arr = new Uint8Array(arr)

          setLoading(p => 'Transforming image')
          let z = bp.decodeJpeg(_arr)
          let shape = z.shape

          setLoading(p => 'Estimating poses')
          let outputs = await bp.detector?.estimatePoses(z)
          if (!outputs || !outputs.length) return;
          let output = outputs[0]
          if (!output || (output?.score || 0) < 0.7) return;
          console.log('output')
          let results = blazePoseKeypointsToStandard(output.keypoints.map(_x => ({..._x, x: _x.x/shape[0], y: _x.y/shape[1]})))
          setDetections(results)
          setLoading(p => null)
        } catch (error) {
          console.log(error)
        }
        setLoading(p => null)
      })()
    }, [src])

    console.log(detections)

    let fx = (_x: number) => `${Math.round(100 * (_x))}%`
    let fy = (_y: number) => `${Math.round(100 * (_y))}%`
  return (
    <View style={{flex: 1, width: w, height: h}}>
      {(loading && src) && <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: _tokens.tRed, zIndex: 10000, width: w, height: h, position: 'absolute'}}>
          <Text center bold h4 white>{loading}</Text>
          <Spacer />
          <ActivityIndicator size={'large'} />
        </View>}
      
      <TouchableOpacity style={src ? undefined : {width: w, height: h, justifyContent: 'center', backgroundColor: g.dm ? _tokens.dark1 : _tokens.gray500}} disabled={src ? (loading != null) : false} onPress={selectMedia}>
      {!src && <Text center bold h3>Select Image</Text>}

      {src && <Image resizeMode='contain' source={{uri: src}} style={{width: w, height: h}} />}
      <Svg width={w} height={h} style={{position: 'absolute'}}>
        {skeleton_points.map((x, i) => {
            let [from, to] = [detections?.[x[0]], detections?.[x[1]]]
            if (!from || !to) return <View key={`not found ${i} ${x[0]} ${x[1]}`} />
            let {x: x1, y: y1, z: z1, confidence: c1} = from
            let {x: x2, y: y2, z: z2, confidence: c2} = to
            if (c1 < 0.4 || c2 < 0.4) return <View key={`not found ${i} ${x[0]} ${x[1]}`} />
            return <G key={`found ${i} ${x[0]} ${x[1]}`} >
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
        {/* <View style={{position: 'absolute', top: 10, right: 10}}>
        {detections && Object.keys(detections).map((_x, i) => {
            let x = detections[_x]
            if (!x) return <View key={`interface ${i}`} />
            return <View key={`interface ${i}`}>
              <Text>{_x}:({Math.round(x.x)}, {Math.round(x.y)}, {Math.fround(x.confidence)})</Text>
            </View>
        })}
        </View> */}
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