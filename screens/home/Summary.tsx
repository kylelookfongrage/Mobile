import { ScrollView, TouchableOpacity, Image, Animated, Easing } from 'react-native'
import React from 'react'
import { Text, View } from '../../components/Themed'
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc'
import { ExpoIcon } from '../../components/ExpoIcon';
import useColorScheme from '../../hooks/useColorScheme';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { FloatingActionButton } from '../../components/FAB';
import { useNavigation } from '@react-navigation/native';
import { useDateContext } from './Calendar';
import { getTdee } from './Profile';
import { DataStore } from 'aws-amplify';
import { Progress, User } from '../../aws/models';
import { useCommonAWSIds } from '../../hooks/useCommonContext';
import { getMatchingNavigationScreen } from '../../data';
import * as Haptics from 'expo-haptics'
import { useProgressValues } from '../../hooks/useProgressValues';
import RunListComponent from '../../components/RunListComponent';
import AnimatedLottieView from 'lottie-react-native';
import drinkWater from '../../assets/animations/drinkwater.json'
import moment from 'moment';
import ThisAdHelpsKeepFree from '../../components/ThisAdHelpsKeepFree';


export const SummaryScreen = () => {

  const dateContext = useDateContext()
  const { sub, userId, progressId, setProgressId } = useCommonAWSIds()
  const { formattedDate, AWSDate, today, setDate } = { formattedDate: dateContext.formattedDate, AWSDate: dateContext.AWSDate, today: dateContext.date, setDate: dateContext.setDate }
  const { food, meals, workouts, fat, weight, goal, water, runs } = useProgressValues({ foodAndMeals: true, activitiesAndWorkouts: true, metrics: true })
  const totalCalories = getTdee(goal, weight, fat)
  const dm = useColorScheme() === 'dark'
  const navigator = useNavigation()


  React.useEffect(() => {
    DataStore.query(Progress, p => p.and(x => [x.userID.eq(userId), x.date.eq(AWSDate)])).then(p => {
      DataStore.query(User, userId).then((u) => {
        if (u) {
          const ux = u
          if (p.length === 0) {
            const newProgress = new Progress({ sub: sub.toString(), weight: ux.weight, fat: ux.fat, picture: '', date: AWSDate, userID: ux.id })
            DataStore.save(newProgress).then(x => setProgressId(x.id))
          } else {
            setProgressId(p[0].id)
          }
        }
      })
    })
  }, [AWSDate])

  const caloriesFromFoodAndMeals = food.reduce((prev, c) => prev + c.kcal, 0) + meals.reduce((prev, curr) => prev + curr.calories, 0)
  const proteinFromFoodAndMeals = food.reduce((prev, c) => prev + c.protein, 0) + meals.reduce((prev, curr) => prev + curr.protein, 0)
  const carbsFromFoodAndMeals = food.reduce((prev, c) => prev + c.carbs, 0) + meals.reduce((prev, curr) => prev + curr.carbs, 0)

  React.useEffect(() => {
    if (totalCalories) {
      cpRef.current?.animate((caloriesFromFoodAndMeals / totalCalories) * 100, 800)
    }
  }, [caloriesFromFoodAndMeals, totalCalories])

  const cpRef = React.useRef<AnimatedCircularProgress | null>(null)
  const waterRef = React.useRef(new Animated.Value(0))
  const waterGoal = Number(weight * 0.5)

  React.useEffect(() => {
    if (weight) {
      const progress = water > waterGoal ? 1 : water / waterGoal
      Animated.timing(waterRef.current, {
        toValue: progress,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: false
      }).start();

    }
  }, [water, weight])

  const lastRun = runs[runs.length - 1]
  const daysToDisplay = [0, 1, 2, 3, 4, 5, 6].map(x => moment(today).startOf('week').add(x, 'days'))
  return (
    <View style={{ flex: 1 }} includeBackground>
      <SafeAreaView edges={['top']} style={[{ flex: 1 }, tw`h-12/12`]} >
        <View style={tw`px-4`}>
          <View style={tw`flex-row items-center justify-between`}>
            <Text weight='bold' style={tw`text-2xl max-w-9/12`}>Summary</Text>
            {/* @ts-ignore */}
            <TouchableOpacity style={tw`p-3`} onPress={() => navigator.navigate('Calendar')}>
              <ExpoIcon iconName='feather' name='calendar' size={25} color={dm ? 'white' : 'black'} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => {
            //@ts-ignore
            navigator.navigate('Calendar')
          }} style={tw`pb-4 w-12/12`}>
            <Text style={tw``} weight='semibold'>{formattedDate}</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={[tw`px-4 h-12/12`]} showsVerticalScrollIndicator={false}>
          <View style={[tw`flex-row items-center justify-between w-12/12 mb-3`]}>
            {daysToDisplay.map(day => {
              const isSelected = day.isSame(today, 'date')
              let selectedColorTint = '500'
              if (!isSelected) {
                if (!dm) selectedColorTint = '300'
              }
              return <TouchableOpacity key={day.format('LL')}
                onPress={() => setDate(day)}
                style={tw`h-${isSelected ? '30' : '20'} w-12 bg-${isSelected ? 'red' : 'gray'}-${selectedColorTint} rounded-full items-center justify-center`}>
                <Text weight='bold' style={tw`text-lg ${(dm || isSelected) ? 'text-white' : ''}`}>{day.format('DD')}</Text>
                <Text weight='semibold' style={tw`text-xs ${(dm || isSelected) ? 'text-white' : ''}`}>{day.format('dd')}</Text>
              </TouchableOpacity>
            })}
          </View>
          <TouchableOpacity onPress={() => {
            const screen = getMatchingNavigationScreen('SummaryFoodList', navigator)
            //@ts-ignore
            navigator.navigate(screen)
          }} style={tw`bg-${dm ? 'gray-700/40' : 'gray-500/20'} mb-4 p-5 rounded-lg items-center justify-between`}>
            <Text style={tw`text-lg mb-2`} weight='semibold'>Macronutrients</Text>
            <AnimatedCircularProgress
              size={150}
              width={6}
              rotation={270}
              fill={0}
              arcSweepAngle={180}
              style={tw`mt-2 -mb-6`}
              lineCap='round'
              tintColor="#D22B2B"
              backgroundColor={!dm ? '#C0C0C0': '#808080'}
              ref={cpRef}
            >
              {
                (fill) => (
                  <View style={tw`items-center -mt-4`}>
                    <Text style={tw`text-lg`} weight='semibold'>{totalCalories <= caloriesFromFoodAndMeals ? 0 : Math.round(totalCalories - caloriesFromFoodAndMeals).toFixed()}{<Text style={tw`text-xs`} weight='semibold'>kcal</Text>}</Text>
                    <Text>Remaining</Text>
                  </View>
                )
              }
            </AnimatedCircularProgress>
            <View style={[tw`rounded flex-row items-center justify-around w-12/12`]}>
              <View>
                <Text style={tw`text-lg`} weight='bold'>{Math.abs(totalCalories).toFixed()} {<Text style={tw`text-xs`} weight='bold'>kcal</Text>}</Text>
                <Text style={tw`text-gray-500`}>Caloric Goal</Text>
              </View>
              {/* @ts-ignore */}
              <View>
                <Text style={tw`text-lg`} weight='bold'>{Math.round(proteinFromFoodAndMeals)}{<Text style={tw`text-xs`} weight='bold'> g</Text>}</Text>
                <Text style={tw`text-gray-500`}>Protein</Text>
              </View>
              <View>
                <Text style={tw`text-lg`} weight='bold'>{Math.round(carbsFromFoodAndMeals)}{<Text style={tw`text-xs`} weight='bold'> g</Text>}</Text>
                <Text style={tw`text-gray-500`}>Carbs</Text>
              </View>
            </View>
          </TouchableOpacity>

          <View style={tw`w-12/12 max-h-1.5/12 bg-gray-${dm ? '700/40' : '500/20'} px-6 rounded-lg items-center justify-between flex-row my-4`}>
            <View style={tw``}>
              <Text weight='semibold' style={tw`mt-2 text-lg`}>Water Intake</Text>
              <Text style={tw`text-gray-500 text-xs mb-4`}>{water.toFixed()} of {waterGoal.toFixed()} fl oz</Text>
            </View>
            <View style={tw`flex-row items-center`}>
              <AnimatedLottieView progress={waterRef.current} autoPlay={false} style={tw`h-35 -mr-3`} source={drinkWater} />

              <View style={tw`items-center justify-around`}>
                <TouchableOpacity style={tw`px-4 py-2 rounded-lg`} onPress={async () => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  const originalProgress = await DataStore.query(Progress, progressId)
                  if (!originalProgress) return;
                  await DataStore.save(Progress.copyOf(originalProgress, x => {
                    x.water = (x.water || 0) + 10
                  }))
                }}>
                  <Text weight='bold' style={tw`text-lg`}>+</Text>
                </TouchableOpacity>
                <TouchableOpacity style={tw`px-4 py-2 rounded-lg`} onPress={async () => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  const originalProgress = await DataStore.query(Progress, progressId)
                  if (!originalProgress) return;
                  await DataStore.save(Progress.copyOf(originalProgress, x => {
                    if (x.water && x.water > 9)
                      x.water = (x.water || 0) - 10
                  }))
                }}>
                  <Text weight='bold' style={tw`text-gray-500 text-lg`}>-</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <TouchableOpacity onPress={() => {
            navigator.navigate('PersonalInformation')
          }} style={tw`w-12/12 bg-gray-${dm ? '700/40' : '500/20'} rounded-lg p-4 mt-4 mb-6`}>
            <Text style={tw`text-lg text-center`} weight='semibold'>Personal Information</Text>
            <View style={tw`mt-4 flex-row items-center justify-around`}>
              <View>
              <Text style={tw`text-xs text-gray-500`}>Weight</Text>
              <Text style={tw`text-lg`} weight='semibold'>{weight} {<Text style={tw`text-red-500 text-sm`}>lbs</Text>}</Text>
              </View>
              <View style={[tw`h-15 bg-gray-${dm ? '600' : '400'}`, { width: 1 }]} />
              <View>
              <Text style={tw`text-xs text-gray-500`}>Body Fat</Text>
              <Text style={tw`text-lg`} weight='semibold'>{fat} {<Text style={tw`text-red-500 text-sm`}>%</Text>}</Text>
              </View>
              <View style={[tw`h-15 bg-gray-${dm ? '600' : '400'}`, { width: 1 }]} />
              <View style={tw`bg-transparent`}>
              <Text style={tw`text-xs text-gray-500`}>Goal</Text>
              <Text style={tw`text-lg text-center`} weight='semibold'>{goal.toString()}</Text>
              </View>
            </View>
          </TouchableOpacity>
          <View style={tw`flex-row items-center justify-between w-12/12 mt-2`}>
            <Text style={tw`text-lg`} weight='semibold'>Latest {lastRun?.runType || 'Run'} Activity</Text>
            <TouchableOpacity style={tw`p-3`} onPress={() => {
              //@ts-ignore
              navigator.navigate('Run', { progressId: progressId })
            }}>
              <Text style={tw`text-red-500`} weight='semibold'>Start a Run</Text>
            </TouchableOpacity>
          </View>
          {runs.length === 0 && <Text style={tw`text-center my-6`}>No runs to display</Text>}
          {lastRun && <RunListComponent run={lastRun} onPress={() => {
            const screen = getMatchingNavigationScreen('ListRun', navigator)
            //@ts-ignore
            navigator.navigate(screen)
          }} />}
          <View style={tw`flex-row items-center justify-between w-12/12 mt-6`}>
            <Text style={tw`text-lg`} weight='semibold'>Workouts</Text>
            <TouchableOpacity style={tw`p-3`} onPress={() => {
              const screen = getMatchingNavigationScreen('ListWorkout', navigator)
              //@ts-ignore
              navigator.navigate(screen, { progressId: progressId })
            }}>
              <Text style={tw`text-red-500`} weight='semibold'>Search Workouts</Text>
            </TouchableOpacity>
          </View>
          {workouts.length === 0 && <Text style={tw`text-center my-6`}>There are no workouts to display</Text>}
          {workouts.map((w, i) => {
            return <TouchableOpacity
              onPress={() => {
                navigator.navigate('WorkoutPlay', { id: w.id })
              }}
              key={`workout ${w.id} at i ${i}`} style={tw`w-12/12 flex-row items-center p-4 mb-2 items-center ${dm ? 'bg-gray-700' : 'border border-black'} rounded-xl`}>
              <Image source={{ uri: w.picture }} style={{ width: 60, height: 60, borderRadius: 10 }} />
              <View style={tw`ml-2`}>
                <Text style={tw``}>{w.name}</Text>
                <Text style={tw`text-gray-400`}>by {<Text style={tw`text-red-500`}>{w.author}</Text>}</Text>
              </View>
            </TouchableOpacity>
          })}
          <View style={tw`pb-10`} />
          <ThisAdHelpsKeepFree />
          <View style={tw`pb-40`} />
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}
