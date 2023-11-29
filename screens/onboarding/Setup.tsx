import { View, Text, SafeAreaView } from '../../components/base/Themed'
import React, { useEffect, useRef, useState } from 'react'
import tw from 'twrnc'
import useColorScheme from '../../hooks/useColorScheme'
import moment from 'moment';
import { Goal, Tier, User } from '../../aws/models';
import { BackButton } from '../../components/base/BackButton';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import { Dimensions, FlatList, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ExpoIcon } from '../../components/base/ExpoIcon';
import { RulerPicker } from 'react-native-ruler-picker';
import DatePicker from 'react-native-date-picker'
import { calculateBodyFat, inchesToFeet, caloriesPerDay } from '../../data';
import * as WebBrowser from 'expo-web-browser'
import { useCommonAWSIds } from '../../hooks/useCommonContext';
import { DataStore } from 'aws-amplify';
import { useNavigation } from '@react-navigation/native';
import { UserQueries } from '../../types/UserDao';
import Colors from '../../constants/Colors';
import { useDispatch } from 'react-redux';
import { useSelector } from '../../redux/store';
import { registerProfile } from '../../redux/reducers/auth';
import { Progress, XStack } from 'tamagui';
import { _tokens } from '../../tamagui.config';
import Input from '../../components/base/Input';
import Button from '../../components/base/Button';



interface SetupQuestion {
    name: string;
    description: string;
    type: 'input' | 'date' | 'select' | 'ruler',
    fat?: boolean;
    value: any;
    setValue: (b: any) => void;
    options?: { name: string; value: any; description?: string; icon?: string; }[];
    min?: any;
    max?: any;
    unit?: string;
    initialValue?: any;
    validation?: (v: any) => Promise<string | null>;
    textIcon?: string;
}

