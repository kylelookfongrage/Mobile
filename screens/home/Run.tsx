import React, { useState, useEffect, useRef } from 'react';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { Alert, Dimensions, TouchableOpacity, useColorScheme } from 'react-native';
import { Text, View } from '../../components/base/Themed';
import tw from 'twrnc'
import moment from 'moment';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ExpoIcon } from '../../components/base/ExpoIcon';
import { useNavigation } from '@react-navigation/native';
import { defaultRunTypes, getTotalDistance, RunType, toHHMMSS } from '../../data';
import { useDateContext } from './Calendar';
import { useCommonAWSIds } from '../../hooks/useCommonContext';
import { useBadges } from '../../hooks/useBadges';
import SaveButton from '../../components/base/SaveButton';
import { ProgressDao } from '../../types/ProgressDao';
import { useSelector } from '../../redux/store';




const Stack = createNativeStackNavigator()

const RunTracker = (props: { id?: string }) => {
    const { id } = props;
    let {formattedDate} = useSelector(x => x.progress)
    let AWSDate = moment(formattedDate).format()
    let {profile} = useSelector(x => x.auth)
    const [coordinates, setCoordinates] = useState<{lat: number, long: number}[]>([]);
    const mapRef = useRef<MapView | null>(null)
    const [currentlocation, setcurrentlocation] = useState<Location.LocationObject | null>(null)
    const [runType, setRunType] = useState<RunType>(defaultRunTypes[0])
    const [date, setDate] = useState<string>(moment().format('LL'))
    const [paused, setPaused] = useState<boolean>(true)
    const [originalTime, setOriginalTime] = useState<number | null>(null)
    const [totalTime, setTotalTime] = useState<number>(0)
    const [status, requestPermission] = Location.useForegroundPermissions()

    function onResetCameraPress() {
        if (!mapRef || !currentlocation) return;
        //@ts-ignore
        mapRef.current?.animateToRegion({ longitude: currentlocation?.long, latitude: currentlocation?.lat, latitudeDelta: 0.007, longitudeDelta: 0.007 })
    }

    const getCurrentLocation = () => {
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest }).then(x => setcurrentlocation(x))
    }

    const watch_location = async (): Promise<void | Location.LocationSubscription> => {
        if (status?.granted) {
            let location = await Location.watchPositionAsync({
              accuracy:Location.Accuracy.High,
              timeInterval: 10000,
              }, (loc) => {
                console.log('setting from watch')
                setcurrentlocation({...loc})
              })
              return location
        }
    }

    useEffect(() => {
        setTimeout(() => {
            if (coordinates.length > 0) { // if already started 
                if (paused) return;
                setTotalTime((totalTime || 0) + 1)
                if (originalTime !== -1 && totalTime % 3 === 0) { // if original time !== -1, time has not yet started
                    setOriginalTime(-1)
                    watch_location()
                }
                if (totalTime > 0 && totalTime % 15 === 0) { // every 15 seconds, get current position
                    getCurrentLocation()
                }
            }
            if (originalTime !== -1 && coordinates.length === 0 && totalTime < 1) { // For new runs
                setOriginalTime(-1)
                watch_location()
            }
        }, 1000);
    })

    useEffect(() => {
        if ((paused === false || coordinates.length === 0) && currentlocation) {
            setCoordinates([...coordinates, { lat: currentlocation.coords.latitude, long: currentlocation.coords.longitude }])
        }
    }, [currentlocation])

    useEffect(() => {
        (async () => {
            if (!status?.granted && status?.canAskAgain) {
                requestPermission()
                return;
            }
        })();
    }, [status])


    const navigator = useNavigation()
    const {logProgress} = useBadges()
    let dao = ProgressDao(false)

    async function onSavePress() {
        if (!totalTime) {
            navigator.navigate('FinishedExercise')
        }
        setPaused(true)
        dao.saveProgress('run_progress', {
            user_id: profile?.id,
            time: totalTime,
            date: AWSDate,
            coordinates,
            type: runType.name
        })
        // if (id) {
        //     const og = await DataStore.query(RunProgress, id)
        //     if (og) {
        //         await DataStore.save(RunProgress.copyOf(og, x => {
        //             x.totalTime = totalTime;
        //             x.runType = runType.name;
        //             x.coordinates = coordinates;
        //         }))
        //     }
        // } else {
        //     await DataStore.save(new RunProgress({ date: AWSDate, userID: userId, totalTime: totalTime, coordinates: coordinates, runType: runType.name, progressID: progressId }))
        //     logProgress(BadgeType.runs)
        // }
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
            {props => <RunDetailsView coordinates={coordinates} date={date} setRunType={setRunType} runType={runType} time={totalTime || 0} onSavePress={() => Alert.alert(`Finish ${runType.name}`, 'Are you sure that you are complete?', [
                { text: 'Cancel' }, {
                    text: 'Finish', onPress: () => {
                        //@ts-ignore
                        navigator.pop()
                        onSavePress()
                    }
                }
            ])} paused={paused} setPaused={setPaused} onResetPressed={() => {
                Alert.alert('Reset', 'Are you sure that you want to reset? This action cannot be reversed', [
                    { text: 'Cancel' }, {
                        text: 'Reset', onPress: () => {
                            setCoordinates([])
                            setTotalTime(0)
                            setOriginalTime(0)
                        }
                    }
                ])
            }} />}
        </Stack.Screen>
    </Stack.Navigator>
};

