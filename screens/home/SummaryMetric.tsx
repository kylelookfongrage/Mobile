import { View, Text } from '../../components/Themed'
import React, { useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useProgressValues } from '../../hooks/useProgressValues'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ScrollView, TouchableOpacity, useColorScheme } from 'react-native'
import tw from 'twrnc'
import { Ruler } from '../../components/Ruler'
import { DataStore } from 'aws-amplify'
import { Progress, User } from '../../aws/models'
import { useCommonAWSIds } from '../../hooks/useCommonContext'

export default function SummaryMetric(props: {weight?: boolean}) {
  const navigator = useNavigation()
  const {weight, fat} = useProgressValues({metrics: true}) 
  const {userId, progressId} = useCommonAWSIds() 
  const [newValue, setNewValue] = useState<number>(0)
  const padding = useSafeAreaInsets()
  const dm = useColorScheme() === 'dark'
  return <View style={[tw`bg-gray-${dm ? '800' : '200'}/95 px-6`, {paddingTop: padding.top, flex: 1}]}>
    <ScrollView>
    <Text style={tw`text-xl mb-12 mt-12`} weight='bold'>{props.weight ? 'Body Weight' : 'Body Fat'}</Text>
    <Ruler initial={props.weight ? weight : fat} unit={props.weight ? 'lbs' : '%'} onChange={setNewValue} min={props.weight ? 70 : 3} max={props.weight ? 300 : 60} />
    {newValue !== (props.weight ? weight : fat) && <TouchableOpacity onPress={async () => {
        const user = await DataStore.query(User, userId)
        const progress = await DataStore.query(Progress, progressId)
        if (!user || !progress){
            alert('There was a problem, please check your connection')
            return;
        }
        await DataStore.save(User.copyOf(user, x => {
           (props.weight ?  x.weight=newValue : x.fat=newValue)
        }))
        await DataStore.save(Progress.copyOf(progress, x => {
            (props.weight ?  x.weight=newValue : x.fat=newValue)
        }))
        //@ts-ignore
        navigator.pop()
    }} style={tw`bg-${dm ? 'red-600' : "red-500"} mr-2 px-5 mx-20 mt-12 h-12 justify-center items-center rounded-full`}>
            <Text>Save Changes</Text>
        </TouchableOpacity>}
    </ScrollView>
    {/* @ts-ignore */}
    <TouchableOpacity onPress={() => navigator.pop()} style={[{paddingBottom: padding.bottom + 20}, tw`px-3 pt-3`]}>
      <Text style={tw`text-center text-gray-500 text-lg`} weight='bold'>Close</Text>
    </TouchableOpacity>
  </View>
}