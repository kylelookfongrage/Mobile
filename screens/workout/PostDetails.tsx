import { View, Text } from '../../components/base/Themed'
import React, { useEffect, useMemo, useState } from 'react'
import { Comments, Favorite, Post, User } from '../../aws/models'
import { useCommonAWSIds } from '../../hooks/useCommonContext';
import { useNavigation } from '@react-navigation/native';
import { DataStore, Storage } from 'aws-amplify';
import { defaultImage, formatCash, getMatchingNavigationScreen, isStorageUri } from '../../data';
import { BackButton } from '../../components/base/BackButton';
import { ScrollView, TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import tw from 'twrnc'
import { ExpoIcon } from '../../components/base/ExpoIcon';
import { KeyboardAvoidingView, Platform, useColorScheme, Image, Keyboard } from 'react-native';
import { PostMedia } from '../../components/features/PostMedia';
import moment from 'moment';
interface CommentDisplay extends Comments { userDidLike: boolean; numLikes: number }
interface UserInfo { [k: string]: { username: string; img: string; name: string | null } }

export default function PostDetails(props: { id: string }) {
    const [post, setPost] = useState<Post | null>(null);
    const { userId } = useCommonAWSIds();
    const [FETCH_AMOUNT, setFetchAmount] = useState<number>(30)
    const [userMapping, setUserMapping] = useState<UserInfo>({})
    const [pageNumber, setPageNumber] = useState<number>(0)
    const [postComments, setPostComments] = useState<CommentDisplay[]>([])
    const [numComments, setNumComments] = useState<number>(0)
    const [likes, setLikes] = useState<number>(0)
    const [userHasLiked, setUserHasLiked] = useState<boolean>(false)
    const [allFetched, setAllFetched] = useState<boolean>(false)
    const now = moment()
    const prepare = async () => {
        const internalUserInfo: UserInfo = { ...userMapping }
        if (!post) {
            const postNoMedia = await DataStore.query(Post, props.id)
            if (!postNoMedia) return;
            const user = await DataStore.query(User, postNoMedia.userID)
            const nComments = (await postNoMedia.Comments.toArray()).length
            setNumComments(nComments)
            const nLikes = (await DataStore.query(Favorite, f => f.and(fav => [fav.potentialID.eq(props.id), fav.type.eq('POST')]))).length
            const userliked = (await DataStore.query(Favorite, f => f.and(fav => [fav.potentialID.eq(props.id), fav.type.eq('POST'), fav.userID.eq(userId)]))).length > 0
            setLikes(nLikes)
            setUserHasLiked(userliked)
            if (user) {
                let img = user.picture || defaultImage
                if (isStorageUri(img)) img = await Storage.get(img, { expires: 900 })
                internalUserInfo[user.id] = { name: user.name || null, img, username: user.username }
            }
            setPost(postNoMedia)
        }
        let internalMapping: UserInfo = {...userMapping}
        if (!internalMapping[userId]) {
            const user = await DataStore.query(User, userId)
            if (!user) return;
            let img = user.picture || defaultImage
            if (isStorageUri(img)) img = await Storage.get(img)
            internalMapping[userId] = {name: user.name || null, username: user.username, img}
        }
        if (allFetched) return;
        let comments = await DataStore.query(Comments, p => p.and(c => [
            c.postID.eq(props.id), c.type.eq('POST'),
            c.or(com => [com.createdAt.lt(now.utc().format()), com.userID.ne(userId)])
        ]), { sort: x => x.createdAt('DESCENDING'), limit: FETCH_AMOUNT, page: pageNumber })
        let newComments: CommentDisplay[] = []
        for (var comment of comments) {
            let info = internalUserInfo[comment.userID]
            if (!info) {
                const user = await DataStore.query(User, comment.userID)
                if (!user) continue;
                let img = user.picture || defaultImage
                if (isStorageUri(img)) img = await Storage.get(img, { expires: 900 })
                internalUserInfo[user.id] = { name: user.name || null, img, username: user.username }
            }
            const numLikes = (await DataStore.query(Favorite, f => f.and(fav => [fav.potentialID.eq(comment.id), fav.type.eq('COMMENT')]))).length
            const userDidLike = (await DataStore.query(Favorite, f => f.and(fav => [fav.potentialID.eq(comment.id), fav.type.eq('COMMENT'), fav.userID.eq(userId)]))).length > 0
            newComments.push({ ...comment, numLikes, userDidLike })
        }
        setPostComments([...postComments, ...newComments])
        setAllFetched(newComments.length < FETCH_AMOUNT)
        setUserMapping(internalUserInfo)
    }
    useEffect(() => {
        if (!props.id) return;
        prepare()
    }, [pageNumber])
    const dm = useColorScheme() === 'dark'
    const onSubmitPress = async () => {
        if (!newComment || newComment === '') return;
        const newCommentDB = await DataStore.save(new Comments({
            userID: userId, string: newComment, postID: props.id, potentialID: props.id, type: 'POST'
        }))
        setNewComment('')
        const newCommentDisplay: CommentDisplay = {...newCommentDB, userDidLike: false, numLikes: 0}
        setPostComments([newCommentDisplay, ...postComments])
        setFetchAmount(FETCH_AMOUNT + 1)
        Keyboard.dismiss()
    }
    const [newComment, setNewComment] = useState<string>('')
    const [shouldShowMore, setShouldShowMore] = useState<boolean>(false);
    if (!post) return <View includeBackground />
    const postUser = userMapping[post?.userID]
    if (!postUser) return <View includeBackground />

    return (
        <View includeBackground style={{ flex: 1 }}>
            <BackButton />
            <KeyboardAvoidingView enabled behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView
                    contentContainerStyle={tw`px-6 pb-9 pt-4`}
                    keyboardDismissMode='interactive'
                >
                    <View style={tw`flex-row items-center`}>
                        <Image style={tw`h-15 w-15 rounded-full`} source={{ uri: postUser.img }} />
                        <View style={tw`ml-2 max-w-9/12`}>
                            <Text weight='semibold'>{postUser.name}</Text>
                            <Text style={tw`text-gray-500 text-xs`}>@{postUser.username}</Text>
                        </View>
                    </View>
                    <Text style={tw`my-3`}>{shouldShowMore ? post.description : post.description?.substring(0, 100)} {(post?.description?.length || 100) >= 99 && <Text weight='semibold' style={tw`text-gray-500`} onPress={() => setShouldShowMore(!shouldShowMore)}>...{shouldShowMore ? 'Hide' : 'Show More'}</Text>}</Text>
                    {/* @ts-ignore */}
                    <PostMedia canNavigate onDismissTap={() => { }} media={post.media} mealId={post.mealID} exerciseId={post.exerciseID} runProgressId={post.runProgressID} workoutId={post.workoutID} />
                    <View style={tw`flex-row items-center justify-between mt-3 mb-9`}>
                        <View style={tw`flex-row items-center`}>
                            <TouchableOpacity onPress={async () => {
                                if (userHasLiked) {
                                    const ogLike = await DataStore.query(Favorite, f => f.and(fav => [fav.potentialID.eq(post.id), fav.type.eq('POST'), fav.userID.eq(userId)]))
                                    if (ogLike[0]) {
                                        await DataStore.delete(Favorite, ogLike[0].id)
                                        setUserHasLiked(false)
                                        setLikes(likes - 1)
                                    }
                                } else {
                                    await DataStore.save(new Favorite({
                                        potentialID: post.id,
                                        type: 'POST',
                                        userID: userId
                                    }))
                                    setUserHasLiked(true)
                                    setLikes(likes + 1)
                                }
                            }} style={tw`flex-row items-center justify-center`}>
                                <ExpoIcon name={userHasLiked ? 'heart' : 'heart-outline'} iconName='ion' size={25} color={userHasLiked ? 'red' : 'gray'} />
                                <Text style={tw`text-gray-500 ml-2 text-xs`}>{likes} likes</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => { }} style={tw`flex-row items-center justify-center ml-5`}>
                                <ExpoIcon name={'message-circle'} iconName='feather' size={25} color={'gray'} />
                                <Text style={tw`text-gray-500 ml-2 text-xs`}>{numComments} comments</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={tw`text-xs text-gray-500`}>{moment(post.createdAt).fromNow()}</Text>
                    </View>
                    {postComments.length === 0 && <Text style={tw`text-center p-6 text-gray-500`}>There are no comments to show. Be the first to add one!</Text>}
                    {postComments.map(comment => {
                        const info = userMapping[comment.userID]
                        const onLikeTap = async (id: string, liked: boolean) => {
                            if (liked) {
                                const ogLike = await DataStore.query(Favorite, f => f.and(fav => [
                                    fav.potentialID.eq(id), fav.type.eq('COMMENT'), fav.userID.eq(userId)
                                ]))
                                if (ogLike[0]) {
                                    await DataStore.delete(Favorite, ogLike[0].id)
                                    setPostComments([...postComments].map(x => {
                                        if (x.id === comment.id) {
                                            return {...x, numLikes: x.numLikes - 1, userDidLike: false}
                                        }
                                        return x
                                    }))
                                }
                            } else {
                                await DataStore.save(new Favorite({
                                    potentialID: comment.id, userID: userId, type: 'COMMENT' 
                                }))
                                setPostComments([...postComments].map(x => {
                                    if (x.id === comment.id) {
                                        return {...x, numLikes: x.numLikes + 1, userDidLike: true}
                                    }
                                    return x
                                }))
                            }
                        }
                        if (!info) return <View key={comment.id} />
                        return <CommentDisplay key={comment.id} info={info} comment={comment} onLikeTap={onLikeTap} />
                    })}
                    {postComments.length > 0 && <TouchableOpacity disabled={allFetched} onPress={() => {
                        setPageNumber(pageNumber + 1)
                    }}>
                        <Text weight='semibold' style={tw`text-center text-gray-500 py-4`} >{allFetched ? 'That\'s all!' : 'Show More...'}</Text>
                    </TouchableOpacity>}
                </ScrollView>
                <View style={tw`pt-3`}>
                    <View style={tw`mb-6 w-12/12 flex-row items-center justify-evenly`}>
                        <TextInput onSubmitEditing={onSubmitPress} value={newComment} onChangeText={setNewComment} placeholderTextColor={'gray'} placeholder='Comment....' style={tw`bg-gray-${dm ? '700/50' : '300'} w-8.5/12 rounded-2xl p-4 text-${dm ? 'white' : 'black'}`} multiline numberOfLines={3} />
                        <TouchableOpacity onPress={onSubmitPress} style={tw`items-center justify-center p-3 bg-gray-${dm ? '700/40' : '300'} rounded-full`}>
                            <ExpoIcon name='message-circle' iconName='feather' size={25} color='gray' />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    )
}


