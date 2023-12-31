import { BackButton } from '../../components/base/BackButton'
import { View, Text } from '../../components/base/Themed'
import React from 'react'
import tw from 'twrnc'

export default function TaskAgenda() {
  return (
    <View includeBackground style={{flex: 1}}>
        <BackButton name="Today's Tasks" />
      <View style={tw`px-2`}>

      </View>
    </View>
  )
}