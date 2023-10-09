import React from 'react'
import { useStorage } from '../../supabase/storage';
import { View } from './Themed';
import { defaultImage, isStorageUri } from '../../data';
import { Image } from 'react-native';
import tw from 'twrnc'

export default function SupabaseImage(props: { uri: string, style: string, resizeMode?: string; }){
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
    //@ts-ignore
    return <Image source={{ uri: src }} style={tw`${props.style}`} resizeMethod={props.resizeMode} />
}