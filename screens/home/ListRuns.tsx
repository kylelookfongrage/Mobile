import { View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Text } from '../../components/Themed'
import { RunProgress } from '../../aws/models'
import { useCommonAWSIds } from '../../hooks/useCommonContext'
import { DataStore } from 'aws-amplify'
import { BackButton } from '../../components/BackButton'
import RunListComponent from '../../components/RunListComponent'
import { ScrollView } from 'react-native-gesture-handler'
import tw from 'twrnc'
import { useNavigation } from '@react-navigation/native'


export default function ListRuns() {
    const [runs, setRuns] = useState<RunProgress[]>([])
    const {progressId} = useCommonAWSIds()

    useEffect(() => {
        DataStore.query(RunProgress, rp => rp.progressID.eq(progressId)).then(setRuns)
    }, [])
    const navigator = useNavigation()
  return (
    <View style={{flex: 1}}>
      <BackButton name='Daily Activity' /> 
      <ScrollView style={tw`px-4 pt-6`} showsVerticalScrollIndicator={false}>
      {runs.map(x => {
        return <View style={tw`my-3`} key={x.id}>
            <RunListComponent run={x} onPress={() => {
                //@ts-ignore
                navigator.navigate('Run', {id: x.id})
            }} />
        </View>
      })}
      <View style={tw`pb-40`} />
      </ScrollView>
    </View>
  )
}