export default RunTracker;


function RunDetailsView(props: { coordinates: {lat: number, long: number}[], date: string; setRunType: (p: any) => void; runType: RunType, onSavePress: () => void; time: number, paused: boolean, setPaused: (p: boolean) => void, onResetPressed: () => void; }) {
    const { coordinates, date, setRunType, runType, time } = props;
    const totalDistanceInMiles = getTotalDistance(coordinates)
    const dm = useColorScheme() === 'dark'
    const navigator = useNavigation()
    const height = Dimensions.get('screen').height
    return <View includeBackground style={[{ marginTop: height * 0.30, height: height * 0.70 }, tw`rounded-t-3xl p-6`]}>
        <View style={tw`justify-between h-12/12 pb-12`}>
            <View>
                <View style={tw`flex-row justify-between`}>
                    <View style={tw``}>
                        <Text style={tw`text-xl`} weight='semibold'>{runType.name} Activity</Text>
                        <Text>{date}</Text>
                    </View>
                    <TouchableOpacity onPress={() => {
                        //@ts-ignore
                        navigator.pop()
                    }}>
                        <ExpoIcon iconName='feather' name='x-circle' color='gray' size={25} />
                    </TouchableOpacity>
                </View>
                <View style={tw`flex-row justify-center mt-6`}>
                    <TouchableOpacity onPress={() => props.setPaused(!props.paused)}>
                    <View card style={[{ width: Dimensions.get('screen').width * 0.15, height: Dimensions.get('screen').width * 0.15 }, tw`items-center justify-center rounded-lg mx-2`]}>
                        <ExpoIcon name={props.paused ? 'play' : 'pause'} iconName='feather' size={25} color='white' />
                    </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => props.onResetPressed()}>
                    <View card style={[{ width: Dimensions.get('screen').width * 0.15, height: Dimensions.get('screen').width * 0.15 }, tw`items-center justify-center rounded-lg mx-2`]}>
                        <ExpoIcon name={'refresh-ccw'} iconName='feather' size={25} color='white' />
                    </View>
                    </TouchableOpacity>
                </View>
                <View style={tw`flex-row items-center justify-between my-6`}>
                    <View card style={[{ width: Dimensions.get('screen').width * 0.40, height: Dimensions.get('screen').height * 0.15 }, tw`p-3 rounded-xl items-center`]}>
                        <Text style={tw`text-xs`}>Time</Text>
                        <Text style={tw`text-center my-7 text-3xl`} weight='bold'>{toHHMMSS(time)}</Text>
                    </View>
                    <View card style={[{ width: Dimensions.get('screen').width * 0.40, height: Dimensions.get('screen').height * 0.15 }, tw`p-3 rounded-xl items-center`]}>
                        <Text style={tw`text-xs`}>Total Miles</Text>
                        <Text style={tw`text-center my-7 text-3xl`} weight='bold'>{totalDistanceInMiles}{<Text style={tw`text-xs`}>mi.</Text>}</Text>
                    </View>
                </View>
                <Text weight='semibold' style={tw`my-4`}>Change Activity Type: </Text>
                <View style={tw`flex-row items-center justify-around`}>
                    {defaultRunTypes.map(opt => {
                        const selected = opt.name === runType.name
                        return <TouchableOpacity style={tw`p-3 ${selected ? 'bg-red-500/80' : 'bg-gray-500/20'} rounded`} key={opt.name} onPress={() => setRunType(opt)}>
                            <Text>{opt.emoji}</Text>
                        </TouchableOpacity>
                    })}
                </View>
            </View>
            <SaveButton safeArea onSave={props.onSavePress} />
        </View>
    </View>
}


