import { View, Text } from '../base/Themed'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Image, ImageBackground, TouchableOpacity } from 'react-native'
import { isStorageUri } from '../../data'
import usePoses, { skeleton_points, useBlazePose, blazePoseKeypointsToStandard } from '../../hooks/usePoses'
import { Circle, Svg, Text as SVGText, G, Line } from 'react-native-svg'
import { _tokens } from '../../tamagui.config'
import { useGet } from '../../hooks/useGet'
import tw from 'twrnc'
import tf from '@tensorflow/tfjs-core'
import * as ImagePicker from 'expo-image-picker'
import { manipulateAsync, FlipType, SaveFormat } from 'expo-image-manipulator';


const AIImage = (props: {
    src: string
}) => {
    let bp = useBlazePose()
    let g = useGet()
    let [src, setSrc] = useState(props.src)
    let [h,w] = [g.s.height * 0.45, g.s.width]
    let [detections, setDetections] = useState<any>({})
    let {model, process_keypoints, loaded} = usePoses('blazePose')
    let [loading, setLoading] = useState(false)
    const currentMediaPermissions = ImagePicker.useMediaLibraryPermissions();
    let selectMedia = async () => {
      let [_permission, requestPermission] = currentMediaPermissions
      try {
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
          setLoading(true)
          if (!src || isStorageUri(src) || !model) return;
          let res = await fetch(src, {}, {isBinary: true})
          if (!res) {console.log('no res'); return;}
          let arr = await res.arrayBuffer()
          // let _arr = new Uint8Array(arr)
          // let z = tf.browser.fromPixels({data: _arr, width: _arr.length/2, height: _arr.length/2})
          // let smallImg = tf.image.resizeBilinear(z, [256, 256]); // 192,192 is dictated by my model
          // console.log(smallImg.shape)
          // let buffer = smallImg.dataSync().buffer
          // let outputs = await model.run([new Float32Array(buffer)])
          // if (!outputs || !outputs.length) return;
          // let output = outputs[0]
          // let keypoints = process_keypoints(output)
          // setDetections(keypoints)
          setLoading(false)
        } catch (error) {
          console.log(error)
        }
        setLoading(false)
      })()
    }, [src, loaded])

    let fx = (_x: number) => (w * (_x / 256))
    let fy = (_y: number) => (h * (_y / 256))
  return (
    <View style={{flex: 1, width: w, height: h}}>
      <TouchableOpacity onPress={selectMedia}>
      {!src && <Text>Select Image</Text>}
      {src && <Image source={{uri: src}} style={{width: w, height: h}} />}
      {loading && <ActivityIndicator size={'large'} style={{position: 'absolute', alignSelf: 'center', top: h/2}} />}
     
      <Svg width={w} height={h} style={{position: 'absolute'}}>
      {detections && Object.keys(detections).map((_x, i) => {
            let x = detections[_x]
            if (!x || x?.confidence < 0.5) return <View key={`not found ${i}`} />
            return <Circle key={`not found ${i}`} x={w-fx(x.x)} y={fy(x.y)} stroke={_tokens.primary900} r={5} fill={_tokens.primary900} />
        })}
        {skeleton_points.map((x, i) => {
            let [from, to] = [detections?.[x[0]], detections?.[x[1]]]
            if (!from || !to) return <View key={`not found ${i} ${x[0]} ${x[1]}`} />
            let {x: x1, y: y1, z: z1, confidence: c1} = from
            let {x: x2, y: y2, z: z2, confidence: c2} = to
            if (c1 < 0.4 || c2 < 0.4) return <View key={`not found ${i} ${x[0]} ${x[1]}`} />
            return <Line 
                key={`found ${i} ${x[0]} ${x[1]}`} 
                strokeWidth={4}
                stroke={_tokens.primary900}
                x1={`${Math.fround((w-fx(x1)))}`} 
                x2={`${Math.fround((w-fx(x2)))}`} 
                y1={`${Math.fround((fy(y1)))}`}
                y2={`${Math.fround((fy(y2)))}`}
            />
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