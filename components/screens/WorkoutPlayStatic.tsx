import { useColorScheme, Dimensions, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Pressable, Keyboard } from 'react-native'
import React, { useRef, useState } from 'react'
import tw from 'twrnc'
import { View, Text } from '../base/Themed'
import { defaultImage, isStorageUri, toHHMMSS } from '../../data'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ExpoIcon, Icon } from '../base/ExpoIcon'
import AnimatedLottieView from 'lottie-react-native'
import { useNavigation } from '@react-navigation/native'
import { WorkoutPlayDisplayProps } from '../../types/WorkoutDao'
import SupabaseImage from '../base/SupabaseImage'
import { Video } from '../base/Video'
import { useStorage } from '../../supabase/storage'
import Spacer from '../base/Spacer'
import { Progress, Tooltip, XStack, YStack } from 'tamagui'
import { _tokens } from '../../tamagui.config'
import Selector from '../base/Selector'
import Button, { IconButton } from '../base/Button'
import Overlay from './Overlay'
import Description from '../base/Description'
import SpinSelect from '../inputs/SpinSelect'
import Input from '../base/Input'

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
        onSetUpdate,
        totalTime,
        onResetPress,
        workoutPlayDetails,
        onNewSetPress,
        onFinishPress,
        selectedWorkoutPlayDetail,
        setSelectedWorkoutPlayDetail,
        forwardBackwardPress,
        animation,
        workoutDetails
    } = props;

    console.log('SELECTED')
    console.log(selectedWorkoutPlayDetail)
    console.log('ALL')
    console.log(workoutPlayDetails)
    let s = useStorage()
    let screen = Dimensions.get('screen')
    const ref = useRef<ScrollView | null>(null)
    const navigator = useNavigation();
    let options = ['Exercise', 'Set Log', 'Remaining']
    let [selectedOption, setSelectedOption] = useState(options[0])
    let [showExerciseDetails, setShowExerciseDetails] = useState<boolean>(false)
    if (!selectedWorkoutPlayDetail) {
        return <View includeBackground style={{ flex: 1 }}>
            <SafeAreaView>
                <Text>Loading...</Text>
                <ActivityIndicator />
            </SafeAreaView>
        </View>
    }
    return (
        <View style={[{ flex: 1 }]} safeAreaTop includeBackground>
            <XStack alignItems='center' justifyContent='space-between' paddingHorizontal='$3'>
                <Pressable onPress={onFinishPress}>
                    <ExpoIcon name='close' iconName='ion' size={25} color={dm ? 'white' : 'black'} />
                </Pressable>
                <Progress style={{ width: 214, height: 12, borderRadius: 100 }} value={100 * workoutPlayDetails.filter(x => x.completed).length / workoutPlayDetails.length}>
                    <Progress.Indicator backgroundColor={_tokens.primary900} />
                </Progress>
                <Icon name='Setting' size={25} color={dm ? 'white' : 'black'} />
            </XStack>
            <Spacer lg />
            <Selector searchOptions={options} selectedOption={selectedOption} onPress={setSelectedOption} />
            <Spacer lg />
            {selectedOption === options[0] && <YStack>
                {currentExercise.video && <Video autoPlay isLooping resizeMode='cover' indicatorMarginBottom={'0'} indicatorMarginTop={15} style={{ height: screen.height * 0.40, width: screen.width }} source={{ uri: isStorageUri(currentExercise.video) ? s.constructUrl(currentExercise.video)?.data?.publicUrl : currentExercise.video }} />}
                {(!currentExercise.video) && <SupabaseImage style={{ height: screen.height * 0.40, width: screen.width }} uri={currentExercise.preview || defaultImage} />}

            </YStack>}
            {selectedOption === options[1] && <YStack onPress={() => {
                if (Keyboard.isVisible()) {
                    Keyboard.dismiss()
                }
            }} w='100%' h={screen.height * 0.40}>
                <View style={{ flex: 1 }}>
                    <ScrollView showsVerticalScrollIndicator={false} style={tw`px-2`}>
                        {workoutPlayDetails.filter(x => x.workout_detail_id === selectedWorkoutDetail.id).map((set, i) => {
                            const selected = selectedWorkoutPlayDetail.id === set.id
                            return <XStack alignItems='center' justifyContent='space-between' marginBottom='$3' key={`set: ${set.id} at ${i}`} >
                                <YStack width={'$3'} height={'$4'} borderRadius={'$3'} alignItems='center' justifyContent='center' backgroundColor={selected ? _tokens.primary900 : dm ? _tokens.dark1 : _tokens.gray300}>
                                    <Text lg weight='bold' style={tw`${selected ? 'text-white' : ''}`}>{i+1}</Text>
                                </YStack>
                                <XStack alignItems='center'>
                                    <Input number value={set.weight || undefined} numberChange={n => onSetUpdate({...set, weight: n})} width={'$10'} otherProps={{maxLength: 4}} type='number-pad' inputWidth={'$7'} placeholder='150' height={'$4'} id={`set: ${set.id} at ${i}`} />
                                    <Text>{set.metric ? 'kgs' : 'lbs'}</Text>
                                </XStack>
                                <XStack alignItems='center'>
                                    <Input width={'$10'} value={set.reps||undefined} numberChange={n => onSetUpdate({...set, reps: n})}  otherProps={{maxLength: 4}} type='number-pad' inputWidth={'$7'} placeholder='150' height={'$4'} id={`set: ${set.id} at ${i}`} />
                                    <Text>reps</Text>
                                </XStack>
                                <YStack width={'$3'} height={'$4'} borderRadius={'$3'} alignItems='center' justifyContent='center' backgroundColor={set.completed ? _tokens.tGreen : (dm ? _tokens.dark1 : _tokens.gray300)}>
                                    <ExpoIcon name='checkmark' iconName='ion' size={25} color={set.completed ? 'green' : 'gray'} />
                                </YStack>
                            </XStack>
                            return <View key={`set: ${set.id} at ${i}`} >
                                <TouchableOpacity onPress={() => {
                                    if (!selected) {
                                        setSelectedWorkoutPlayDetail(set)
                                    }
                                }} style={tw`p-2 items-start justify-center`}>
                                    <View style={tw`flex-row items-center`}>
                                        <ExpoIcon name='check-circle' iconName='feather' size={20} color={set.completed ? 'green' : 'gray'} />
                                        <Text style={tw`ml-2 ${set.completed ? 'line-through text-gray-500' : ''}`} weight={selected ? 'bold' : 'regular'}>Set {i + 1}: {toHHMMSS(set.time || 0)} {selectedWorkoutDetail.time ? 'of ' + toHHMMSS(selectedWorkoutDetail.time) : ''}</Text>
                                    </View>
                                </TouchableOpacity>
                                {selected && <View>
                                    <View style={tw`flex-row items-center mt-3 justify-around`}>
                                        <View style={tw`items-center`}>
                                            <TextInput keyboardType='number-pad' placeholder='sets' style={tw`py-4 px-12 rounded-xl text-${dm ? 'white' : 'black'} bg-gray-${dm ? '800/60' : '300'}`} value={set.reps?.toString() || ''} onChangeText={(v) => {
                                                const newValue = v.replace(/[^0-9]/g, '')
                                                setSelectedWorkoutPlayDetail({ ...set, reps: Number(newValue) || null })

                                            }} />
                                            <Text style={tw`mt-2`} weight='semibold'>Reps</Text>
                                        </View>
                                        <View style={tw`items-center`}>
                                            <TextInput keyboardType='number-pad' placeholder={set.metric ? 'kgs' : 'lbs'} style={tw`py-4 px-12 rounded-xl text-${dm ? 'white' : 'black'} bg-gray-${dm ? '800/60' : '300'}`} value={set.weight?.toString() || ''} onChangeText={(v) => {
                                                const newValue = v.replace(/[^0-9]/g, '')
                                                setSelectedWorkoutPlayDetail({ ...set, weight: Number(newValue) || null })

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
                                    <Spacer sm />
                                    <TouchableOpacity onPress={() => {
                                        setSelectedWorkoutPlayDetail({ ...selectedWorkoutPlayDetail, completed: !selectedWorkoutPlayDetail.completed, rest: 0 })
                                    }} style={tw`mx-4 items-center justify-center px-2 py-3 bg-red-600 my-3 rounded-xl`}>
                                        <Text style={tw`text-white`} weight='bold'>{set.completed ? 'Restart' : 'Complete'}</Text>
                                    </TouchableOpacity>
                                </View>}
                            </View>
                        })}
                        <TouchableOpacity onPress={onNewSetPress} style={tw`flex-row items-center p-2 mt-4`}>
                            <ExpoIcon name='plus' iconName='feather' size={20} color={'gray'} />
                            <Text>New Set</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </YStack>}
            {selectedOption === options[2] && <YStack w='100%' h={screen.height * 0.40}>
                    <View style={{flex: 1}}>
                        <ScrollView style={tw`px-3`} showsVerticalScrollIndicator={false}>
                        {workoutDetails.map((wd, idx) => {
                            let selected = selectedWorkoutDetail.id === wd.id
                            const currentExerciseForWD = exercises.filter(x => x.id === wd.exercise_id)[0]
                            return <TouchableOpacity onPress={() => {
                                setSelectedWorkoutDetail(wd)
                                setSelectedWorkoutPlayDetail(workoutPlayDetails.filter(x => x.workout_detail_id === wd.id)[0])
                                if (ref.current) {
                                    ref.current.scrollTo({ y: 0, animated: true })
                                }
                            }} key={wd.id + `${idx}`}>
                                <XStack marginBottom={'$2'} marginHorizontal='$1' borderRadius={'$4'} alignItems='center' backgroundColor={selected ? _tokens.primary900 : dm ? _tokens.dark1 : _tokens.gray300}>
                                    <SupabaseImage style={tw`h-12 w-12 rounded`} uri={currentExerciseForWD.preview || defaultImage} />
                                    <Spacer sm horizontal/>
                                    <Text lg style={tw`${selected ? 'text-white' : ''}`}>{currentExerciseForWD.name}</Text>
                                </XStack>
                            </TouchableOpacity>
                        })}
                        </ScrollView>
                    </View>
                </YStack>}
            <Spacer />
            <XStack alignItems='center' justifyContent='center'>
                <Text h5 weight='semibold' style={tw`text-center`}>{currentExercise.name}</Text>
                <Spacer horizontal sm />
                <IconButton onPress={() => setShowExerciseDetails(true)} iconName='Info-Square' iconWeight={'light'} type='dark' size={'$2'} iconSize={25} />
            </XStack>
            <Spacer sm />
            <Text style={tw`text-center text-gray-500`} lg weight='semibold'>Round {workoutPlayDetails.filter(x => x.workout_detail_id === selectedWorkoutDetail.id && x.completed).length + 1} of {(workoutPlayDetails.filter(x => x.workout_detail_id === selectedWorkoutDetail.id).length || 1)}</Text>
            <Spacer />
            <Text h1 weight='bold' style={tw`text-center`}>{toHHMMSS(selectedWorkoutDetail.time ? ((selectedWorkoutDetail.time - (selectedWorkoutPlayDetail?.time || 0)) > 0 ? (selectedWorkoutDetail.time - (selectedWorkoutPlayDetail?.time || 0)) : 0) : totalTime, ' : ')}</Text>
            <Spacer />
            <YStack paddingHorizontal='$3'>
                <Button type={paused ? 'primary' : 'secondary'} IconLeft={() => <ExpoIcon name={paused ? 'play' : 'pause'} style={tw`mr-2`} iconName='ion' size={23} color='white' />} height={'$5'} title={paused ? (totalTime > 0 ? 'Resume' : 'Start') : 'Pause'} pill onPress={() => setPaused(!paused)} />
                <Spacer lg />
                <XStack alignItems='center' justifyContent='center'>
                    <Button onPress={() => forwardBackwardPress(true)} type='dark' height={'$5'} width={'45%'} title='Previous' pill />
                    <Spacer horizontal lg />
                    <Button onPress={forwardBackwardPress} type='dark' height={'$5'} width={'45%'} title='Skip' pill />
                </XStack>
            </YStack>

            <Overlay dialogueHeight={45} visible={showExerciseDetails} onDismiss={() => setShowExerciseDetails(false)}>
                <Text h4 weight='bold'>{currentExercise.name}</Text>
                <Spacer sm />
                <XStack alignItems='center' justifyContent='space-around'>
                    <Text>{selectedWorkoutDetail.reps} x {selectedWorkoutDetail.sets} Sets</Text>
                    <Text>{toHHMMSS(selectedWorkoutDetail.rest || 0)} Rest</Text>
                    <Text>{toHHMMSS(selectedWorkoutDetail.time || 0)} Time</Text>
                </XStack>
                <Spacer sm />
                <Description value={currentExercise.description + (!selectedWorkoutDetail.note ? '' : `\nNote: ${selectedWorkoutDetail.note}`)} editable={false} />

            </Overlay>
            <ScrollView ref={ref} showsVerticalScrollIndicator={false}>


            </ScrollView>
            <SafeAreaView edges={['left']}>
                <ScrollView>

                    <View style={tw`px-4 pt-4`}>
                        <Text style={tw`max-w-9/12`} h4 weight='bold'>{currentExercise.name}</Text>
                        <Spacer />
                        <Text style={tw``}>{(currentExercise?.description?.length || 0) > 100 ? (shouldShowMore ? currentExercise.description : (currentExercise.description || '').substring(0, 100)) : currentExercise.description}
                            <Text style={tw`ml-4 text-gray-500`} weight='semibold' onPress={() => setShouldShowMore(!shouldShowMore)}>  {((currentExercise.description || '').length > 100) ? (shouldShowMore ? 'Hide' : 'Show More') : ''}</Text>
                        </Text>
                        <Spacer />
                        {selectedWorkoutDetail.note && <Text>Note: {selectedWorkoutDetail.note}</Text>}
                        <Spacer />
                        <View card style={tw`items-center w-12/12 items-center justify-center mt-3 mb-6 p-3 pb-6 rounded-xl`}>
                            <Text style={tw`text-4xl my-4`} weight='regular'>{toHHMMSS(totalTime)}</Text>
                            <View style={tw`flex flex-row items-center justify-center`}>
                                <View style={tw`items-center justify-center`}>
                                    <Text style={tw`mb-2 text-xs text-gray-500`} weight='semibold'>{paused ? 'Start' : 'Pause'}</Text>
                                    <TouchableOpacity onPress={() => {
                                        setPaused(!paused)
                                    }} style={tw`bg-slate-${dm ? '600/30' : '400'}/60 items-end justify-center p-4 rounded-full`}>
                                        <ExpoIcon iconName='feather' style={tw``} name={totalTime === 0 ? 'play' : (paused ? 'play' : 'pause')} size={30} color='#36454F' />
                                    </TouchableOpacity>
                                </View>
                                <View style={[tw`bg-gray-500 mx-12`, { width: 1, height: 60 }]} />
                                <View style={tw`items-center justify-center`}>
                                    <Text style={tw`mb-2 text-xs text-gray-500`} weight='semibold'>Restart</Text>
                                    <TouchableOpacity onPress={onResetPress} style={tw`bg-slate-${dm ? '600/30' : '400'}/60 items-end justify-center p-4 rounded-full`}>
                                        <ExpoIcon iconName='feather' style={tw``} name={'rotate-ccw'} size={30} color='#36454F' />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>


                        <Spacer xl />
                        {selectedWorkoutDetail.id !== workoutDetails[0]?.id && <Text h3>Completed Exercises</Text>}
                        {workoutDetails.map((wd, idx) => {
                            if (selectedWorkoutDetail.id === wd.id) return <Text key={wd.id + `${idx}`} style={tw`mt-6 text-lg`} weight='semibold'>Exercises Remaining</Text>;
                            const currentExerciseForWD = exercises.filter(x => x.id === wd.exercise_id)[0]
                            return <View
                                key={wd.id + `${idx}`}
                                style={tw`bg-transparent`}
                            >
                                <View card
                                    style={tw`px-4 py-3 my-3 w-12/12 rounded-xl flex-row justify-between`}>
                                    <TouchableOpacity onPress={() => {
                                        setSelectedWorkoutDetail(wd)
                                        setSelectedWorkoutPlayDetail(workoutPlayDetails.filter(x => x.workout_detail_id === wd.id)[0])
                                        if (ref.current) {
                                            ref.current.scrollTo({ y: 0, animated: true })
                                        }
                                    }} style={tw`flex-row w-12/12`}>
                                        <SupabaseImage uri={currentExerciseForWD.preview || defaultImage} style={`h-15 w-15 rounded-lg`} />
                                        <View style={tw`justify-evenly ml-4 items-start max-w-11/12`}>
                                            <Text style={tw``} weight='bold'>{currentExerciseForWD.name}</Text>
                                            <Text style={tw`text-xs text-gray-500`}>{wd.sets} x {wd.reps || 0} sets</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>

                            </View>
                        })}
                    </View>
                    {/* Finish Workout Button */}
                    <View style={tw`h-40`} />
                </ScrollView>
            </SafeAreaView>
        </View>
    )
}