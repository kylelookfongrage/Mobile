import { Dimensions, useColorScheme, TouchableOpacity, Image, ActivityIndicator, TextInput, Keyboard, TouchableWithoutFeedback } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Text, View } from '../../components/Themed'
import tw from 'twrnc'
import { useNavigation } from '@react-navigation/native'
import { WorkoutDetails } from '../../aws/models'
import { useExerciseAdditions, WorkoutAddition } from '../../hooks/useExerciseAdditions'
import { getMatchingNavigationScreen, isStorageUri } from '../../data'
import { BackButton } from '../../components/BackButton'
import { ScrollView } from 'react-native-gesture-handler'
import { DataStore, Storage } from 'aws-amplify'
import { ExpoIcon } from '../../components/ExpoIcon'
import { ErrorMessage } from '../../components/ErrorMessage'
import { useCommonAWSIds } from '../../hooks/useCommonContext'


export default function AddExerciseToWorkout(props: { exerciseId: string }) {
    const { exerciseId } = props;
    const { workouts, setWorkouts } = useExerciseAdditions()
    const {userId} = useCommonAWSIds()
    const height = Dimensions.get('screen').height
    const [uploading, setUploading] = useState<boolean>(false)
    const [sets, setSets] = useState<number | null>(null);
    const [reps, setReps] = useState<number | null>(null);
    const [secs, setSecs] = useState<number | null>(null);
    const [rest, setRest] = useState<number | null>(null);
    const [note, setNote] = useState<string>('')
    const navigator = useNavigation()
    const [errors, setErrors] = useState<string[]>([])
    const dm = useColorScheme() === 'dark'
    async function saveExercise(){
        setUploading(true)
        try {
            for (var workout of workouts) {
                await DataStore.save(new WorkoutDetails({
                    secs: secs, sets: sets || 1, rest: rest, reps: reps,
                    workoutID: workout.id, exerciseID: props.exerciseId, userID: userId
                }))
            }
        } catch (error) {
            //@ts-ignore
            setErrors([error.toString()])
            return;
        }
        setUploading(false)
        //@ts-ignore
        navigator.pop()
    }
    return <View style={[{ flex: 1 }]} includeBackground>
        <BackButton />
        <TouchableWithoutFeedback onPress={() => {
            Keyboard.dismiss()
        }}>
            <ScrollView contentContainerStyle={tw`px-6 mt-9`}>
                {errors.length > 0 && <View style={tw`mb-6`}>
                    <ErrorMessage errors={errors} onDismissTap={() => setErrors([])} />
                </View>}
                <Text style={tw`text-lg`} weight='semibold'>Add Exercise to Workouts</Text>
                <Text style={tw`text-xs text-gray-500 text-center py-4`}>Please fill out how many sets, reps, time, and rest should be associated with this exercise</Text>
                <View style={tw`flex flex-row items-center justify-around pb-4`}>
                    <NumericInput title='Sets' value={sets} onChange={setSets} textInputStyle='text-center' />
                    <NumericInput title='Reps' value={reps} onChange={setReps} textInputStyle='text-center' />
                    <NumericInput title='Time' value={secs} onChange={setSecs} textInputStyle='text-center' placeholder='secs' />
                    <NumericInput title='Rest' value={rest} onChange={setRest} textInputStyle='text-center' placeholder='secs' />
                </View>
                <Text style={tw`mt-3`} weight='semibold'>Notes</Text>
                <TextInput value={note} onChangeText={setNote} placeholder='Any Notes for your exercise (e.g. left side / right side)' placeholderTextColor={'gray'} multiline numberOfLines={3} style={tw`${dm ? 'text-white' : 'text-black'}`} />
                <View style={tw`flex flex-row items-center justify-between my-6`}>
                    <Text style={tw``} weight='semibold'>Workouts</Text>
                    <TouchableOpacity onPress={() => {
                        const screen = getMatchingNavigationScreen('ListWorkout', navigator)
                        //@ts-ignore
                        navigator.navigate(screen, { exerciseId: props.exerciseId })
                    }} style={tw`p-3`}>
                        <Text style={tw`text-xs`}>Add Workout</Text>
                    </TouchableOpacity>
                </View>
                {workouts.map(x => {
                    return <WorkoutAdditionTab key={x.id} id={x.id} name={x.name} img={x.img} onDelete={(id) => {
                        setWorkouts(workouts.filter(x => x.id !== id))
                    }} />
                })}
            </ScrollView>
        </TouchableWithoutFeedback>
        <View style={[
            {
                position: 'absolute',
                bottom: 0,
                flex: 1
            },
            tw`w-12/12`
        ]}>
            {/* Add Food Button */}
            <View style={tw`py-5 w-12/12 items-center px-7 flex-row justify-center`}>
                <TouchableOpacity onPress={saveExercise} style={tw`bg-${dm ? 'red-600' : "red-500"} mr-2 px-5 h-12 justify-center rounded-full`}>
                    {!uploading && <Text numberOfLines={1} style={tw`text-center text-white`} weight='semibold'>{'Add to Workouts'}</Text>}
                    {uploading && <ActivityIndicator />}
                </TouchableOpacity>
            </View>
        </View>
    </View>
}

interface WorkoutAdditionTabProps extends WorkoutAddition {
    onDelete: (id: string) => void;
}
const WorkoutAdditionTab = (props: WorkoutAdditionTabProps) => {
    const [image, setImage] = useState<string>('')
    useEffect(() => {
        if (isStorageUri(props.img)) {
            Storage.get(props.img).then(setImage).catch(() => { })
        } else {
            setImage(props.img)
        }
    }, [])
    const dm = useColorScheme() === 'dark'
    return <View style={tw`flex flex-row items-center justify-between`}>
        <View style={tw`flex flex-row justify-start`}>
            {image && <Image source={{ uri: image }} style={tw`h-12 w-12 rounded`} />}
            <View style={tw`mx-2`}>
                <Text style={tw``} weight='bold'>{props.name}</Text>
                <Text style={tw`text-xs text-gray-500`}>{props.addedAlready ? 'Already Added' : 'New Workout'}</Text>
            </View>
        </View>
        <TouchableOpacity style={tw`p-3`} onPress={() => {
            props.onDelete && props.onDelete(props.id)
        }}>
            <ExpoIcon name='trash' iconName='feather' size={20} color={dm ? 'white' : 'black'} />
        </TouchableOpacity>
    </View>
}



interface NumericInputProps {
    title: string;
    titleStyle?: string;
    value: number | null;
    onChange: (v: number | null) => void;
    textInputStyle?: string;
    placeholder?: string;
}
export const NumericInput = (props: NumericInputProps) => {
    const { title, titleStyle, value, onChange, textInputStyle, placeholder } = props;
    const dm = useColorScheme() === 'dark'
    return <View>
        <Text style={tw`${titleStyle || ''}`} weight='semibold'>{title}</Text>
        <TextInput
            style={tw`${textInputStyle || ''} ${dm ? 'text-white' : 'text-black'}`}
            keyboardType='number-pad'
            value={value?.toString() || ''}
            placeholder={placeholder || 'x'}
            placeholderTextColor={'gray'}
            onChangeText={v => {
                const newValue = v.replace(/[^0-9]/g, '')
                onChange(Number(newValue) || null)
            }} />
    </View>
}