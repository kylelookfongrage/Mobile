import { View, Text } from '../../components/base/Themed'
import React, { useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import tw from 'twrnc'
import { Ruler } from '../../components/inputs/Ruler'
import { useBadges } from '../../hooks/useBadges'
import { ProgressDao } from '../../types/ProgressDao'
import { useSelector } from '../../redux/store'
import SaveButton from '../../components/base/SaveButton'

export default function SummaryMetric(props: {weight?: boolean}) {
  const navigator = useNavigation()
  let dao = ProgressDao(false)
  let {today} = useSelector(x => x.progress)
  const {profile} = useSelector(x => x.auth) 
  const [newValue, setNewValue] = useState<number>(0)
  const {logProgress} = useBadges()
  const padding = useSafeAreaInsets()
  let min = props.weight ? 70 : 3
  let hasNewValue = newValue !== (props.weight ? (today?.weight) : (today?.fat))
  let onClose = async () => {
    if (hasNewValue) {
      await dao.updateProgress(props.weight ? 'weight' : 'fat', newValue)
    }
    //@ts-ignore
    navigator.pop()
  }
  return <View card style={[tw``, {paddingTop: padding.top, flex: 1}]}>
    <Text h3 style={tw`mb-12 mt-12 px-3`} weight='bold'>{props.weight ? 'Body Weight' : 'Body Fat'}</Text>
    <View style={tw`w-12/12 px-4`}>
    <Ruler initial={props.weight ? (today?.weight || profile?.weight || min) : (today?.fat || profile?.startFat || min)} unit={props.weight ? (profile?.metric ? 'kgs' : 'lbs') : '%'} onChange={setNewValue} min={min} max={props.weight ? 300 : 60} />
    </View>
    <SaveButton title={`${hasNewValue ? 'Save Changes' : 'Close'}`} discludeBackground safeArea onSave={onClose} />
  </View>
}