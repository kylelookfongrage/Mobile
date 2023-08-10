import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedScrollHandler,
    interpolate,
    Extrapolation,
    Extrapolate,
} from 'react-native-reanimated';
import { MediaType } from '../types/Media';
import * as ImagePicker from 'expo-image-picker'
import React, { useRef } from 'react';
import { Dimensions, SafeAreaView, TouchableOpacity, useColorScheme, View, Image, StyleSheet, FlatList } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { DefaultVideoPlayer, Video } from './Video';
import { ExpoIcon } from './ExpoIcon';
import tw from 'twrnc'
import { Text } from './Themed';
import { Storage } from 'aws-amplify';
import { defaultImage, isStorageUri } from '../data';
import { ResizeMode } from 'expo-av';
import VideoPlayer from 'expo-video-player'


interface ImagePickerViewProps {
    srcs?: MediaType[];
    type?: "video" | "image" | "all"
    onChange?: (media: MediaType[]) => void;
    wide?: boolean;
    imageStyle?: any;
    pt?: number;
    editable?: boolean
    resizeMode?: any;
    multiple?: boolean;
    snapTo?: number
    height?: number;
}
export const ImagePickerView = (props: ImagePickerViewProps) => {
    let mediaType = ImagePicker.MediaTypeOptions.All
    if (props.type === 'image') mediaType = ImagePicker.MediaTypeOptions.Images
    if (props.type === 'video') mediaType = ImagePicker.MediaTypeOptions.Videos
    const [mediaSources, setMediaSources] = React.useState<MediaType[]>([])
    const currentMediaPermissions = ImagePicker.useMediaLibraryPermissions()
    const currentCameraPermissions = ImagePicker.useCameraPermissions()

    const setMedia = async (camera: boolean) => {
        const settings = {
            mediaTypes: mediaType,
            aspect: [9, 16],
            allowsEditing: true,
            quality: 1
        }
        //@ts-ignore
        const result = await (camera ? ImagePicker.launchCameraAsync({ ...settings }) : ImagePicker.launchImageLibraryAsync({ ...settings }))
        if (result && result.assets && result.assets.length > 0) {
            const res = result.assets[0]
            setMediaSources([...mediaSources, { uri: res.uri, type: res.type }])
            props.onChange && props.onChange([...mediaSources, { uri: res.uri, type: res.type }])
            if (scrollRef && scrollRef.current) {
                const pos = (mediaSources.length) * width
                scrollRef.current.scrollTo({ x: pos, y: 0, animated: true })
            }
        }

    }
    const pickMedia = async (camera: boolean) => {
        if (camera) {
            if (!currentCameraPermissions[0] || !currentCameraPermissions[0]?.granted) {
                const hasAccess = (await ImagePicker.requestCameraPermissionsAsync()).granted
                if (hasAccess) {
                    await setMedia(camera)
                } else {
                    alert('We need your access to the camera, please go to your settings.')
                }
            } else {
                await setMedia(camera)
            }

        } else {
            if (!currentMediaPermissions[0] || !currentMediaPermissions[0]?.granted) {
                const hasAccess = (await ImagePicker.requestMediaLibraryPermissionsAsync()).granted
                if (hasAccess) {
                    setMedia(camera)
                } else {
                    alert('We need your access to the camera roll, please go to your settings.')
                }
            } else {
                setMedia(camera)
            }
        }

    }
    React.useEffect(() => {
        //@ts-ignore
        setMediaSources([])
        if (props.srcs && props.srcs.length > 0) {
            Promise.all(props.srcs.map(async x => {
                if (isStorageUri(x.uri || defaultImage)) {
                    const url = await Storage.get(x.uri||defaultImage)
                    return { uri: url, type: x.type, awsId: x.uri }
                } else {
                    return x
                }
            })).then(x => {
                setMediaSources(x)
            })
        }
    }, [props.srcs])
    const onDelete = (uri: string) => {
        props.onChange && props.onChange(mediaSources.filter(x => x.uri !== uri))
    }

    const styles = StyleSheet.create({
        img: {
            width: Dimensions.get('screen').width,
            height: props.height || Dimensions.get('screen').height * 0.55,
        }
    })
    const dm = useColorScheme() === 'dark'

    const scrollX = useRef(new Animated.Value(0)).current;

    const width = Dimensions.get('screen').width
    const scrollRef = useRef<ScrollView>(null)
    const navigator = useNavigation()

    return <View style={[{ flex: 1 }]}>
        <Animated.ScrollView onScroll={Animated.event([{
            nativeEvent: {
                contentOffset: {
                    x:
                        scrollX
                }
            }
            // @ts-ignore
        }])} horizontal showsHorizontalScrollIndicator={false} ref={scrollRef} decelerationRate={0.5} scrollEventThrottle={16} snapToInterval={props.snapTo || width}
            // @ts-ignore
            contentContainerStyle={[tw`${mediaSources.length === 0 ? 'py-20' : ''} justify-center`]} style={{height: styles.img.height}}>
            {/* Image */}
            {mediaSources.map((imageSource: MediaType, i) => {
                //@ts-ignore
                return <View key={i} style={[tw` items-center ${props.pt ? 'pt-' + props.pt : ''}`, {
                    width: props.snapTo || Dimensions.get('screen').width
                }]}>
                    {mediaSources.length > 1 && <View style={[{ position: 'absolute', top: 40, right: 20, zIndex: 1 }, tw`py-2 px-4 bg-gray-${dm ? '700' : '300'} rounded-lg`]}>
                        {(i === mediaSources.length - 1 && props.editable) && <Text style={tw``}>Scroll to add</Text>}
                        {(i !== mediaSources.length - 1 || !props.editable) && <Text style={tw``}>{i + 1}/{mediaSources.length}</Text>}
                    </View>}
                    {imageSource && imageSource.type === 'image' && <TouchableOpacity onPress={() => {
                        const numberOfVideos = mediaSources.filter(x => x.type === 'video').length
                        //@ts-ignore
                        navigator.navigate('Image', { uris: mediaSources.filter((x => x.type === 'image')).map((x => x.uri)), defaultIndex: i < numberOfVideos ? i : i - numberOfVideos })
                    }}>
                        <Image
                            resizeMethod={props.resizeMode || 'contain'}
                            source={{ uri: imageSource.uri }}
                            style={props.imageStyle ? props.imageStyle : styles.img} />
                    </TouchableOpacity>}
                    {imageSource && imageSource.type === 'video' && <View style={tw``}>
                        <Video
                            source={{ uri: imageSource.uri }}
                            // @ts-ignore
                            resizeMode={props.resizeMode || 'cover'}
                            style={styles.img}
                        />
                    </View>}
                    {props.editable === true && <TouchableOpacity style={[tw`p-1 px-4 -mt-20 items-end w-12/12`]} onPress={() => onDelete(imageSource.uri)}>
                        <View style={tw`bg-gray-${dm ? '700' : '300'} w-2/12 -mt-6 items-center p-2 rounded-lg`}>
                            <ExpoIcon name='trash-bin' iconName='ion' size={25} color={dm ? 'white' : 'black'} />
                        </View>
                    </TouchableOpacity>}
                </View>
            })}
            {props.editable !== false && <View style={[tw`flex-row items-center mt-9 justify-center pt-4`, { width: props.snapTo || Dimensions.get('screen').width }]}>
                <TouchableOpacity style={tw`p-4 items-center justify-center`} onPress={() => pickMedia(false)}>
                    <Text style={tw``}>{(props.multiple !== true && mediaSources.length > 0) ? 'Replace' : 'Pick'} a{props.type === 'image' ? "n image" : props.type === 'video' ? " video" : 'n image or video'}</Text>
                </TouchableOpacity>
                <Text>|</Text>
                <TouchableOpacity style={tw`p-4 items-center justify-center`} onPress={() => pickMedia(true)}>
                    <Text style={tw``}>{(props.multiple !== true && mediaSources.length > 0) ? 'Replace' : 'Take'} a{props.type === 'image' ? "n image" : props.type === 'video' ? " video" : 'n image or video'}</Text>
                </TouchableOpacity>
            </View>}
        </Animated.ScrollView>
    </View>
}

