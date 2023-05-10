import React, { useState, useEffect, useRef } from 'react';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { Dimensions, TouchableOpacity, useColorScheme, View } from 'react-native';
import { Text } from '../../components/Themed';
import tw from 'twrnc'
import { Coordinates, RunProgress } from '../../aws/models';
import moment from 'moment';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ExpoIcon } from '../../components/ExpoIcon';
import { useNavigation } from '@react-navigation/native';
import { defaultRunTypes, getTotalDistance, RunType, toHHMMSS } from '../../data';
import { DataStore } from 'aws-amplify';
import { useDateContext } from './Calendar';
import { useCommonAWSIds } from '../../hooks/useCommonContext';
import * as TaskManager from 'expo-task-manager';




const Stack = createNativeStackNavigator()

const RunTracker = (props: {id?: string}) => {
    const {id} = props;
    const {AWSDate} = useDateContext()
    const {userId, progressId} = useCommonAWSIds()
    const [coordinates, setCoordinates] = useState<Coordinates[]>([]);
    const mapRef = useRef<MapView | null>(null)
    const [currentlocation, setcurrentlocation] = useState<Coordinates | null>(null)
    const [runType, setRunType] = useState<RunType>(defaultRunTypes[0])
    const [date, setDate] = useState<string>(moment().format('LL'))
    const [paused, setPaused] = useState<boolean>(true)
    const [totalTime, setTotalTime] = useState<number>(0)
    const [ready, setReady] = useState<boolean>(false)

    useEffect(() => {
        setTimeout(() => {
            if (paused || !ready) return;
            setTotalTime(totalTime + 1)
        }, 1000);
    })

    useEffect(() => {
        (async () => {
            if (!ready) return;
            let subscription = null
            const {status} = await Location.requestForegroundPermissionsAsync()
            if (status !== 'granted') {
                alert('We need your permission to track this run! Change your settings via the settings app to track location.')
                return;
            }
            subscription = await Location.watchPositionAsync({
                accuracy: Location.Accuracy.BestForNavigation,
            }, (x => {
                console.log('before pause check')
                setcurrentlocation({ lat: x.coords.latitude, long: x.coords.longitude })
                if (!paused || coordinates.length === 0) {
                    let newCoordinates = [...coordinates]
                    newCoordinates.push({lat: x.coords.latitude, long: x.coords.longitude})
                    setCoordinates(newCoordinates)
                }
            }))
            subscription.remove();
        })()
    }, [ready, paused])
    
    useEffect(() => {
        if (id) {
            DataStore.query(RunProgress, id).then(x => {
                console.log('setting coords - 3')
                if (x) {
                    setTotalTime(x.totalTime || 0)
                    setDate(moment(x.date || '2023-01-01').format('LL'))
                    setRunType(defaultRunTypes.filter(y => y.name===x.runType)[0] || defaultRunTypes[0])
                    setCoordinates(x.coordinates || [])
                    setReady(true)
                }
            })
        } else{
            setReady(true)
        }
    }, [])

    function onResetCameraPress() {
        if (!mapRef || !currentlocation) return;
        mapRef.current?.animateToRegion({ longitude: currentlocation?.long, latitude: currentlocation?.lat, latitudeDelta: 0.007, longitudeDelta: 0.007 })
    }
    const navigator = useNavigation()

    async function onSavePress(){
        setPaused(true)
        if (id) {
            const og = await DataStore.query(RunProgress, id)
            if (og) {
                await DataStore.save(RunProgress.copyOf(og, x => {
                    x.totalTime=totalTime;
                    x.runType=runType.name;
                    x.coordinates=coordinates;
                }))
            }
        } else {
            await DataStore.save(new RunProgress({date: AWSDate, userID: userId, totalTime: totalTime, coordinates: coordinates, runType: runType.name, progressID: progressId }))
        }
        navigator.navigate('FinishedExercise')
    }

    return <Stack.Navigator initialRouteName='Map'>
        <Stack.Screen name='Map' options={{ headerShown: false }}>
            {props => <View style={{ flex: 1 }}>
                <MapView
                    rotateEnabled={false}
                    ref={mapRef}
                    style={{ flex: 1, height: Dimensions.get('screen').height * 0.5 }}
                    region={{
                        latitude: coordinates[coordinates.length - 1]?.lat,
                        longitude: coordinates[coordinates.length - 1]?.long,
                        latitudeDelta: 0.005,
                        longitudeDelta: 0.005,
                    }}
                >
                    <Marker coordinate={{ latitude: coordinates[coordinates.length - 1]?.lat, longitude: coordinates[coordinates.length - 1]?.long }}>
                        <Text>{runType.emoji}</Text>
                    </Marker>
                    <Polyline coordinates={coordinates.map(x => ({ latitude: x.lat, longitude: x.long }))} strokeWidth={2} strokeColor={'red'} />
                </MapView>
                <TouchableOpacity onPress={onResetCameraPress} style={[tw`p-3 bg-gray-800 items-center justify-center rounded-lg`, { zIndex: 1, position: 'absolute', top: 100, right: 50 }]}>
                    <ExpoIcon name='navigation' iconName='feather' size={25} color='white' />
                </TouchableOpacity>
                <View style={[tw`w-12/12 items-center justify-center`, { zIndex: 1, position: 'absolute', bottom: 100 }]}>
                    <TouchableOpacity onPress={() => {
                        //@ts-ignore
                        navigator.navigate('RunDetails')
                    }} style={tw`bg-red-500 rounded-xl py-4 px-9`}>
                        <Text style={tw`text-white`} weight='semibold'>View Details</Text>
                    </TouchableOpacity>
                </View>
            </View>}
        </Stack.Screen>
        <Stack.Screen name='RunDetails' options={{ headerShown: false, presentation: 'transparentModal' }}>
            {props => <RunDetailsView coordinates={coordinates} date={date} setRunType={setRunType} runType={runType} time={totalTime} onSavePress={onSavePress} paused={paused} setPaused={setPaused} />}
        </Stack.Screen>
    </Stack.Navigator>
};

