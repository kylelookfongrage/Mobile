import React, { useEffect } from 'react'
import { useStorage } from '../../supabase/storage';
import { View } from './Themed';
import { defaultImage, isStorageUri } from '../../data';
import { Image, ImageBackground, Pressable } from 'react-native';
import tw from 'twrnc'
import useAsync from '../../hooks/useAsync';
const loadingIndicator = require('../../assets/animations/loader.gif')
import * as fs from 'expo-file-system';
import { useNavigation } from '@react-navigation/native';
import usePoses, { useBlazePose } from '../../hooks/usePoses';
import { Circle, Svg } from 'react-native-svg';
import { _tokens } from '../../tamagui.config';

export default function SupabaseImage(props: { 
    uri: string; 
    style: string | any; 
    disableSave?: boolean; 
    resizeMode?: string; 
    background?: boolean, 
    disablePress?: boolean
    children?: any 
    onSrcChange?: (src: string) => void;
}){
    let [src, setSrc] = React.useState<string>('')
    const s = useStorage()
    let n = useNavigation()

    useAsync(async () => {
        let _img = props.uri || defaultImage
        let img = _img;
        if (img[0] && img[0] === '/') {
            img=img.substring(1)
        }
        let dirs = listDirs(img)
        try {
            if (dirs.length) {
                for (var dir of dirs) {
                    let _path = fs.documentDirectory + dir + '/'
                    let info = await fs.getInfoAsync(_path)
                    if (info.exists) continue;
                    await fs.makeDirectoryAsync(_path, {intermediates: true})
                }
            }
            let path = (fs.documentDirectory + img).replace(/ /g,"_");
            let _res = await fs.getInfoAsync(path)
            if (_res.exists) {
                setSrc(_res.uri)
            } else {
                if (isStorageUri(img)) {
                    console.log('fetching from supabase')
                    let _uri = s.constructUrl(img)?.data?.publicUrl
                    try {
                        let fsRes = await fs.downloadAsync(_uri, path)
                        setSrc(fsRes.uri)
                    } catch (error) {
                        setSrc(_uri)
                    }
                } else {
                    setSrc(img)
                }
            }
        } catch (error) {
            console.log(error?.toString())
            setSrc('')
        }
    }, [props.uri])

    useEffect(() => {
        if (!src || !props.onSrcChange) return;
        props.onSrcChange(src)
    }, [src])

    if (!src) return <View {...props.style} />
    let Component = props.background ? ImageBackground : Image
    return <Pressable disabled={props.disablePress} {...props.style} onPress={() => n.navigate('Image', {uris: [src]})}>
        {/* @ts-ignore */}
        <Component loadingIndicatorSource={loadingIndicator} {...(props.background ? props : {})} source={src ? { uri: src } : loadingIndicator} style={(typeof props.style === 'string') ? tw`${props.style}` : props.style} resizeMethod={props.resizeMode || 'scale'} />
    </Pressable>
}


const listDirs = (_x: string) => {
    let x = _x;
    if (x[0] && x[0] === '/') {
        x=x.substring(1)
    } 
    let _list = x.split('/')
    if (_list.length === 1) return []
    return _list.slice(0, -1)
}