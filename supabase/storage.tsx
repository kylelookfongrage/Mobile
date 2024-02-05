import { supabase } from "../supabase";
import { MediaType, defaultImage, isStorageUri } from "../data";
import {decode} from 'base64-arrayBuffer';
import { useState } from "react";
//@ts-ignore
import { v4 as randomUUID } from 'uuid';
import * as VT from 'expo-video-thumbnails'



export enum BucketIds {
    public = 'public'
}



export function useStorage() {
    const storage = supabase.storage
    const [uploading, setUploading] = useState<boolean>(false)
    const upload = async (media: MediaType, bucket = BucketIds.public, setUpload=false) => {
        console.log(media)
        if (isStorageUri(media.uri)) return media;
        if (setUpload) {
            setUploading(true)
        }
        const uri = media.uri
        const splits = uri.split('.')
        const extension = splits[splits.length - 1]
        console.log(media.supabaseID + ': Original ID being uploaded')
        const fileName = media.supabaseID ? media.supabaseID : randomUUID() + '.' + extension
        console.log(fileName)
        let ext = uri.substring(uri.lastIndexOf('.') + 1)
        let formData = new FormData()
        //@ts-ignore
        formData.append('files', {
            uri: uri,
            name: fileName,
            type: (media.type === 'video' ? 'video/' : 'image/') + ext
        })
        const {data, error} = await storage.from(bucket).upload(fileName, formData, {upsert: true})
        if (setUpload) {
            setUploading(false)
        }
        if (data) {
            return {...media, uri: data.path, supabaseID: data.path}
        } else if (error) {
            console.log(error)
            throw Error('Cannot upload to server.')
        }
    }

    const uploadBulk = async(media: MediaType[]) => {
        let res = await Promise.all(media.map(async m => {
            return await upload(m)
        }))
        return res.filter(x => x) as MediaType[]
    }

    const uploadWithPreview = async (video: string | null | undefined, preview: string | null | undefined, originalVideoId: string | undefined=undefined, originalPreviewId: string | undefined=undefined): Promise<{video: string | null | undefined; preview: string | null | undefined}> => {
        let uri = video;
        let previewUri = preview || defaultImage
        console.log('settting video')
        if (video && !isStorageUri(video)) {
            console.log('getting vt')
            if (isStorageUri(video)) uri = constructUrl(video)?.data?.publicUrl
            let {uri: thumbnail} = await VT.getThumbnailAsync(video, {time: 0, quality: 0.7})
            previewUri = (await upload({type: 'image', uri: thumbnail}))?.uri
            uri = (await upload({type: 'video', uri: video, supabaseID: originalVideoId}))?.uri
        } else if (preview && !isStorageUri(preview)) {
            console.log('uploading preview')
            previewUri = (await upload({type: 'image', uri: preview, supabaseID: originalPreviewId}))?.uri
        }
        return {preview: previewUri, video: uri}
    }

    const uploadBulkWithPreview = async (media: MediaType[]): Promise<{media: MediaType[], preview: string} | undefined> => {
        let preview = media[0]
        if (!preview) return undefined;
        let previewUri = preview.uri
        if (preview && preview?.type === 'video') {
            if (previewUri && isStorageUri(previewUri)) previewUri = constructUrl(previewUri)?.data?.publicUrl
            let {uri} = await VT.getThumbnailAsync(previewUri, {time: 0, quality: 0.7})
            previewUri = uri
        }
        let previewUpload = await upload({type: 'image', uri: previewUri})
        if (!previewUpload) return undefined;
        let otherMedia = await uploadBulk(media)
        return {media: otherMedia, preview: previewUpload.uri}
    }

    const constructUrl = (uri: string, options?: any) => {
        return storage.from(BucketIds.public).getPublicUrl(uri, options)
    }   

    const download = async (path: string, bucket=BucketIds.public, options: any={}, publicUrl=true): Promise<string | null> => {
        const x = publicUrl ? storage.from(bucket).getPublicUrl(path, {...options}) : await storage.from(bucket).createSignedUrl(path, 86400, {...options})
        if (x?.data) {
            //@ts-ignore
            return x.data?.publicUrl || x.data?.signedUrl || null
        } else {
            return null
        }
    }
    return {upload, uploading, download, constructUrl, uploadBulk, uploadBulkWithPreview, uploadWithPreview}
}
