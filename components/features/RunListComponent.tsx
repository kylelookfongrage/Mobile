import { Dimensions, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Text } from '../base/Themed'
import tw from 'twrnc'
import MapView, { Marker, Polyline } from 'react-native-maps'
import { defaultRunTypes, getTotalDistance, toHHMMSS } from '../../data'
import { RunProgress } from '../../aws/models'

export default function RunListComponent(props: {run: RunProgress; onPress?: (run: RunProgress) => void; canScroll: boolean;}) {
    let {run} = props;
    const relevantCoordinates = run?.coordinates
    let lastRunCoordinates = relevantCoordinates?.[relevantCoordinates.length - 1] || {lat: 0, long: 0};
    const runTypeMapping = defaultRunTypes.filter(x => x.name === run?.runType)?.[0] || defaultRunTypes[0]
    if (!run) return <View />
  return (
    <TouchableOpacity onPress={() => {
        props.onPress && props.onPress(props.run)
    }} style={tw`flex-row items-center justify-center`}>
            <MapView
                rotateEnabled={props.canScroll}
                scrollEnabled={props.canScroll}
                zoomEnabled={props.canScroll}
                region={{
                  latitude: lastRunCoordinates.lat,
                  longitude: lastRunCoordinates.long,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
              }}
                style={{ flex: 1, height: Dimensions.get('screen').height * 0.20, width: Dimensions.get('screen').height * 0.30, borderRadius: 15 }}
              >
                {/* @ts-ignore */}
                <Marker coordinate={{ latitude: run?.coordinates?.[run?.coordinates?.length - 1]?.lat, longitude: run?.coordinates?.[run?.coordinates?.length - 1]?.long }}>
                        <Text>{runTypeMapping.emoji}</Text>
                    </Marker>
                     {/* @ts-ignore */}
                    <Polyline coordinates={run?.coordinates?.map(x => ({ latitude: x.lat, longitude: x.long }))} strokeWidth={2} strokeColor={'red'} />
              </MapView>
              <View style={[{height: Dimensions.get('screen').height * 0.20}, tw`w-4/12 pl-6 rounded justify-center`]}>
                <Text style={tw`text-lg`} weight='bold'>{toHHMMSS(run.totalTime || 0)}</Text>
                <Text style={tw`text-gray-500`}>Total Time</Text>
                 {/* @ts-ignore */}
                <Text style={tw`text-lg mt-4`} weight='bold'>{getTotalDistance(run.coordinates || [])}{<Text style={tw`text-xs`} weight='bold'> miles</Text>}</Text>
                <Text style={tw`text-gray-500`}>Distance</Text>
              </View>
            </TouchableOpacity>
  )
}