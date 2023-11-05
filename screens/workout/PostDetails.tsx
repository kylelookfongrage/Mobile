import { View, Text } from '../../components/base/Themed'
import React, { useEffect, useMemo, useState } from 'react'
import { useCommonAWSIds } from '../../hooks/useCommonContext';
import { useNavigation } from '@react-navigation/native';
import { defaultImage, formatCash, getMatchingNavigationScreen, isStorageUri } from '../../data';
import { BackButton } from '../../components/base/BackButton';
import { ScrollView, TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import tw from 'twrnc'
import { ExpoIcon } from '../../components/base/ExpoIcon';
import { KeyboardAvoidingView, Platform, useColorScheme, Image, Keyboard, Dimensions } from 'react-native';
import { PostMedia } from '../../components/features/PostMedia';
import moment from 'moment';
import { Tables } from '../../supabase/dao';
import { supabase } from '../../supabase';
import SupabaseImage from '../../components/base/SupabaseImage';
import Spacer from '../../components/base/Spacer';
import { PostDao } from '../../types/PostDao';
import useHaptics from '../../hooks/useHaptics';
import { ShowMoreDialogue } from '../home/ShowMore';
type TPost = Tables['post']['Row'] & {user: {pfp?: string|null|undefined; name: string; username: string, feed?: Tables['feed']['Row'][]} }
type TComment = Tables['comment']['Row'] & {user: {pfp?: string|null|undefined; name: string; username: string} }

export default function PostDetails(props: { id: string }) {
    
    const [post, setPost] = useState<TPost | null>(null);
    const { profile } = useCommonAWSIds();
    const [pageNumber, setPageNumber] = useState<number>(0)
    const [postComments, setPostComments] = useState<TComment[]>([])
    const [numComments, setNumComments] = useState<number>(0)
    const [userHasLiked, setUserHasLiked] = useState<boolean>(false)
    const now = moment()
    const prepare = async () => {
       let res = await supabase.from('post').select('*, user(name, pfp,username), feed(*)').filter('id', 'eq', props.id).filter('feed.user_id', 'eq',profile?.id ).single()
       if (res.data) {
        setPost(res.data)
        if (res.data.feed) {
            setUserHasLiked(res.data.feed?.[0]?.liked === true)
        }
        let c = await supabase.from('comment').select('*, user(name, pfp,username)').filter('post_id', 'eq', props.id).order('created_at', {ascending: false}).range(0,50)
        if (c.data) {
            setPostComments(c.data)
        }
       }
    }
    useEffect(() => {
        if (!props.id) return;
        prepare()
    }, [pageNumber])
    const dm = useColorScheme() === 'dark'
    const onSubmitPress = async (comment?: number | null | undefined) => {
        let res = await supabase.from('comment').insert({user_id: profile?.id, description: newComment, post_id: props.id, comment_reply: comment}).select('*,user(pfp,username,name)')
        if (res.data) {
            if (res.data[0]) {
                setPostComments([res.data[0],...postComments])
            }
        }
        Keyboard.dismiss()
        setNewComment('')
    }
    const [newComment, setNewComment] = useState<string>('')
    let dao = PostDao()
    const [shouldShowMore, setShouldShowMore] = useState<boolean>(false);
    let h = useHaptics()
    if (!post) return <View includeBackground />
    return (
        <View includeBackground style={{ flex: 1 }}>
            <View style={{...tw`flex-row items-end`, width: Dimensions.get('screen').width - 55}}>
                <BackButton />
                <ShowMoreDialogue post_id={post.id} />
            </View>
            <KeyboardAvoidingView enabled behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView
                    contentContainerStyle={tw`px-2 pb-9 pt-4`}
                    keyboardDismissMode='interactive'
                    showsVerticalScrollIndicator={false}
                >
                    <View style={tw`flex-row items-center`}>
                        <SupabaseImage style={tw`h-15 w-15 rounded-full`} uri={post.user.pfp || defaultImage} />
                        <View style={tw`ml-2 max-w-9/12`}>
                            <Text weight='semibold'>{post.user.name}</Text>
                            <Text style={tw`text-gray-500 text-xs`}>@{post.user.username}</Text>
                        </View>
                    </View>
                    <Text style={tw`my-3`}>{shouldShowMore ? post.description : post.description?.substring(0, 100)} {(post?.description?.length || 100) >= 99 && <Text weight='semibold' style={tw`text-gray-500`} onPress={() => setShouldShowMore(!shouldShowMore)}>...{shouldShowMore ? 'Hide' : 'Show More'}</Text>}</Text>
                    {/* @ts-ignore */}
                    <PostMedia canNavigate onDismissTap={() => { }} media={post.media} mealId={post.meal_id} exerciseId={post.exercise_id} runProgressId={post.run_id} workoutId={post.workout_id} />
                    <View style={tw`flex-row items-center justify-between mt-3`}>
                        <View style={tw`flex-row items-center`}>
                            <TouchableOpacity onPress={async () => {
                                if (!post) return;
                                await dao.on_like_press(post.id, userHasLiked)
                                h.press()
                                setPost({...post, likes: userHasLiked ? (post?.likes || 1)-1 : (post.likes || 0)+1})
                                setUserHasLiked(!userHasLiked)
                            }} style={tw`flex-row items-center justify-center`}>
                                <ExpoIcon name={userHasLiked ? 'heart' : 'heart-outline'} iconName='ion' size={25} color={userHasLiked ? 'red' : 'gray'} />
                                <Text style={tw`text-gray-500 ml-2 text-xs`}>{post.likes} likes</Text>
                            </TouchableOpacity>
                            {/* <TouchableOpacity onPress={() => { }} style={tw`flex-row items-center justify-center ml-5`}>
                                <ExpoIcon name={'message-circle'} iconName='feather' size={25} color={'gray'} />
                                <Text style={tw`text-gray-500 ml-2 text-xs`}>{numComments} comments</Text>
                            </TouchableOpacity> */}
                        </View>
                        <Text style={tw`text-xs text-gray-500`}>{moment(post.created_at).fromNow()}</Text>
                    </View>
                    <Spacer full lg divider/>
                    {postComments.length === 0 && <Text xs style={tw`text-center px-6 text-gray-500`}>There are no comments to show. Be the first to add one!</Text>}
                    {postComments.map(comment => {
                        const onLikeTap = async (id: string, liked: boolean) => {
                            if (liked) {
                                
                            } else {
                                
                            }
                        }
                        return <CommentDisplay key={comment.id} comment={comment} onLikeTap={onLikeTap} />
                    })}
                </ScrollView>
                <View style={tw`pt-3`}>
                    <View style={tw`mb-2 w-12/12 flex-row items-center justify-between px-4`}>
                        <View card style={tw`w-10/12 rounded-lg pb-3 pt-2 px-3`}>
                        <TextInput onSubmitEditing={onSubmitPress} value={newComment} onChangeText={setNewComment} placeholderTextColor={'gray'} placeholder='Comment....' style={tw`w-12/12 text-${dm ? 'white' : 'black'}`} multiline numberOfLines={3} />
                        </View>
                        <TouchableOpacity onPress={onSubmitPress} style={tw`items-center justify-center`}>
                            <View card style={tw`p-3 rounded-full`}>
                            <ExpoIcon name='message-circle' iconName='feather' size={20} color='gray' />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    )
}


const CommentDisplay = (props: {  onLikeTap: (id: string, liked: boolean) => void, comment: TComment }) => {
    const {  onLikeTap, comment } = props;
    const internalComment = useMemo(() => comment, [comment])
    const navigator = useNavigation()
    const dm = useColorScheme() === 'dark'
    return <View style={{...tw`py-1 my-1`}}>
        <View style={{...tw`flex-row items-center justify-between w-12/12`}}>
            <View style={tw`flex-row items-start max-w-9/12`}>
                <SupabaseImage uri={comment.user.pfp || defaultImage} style={tw`h-10 w-10 rounded-full`} />
                <Spacer horizontal sm />
                <View>
                    <Text weight='semibold' xs>{comment.user.name}</Text>
                    <Text onPress={() => {
                        const screen = getMatchingNavigationScreen('User', navigator)
                        //@ts-ignore
                        navigator.navigate(screen, { id: comment.user_id })
                    }} style={tw`text-red-500`} xs>@{comment.user.username}</Text>
                    <Text style={tw`mt-1 text-gray-${dm ? '300' : '500'}`}>{comment.description}</Text>
                </View>
            </View>
            {/* <TouchableOpacity style={tw`p-2 items-center flex-row justify-center`} onPress={() => onLikeTap && onLikeTap(internalComment.id, false)}>
                <ExpoIcon name={internalComment.created_at ? 'heart' : 'heart-outline'} iconName='ion' size={20} color={internalComment.comment_reply ? 'red' : 'gray'} />
                <Text style={tw`text-xs text-gray-500 ml-2`} weight='semibold'>{formatCash(0)}</Text>
            </TouchableOpacity> */}
        </View>
        <Text style={{...tw`text-gray-500 text-right`, fontSize: 10}}>{moment(internalComment.created_at).fromNow()}</Text>
    </View>
}