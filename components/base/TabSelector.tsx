import { View, Text } from './Themed'
import React, { useEffect, useState } from 'react'
import { TouchableOpacity } from 'react-native-gesture-handler';
import tw from 'twrnc'
import { useColorScheme } from 'react-native';

export default function TabSelector(props: {tabs: string[]; selected?: string; onTabChange?: (t: string) => void; style?: any, disabledTabs?: string[]}) {
    const {tabs, onTabChange} = props;
    const [selectedTab, setSelectedTab] = useState<string | undefined>(tabs[0]);
    const dm = useColorScheme() === 'dark'
    useEffect(() => {
      if (props.selected && props.tabs.includes(props.selected)) setSelectedTab(props.selected)
    }, [props.selected])
    if (!selectedTab) return <View />
  return (
    <View style={[tw`flex-row mx-3 items-center justify-between rounded-3xl`, props.style ? props.style : tw``]}>
      {tabs.filter(x => (!(props.disabledTabs || []).includes(x))).map(x => {
        const selected = selectedTab === x
        const borderColor = dm ? 'white' : 'black'
        return <TouchableOpacity style={tw`${selected ? 'px-4 border-b border-'+borderColor : 'px-4'} py-3`} onPress={() => {
            props.onTabChange && props.onTabChange(x)
            setSelectedTab(x)
        }} key={x}> 
            <Text weight={selected ? 'bold' : 'regular'} style={tw`text-center text-xs`}>{x}</Text>
        </TouchableOpacity>
      })}
    </View>
  )
}