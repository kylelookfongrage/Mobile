import React, { useEffect, useState } from 'react'
import { View } from '../../components/base/Themed'
import { RunProgress } from '../../aws/models'
import { useCommonAWSIds } from '../../hooks/useCommonContext'
import { DataStore } from 'aws-amplify'
import { BackButton } from '../../components/base/BackButton'
import RunListComponent from '../../components/features/RunListComponent'
import { ScrollView } from 'react-native-gesture-handler'
import tw from 'twrnc'
import { useNavigation } from '@react-navigation/native'


export default function ListRuns() {
    const [runs, setRuns] = useState<RunProgress[]>([])
    const {progressId} = useCommonAWSIds()

    useEffect(() => {
        DataStore.query(RunProgress, rp => rp.progressID.eq(progressId), {limit: 10, sort: x => x.createdAt('DESCENDING')}).then(setRuns)
    }, [])
    const navigator = useNavigation()
  return (
    <View style={{flex: 1}} includeBackground>
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