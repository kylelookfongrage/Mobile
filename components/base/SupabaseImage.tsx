import React from 'react'
import { useStorage } from '../../supabase/storage';
import { View } from './Themed';
import { defaultImage, isStorageUri } from '../../data';
import { Image, ImageBackground } from 'react-native';
import tw from 'twrnc'

export default function SupabaseImage(props: { uri: string, style: string | any, resizeMode?: string; background?: boolean, children?: any }){
    let [src, setSrc] = React.useState<string>('')
    const s = useStorage()
    React.useEffect(() => {
        let img = props.uri || defaultImage
        if (isStorageUri(img)) {
            let uri = s.constructUrl(img)?.data?.publicUrl
            if (uri) setSrc(uri)
        } else {
            setSrc(img)
        }
    }, [props.uri])
    if (!src) return <View />
    let Component = props.background ? ImageBackground : Image
    //@ts-ignore
    return <Component {...(props.background ? props : {})} source={{ uri: src }} style={(typeof props.style === 'string') ? tw`${props.style}` : props.style} resizeMethod={props.resizeMode || 'scale'} />
}