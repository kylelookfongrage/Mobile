import React from 'react'
import { View } from '../../components/base/Themed'
import { BackButton } from '../../components/base/BackButton'
import RunListComponent from '../../components/features/RunListComponent'
import { ScrollView } from 'react-native-gesture-handler'
import tw from 'twrnc'
import { useNavigation } from '@react-navigation/native'
import { Tables } from '../../supabase/dao'
import { ProgressDao } from '../../types/ProgressDao'
import { useSelector } from '../../redux/store'
import SaveButton from '../../components/base/SaveButton'


export default function ListRuns() {
    let {runProgress} = useSelector(x => x.progress)
    let runs = runProgress
    const navigator = useNavigation()
  return (
    <View style={{flex: 1}} includeBackground>
      <BackButton name='Daily Activity' /> 
      <ScrollView style={tw`px-4 pt-6`} showsVerticalScrollIndicator={false}>
      {runs.map(x => {
        return <View style={tw`my-3`} key={x.id}>
            <RunListComponent canScroll run={x} onPress={() => {
                //@ts-ignore
                // navigator.navigate('Run', {id: x.id})
            }} />
        </View>
      })}
      <View style={tw`pb-40`} />
      </ScrollView>
      <SaveButton title='Start Run' onSave={() => {
        navigator.navigate('Run')
      }} />
    </View>
  )
}