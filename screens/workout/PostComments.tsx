import { ActivityIndicator, Image, TextInput, Dimensions, Keyboard, KeyboardAvoidingView, Platform, TouchableOpacity, useColorScheme, Pressable } from 'react-native'
import { View, Text } from '../../components/base/Themed'
import React from 'react'
import tw from 'twrnc'
import { useNavigation } from '@react-navigation/native'
import { RefreshControl, ScrollView } from 'react-native-gesture-handler'
import { ExpoIcon } from '../../components/base/ExpoIcon'
import { Comments, Favorite, FavoriteType, User } from '../../aws/models'
import { DataStore, Storage } from 'aws-amplify'
import { defaultImage, formatCash, getMatchingNavigationScreen, isStorageUri } from '../../data'
import { useCommonAWSIds } from '../../hooks/useCommonContext'
import moment from 'moment'

interface CommentDisplay extends Comments {
    username: string;
    picture: string;
    userDidLike: boolean;
    numberLikes: number;
}

export default function PostComments(props: { postId: string; postType: FavoriteType; }) {
    const { postId, postType } = props;
    let { userId } = useCommonAWSIds()
    const height = Dimensions.get('screen').height
    const dm = useColorScheme() === 'dark'
    const navigator = useNavigation()
    const [uploading, setUploading] = React.useState<boolean>(false)
    let [comments, setComments] = React.useState<CommentDisplay[]>([])
    let [newComment, setNewComment] = React.useState<string>('')
    const [refreshing, setRefreshing] = React.useState<boolean>(false)
    let commentInput = React.useRef<TextInput | null>(null)
    const prepare = async () => {
        let commentsWithoutUsernames = await DataStore.query(Comments, c => c.and(x => [
            x.potentialID.eq(postId), x.type.eq(postType)
        ]), { sort: x => x.createdAt('DESCENDING'), limit: 100 })
        let commentsWithPictures: CommentDisplay[] = await Promise.all(commentsWithoutUsernames.map(async comment => {
            let user = (await DataStore.query(User, comment.userID))
            let username = user?.username || 'rage'
            let picture = user?.picture || defaultImage
            let likes = (await DataStore.query(Favorite, f=>f.and(fav => [
                fav.potentialID.eq(comment.id), fav.type.eq(FavoriteType.COMMENT)
            ]))).length
            const userDidLike = (await DataStore.query(Favorite, f=>f.and(fav => [
                fav.userID.eq(userId), fav.potentialID.eq(comment.id), fav.type.eq(FavoriteType.COMMENT)
            ]))).length > 0
            if (isStorageUri(picture)) {
                picture = await Storage.get(picture)
            }
            return { ...comment, username, picture, numberLikes: likes, userDidLike }
        }))
        setComments(commentsWithPictures)
        setRefreshing(false)
    }
    React.useEffect(() => {
        prepare()
    }, [])
    const onSubmitPress = async () => {
        if (newComment) {
            let savedComment = await DataStore.save(new Comments({
                type: postType,
                potentialID: postId,
                string: newComment,
                userID: userId,
                postID: props.postId
            }))
            let userDetails = await DataStore.query(User, userId)
            let pfp = userDetails?.picture || defaultImage
            if (isStorageUri(pfp)) {
                pfp = await Storage.get(pfp)
            }
            let newComments = [...comments]
            newComments.push({ ...savedComment, username: userDetails?.username || 'rage', picture: pfp, numberLikes: 0, userDidLike: false })
            setComments(newComments)
            setNewComment('')
        }
    }
    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} enabled style={[{ marginTop: height * 0.30, height: height * 0.70, flex: 1 }, tw`bg-${dm ? 'gray-800' : 'gray-200'} rounded-t-3xl py-6`]}>
            <View style={tw`flex-row items-center justify-between px-6`}>
                        <View style={tw``} />
                        <TouchableOpacity onPress={() => {
                            //@ts-ignore
                            navigator.pop()
                        }}>
                            <ExpoIcon iconName='feather' name='x-circle' color='gray' size={25} />
                        </TouchableOpacity>
                    </View>
            <ScrollView contentContainerStyle={tw`justify-between h-12/12`} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={prepare} />}>
                <View style={tw`px-6`}>
                    <Pressable onPress={() => {
                        Keyboard.dismiss()
                    }}>
                        {comments.length === 0 && <Text style={tw`text-center p-6 text-gray-500`}>There are no comments to show. Be the first to add one!</Text>}
                        {comments.map(comment => {
                            const onLikeTap = async () => {
                                if (comment.userDidLike) {
                                    let potentialComment = await DataStore.query(Favorite, f => f.and(fav => [
                                        fav.type.eq(FavoriteType.COMMENT), fav.potentialID.eq(comment.id), fav.userID.eq(userId)
                                    ]))
                                    let fav = potentialComment[0]
                                    if (fav) {
                                        await DataStore.delete(fav)
                                        setComments([...comments].map(x => {
                                            if(x.id === comment.id) {
                                                return {...x, userDidLike: false, numberLikes: x.numberLikes - 1}
                                            } return x
                                        }))
                                    }
                                }else {
                                    console.log('in else')
                                    await DataStore.save(new Favorite({type: FavoriteType.COMMENT, potentialID: comment.id, userID: userId}))
                                    console.log('saving')
                                    setComments([...comments].map(x => {
                                        console.log(x.id)
                                        if(x.id === comment.id) {
                                            return {...x, userDidLike: true, numberLikes: x.numberLikes + 1}
                                        } return x
                                    }))
                                }
                            }
                            return <View key={comment.id} style={tw`py-1 my-1`}>
                                <View style={tw`flex-row items-center justify-between w-12/12`}>
                                    <View style={tw`flex-row items-start max-w-9/12`}>
                                        <Image source={{ uri: comment.picture }} style={tw`h-10 w-10 rounded-full mr-1.5`} />
                                        <View>
                                            <Text onPress={() => {
                                                const screen = getMatchingNavigationScreen('User', navigator)
                                                //@ts-ignore
                                                navigator.pop()
                                                //@ts-ignore
                                                navigator.navigate(screen, {id: comment.userID})
                                            }} style={tw`text-xs text-red-500`} weight='semibold'>@{comment.username}</Text>
                                            <Text style={tw`mt-1 text-gray-${dm ? '300' : '500'}`}>{comment.string}</Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity style={tw`p-2 items-center flex-row justify-center`} onPress={onLikeTap}>
                                        <ExpoIcon name={comment.userDidLike ? 'heart' : 'heart-outline'} iconName='ion' size={20} color={comment.userDidLike ? 'red' : 'gray'} />
                                        <Text style={tw`text-xs text-gray-500 ml-2`} weight='semibold'>{formatCash(comment.numberLikes)}</Text>
                                    </TouchableOpacity>
                                </View>
                                <Text style={tw`text-xs text-gray-500 text-right`}>{moment(comment.createdAt).fromNow()}</Text>
                            </View>
                        })}
                    </Pressable>
                </View>
            </ScrollView>
            <View style={tw`pt-3`}>
                    <View style={tw`mb-6 w-12/12 flex-row items-center justify-evenly`}>
                        <TextInput onSubmitEditing={onSubmitPress} ref={commentInput} value={newComment} onChangeText={setNewComment} placeholderTextColor={'gray'} placeholder='Comment....' style={tw`bg-gray-${dm ? '700/50' : '300'} w-8.5/12 rounded-2xl p-4 text-${dm ? 'white' : 'black'}`} multiline numberOfLines={3} />
                        <TouchableOpacity onPress={onSubmitPress} style={tw`items-center justify-center p-3 bg-gray-${dm ? '700/40' : '300'} rounded-full`}>
                            <ExpoIcon name='message-circle' iconName='feather' size={25} color='gray' />
                        </TouchableOpacity>

                    </View>
                </View>
        </KeyboardAvoidingView>
    )
}