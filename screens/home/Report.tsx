import { View, Text } from '../../components/base/Themed'
import React, { useState } from 'react'
import { BackButton } from '../../components/base/BackButton'
import { ScrollView, TextInput } from 'react-native-gesture-handler'
import { FavoriteType, ReportsOfTerms } from '../../aws/models';
import tw from 'twrnc'
import { ReportReasons } from '../../aws/models';
import { defaultImage, titleCase } from '../../data';
import { ActivityIndicator, Image, Keyboard, Pressable, TouchableOpacity, useColorScheme } from 'react-native';
import { ExpoIcon } from '../../components/base/ExpoIcon';
import { DataStore, Storage } from 'aws-amplify';
import { useCommonAWSIds } from '../../hooks/useCommonContext';
import { useNavigation } from '@react-navigation/native';
import { ErrorMessage } from '../../components/base/ErrorMessage';
import { BadgeType, useBadges } from '../../hooks/useBadges';

export default function Report(props: {name: string, desc: string, img: string, id: string; type: FavoriteType, userId: string;}) {
    const reportReasons = [
        {name: 'Hate Speech', icon: 'mic-off', reason: ReportReasons.HATE_SPEECH},
        {name: 'Violence', icon: 'alert-triangle', reason: ReportReasons.VIOLENCE},
        {name: 'Spam', icon: 'frown', reason: ReportReasons.SPAM},
        {name: 'Nudity', icon: 'eye-off', reason: ReportReasons.NUDITY},
        {name: 'Other', icon: 'help-circle', reason: ReportReasons.OTHER}
    ]
    const dm = useColorScheme() === 'dark'
    const [uploading, setUploading] = useState<boolean>(false)
    const [selectedReason, setSelectedReason] = useState<ReportReasons | null>(null)
    const [description, setDescription] = useState<string>('')
    const [errors, setErrors] = useState<string[]>([])
    const {userId} = useCommonAWSIds()
    const navigator = useNavigation()
    const [picture, setPicture] = useState<string | null>(null)
    const {logProgress} = useBadges(false)
    React.useEffect(() => {
        (async () => {
            if (props.img === defaultImage) {
            const pic = await Storage.get(props.img)
            setPicture(pic)
            } else {
            setPicture(props.img)
            }
      })()
    
      }, [])
    const onFinishPress = async () => {
        if (!selectedReason || !description) {
            setErrors(['You must fill out a reason and a description'])
            return;
        }
        setUploading(true)
        try {
            let potentialReports = await DataStore.query(ReportsOfTerms, x => x.and(rep => [
                rep.userID.eq(userId), rep.potentialID.eq(props.id)
            ]))
            if (potentialReports.length > 0) {
                throw Error('You have already reported this, please wait for us to take action!')
            }
            await DataStore.save(new ReportsOfTerms({reportType: selectedReason, reasonDescription: description, userID: userId, potentialID: props.id}))
            logProgress(BadgeType.reports)
            //@ts-ignore
            navigator.pop()
        } catch (error) {
            //@ts-ignore
            setErrors([error.toString()])
        }
        setUploading(false)
    }
  return (
    <View style={[{flex: 1}]} includeBackground>
        <BackButton />
      <ScrollView contentContainerStyle={tw`px-6 pt-3`} showsVerticalScrollIndicator={false}>
        {errors.length > 0 && <View style={tw`mb-3`}>
                <ErrorMessage errors={errors} onDismissTap={() => setErrors([])} />
            </View>}
      <Pressable onPress={() => Keyboard.dismiss()}>
      <Text style={tw`text-lg text-gray-500`} weight='bold'>Report {titleCase(props.type || 'something')}</Text>
      <View style={tw`mt-4 flex-row items-center w-12/12`}>
        {picture && <Image source={{uri: picture}} style={tw`h-15 w-15 rounded-xl`} />}
        <View style={tw`ml-2 max-w-9/12`}>
            <Text style={tw``}>{props.name}</Text>
            <Text style={tw`text-xs text-gray-500`}>{props.desc}</Text>
        </View>
      </View>   
      <Text style={tw`mt-6 text-gray-500`} weight='bold'>Report Reason</Text>
      <View style={tw`flex-row items-center flex-wrap justify-center mt-3 w-12/12`}>
        {reportReasons.map(reason => {
            const selected = selectedReason === reason.reason
            const unselectedColor = `bg-gray-${dm ? '700/50' : '400/50'}`
            let selectedColor = `bg-red-${dm ? '700' : '500'}`
            let color = selected ? selectedColor : unselectedColor
            return <TouchableOpacity onPress={() => setSelectedReason(reason.reason)} key={reason.name} style={tw`py-3 items-center ${color}  mx-1 mt-2 rounded-xl w-3.5/12`}>
                <ExpoIcon name={reason.icon} iconName='feather' size={20} color={selected ? 'white' : 'gray'} />
                <Text style={tw`text-xs mt-1 ${selected ? 'text-white' : 'text-gray-500'}`} weight={selected ? 'bold' : 'regular'}>{reason.name}</Text>
            </TouchableOpacity>
        })}
      </View>
      <Text style={tw`mt-6 mb-3 text-gray-500`} weight='bold'>Please provide a description</Text>
      <TextInput value={description} onChangeText={setDescription} placeholder='why are you reporting this?' placeholderTextColor={'gray'} multiline numberOfLines={6} style={tw`text-${dm ? 'white' : 'black'} border border-${dm ? 'gray-700' : 'gray-500'} p-3 rounded-xl`} />
      </Pressable>
      <View style={tw`h-90`} />
      <View style={tw`h-12`} />
      
      </ScrollView>
      <View style={[
                {
                    position: 'absolute',
                    bottom: 20,
                    flex: 1
                },
                tw`w-12/12`
            ]}>
                {/* Add Food Button */}
                <View style={tw`py-5 w-12/12 items-center px-7 flex-row justify-center`}>
                    <TouchableOpacity disabled={uploading === true} onPress={onFinishPress} style={tw`bg-${dm ? 'red-600' : "red-500"} mr-2 px-9 h-12 justify-center rounded-full`}>
                        {!uploading && <Text numberOfLines={1} style={tw`text-center text-white`} weight='semibold'>Finish</Text>}
                        {uploading && <ActivityIndicator />}
                    </TouchableOpacity>
                </View>
            </View>
    </View>
  )
}