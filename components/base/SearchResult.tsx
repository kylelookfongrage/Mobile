import { View, Text } from './Themed'
import React from 'react'
import { TouchableOpacity, View as DView } from 'react-native'
import tw from 'twrnc'
import SupabaseImage from './SupabaseImage';
import { defaultImage } from '../../data';

type SearchResultProps = DView['props']
export default function SearchResult(props: SearchResultProps & {name: string, onPress: () => void; img?: string | null | undefined}) {
    let {name, onPress, img} = props;
  return <View card style={{ ...tw`mb-2 rounded` }}>
  <TouchableOpacity
      onPress={() => {
          if (onPress) onPress()
      }}
      style={[tw`flex-row items-center justify-between rounded-xl py-2 px-2 mx-2`]}>
      <View style={props.style || tw`flex-row items-center max-w-8/12`}>
          <SupabaseImage uri={img || defaultImage} style={`h-12 w-12 rounded mr-2`} />
          <View>
                <Text style={tw``} weight='semibold'>{name}</Text> 
                {/* @ts-ignore */}
                {props.children}
            </View>
      </View>
  </TouchableOpacity>
</View>
}