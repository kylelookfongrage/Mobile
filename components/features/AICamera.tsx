import React, { useRef } from 'react'
import { BackButton } from '../../components/base/BackButton'
import { View, Text } from '../../components/base/Themed'
import { NothingToDisplay } from '../base/Toast'
import { useGet } from '../../hooks/useGet'
import usePoses, { _keypoints, skeleton_points } from '../../hooks/usePoses'
import { Skia, matchFont } from '@shopify/react-native-skia'
import { _tokens } from '../../tamagui.config'
import { Platform } from 'react-native'
import { Camera, useCameraDevice, useSkiaFrameProcessor, type Frame } from 'react-native-vision-camera'

export default function AICamera() {
    let device = useCameraDevice('back')
    let ref = useRef<Camera>(null)
    let { resize, model, keypoints, process_keypoints, tensorHeight, tensorWidth } = usePoses('blazePose')
    let g = useGet()
    // console.log(__keypoints)
    let paint = Skia.Paint()
    paint.setColor(Skia.Color(_tokens.primary900))
    paint.setStrokeWidth(5)
    const fontFamily = Platform.select({ ios: "Helvetica", default: "serif" });
    const fontStyle = {
        fontFamily,
        fontSize: 14,
    };
    const font = matchFont(fontStyle);
    let fp = useSkiaFrameProcessor(frame => {
        'worklet'
        frame.render()
        if (!model || !keypoints || !process_keypoints) return;
        let [w, h] = [frame.width, frame.height]
        let arr = resize(frame)
        let outputs = model.runSync([arr])
        let output = outputs[0]
        if (!output) return;
        let results = process_keypoints(output)
        console.log(results)
        if (!results) return;
        let fx = (_x: number) => (w * (_x / (tensorWidth-1)))
        let fy = (_y: number) => (h * (_y / (tensorHeight-1)))
        for (var keypoint of _keypoints) {
            if (keypoint.includes('finger')) continue;
            if (results[keypoint] && results[keypoint]?.confidence > 0.70 && results[keypoint]?.confidence < 1.01) {
                let {x,y,z} = results[keypoint]
                if (!x || !y) continue;
                let x1 = fx(x)
                let y1 = fy(y)
                frame.drawCircle(x1, y1, 5, paint)
                frame.drawText(`${keypoint}, (${x1}, ${y1})`, x1 + 10, y1, paint, font)
            }
        }
        for (var point of skeleton_points) {
            let [from, to] = [results[point[0]], results[point[1]]]
            if (!from || !to) continue;
            let {x: x1, y: y1, z: z1, confidence: c1} = from
            let {x: x2, y: y2, z: z2, confidence: c2} = to
            if (c1 > 0.7 && c2 > 0.7 && c1 < 1.01 && c2 < 1.01) {
                frame.drawLine(fx(x1), fy(y1), fx(x2), fy(y2), paint)
            }
        }

    }, [resize, model, paint, font])

    if (!device) return <View>
        <BackButton />
        <NothingToDisplay text='No camera device' />
    </View>
    return (
        <View includeBackground style={{ flex: 1 }}>
            <BackButton inplace/>
            <Camera
                ref={ref}
                pixelFormat="rgb"
                focusable
                frameProcessor={fp}
                device={device}
                isActive={true}
                style={{ height: g.s.width, width: g.s.width }}
            >
            
            </Camera>
        </View>
    )
}


