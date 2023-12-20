import { View, Text } from '../../components/base/Themed'
import React, { useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ScrollView, TouchableOpacity, useColorScheme } from 'react-native'
import tw from 'twrnc'
import { Ruler } from '../../components/inputs/Ruler'
import { useCommonAWSIds } from '../../hooks/useCommonContext'
import { useBadges } from '../../hooks/useBadges'
import { ProgressDao } from '../../types/ProgressDao'
import { useSelector } from '../../redux/store'

export default function SummaryMetric(props: {weight?: boolean}) {
  const navigator = useNavigation()
  let dao = ProgressDao(false)
  let {today} = useSelector(x => x.progress)
  const {profile} = useSelector(x => x.auth) 
  const [newValue, setNewValue] = useState<number>(0)
  const {logProgress} = useBadges()
  const padding = useSafeAreaInsets()
  const dm = useColorScheme() === 'dark'
  let min = props.weight ? 70 : 3
  return <View card style={[tw`px-6`, {paddingTop: padding.top, flex: 1}]}>
    <ScrollView>
    <Text style={tw`text-xl mb-12 mt-12`} weight='bold'>{props.weight ? 'Body Weight' : 'Body Fat'}</Text>
    <Ruler initial={props.weight ? (today?.weight || profile?.weight || min) : (today?.fat || profile?.startFat || min)} unit={props.weight ? 'lbs' : '%'} onChange={setNewValue} min={min} max={props.weight ? 300 : 60} />
    {newValue !== (props.weight ? (today?.weight) : (today?.fat)) && <TouchableOpacity onPress={async () => {
        await dao.updateProgress(props.weight ? 'weight' : 'fat', newValue)
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