import { useColorScheme, Dimensions, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Pressable, Keyboard } from 'react-native'
import React, { useRef, useState } from 'react'
import tw from 'twrnc'
import { View, Text } from '../base/Themed'
import { defaultImage, isStorageUri, sleep, titleCase, toHHMMSS } from '../../data'
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
import Animated, { FadeIn, FadeInUp, FadeOut, FadeOutDown } from 'react-native-reanimated'
import SwipeWithDelete from '../base/SwipeWithDelete'
import { SettingItem } from '../../screens/home/Settings'

export default function WorkoutPlayStatic(props: WorkoutPlayDisplayProps) {
    const dm = useColorScheme() === 'dark'
    const {
        currentExercise,
        exercises,
        selectedWorkoutDetail,
        paused,
        setPaused,
        onSetUpdate,
        totalTime,
        onResetPress,
        workoutPlayDetails,
        onNewSetPress,
        onFinishPress,
        selectedWorkoutPlayDetail,
        forwardBackwardPress,
        animation,
        selectedAnimation,
        updateAllSets,
        deleteSet,
        workoutDetails,
        onWorkoutDetailPress,
        resting,
        next
    } = props;
    

    let s = useStorage()
    let screen = Dimensions.get('screen')
    const ref = useRef<ScrollView | null>(null)
    const navigator = useNavigation();
    let options = ['Exercise', 'Set Log', 'Remaining']
    let [selectedOption, setSelectedOption] = useState(options[0])
    let [showExerciseDetails, setShowExerciseDetails] = useState<boolean>(false)
    let [showOptions, setShowOptions] = useState<boolean>(false)
    console.log(`SWPD.Rest ${selectedWorkoutPlayDetail?.rest}`)
    console.log(`SWD.REST`, selectedWorkoutDetail.rest)
    if (!selectedWorkoutPlayDetail) {
        return <View includeBackground style={{ flex: 1 }}>
            <SafeAreaView>
                <Text>Loading...</Text>
                <ActivityIndicator />
            </SafeAreaView>
        </View>
    }
    if (resting || (paused && totalTime > 0)) {
        let wpd = paused ? selectedWorkoutPlayDetail : (next || selectedWorkoutPlayDetail)
        let exercise = exercises.find(x => x.id === wpd?.exercise_id)
        let wd = workoutDetails.find(x => x.id === wpd?.workout_detail_id)

        return <Animated.View entering={FadeInUp} exiting={FadeOutDown} style={[{ flex: 1, backgroundColor: _tokens.primary900 }]}>
            <SafeAreaView>
            <XStack alignItems='center' justifyContent='space-between' paddingHorizontal='$3'>
                <Pressable onPress={onFinishPress}>
                    <ExpoIcon name='close' iconName='ion' size={25} color={dm ? 'white' : 'black'} />
                </Pressable>
                <Text lg weight='bold' style={tw`text-white`}>{resting ? 'RESTING' : "PAUSED"}</Text>
                <Text>     </Text>
            </XStack>
            <Spacer lg/>
            {(!resting || (resting && !animation)) && <YStack>
               {exercise?.video && <Video autoPlay isLooping resizeMode='cover' indicatorMarginBottom={'0'} indicatorMarginTop={15} style={{ height: screen.height * 0.40, width: screen.width }} source={{ uri: isStorageUri(exercise?.video) ? s.constructUrl(exercise?.video)?.data?.publicUrl : exercise?.video }} />}
                {(!exercise?.video) && <SupabaseImage style={{ height: screen.height * 0.40, width: screen.width }} uri={exercise?.preview || defaultImage} />}
            </YStack> }
            {(resting && animation) && <YStack style={{ height: screen.height * 0.40, width: screen.width }} alignItems='center' justifyContent='center'>
                <AnimatedLottieView source={animation} autoPlay
                style={{ height: screen.height * 0.40, width: screen.width }} />
                </YStack>}
            <Spacer lg />
            {(resting && next && exercise) && <Text lg weight='bold' style={tw`text-white text-center`}>Up Next</Text>}
            {resting && <Spacer lg/>}
            <XStack alignItems='center' justifyContent='center'>
                <Text h5 weight='semibold' style={tw`text-center text-white`}>{exercise?.name}</Text>
                <Spacer horizontal sm />
                <IconButton onPress={() => setShowExerciseDetails(true)} iconName='Info-Square' iconWeight={'light'} type='primary' size={'$2'} iconSize={25} />
            </XStack>
            <Spacer sm />
            {!resting && <Text style={tw`text-center text-white`} lg weight='semibold'>Round {wpd?.num || 1} of {(workoutPlayDetails.filter(x => x.workout_detail_id === wd?.id).length || 1)}</Text>}
            {(resting && next) && <Text style={tw`text-center text-white`} lg weight='semibold'>Round {next.num} of {(workoutPlayDetails.filter(x => x.workout_detail_id === wd?.id).length || 1)}</Text>}
            <Spacer />
            {!resting && <Text h1 weight='bold' style={tw`text-center text-white`}>{toHHMMSS(wd?.time ? ((wd?.time - (wpd?.time || 0)) > 0 ? (wd?.time - (wpd?.time || 0)) : 0) : totalTime, ' : ')}</Text>}
            {resting && <Text h1 weight='bold' style={tw`text-center text-white`}>{toHHMMSS((selectedWorkoutDetail?.rest || 0) - (selectedWorkoutPlayDetail?.rest || 0))}</Text>}
            <Spacer />
            <YStack paddingHorizontal='$3'>
                {paused && <>
                    <Button color={'white'} type={'light'}  IconLeft={() => <ExpoIcon name={paused ? 'play' : 'pause'} style={tw`mr-2`} iconName='ion' size={23} color={_tokens.primary900} />} height={'$5'} title={paused ? (totalTime > 0 ? 'Resume' : 'Start') : 'Pause'} pill onPress={() => setPaused(!paused)} />
                <Spacer lg />
                    <Button onPress={onResetPress} type='darkOutline' color={_tokens.primary900} height={'$5'} title='Restart' pill />
                    <Spacer />
                    <Button onPress={onFinishPress} type='darkOutline' color={_tokens.primary900} height={'$5'} title='Cancel' pill />
                </>}
                {!paused && <Spacer xl/>}
                {!paused && <XStack alignItems='center' justifyContent='center'>
                    <Button onPress={() => forwardBackwardPress(false)}  type='darkOutline' color={_tokens.primary900}  height={'$5'} width={'45%'} title='Back' pill />
                    <Spacer horizontal lg />
                    <Button onPress={forwardBackwardPress} color={'white'} type={'light'}  height={'$5'} width={'45%'} title='Skip' pill />
                </XStack>}
               
            </YStack>

            <Overlay dialogueHeight={45} visible={showExerciseDetails} onDismiss={() => setShowExerciseDetails(false)}>
                <Text h4 weight='bold'>{exercise?.name}</Text>
                <Spacer sm />
                <XStack alignItems='center' justifyContent='space-around'>
                    <Text>{wd?.reps} x {wd?.sets} Sets</Text>
                    <Text>{toHHMMSS(wd?.rest || 0)} Rest</Text>
                    <Text>{toHHMMSS(wd?.time || 0)} Time</Text>
                </XStack>
                <Spacer sm />
                <Description value={exercise?.description + (!wd?.note ? '' : `\nNote: ${wd?.note}`)} editable={false} />

            </Overlay>
            </SafeAreaView>
        </Animated.View>
    }
    return (
        <View style={[{ flex: 1 }]} safeAreaTop includeBackground={!resting}>
            <XStack alignItems='center' justifyContent='space-between' paddingHorizontal='$3'>
                <Pressable onPress={onFinishPress}>
                    <ExpoIcon name='close' iconName='ion' size={25} color={dm ? 'white' : 'black'} />
                </Pressable>
                <Progress style={{ width: 214, height: 12, borderRadius: 100 }} value={100 * workoutPlayDetails.filter(x => x.completed).length / workoutPlayDetails.length}>
                    <Progress.Indicator backgroundColor={_tokens.primary900} />
                </Progress>
                <Pressable onPress={() => setShowOptions(true)}>
                <Icon name='Setting' size={25} color={dm ? 'white' : 'black'} />
                </Pressable>
            </XStack>
            <Spacer lg />
            <Selector searchOptions={options} selectedOption={selectedOption} onPress={setSelectedOption} />
            <Spacer lg />
            {selectedOption === options[0] && <YStack>
                {currentExercise.video && <Video autoPlay isLooping resizeMode='cover' indicatorMarginBottom={'0'} indicatorMarginTop={15} style={{ height: screen.height * 0.40, width: screen.width }} source={{ uri: isStorageUri(currentExercise.video) ? s.constructUrl(currentExercise.video)?.data?.publicUrl : currentExercise.video }} />}
                {(!currentExercise.video) && <SupabaseImage style={{ height: screen.height * 0.40, width: screen.width }} uri={currentExercise.preview || defaultImage} />}

            </YStack>}
            {selectedOption === options[1] && <YStack padding='$0' w='100%' h={screen.height * 0.40}>
                    <ScrollView keyboardShouldPersistTaps='handled' keyboardDismissMode='on-drag' showsVerticalScrollIndicator={false} style={tw`px-2`}>
                        {workoutPlayDetails.filter(x => x.workout_detail_id === selectedWorkoutPlayDetail.workout_detail_id).map((set, i) => {
                            const selected = selectedWorkoutPlayDetail.id === set.id
                            return <SwipeWithDelete onDelete={() => {
                                if (workoutPlayDetails.filter(x => x.workout_detail_id === selectedWorkoutPlayDetail.workout_detail_id).length === 1) return;
                                deleteSet(set)
                            }} key={`set: ${set.id} at ${i}`} > 
                                <XStack backgroundColor={dm ? _tokens.darkBg : _tokens.lightBg} alignItems='center' justifyContent='space-between' marginVertical='$2'>
                                <YStack width={'$3'} height={'$4'} borderRadius={'$3'} alignItems='center' justifyContent='center' backgroundColor={selected ? _tokens.primary900 : dm ? _tokens.dark1 : _tokens.gray300}>
                                    <Text lg weight='bold' style={tw`${selected ? 'text-white' : ''}`}>{i+1}</Text>
                                </YStack>
                                <XStack alignItems='center'>
                                    <Input number value={set.weight || undefined} numberChange={n => onSetUpdate({...set, weight: n})} width={'$10'} otherProps={{maxLength: 4}} type='number-pad' inputWidth={'$7'} placeholder='150' height={'$4'} id={`set: ${set.id} at ${i}`} />
                                    <Text>{set.metric ? 'kgs' : 'lbs'}</Text>
                                </XStack>
                                <XStack alignItems='center'>
                                    <Input width={'$10'} value={set.reps||undefined} numberChange={n => onSetUpdate({...set, reps: n})}  otherProps={{maxLength: 3}} type='number-pad' inputWidth={'$7'} placeholder=' 15' height={'$4'} id={`set: ${set.id} at ${i}`} />
                                    <Text>reps</Text>
                                </XStack>
                                <YStack width={'$3'} height={'$4'} borderRadius={'$3'} alignItems='center' justifyContent='center' backgroundColor={set.completed ? _tokens.tGreen : (dm ? _tokens.dark1 : _tokens.gray300)}>
                                    <ExpoIcon name='checkmark' iconName='ion' size={25} color={set.completed ? 'green' : 'gray'} />
                                </YStack>
                            </XStack>
                            </SwipeWithDelete>
                        })}
                        {!paused && <TouchableOpacity onPress={onNewSetPress} style={tw`flex-row items-center p-2 mt-4`}>
                            <ExpoIcon name='plus' iconName='feather' size={20} color={'gray'} />
                            <Text>New Set</Text>
                        </TouchableOpacity>}
                    </ScrollView>
            </YStack>}
            {selectedOption === options[2] && <YStack w='100%' h={screen.height * 0.40}>
                    <View style={{flex: 1}}>
                        <ScrollView style={tw`px-3`} showsVerticalScrollIndicator={false}>
                        {workoutDetails.map((wd, idx) => {
                            let selected = selectedWorkoutDetail.id === wd.id
                            const currentExerciseForWD = exercises.filter(x => x.id === wd.exercise_id)[0]
                            return <TouchableOpacity onPress={() => {
                                onWorkoutDetailPress(wd)
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
            <Text style={tw`text-center text-gray-500`} lg weight='semibold'>Round {selectedWorkoutPlayDetail.num || 1} of {(workoutPlayDetails.filter(x => x.workout_detail_id === selectedWorkoutDetail.id).length || 1)}</Text>
            <Spacer />
            <Text h1 weight='bold' style={tw`text-center`}>{toHHMMSS(selectedWorkoutDetail.time ? ((selectedWorkoutDetail.time - (selectedWorkoutPlayDetail?.time || 0)) > 0 ? (selectedWorkoutDetail.time - (selectedWorkoutPlayDetail?.time || 0)) : 0) : totalTime, ' : ')}</Text>
            <Spacer />
            <YStack paddingHorizontal='$3'>
                <Button type={paused ? 'primary' : 'secondary'} IconLeft={() => <ExpoIcon name={paused ? 'play' : 'pause'} style={tw`mr-2`} iconName='ion' size={23} color='white' />} height={'$5'} title={paused ? (totalTime > 0 ? 'Resume' : 'Start') : 'Pause'} pill onPress={() => setPaused(!paused)} />
                <Spacer lg />
                <XStack alignItems='center' justifyContent='center'>
                    <Button disabled={totalTime === 0} onPress={() => forwardBackwardPress(false)} type='dark' height={'$5'} width={'45%'} title='Previous' pill />
                    <Spacer horizontal lg />
                    <Button disabled={totalTime === 0} onPress={forwardBackwardPress} type='dark' height={'$5'} width={'45%'} title='Skip' pill />
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

            <Overlay dialogueHeight={45} visible={showOptions} onDismiss={() => setShowOptions(false)}>
                <Text h4 weight='bold' style={tw`text-center`}>Workout Settings</Text>
                <Spacer divider />
                <SettingItem setting={{title: 'Resting Display', description: selectedAnimation ? titleCase(selectedAnimation) : 'Up Next Video', onPress: (n) => {
                    try {
                        setShowOptions(false)
                        n.navigate('SelectSprite')
                    } catch (error) {
                        console.log(error)
                    }
                }}} disableMargin hideCarat/>
                <Spacer />
                <SettingItem setting={{title: 'Metric Units', description: 'This can be globally changed in your profile settings', switch: true, switchValue: selectedWorkoutPlayDetail?.metric === true ? true : false, onSwitch: (b) => {
                    console.log(b)
                    updateAllSets('metric', b)
                }}} disableMargin hideCarat/>

            </Overlay>
        </View>
    )
}


