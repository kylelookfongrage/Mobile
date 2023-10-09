import { useColorScheme, Image, Dimensions, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native'
import React from 'react'
import tw from 'twrnc'
import { View, Text } from '../base/Themed'
import { defaultImage, toHHMMSS, WorkoutPlayDisplayProps } from '../../data'
import { ImagePickerView } from '../inputs/ImagePickerView'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ExpoIcon } from '../base/ExpoIcon'
import AnimatedLottieView from 'lottie-react-native'
import { useNavigation } from '@react-navigation/native'

export default function WorkoutPlayStatic(props: WorkoutPlayDisplayProps) {
    const dm = useColorScheme() === 'dark'
    const {
        currentExercise,
        exercises,
        shouldShowMore,
        setShouldShowMore,
        selectedWorkoutDetail,
        setSelectedWorkoutDetail,
        paused,
        setPaused,
        totalTime,
        onResetPress,
        workoutPlayDetails,
        onNewSetPress,
        onFinishPress,
        selectedWorkoutPlayDetail,
        setSelectedWorkoutPlayDetail,
        animation,
        workoutDetails
    } = props;
    const navigator = useNavigation();
    if (!selectedWorkoutPlayDetail) {
         return <View includeBackground style={{flex: 1}}>
            <SafeAreaView>
            <Text>Loading...</Text>
            <ActivityIndicator />
        </SafeAreaView>
        </View>
    }
    return (
        <View style={[{ flex: 1 }]} includeBackground>
            <SafeAreaView edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <ImagePickerView height={Dimensions.get('screen').height * 0.45} srcs={currentExercise.media} editable={false} />
                <View style={tw`px-4 pt-2`}>
                    <Text style={tw`text-xl max-w-9/12`} weight='bold'>{currentExercise.name}</Text>
                    <Text style={tw``}>{currentExercise.description.length > 100 ? (shouldShowMore ? currentExercise.description : currentExercise.description.substring(0, 100)) : currentExercise.description} 
                    <Text style={tw`ml-4 text-gray-500`} weight='semibold' onPress={() => setShouldShowMore(!shouldShowMore)}>  {(currentExercise.description.length > 100) ? (shouldShowMore ? 'Hide' : 'Show More') : ''}</Text>
                    </Text>
                    {selectedWorkoutDetail.note && <Text>Note: {selectedWorkoutDetail.note}</Text>}

                    <View style={tw`items-center w-12/12 items-center justify-center bg-gray-${dm ? '700/40' : '500/30'} mt-3 mb-6 p-3 pb-6 rounded-xl`}>
                        <Text style={tw`text-4xl my-4`} weight='regular'>{toHHMMSS(totalTime)}</Text>
                        <View style={tw`flex flex-row items-center justify-center`}>
                            <View style={tw`items-center justify-center`}>
                                <Text style={tw`mb-2 text-xs text-gray-500`} weight='semibold'>{paused ? 'Start' : 'Pause'}</Text>
                            <TouchableOpacity onPress={() => {
                                setPaused(!paused)
                            }} style={tw`bg-slate-${dm ? '200' : '400'}/60 items-end justify-center p-4 rounded-full`}>
                                <ExpoIcon iconName='feather' style={tw``} name={totalTime === 0 ? 'play' : (paused ? 'play' : 'pause')} size={25} color='#36454F' />
                            </TouchableOpacity>
                            </View>
                            <View style={[tw`bg-gray-500 mx-12`, {width: 1, height: 60}]} />
                            <View style={tw`items-center justify-center`}>
                            <Text style={tw`mb-2 text-xs text-gray-500`} weight='semibold'>Restart</Text>
                            <TouchableOpacity onPress={onResetPress} style={tw`bg-slate-${dm ? '200' : '400'}/60 items-end justify-center p-4 rounded-full`}>
                                <ExpoIcon iconName='feather' name={'rotate-ccw'} size={25} color='#36454F' />
                            </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    <View style={tw`border border-${dm ? 'white' : 'black'} rounded-xl p-3 mt-4`}>
                        {workoutPlayDetails.filter(x => x.workoutdetailsID === selectedWorkoutDetail.id).map((set, i) => {
                            const selected = selectedWorkoutPlayDetail.id === set.id
                            return <View key={`set: ${set.id} at ${i}`} >
                                <TouchableOpacity onPress={() => {
                                    if (!selected) {
                                        setSelectedWorkoutPlayDetail(set)
                                    }
                                }} style={tw`p-2 items-start justify-center`}>
                                    <View style={tw`flex-row items-center`}>
                                        <ExpoIcon name='check-circle' iconName='feather' size={20} color={set.completed ? 'green' : 'gray'} />
                                        <Text style={tw`ml-2 ${set.completed ? 'line-through text-gray-500' : ''}`} weight={selected ? 'bold' : 'regular'}>Set {i + 1}: {toHHMMSS(set.secs || 0)} {selectedWorkoutDetail.secs ? 'of ' + toHHMMSS(selectedWorkoutDetail.secs) : ''}</Text>
                                    </View>
                                </TouchableOpacity>
                                {selected && <View>
                                    <View style={tw`flex-row items-center mt-3 justify-around`}>
                                        <View style={tw`items-center`}>
                                            <TextInput keyboardType='number-pad' placeholder='sets' style={tw`py-5 px-9 rounded-xl text-${dm ? 'white' : 'black'} bg-gray-${dm ? '700' : '300'}`} value={set.reps?.toString() || ''} onChangeText={(v) => {
                                                const newValue = v.replace(/[^0-9]/g, '')
                                                setSelectedWorkoutPlayDetail({...set, reps: Number(newValue) || null})

                                            }} />
                                        <Text style={tw`mt-2`} weight='semibold'>Reps</Text>   
                                        </View>
                                        <View style={tw`items-center`}>
                                            <TextInput keyboardType='number-pad' placeholder='lbs' style={tw`py-5 px-9 rounded-xl text-${dm ? 'white' : 'black'} bg-gray-${dm ? '700' : '300'}`} value={set.weight?.toString() || ''} onChangeText={(v) => {
                                                const newValue = v.replace(/[^0-9]/g, '')
                                                setSelectedWorkoutPlayDetail({...set, weight: Number(newValue) || null})

                                            }} />
                                        <Text style={tw`mt-2`} weight='semibold'>Weight</Text>   
                                        </View>
                                    </View>
                                    {(set.completed && (set.rest !== selectedWorkoutDetail.rest)) && <TouchableOpacity onLongPress={() => {
                                        navigator.navigate('SelectSprite')
                                    }} style={tw`flex-row items-center justify-center`}>
                                        <AnimatedLottieView autoPlay
                                            style={tw`h-15 w-15`}
                                            source={animation} />
                                        <Text>Resting: {toHHMMSS(set.rest || 0)}</Text>
                                    </TouchableOpacity>}
                                    <TouchableOpacity onPress={() => {
                                        setSelectedWorkoutPlayDetail({ ...selectedWorkoutPlayDetail, completed: !selectedWorkoutPlayDetail.completed, rest: 0 })
                                    }} style={tw`mx-4 items-center justify-center p-2 bg-red-500 my-3 rounded-xl`}>
                                        <Text style={tw`text-white`}>{set.completed ? 'Restart' : 'Complete'}</Text>
                                    </TouchableOpacity>
                                </View>}
                            </View>
                        })}
                        <TouchableOpacity onPress={onNewSetPress} style={tw`flex-row items-center p-2 mt-4`}>
                            <ExpoIcon name='plus' iconName='feather' size={20} color={'gray'} />
                            <Text>New Set</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={tw`mt-6 text-lg`} weight='semibold'>Exercises Remaining</Text>
                    {workoutDetails.map((wd, idx) => {
                        if (selectedWorkoutDetail.id === wd.id) return <View key={wd.id} />;
                        const currentExerciseForWD = exercises.filter(x => x.id === wd.exerciseID)[0]
                        if (!currentExerciseForWD) return
                        let image = currentExerciseForWD.media.filter(x => x.type === 'image')[0]
                        return <TouchableOpacity
                            key={wd.id + `${idx}`}
                            style={tw`px-4 py-3 my-2 bg-gray-${dm ? '700' : '300'} w-12/12 rounded-xl flex-row justify-between`}
                            onPress={() => {
                                setSelectedWorkoutDetail(wd)
                                setSelectedWorkoutPlayDetail(workoutPlayDetails.filter(x => x.workoutdetailsID === wd.id)[0])
                            }}>
                            <View style={tw`flex-row`}>
                                <Image source={{ uri: image.uri || defaultImage }} style={tw`h-15 w-15 rounded-lg`} />
                                <View style={tw`justify-evenly ml-2 items-start max-w-11/12`}>
                                    <Text style={tw``} weight='semibold'>{currentExerciseForWD.name}</Text>
                                    <Text>{wd.sets} sets</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    })}
                </View>
                {/* Finish Workout Button */}
                <View style={tw`h-40`} />
            </ScrollView>
            </SafeAreaView>
            <View style={[
                {
                    position: 'absolute',
                    bottom: 10,
                    flex: 1
                },
                tw`w-12/12`
            ]}>
                {/* Add Food Button */}
                <View style={tw`py-5 items-center flex-row justify-center`}>
                    <TouchableOpacity onPress={onFinishPress} style={tw`bg-${dm ? 'red-600' : "red-500"} px-5 h-12 justify-center rounded-full`}>
                        <Text numberOfLines={1} style={tw`text-center text-white`} weight='semibold'>Finish Workout</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}