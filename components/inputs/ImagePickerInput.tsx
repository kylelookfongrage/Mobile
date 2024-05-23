import { MediaType, isStorageUri } from '../../data';
import { useGet } from '../../hooks/useGet';
import SupabaseImage from '../base/SupabaseImage';
import { View, Text } from '../base/Themed'
import React, { useMemo, useState } from 'react'
import { Video } from '../base/Video';
import { useStorage } from '../../supabase/storage';
import { ResizeMode } from 'expo-av';
import tw from 'twrnc'
import { TouchableOpacity } from 'react-native';
import { Icon } from '../base/ExpoIcon';
import Spacer from '../base/Spacer';
import * as ImagePicker from 'expo-image-picker'
import { _tokens } from '../../tamagui.config';

interface ImagePickerInputProps {
    srcs?: MediaType[];
    type?: "video" | "image" | "all";
    onChange?: (media: MediaType[]) => void;
    editable?: boolean;
    multiple?: boolean;
    height?: number;
}

const ImagePickerInput = (props: ImagePickerInputProps) => {
    let { srcs, type, onChange, editable, multiple, height } = props;
    let mediaType = ImagePicker.MediaTypeOptions.All;
    if (props.type === "image") mediaType = ImagePicker.MediaTypeOptions.Images;
    if (props.type === "video") mediaType = ImagePicker.MediaTypeOptions.Videos;
    const currentMediaPermissions = ImagePicker.useMediaLibraryPermissions();
    const currentCameraPermissions = ImagePicker.useCameraPermissions();
    let g = useGet();
    let s = useStorage()
    let [selectedSrc, setSelectedSrc] = useState(0)
    let selectedMedia = useMemo(() => {
        let _src = srcs?.[selectedSrc]
        if (!_src) return null;
        if (isStorageUri(_src.uri)) {
            let res = s.constructUrl(_src.uri)
            if (res?.data?.publicUrl) _src['uri'] = res.data.publicUrl
        }
        return _src
    }, [selectedSrc])

    let _imageStyle = {
        width: g.s.width,
        height: g.s.height * 0.55, alignSelf: 'center', ...tw`mb-9`
    }
    let selectMedia = async (camera?: boolean) => {
        let [_permission, requestPermission] = camera ? currentCameraPermissions : currentMediaPermissions
        try {
            if (_permission?.granted) {
                let res = await requestPermission()
                if (!res.granted) throw Error(`We need your permission to access your ${camera ? 'Camera' : "Media Library"}`)
                const settings = {
                    mediaTypes: mediaType,
                    aspect: [9, 16],
                    allowsEditing: true,
                    quality: 1,
                };
                //@ts-ignore
                const result = await (camera //@ts-ignore
                    ? ImagePicker.launchCameraAsync({ ...settings }) //@ts-ignore
                    : ImagePicker.launchImageLibraryAsync({ ...settings }));
                if (result && result.assets && result.assets.length > 0) {
                    const res = result.assets[0];
                    console.log(res)
                    props.onChange &&
                        props.onChange([
                            ...(props.srcs || []),
                            { uri: res.uri, type: res.type || "image" },
                        ]);
                }
            }
        } catch (error) {
            g.setFn(p => ({ ...p, error: error?.toString() || 'There was a problem', loading: false }))
        }
    }

    const onDelete = (uri: string) => {
        if (props.onChange) {
          if (!props.multiple) {props.onChange([])}
          else {
            props.onChange((props.srcs || []).filter((x) => x.uri !== uri && x.supabaseID !== uri));
          }
        }
      };

    return (
        <View card style={{ flex: 1, height: _imageStyle.height, ...tw`justify-center items-center flex` }}>
            {(!selectedMedia && editable) && <View style={tw`mb-9 flex-row items-center justify-around w-12/12`}>
                <TouchableOpacity onPress={async () => await selectMedia(false)} style={tw`justify-center items-center`}>
                    <Icon name='Image' size={40} color='gray' weight='bold' />
                    <Spacer sm />
                    <Text gray semibold lg>Media Library</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={async () => await selectMedia(true)} style={tw`justify-center items-center`}>
                    <Icon name='Camera' size={40} color='gray' />
                    <Spacer sm />
                    <Text gray semibold lg>Camera</Text>
                </TouchableOpacity>
            </View>}
            {(editable === true && selectedMedia) && (
                <TouchableOpacity
                  style={[{position: 'absolute', alignItems: 'center', justifyContent: 'center', top: 50, right: 0, marginTop: -20, paddingTop: 20, paddingBottom: 15, paddingHorizontal: 10, zIndex: 40000000}]}
                  onPress={() => onDelete(selectedMedia?.uri || '')}
                >
                 <Icon name="Delete" weight="bold" size={25} color={_tokens.error} />
                    <Text bold>
                      Remove
                    </Text>
                </TouchableOpacity>
              )}
            {selectedMedia && (selectedMedia.type === 'image' ? <SupabaseImage style={{ ..._imageStyle }} uri={selectedMedia.uri} /> : <Video indicatorMarginTop={-20}
                indicatorMarginBottom={33} style={{ ..._imageStyle }} resizeMode={ResizeMode.CONTAIN} source={{ uri: selectedMedia.uri }} />)}
        </View>
    )
}

export default ImagePickerInput