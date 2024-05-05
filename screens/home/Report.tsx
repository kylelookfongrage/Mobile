import { View, Text } from '../../components/base/Themed'
import React, { useState } from 'react'
import { BackButton } from '../../components/base/BackButton'
import tw from 'twrnc'
import { defaultImage, titleCase } from '../../data';
import { useSelector } from '../../redux/store';
import useAsync from '../../hooks/useAsync';
import { useGet } from '../../hooks/useGet';
import { supabase } from '../../supabase';
import Spacer from '../../components/base/Spacer';
import { TouchableOpacity } from 'react-native-gesture-handler';
import ManageButton from '../../components/features/ManageButton';
import { ScrollView } from 'react-native';
import { XStack, YStack } from 'tamagui';
import SupabaseImage from '../../components/base/SupabaseImage';
import { getEmojiByCategory } from '../../types/FoodApi';
import { _tokens } from '../../tamagui.config';
import { TextArea } from '../../components/base/Input';
import { Icon } from '../../components/base/ExpoIcon';
import SaveButton from '../../components/base/SaveButton';
import { useNavigation } from '@react-navigation/native';


const reportReasons = [
    { name: 'Hate Speech / Spam', icon: 'Volume-Off', reason: 'HATE_SPEECH', description: 'Any text includes speech that is hateful or spammful'},
    { name: 'Inaccuracy', icon: 'Info-Circle', reason: "VIOLENCE", description: 'This includes information that is inaccurate or misleading' },
    { name: 'Nudity', icon: 'Image', reason: "NUDITY", description: 'Any videos/pictures related to this includes nudity.' },
    { name: 'Unoriginal Content', icon: 'Shield-Done', reason: "UNORIGINAL_CONTENT", description: 'This content is copied from someone else, paid or free.' },
    { name: 'Other', icon: 'Danger', reason: 'OTHER', description: 'Please indicate reasoning in the description below' }
]



export default function Report(props: {
    workout_id?: number;
    exercise_id?: number;
    food_id?: number;
    meal_id?: number;
    user_id?: string;
    plan_id?: number;
    post_id?: number;
    comment_id?: number;
    messgage_id?: string;
}) {
    
    let [details, setDetails] = useState({name: '', uri: defaultImage, selectedReason: null as null | string, description: '',  category: null, type: '', table: '', id: null as null | string | number})
    let {profile} = useSelector(x => x.auth)
    let n = useNavigation()
    let g = useGet()

    useAsync(async () => {
        let [_table, _category, _type, _name, _uri, _id] = ["", "", "", "", "", 0]
        if (props.workout_id) {_table='workout'; _type='Workout'; _name = 'name'; _uri='image'; _id=props.workout_id;}
        if (props.plan_id) {_table='fitness_plan'; _type='Fitnes Plan'; _name='name'; _uri='image'; _id=props.plan_id;}
        if (props.exercise_id) {_table='exercise'; _type='Exercise'; _name='name'; _uri='preview'; _id=props.exercise_id;}
        if (props.food_id) {_table='food'; _type='Food'; _name='name'; _category='category'; _id=props.food_id;}
        if (props.meal_id) {_table='meal'; _type='Meal'; _name='name'; _uri='preview'; _id = props.meal_id;}
        //@ts-ignore
        if (props.user_id) {_table='user'; _type='Profile'; _name='name'; _uri='pfp'; _id=props.user_id}
        try {
            g.set('loading', true);
            let {data: _data, error} = await supabase.from(_table).select('*').filter('id', 'eq', _id).single();
            if (error || !_data) throw Error(error?.message || 'There was a problem');
            setDetails(p => {
                let data = (Array.isArray(_data) && _data[0]) ? _data[0] : _data
                let og = {...p}
                og['type'] = _type;
                og['table'] = _table;
                og['id'] = _id;
                if (_category) {og['category'] = data[_category]}
                if (_name) {og['name'] = data[_name]}
                if (_uri) {og['uri'] = data[_uri]}
                return og;
            })
            g.set('loading', false);
        } catch (error) {
            g.setFn(p => {
                let og = {...p};
                og.loading = false;
                og.error = error?.toString() || 'there was a problem'
                return og
            })
        }
    }, [])

    console.log(details)

    const onFinishPress = async () => {
        g.set('loading', true)
        try {
            if (!details.selectedReason) throw Error('You must select a report reason')
            if (!profile) throw Error('Cannot find your profile, please reload the application')
            let {workout_id, meal_id, exercise_id, food_id, plan_id, comment_id, post_id, messgage_id, user_id} = props;
            let ids = {workout_id, meal_id, exercise_id, food_id, plan_id, comment_id, post_id, messgage_id, user_id}
            let {data, error} = await supabase.from('reports_of_terms').insert({
                reason: details.selectedReason, description: details.description, reported_by: profile.id, ...ids
            }).select('*')
            console.log('data', data)
            console.log('error', error)
            if (error || !data) throw Error(error?.message || 'There was a problem submitting your report, please check your internet connection')
            g.set('loading', false)
            n.pop()
        } catch (error) {
            g.setFn(p => {
                let og = {...p};
                og.loading = false;
                og.error = error?.toString() || 'there was a problem'
                return og
            })
        }
    }

    return (
        <View style={[{ flex: 1 }]} includeBackground>
            <BackButton name={`Report ${details.type}`} />
            <Spacer />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={tw`px-2`}>
                <XStack alignItems='center'>
                    {((details.uri || !details.category) && !props.food_id) && <SupabaseImage uri={details.uri || defaultImage} style={tw`h-15 w-15 rounded-full`} />}
                    {(details.category || props.food_id) && <Text h2>{getEmojiByCategory(details.category)}</Text>}
                    <Spacer horizontal sm />
                    <YStack>
                    <Text bold xl>{details.name}</Text>
                    <Text gray semibold>{details.type}</Text>
                    </YStack>
                </XStack>
                <Spacer />
                <ManageButton hidden title='Report Reason' />
                <Text gray>Please select why you would like to report this {details.type.toLowerCase()}</Text>
                <Spacer sm />
                {reportReasons.map(x => {
                    let selected = details.selectedReason === x.reason
                    return <TouchableOpacity onPress={() => setDetails(p => ({...p, selectedReason: x.reason}))} key={x.reason} style={{...tw`my-1 py-1 px-2 rounded-lg flex-row items-center`, ...(selected ? {backgroundColor: _tokens.primary900} : {})}}>
                        <Icon name={x.icon} color={selected ? 'white' : 'gray'} size={20} />
                        <Spacer horizontal sm />
                        <View>
                        <Text bold={selected} lg style={tw`${selected ? 'text-white' : ''}`}>{x.name}</Text>
                        <Text sm gray={!selected} style={tw`${selected ? 'text-white' : ''}`}>{x.description}</Text>
                        </View>
                    </TouchableOpacity>
                })}
                <Spacer />
                <ManageButton hidden title='Description' />
                <Text gray>Please provide some context around your report</Text>
                <Spacer sm/>
                <TextArea height={'$12'} id='report-textarea' placeholder='Some context....' iconLeft='Shield-Done' value={details.description} textChange={v => setDetails(p => ({...p, description: v}))} />
                <View style={tw`h-90`} />
            </ScrollView>
            <SaveButton title='Save Report' onSave={onFinishPress} safeArea discludeBackground />
        </View>
    )
}