export default RunTracker;


function RunDetailsView(props: { coordinates: Coordinates[], date: string; setRunType: (p: any) => void; runType: RunType, onSavePress: () => void; time: number, paused: boolean, setPaused: (p: boolean) => void }) {
    const { coordinates, date, setRunType, runType, time } = props;
    const totalDistanceInMiles = getTotalDistance(coordinates)
    const dm = useColorScheme() === 'dark'
    const navigator = useNavigation()
    const height = Dimensions.get('screen').height
    return <View style={[{ marginTop: height * 0.30, height: height * 0.70 }, tw`bg-${dm ? 'gray-800' : 'gray-100'} rounded-t-3xl p-6`]}>
        <View style={tw`justify-between h-12/12 pb-12`}>
            <View>
                <View style={tw`flex-row items-center justify-between`}>
                    <Text style={tw`text-xl`} weight='semibold'>{runType.name} Activity</Text>
                    <Text>{date}</Text>
                </View>
                <Text weight='semibold' style={tw`my-4`}>Change Activity Type: </Text>
                <View style={tw`flex-row items-center justify-around`}>
                    {defaultRunTypes.map(opt => {
                        const selected = opt.name === runType.name
                        return <TouchableOpacity style={tw`p-3 ${selected ? 'bg-red-500/20' : 'bg-gray-500/20'} rounded-lg`} key={opt.name} onPress={() => setRunType(opt)}>
                            <Text>{opt.emoji}</Text>
                        </TouchableOpacity>
                    })}
                </View>
                <View style={tw`flex-row items-center justify-between my-6`}>
                    <View style={[{ width: Dimensions.get('screen').width * 0.40, height: Dimensions.get('screen').height * 0.15 }, tw`p-3 bg-gray-500/25 rounded-xl items-center`]}>
                        <Text style={tw`text-xs`}>Time</Text>
                        <Text style={tw`text-center my-7 text-3xl`} weight='bold'>{toHHMMSS(time)}</Text>
                    </View>
                    <View style={[{ width: Dimensions.get('screen').width * 0.40, height: Dimensions.get('screen').height * 0.15 }, tw`p-3 bg-gray-500/25 rounded-xl items-center`]}>
                        <Text style={tw`text-xs`}>Total Miles</Text>
                        <Text style={tw`text-center my-7 text-3xl`} weight='bold'>{totalDistanceInMiles}{<Text style={tw`text-xs`}>mi.</Text>}</Text>
                    </View>
                </View>
                <View style={tw`flex-row items-center justify-center`}>
                    <TouchableOpacity style={[{width: Dimensions.get('screen').width * 0.15, height: Dimensions.get('screen').width * 0.15}, tw`items-center justify-center bg-gray-500/50 rounded-lg mr-9`]} onPress={() => props.setPaused(!props.paused)}>
                        <ExpoIcon name={props.paused ? 'play' : 'pause'} iconName='feather' size={25} color='white' />
                    </TouchableOpacity>
                    <TouchableOpacity style={[{width: Dimensions.get('screen').width * 0.60, height: Dimensions.get('screen').width * 0.15}, tw`items-center justify-center bg-red-${dm ? '500' : '300'} rounded-lg`]} onPress={() => {
                        //@ts-ignore
                        navigator.pop()
                        props.onSavePress()
                    }}>
                        <Text weight='bold' style={tw`text-white`}>Finish {runType.name}</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <TouchableOpacity style={tw`rounded-xl items-center justify-center p-3 mx-9 bg-red-${dm ? '500' : '300'}`} onPress={() => {
                //@ts-ignore
                navigator.pop()
            }}>
                <Text style={tw`text-center text-white`} weight='semibold'>Close</Text>
            </TouchableOpacity>
        </View>
    </View>
}