export default function Setup(props: { registration?: boolean; }) {
    const {registration} = props;
    const dm = useColorScheme() === 'dark'
    const [name, setName] = useState<string>('')
    const [metric, setMetric] = useState<boolean>(false);
    const [age, setAge] = useState<Date | null>(null);
    const [gender, setGender] = useState<string | null>(null);
    const [goal, setGoal] = useState<string | null>(null);
    const [fitnessHistory, setFitnessHistory] = useState<string>('')
    const [fat, setFat] = useState<number | null>(null)
    const [weight, setWeight] = useState<number | null>(null)
    const [fatGoal, setFatGoal] = useState<number | null>(null)
    const [hip, setHip] = useState<number | null>(null)
    const [waist, setWaist] = useState<number | null>(null)
    const [neck, setNeck] = useState<number | null>(null)
    const [weightGoal, setWeightGoal] = useState<number | null>(null)
    const [goalByDate, setGoalByDate] = useState<Date | null>(null);
    const [newUsername, setNewUsername] = useState<string | null>(null)
    let dispatch = useDispatch()
    const [height, setHeight] = useState<number>(30)
    const dao = UserQueries(false)
    let weightPrefix = metric ? 'kg' : 'lb'
    let measurementPrefix = metric ? 'cm' : 'in'
    const registrationQuestions: SetupQuestion[] = [
        { name: 'Your Name', description: 'Introduce yourself', value: name, setValue: setName, type: 'input', textIcon: 'Profile' },
        { name: 'Username', description: 'Let us get to know you!', value: newUsername, setValue: x => setNewUsername(x.toLowerCase()), type: 'input', textIcon: 'Send', validation: x => dao.validateUsername(x, null) },
    ]
    const questions: SetupQuestion[] = [
        ...(registration ? registrationQuestions : []),
        {
            name: 'Unit of Measure', description: 'Please indicate if you would like to use the metric systems', value: metric, setValue: setMetric, type: 'select', options: [
                { name: 'Metric', description: 'cm and kg', value: true }, { name: 'Imperial', description: 'lb and in', value: false }
            ]
        },
        {
            name: 'Gender', description: 'This will help us calculate your goal calories!', value: gender, setValue: setGender, type: 'select', options: [
                { name: 'Male', value: 'MALE', icon: 'male' }, { name: 'Female', value: 'FEMALE', icon: 'female' }, { name: 'Non-binary', value: 'OTHER', icon: 'male-female' }
            ]
        },
        {
            name: 'Date of Birth', description: 'You age will help us calculate your goal calories, and adapt your fitness plan!', value: age, setValue: setAge, type: 'date', max: new Date(), validation: async () => {
                if (!age) {
                    return 'There was a problem';
                }
                let birthday = moment(age)
                let yearsFromNow = birthday.diff(moment(), 'years')
                if (Math.abs(yearsFromNow) < 18) return 'You must be at least 18 to use this application'
                return null
            }
        },
        {
            name: 'Goal', description: 'Let us know how you would like to use the app!', value: goal, setValue: setGoal, type: 'select', options: [
                { name: 'Net Deficit', value: 'DEFICIT', description: 'I would like to focus on losing body fat and/or weight, while potentially gaining muscle!' },
                { name: 'Maintenance', value: 'MAINTENANCE', description: 'I would like to stay around the same body weight, while replacing body fat with muscle!' },
                { name: 'Net Surplus', value: 'SURPLUS', description: 'I would like to gain weight by consuming more calories, while potentially gaining muscle!' }
            ]
        },
        {
            name: 'Activity Level', description: 'How active are you per day? This will help us adjust plans to your lifestyle!', value: fitnessHistory, setValue: setFitnessHistory, type: 'select', options: [
                { name: 'Sedentary', value: 'SEDENTARY', description: 'I do not engage in formal exercise and I am not physically active' },
                { name: 'Lightly Active', value: 'LIGHT', description: 'I perform some activity during the day (e.g. gardening, walking the dog, etc.), but no formal exercise.' },
                { name: 'Average', value: 'AVERAGE', description: 'I perform formal exercise at least 2 times per week, but would like to take it more seriously' },
                { name: 'Hyperactive', value: 'ACTIVE', description: 'I perform formal exercise at least 3-4 times per week!' },
            ]
        },
        { name: 'Height', description: 'You height will help us calculate your goal calories, and adapt your fitness plan!', value: height, setValue: setHeight, type: 'ruler', unit: measurementPrefix, min: metric ? 50 : 36, max: metric ? 215 : 96 },
        { name: 'Weight', description: 'You weight will help us calculate your goal calories, and adapt your fitness plan!', value: weight, setValue: setWeight, type: 'ruler', unit: weightPrefix, min: metric ? 30 : 80, max: metric ? 250 : 300 },
        { name: 'Weight Goal', description: 'This will give us a quantifiable goal to access your weight progress!', value: weightGoal, setValue: setWeightGoal, type: 'ruler', unit: weightPrefix, min: metric ? 30 : 80, max: metric ? 250 : 300 },
        { name: 'Body Fat', fat: true, description: 'We will track this as progres and calculate your calories.', value: fat, setValue: setFat, type: 'ruler', unit: '%', min: 5, max: 50 },
        { name: 'Body Fat Goal', description: 'This will give us a quantifiable goal to access your body fat progress!', value: fatGoal, setValue: setFatGoal, type: 'ruler', unit: '%', min: 5, max: 50 },
        { name: 'Goal Target', description: 'When would you like to achieve this goal? This will help us calculate your daily calories!', value: goalByDate, setValue: setGoalByDate, type: 'date', min: new Date() },
    ]
    const s = Dimensions.get('screen')
    const [pageNumber, setPageNumber] = useState<number>(0);
    const listRef = useRef<FlatList | null>(null);
    const [shouldCalculateFat, setShouldCalculateFat] = useState<boolean>(false);
    let {profile, user} = useSelector(x => x.auth)
    let c = dm ? Colors.dark : Colors.light

    useEffect(() => {
        try {
            let g: 'male' | 'female' = gender === 'MALE' ? 'male' : 'female'
            if (!waist || !neck || (!hip && g == 'female') || !shouldCalculateFat) return;
            let u: 'Metric' | 'USC' = metric ? 'Metric' : 'USC'
            let z = calculateBodyFat(g, u, waist, neck, height, hip || undefined)
            if (z) {
                setFat(Math.abs(Math.round(z)))
            }
        } catch (error) {
            console.log(error)
        }
    }, [waist, hip, neck, shouldCalculateFat])
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const navigator = useNavigation()
    const insets = useSafeAreaInsets()
    const [loading, setLoading] = useState<boolean>(false)
    const saveProgress = async () => {
        setLoading(true)
        let document = {
            activity: fitnessHistory,
            birthday: moment(age).format('YYYY-MM-DD'),
            email: user?.email,
            gender: gender,
            goal: goal || undefined,
            goalDate: moment(goalByDate).format('YYYY-MM-DD'),
            height: height,
            metric: metric,
            name: name,
            startDate: moment().utc().format('YYYY-MM-DD'),
            startFat: fat,
            startWeight: weight,
            fatGoal: fatGoal,
            //@ts-ignore
            tdee: caloriesPerDay(gender === 'MALE', moment(age).format('YYYY-MM-DD'), moment().utc().format('YYYY-MM-DD'), moment(goalByDate).format('YYYY-MM-DD'), weight, weightGoal, height, fat, fitnessHistory.toLowerCase(), metric),
            username: newUsername || profile?.username,
            weight: weight,
            weightGoal: weightGoal,
        }
        if (props.registration && newUsername && weight && fat) {
            //@ts-ignore
            let res = await dao.save(document)
            //@ts-ignore
            if (res) {
                dispatch(registerProfile({profile: res}))
            }
            setLoading(false)
            navigator.navigate('OnboardingComplete')
        } else if (!props.registration!! && profile?.id) {
            let new_doc = {...document} //@ts-ignore
            delete new_doc['name']
            delete new_doc['username']
            let res = await dao.update(profile.id, new_doc) 
            if (res) {
                dispatch(registerProfile({profile: res}))
            }//@ts-ignore
            navigator.pop();
        }
        setLoading(false)
    }
    return (
        <SafeAreaView includeBackground style={{ flex: 1 }}>
            <XStack paddingHorizontal={24} paddingTop={10} justifyContent='space-between' alignItems='center'>
            <BackButton exlucdeSafeArea replacePop func={() => {
                if (pageNumber !== 0) {
                    setPageNumber(pageNumber - 1)
                    if (listRef && listRef.current) {
                        setShouldCalculateFat(false)
                        listRef.current.scrollToIndex({ animated: true, index: pageNumber - 1 })
                    }
                } else {
                    navigator.goBack()
                }
            }} />
                <Progress style={{ width: 214, height: 12, borderRadius: 100 }} value={((pageNumber) / questions.length) * 100}>
                    <Progress.Indicator backgroundColor={_tokens.primary900} />
                </Progress>
                <Text weight='bold' lg>{pageNumber + 1} / {questions.length}</Text>
            </XStack>
           
            <FlatList horizontal showsHorizontalScrollIndicator={false} data={questions} scrollEnabled={false} ref={listRef} renderItem={({ item, index }) => {
                const q: SetupQuestion = item
                const isHeight = q.name === 'Height'
                return <View key={`Question: ${index}`} style={[{ width: s.width, flex: 1 }, tw`justify-between mt-12`]}>
                    <View style={{ flex: 1 }}>
                        <Text style={tw`text-center`} weight='bold' h2>{q.name}</Text>
                        <Text style={tw`text-center mx-9 mt-3 mb-6`} xl>{q.description}</Text>
                        {errorMessage && <Text style={tw`-mt-3 text-center text-xs text-red-500 px-6 mb-3`}>{errorMessage}</Text>}
                        {q.type === 'input' && <View style={tw`items-center justify-center mt-6`}>
                            <Input id={q.name} width={'90%'} iconLeft={q.textIcon} value={q.value} textChange={q.setValue} placeholder={q.name} />
                            {/* <View card style={tw`flex-row items-center px-6 rounded-3xl`}>
                                {q.textIcon && <ExpoIcon name={q.textIcon} iconName='ion' size={25} color='gray' />}
                                <TextInput style={tw`h-20 text-lg pl-5 pb-6 pt-3 font-semibold rounded-3xl text-${dm ? 'white' : 'black'} w-8/12`} value={q.value} onChangeText={q.setValue} placeholderTextColor={'gray'} placeholder={q.name} />

                            </View> */}
                        </View>}
                        {(q.type === 'select' && (q.options || [])?.length > 0) && <View style={tw`px-6`}>
                            {q.options?.map((x) => {
                                const selected = x.value === q.value
                                let color = ``
                                if (selected) {
                                    color = `bg-red-${dm ? '600/80' : '500'}`
                                }
                                return <TouchableOpacity onPress={() => {
                                    q.setValue(x.value)
                                }} key={`Question ${index}, option ${x.name}`}>
                                    <View card={!selected} style={{...tw`px-6 ${x.description ? 'py-4' : 'py-6'} my-2 flex-row items-center rounded-2xl`, ...(selected && {backgroundColor: _tokens.primary900})}}>
                                    {x.icon && <View style={tw`mr-4`}>
                                        <ExpoIcon name={x.icon} iconName='ion' size={25} color={selected ? 'white' : "gray"} />
                                    </View>}
                                    <View>
                                        <Text style={tw`${selected ? 'text-white' : ''}`} weight='semibold' h5>{x.name}</Text>
                                        {x.description && <Text style={tw`text-${selected ? 'white' : 'gray-500'}`}>{x.description}</Text>}
                                    </View>
                                    </View>
                                </TouchableOpacity>
                            })}
                        </View>}
                        {q.type === 'date' && <View style={tw`px-6 mt-6 items-center justify-center`}>
                            <DatePicker androidVariant='iosClone' mode={'date'} minimumDate={(q.min || null)} maximumDate={(q.max || null)} date={q.value || new Date()} onDateChange={q.setValue} />
                        </View>}
                        {q.type === 'ruler' && <View style={[tw`justify-evenly`, {}]}>
                            {q.fat && <TouchableOpacity style={[{ zIndex: 1 }, tw`items-center justify-center p-3`]} onPress={() => setShouldCalculateFat(!shouldCalculateFat)}>
                                <Text style={{color: _tokens.primary800}} weight='semibold' lg>{shouldCalculateFat ? 'Input Body Fat' : 'Calculate Body Fat'}</Text>
                            </TouchableOpacity>}
                            {(q.fat && shouldCalculateFat) && <View style={[tw`items-center justify-evenly mt-6`, { zIndex: 1 }]}>
                                <Text style={tw`text-lg mb-6`} weight='semibold'>{fat}%</Text>
                                <View style={tw`flex-row items-center justify-evenly w-11/12`}>
                                    <Text>Hip</Text>
                                    <View style={tw`flex-row items-center`}>
                                        <TextInput style={tw`text-${dm ? 'white' : 'black'} p-3 font-bold`} placeholder='hip' placeholderTextColor={'gray'} keyboardType='numeric' value={hip?.toString()} onChangeText={x => {
                                            const newValue = x.replace(/[^0-9]/g, '')
                                            setHip(Number(newValue) || null)
                                        }} />
                                        <Text style={tw`ml-1`}>{measurementPrefix}</Text>
                                    </View>
                                </View>
                                <View style={tw`flex-row items-center mt-3 justify-evenly w-11/12`}>
                                    <Text>Neck</Text>
                                    <View style={tw`flex-row items-center`}>
                                        <TextInput style={tw`text-${dm ? 'white' : 'black'} p-3 font-bold`} placeholder='neck' placeholderTextColor={'gray'} keyboardType='numeric' value={neck?.toString()} onChangeText={x => {
                                            const newValue = x.replace(/[^0-9]/g, '')
                                            setNeck(Number(newValue) || null)
                                        }} />
                                        <Text style={tw`ml-1`}>{measurementPrefix}</Text>
                                    </View>
                                </View>
                                <View style={tw`flex-row items-center mt-3 justify-evenly w-11/12`}>
                                    <Text>Waist</Text>
                                    <View style={tw`flex-row items-center`}>
                                        <TextInput style={tw`text-${dm ? 'white' : 'black'} p-3 font-bold`} placeholder='waist' placeholderTextColor={'gray'} keyboardType='numeric' value={waist?.toString()} onChangeText={x => {
                                            const newValue = x.replace(/[^0-9]/g, '')
                                            setWaist(Number(newValue) || null)
                                        }} />
                                        <Text style={tw`ml-1`}>{measurementPrefix}</Text>
                                    </View>
                                </View>
                                <TouchableOpacity style={tw`mt-9`} onPress={async () => {
                                    await WebBrowser.openBrowserAsync('https://www.nasm.org/resources/body-fat-calculator')
                                }}>
                                    <Text style={tw`text-gray-500`} lg>Need help?</Text>
                                </TouchableOpacity>
                            </View>}
                            {!shouldCalculateFat && <View style={tw`mt-6`}>
                                {(isHeight && !metric) && <View style={tw`-mb-9`}>
                                    <Text style={tw`text-center text-3xl`} weight='bold'>{inchesToFeet(height, q.min)}</Text>
                                    </View>}
                                <RulerPicker 
                                    height={s.height * 0.25} 
                                    indicatorHeight={100} 
                                    fractionDigits={0} 
                                    indicatorColor={_tokens.primary600} 
                                    valueTextStyle={(isHeight && !metric) ? 
                                        {fontSize: 0, color: 'transparent'} : 
                                        tw`text-${dm ? 'white' : 'black'}`
                                    } 
                                    shortStepColor='darkgray' 
                                    unitTextStyle={(isHeight && !metric) ? 
                                        {fontSize: 0, color: 'transparent'} :
                                        tw`text-gray-500 text-xl`
                                    } 
                                    unit={q.unit} 
                                    min={(q.min || 0)} 
                                    decelerationRate={'fast'}
                                    max={q.max || 0} 
                                    onValueChange={isHeight ? x => q.setValue(Number(x)) : undefined}
                                    onValueChangeEnd={isHeight ? undefined : x => q.setValue(Number(x))} />
                            </View>}
                        </View>}
                    </View>
                    {(q.value !== null && q.value !== '') && <View style={[tw`items-center justify-center`, { paddingBottom: insets.bottom + 30 }]}>
                        <Button type='primary' pill width={'50%'} height={60} title={index === questions.length - 1 ? 'Finish' : "Next"} onPress={async () => {
                            setErrorMessage(null)
                            if (q.validation) {
                                let res = await q.validation(q.value)
                                if (res) {
                                    setErrorMessage(res)
                                    return
                                }
                            }
                            if (index !== questions.length - 1) {
                                setPageNumber(index + 1)
                                if (listRef && listRef.current) {
                                    setShouldCalculateFat(false)
                                    listRef.current.scrollToIndex({ animated: true, index: index + 1 })
                                }
                            } else {
                                await saveProgress()
                            }
                        }} />
                       </View>}
                </View>
            }} />
        </SafeAreaView>
    )
}