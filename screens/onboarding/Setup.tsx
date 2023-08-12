import { View, Text } from '../../components/Themed'
import React, { useState } from 'react'
import tw from 'twrnc'
import useColorScheme from '../../hooks/useColorScheme'
import moment from 'moment';
import { Goal } from '../../aws/models';


interface SetupQuestion {
    name: string;
    description: string;
    type: 'input' | 'date' | 'select' | 'height' | 'weight' | 'fat',
    value: any;
    setValue: (b: any) => void;
    options?: {name: string; value: any; description?: string; icon?: string;}[];
    min?: string;
    max?: string;
}

export default function Setup() {
    const dm = useColorScheme() === 'dark'
    const [name, setName] = useState<string>('')
    const [metric, setMetric] = useState<boolean>(false);
    const [age, setAge] = useState<typeof moment | null>(null);
    const [gender, setGender] = useState<string | null>(null);
    const [goal, setGoal] = useState<Goal | null>(null);
    const [fitnessHistory, setFitnessHistory] = useState<string>('')
    const [fat, setFat] = useState<number>(20)
    const [weight, setWeight] = useState<number>(180)
    const [fatGoal, setFatGoal] = useState<number>(15)
    const [hip, setHip] = useState<number>(0)
    const [waist, setWaist] = useState<number>(0)
    const [neck, setNeck] = useState<number>(0)
    const [weightGoal, setWeightGoal] = useState<number>(145)
    const [goalByDate, setGoalByDate] = useState<string | null>(null);
    const [height, setHeight] = useState<number>(60)
    let weightPrefix = metric ? 'kg' : 'lb'
    let measurementPrefix = metric ? 'cm' : ''
    const questions: SetupQuestion[] = [
        {name: 'Your Name', description: 'Introduce yourself', value: name, setValue: setName, type: 'input'},
        {name: 'Unit of Measure', description: 'Please indicate if you would like to use the metric systems', value: metric, setValue: setMetric, type: 'select', options: [
            {name: 'Metric', description: 'cm and kg', value: true}, {name: 'Imperial', description: 'lb and in', value: false}
        ]},
        {name: 'Gender', description: 'This will help us calculate your goal calories!', value: gender, setValue: setGender, type: 'select', options: [
            {name: 'Male', value: 'MALE'}, {name: 'Female', value: 'FEMALE'}, {name: 'Non-binary', value: 'OTHER'}
        ]},
        {name: 'Date of Birth', description: 'You age will help us calculate your goal calories, and adapt your fitness plan!', value: age, setValue: setAge, type: 'date'},
        {name: 'Goal', description: 'Let us know how you would like to use the app!', value: goal, setValue: setGoal, type: 'select', options: [
            {name: 'Net Deficit', value: Goal.DEFICIT, description: 'I would like to focus on losing body fat and/or weight, while potentially gaining muscle!'}, 
            {name: 'Maintenance', value: Goal.MAINTENANCE, description: 'I would like to stay around the same body weight, while replacing body fat with muscle!'}, 
            {name: 'Net Surplus', value: Goal.SURPLUS, description: 'I would like to gain weight by consuming more calories, while potentially gaining muscle!'}
        ]},
        {name: 'Activity Level', description: 'How active are you per day? This will help us adjust plans to your lifestyle!', value: fitnessHistory, setValue: setFitnessHistory, type: 'select', options: [
            {name: 'Sedentary', value: 'SEDENTARY', description: 'I do not engage in formal exercise and I am not physically active'}, 
            {name: 'Lightly Active', value: 'LIGHT', description: 'I perform some activity during the day (e.g. gardening, walking the dog, etc.), but no formal exercise.'}, 
            {name: 'Average', value: 'AVERAGE', description: 'I perform formal exercise at least 2 times per week, but would like to take it more seriously'}, 
            {name: 'Hyperactive', value: 'ACTIVE', description: 'I perform formal exercise at least 3-4 times per week!'}, 
        ]},
        {name: 'Height', description: 'You height will help us calculate your goal calories, and adapt your fitness plan!', value: height, setValue: setHeight, type: 'height'},
        {name: 'Weight', description: 'You weight will help us calculate your goal calories, and adapt your fitness plan!', value: weight, setValue: setWeight, type: 'weight'},
        {name: 'Weight Goal', description: 'This will give us a quantifiable goal to access your weight progress!', value: weightGoal, setValue: setWeightGoal, type: 'weight'},
        {name: 'Body Fat', description: 'You body fat will help us calculate your goal calories, and adapt your fitness plan!', value: fat, setValue: setFat, type: 'fat'},
        {name: 'Body Fat Goal', description: 'This will give us a quantifiable goal to access your body fat progress!', value: fatGoal, setValue: setFatGoal, type: 'fat'},
        {name: 'Goal Target', description: 'When would you like to achieve this goal? This will help us calculate your daily calories!', value: goalByDate, setValue: setGoalByDate, type: 'fat'}
    ]

  return (
    <View>
      <Text>Setup</Text>
    </View>
  )
}