const CommentDisplay = (props: { info: { name: string | null; img: string; username: string }, onLikeTap: (id: string, liked: boolean) => void, comment: CommentDisplay }) => {
    const { info, onLikeTap, comment } = props;
    const internalComment = useMemo(() => comment, [comment])
    const navigator = useNavigation()
    const dm = useColorScheme() === 'dark'
    return <View style={tw`py-1 my-1`}>
        <View style={tw`flex-row items-center justify-between w-12/12`}>
            <View style={tw`flex-row items-start max-w-9/12`}>
                <Image source={{ uri: info.img }} style={tw`h-10 w-10 rounded-full mr-1.5`} />
                <View>
                    <Text onPress={() => {
                        const screen = getMatchingNavigationScreen('User', navigator)
                        //@ts-ignore
                        navigator.navigate(screen, { id: comment.userID })
                    }} style={tw`text-xs text-red-500`} weight='semibold'>@{info.username}</Text>
                    <Text style={tw`mt-1 text-gray-${dm ? '300' : '500'}`}>{comment.string}</Text>
                </View>
            </View>
            <TouchableOpacity style={tw`p-2 items-center flex-row justify-center`} onPress={() => onLikeTap && onLikeTap(internalComment.id, internalComment.userDidLike)}>
                <ExpoIcon name={internalComment.userDidLike ? 'heart' : 'heart-outline'} iconName='ion' size={20} color={internalComment.userDidLike ? 'red' : 'gray'} />
                <Text style={tw`text-xs text-gray-500 ml-2`} weight='semibold'>{formatCash(internalComment.numLikes)}</Text>
            </TouchableOpacity>
        </View>
        <Text style={tw`text-xs text-gray-500 text-right`}>{moment(internalComment.createdAt).fromNow()}</Text>
    </View>
}