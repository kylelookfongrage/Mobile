import { useNavigation } from '@react-navigation/native'
import { BackButton } from '../../components/base/BackButton'
import { View, Text } from '../../components/base/Themed'
import React, { useEffect, useMemo, useState } from 'react'
import { ProgressDao } from '../../types/ProgressDao'
import { useSelector } from '../../redux/store'
import SaveButton from '../../components/base/SaveButton'
import moment from 'moment'
import Spacer from '../../components/base/Spacer'
import { useGet } from '../../hooks/useGet'
import tw from 'twrnc'
import { _tokens } from '../../tamagui.config'
import { MediaType, titleCase } from '../../data'
import { Icon } from '../../components/base/ExpoIcon'
import { TouchableOpacity } from 'react-native'
import Overlay from '../../components/screens/Overlay'
import { SettingItem } from '../home/Settings'
import * as ImagePicker from "expo-image-picker";
import * as Linking from 'expo-linking'
import SupabaseImage from '../../components/base/SupabaseImage'
import { useStorage } from '../../supabase/storage'


type TProgressPictureInput = { left: null | string; right: null | string; back: null | string; front: null | string }
let defaultProgressPictureInput: TProgressPictureInput = { left: null, right: null, front: null, back: null }
let arr: (keyof TProgressPictureInput)[] = ['front', 'back', 'left', 'right']
const ProgressPicture = () => {
    let dao = ProgressDao(false)
    let { today } = useSelector(x => x.progress)
    const { profile } = useSelector(x => x.auth)
    let g = useGet();
    let n = useNavigation()
    let [pictures, setPictures] = useState(defaultProgressPictureInput)
    let [useCamera, setUseCamera] = useState(false)
    let [showSettings, setShowSettings] = useState(false)
    let [showActionsFor, setShowActionsFor] = useState(null as null | keyof TProgressPictureInput)
    let remainingPictures = useMemo(() => [...arr].filter(x => x!==showActionsFor), [showActionsFor])
    const [_cameraStatus, requestCamerAccess] = ImagePicker.useCameraPermissions();
    const [_mediaAccess, requestMediaAccess] = ImagePicker.useMediaLibraryPermissions();
    let {cameraStatus, mediaAccess} = useMemo(() => {
        return {cameraStatus: _cameraStatus?.granted || _cameraStatus?.status === ImagePicker.PermissionStatus.GRANTED, mediaAccess: _mediaAccess?.granted || _mediaAccess?.status === ImagePicker.PermissionStatus.GRANTED}
    }, [_cameraStatus, _mediaAccess])
    let s = useStorage()

    const requestImage = async (key: keyof TProgressPictureInput) => {
        try {
            let fn = useCamera ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync
            let assets = await fn({ mediaTypes: ImagePicker.MediaTypeOptions.Images, aspect: [16, 9]})
            if (assets && assets.assets && assets.assets[0]) {
                setPictures(p => {
                    let og = { ...p } //@ts-ignore
                    og[key] = assets.assets[0].uri
                    return og
                })
            }
        } catch (error) {
            let res = await requestPermissions(useCamera)
            if (res !== true) {
                alert('You will need to provide the permissions to use this feature. Please check the settings on this page.')
            }
        }
    }

    const requestPermissions = async (camera: boolean = false) => {
        let _permission = camera ? _cameraStatus : _mediaAccess
        if (_permission && (_permission.granted || _permission.status === ImagePicker.PermissionStatus.GRANTED)) return true;
        let fn = camera ? requestCamerAccess : requestMediaAccess
        try {
            let r = await fn()
            console.log('called, camera', camera)
            console.log(r)
            if (r.status === ImagePicker.PermissionStatus.GRANTED || r.granted) {
                return true;
            } 
            if (r.canAskAgain) {
              return false
            }
            throw Error()
        } catch (error) {
            Linking.openSettings()
            return false;
        }
    }

    let savePictures = async () => {
        // Obtain original IDs from today's progress
        let {left, right, front, back} = today || defaultProgressPictureInput
        let _obj = {left, right, front, back}

        try {
            g.set('loading', true)
            let obj = {...defaultProgressPictureInput}
            for (var key of arr) {
                if (_obj[key] && !pictures[key]){ //@ts-ignore
                    s.deleteBulk([_obj[key]])
                }
                if (!pictures[key]) continue; //@ts-ignore
                let res = await s.upload({type: 'image', uri: pictures[key], metadata: key, supabaseID: _obj[key]})
                console.log('key', key, 'result: ', res)
                if (res) {
                    obj[key] = res.uri || res.supabaseID
                }
            }
            console.log('obj,', obj)
            if (!today) throw Error('No progress found for today. Please restart application.')
            await dao.update(today?.id, obj)
            n.pop()
        } catch (error) {
            g.set('error', error?.toString() || 'There was a problem')
        } finally{
            g.set('loading', false)
        }
    }

    useEffect(() => {
        let _stg = { ...defaultProgressPictureInput }
        console.log(_stg)
        if (today?.left) _stg.left = today.left;
        if (today?.right) _stg.right = today.right;
        if (today?.back) _stg.back = today.back;
        if (today?.front) _stg.front = today.front;
        setPictures(_stg)
    }, [today])
    let _replacePicture = (key1: keyof TProgressPictureInput | null | undefined, key2: keyof TProgressPictureInput | null | undefined) => {
        if (!key1 || !key2) return;
        setPictures(p => {
            let og = { ...p }
            og[key1] = p[key2]
            og[key2] = p[key1]
            return og
        })
        setShowActionsFor(null)
    }
    let remove = (key: keyof TProgressPictureInput | null | undefined) => {
        if (!key) return;
        setPictures(p => {
            let og = { ...p }
            og[key] = null;
            return og
        })
        setShowActionsFor(null)
    }
    return (
        <View includeBackground style={{ flex: 1 }}>
            <BackButton Right={() => {
                return <TouchableOpacity style={tw`px-2`} onPress={() => setShowSettings(true)}>
                    <Icon name='Setting' color={g.dm ? _tokens.white : _tokens.black} size={25} />
                </TouchableOpacity>
            }} name={`Photo Gallery`} />
            <Text bold h3 center>Progress Photos</Text>
            <Text semibold lg gray center>{moment(today?.date).format('MMM Do, YYYY')}</Text>
            <Spacer sm />
            <View style={{ ...tw`px-2 flex flex-row flex-wrap items-center justify-center` }}>
                {arr.map(x => {
                    let _uri = pictures[x]
                    return <View key={x} style={{ ...tw`m-1.5 justify-center`, borderColor: _uri ? 'transparent' : g.dm ? _tokens.dark3 : _tokens.gray500, borderWidth: 2, borderStyle: 'dashed', borderRadius: 10, width: g.s.width * 0.44, height: g.s.height * 0.33 }}>
                        {!_uri && <TouchableOpacity onPress={() => requestImage(x)}>
                            <Text bold gray lg center>{titleCase(x)}</Text>
                            <Spacer sm />
                            <Icon name='Image' weight='bold' color={_tokens.gray500} size={40} style={tw`self-center`} />
                        </TouchableOpacity>}
                        {_uri && <TouchableOpacity onPress={() => setShowActionsFor(x)}>
                            <SupabaseImage background uri={_uri} style={{
                            borderRadius: 10, width: g.s.width * 0.43, height: g.s.height * 0.32
                        }} >
                            <Text center primary bold lg style={tw`mt-2`}>{titleCase(x)}</Text>
                            </SupabaseImage>
                            </TouchableOpacity>}
                    </View>
                })}
            </View>
            <Overlay visible={showSettings} dialogueHeight={60} onDismiss={() => setShowSettings(false)}>
                <Text h5 bold center>Progress Picture Settings</Text>
                <Spacer divider />
                {!cameraStatus && <SettingItem setting={{ title: 'Camera Access Not Granted', dangerous: true, description: mediaAccess ? '' : 'Without this or media permissions, you will not be able to upload pictures', onPress: async () => requestPermissions(true) }} />}
                {!mediaAccess && <SettingItem setting={{ title: 'Media Library Access Not Granted', dangerous: true, description: !cameraStatus ? '' : 'Without this or camera permissions, you will not be able to upload progress pictures', onPress: async () => requestPermissions(false) }} />}
                <SettingItem disabled={!cameraStatus || !mediaAccess} setting={{ title: 'Use Media Library', description: 'Whether or not to use the camera (default) or media library', switch: true, switchValue: (cameraStatus && mediaAccess) ? !useCamera : (mediaAccess && !cameraStatus ? true : false), onSwitch: b => setUseCamera(p => !p) }} />
                <SettingItem disabled={!pictures.back && !pictures.front && !pictures.left && !pictures.right} hideCarat setting={{
                    title: 'Delete All', description: 'This will remove all pictures, but you will still need to save', dangerous: true, onPress: () => {
                        setPictures(defaultProgressPictureInput)
                        setShowSettings(false)
                    }
                }} />
            </Overlay>
            <Overlay dialogueHeight={40} visible={showActionsFor ? true : false} onDismiss={() => setShowActionsFor(null)}>
                <Text h5 bold center>{titleCase(showActionsFor || '')} Progress Picture</Text>
                <Spacer divider sm/>
                {remainingPictures.map(x => {
                    return <View style={tw`mb-1`} key={x}>
                        <SettingItem disableMargin setting={{title: 'Replace with ' + titleCase(x), onPress: () => _replacePicture(showActionsFor, x) }} />
                    </View>
                })}
                <SettingItem hideCarat disableMargin setting={{dangerous: true, title: 'Delete ' + titleCase(showActionsFor || ''), onPress: () => remove(showActionsFor)}} />
            </Overlay>
            <SaveButton title='Save' onSave={savePictures} discludeBackground safeArea />
        </View>
    )
}

export default ProgressPicture