import { View, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native'
import React from 'react'
import { Text } from '../../components/Themed'
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


export const SummaryScreen = () => {

  const dateContext = useDateContext()
  const { sub, userId, progressId, setProgressId } = useCommonAWSIds()
  const { formattedDate, AWSDate } = { formattedDate: dateContext.formattedDate, AWSDate: dateContext.AWSDate }
  const { food, meals, workouts, fat, weight, goal, water, runs } = useProgressValues({ foodAndMeals: true, activitiesAndWorkouts: true, metrics: true })
  const totalCalories = getTdee(goal, weight, fat)
  const dm = useColorScheme() === 'dark'
  const navigator = useNavigation()



  React.useEffect(() => {
    DataStore.query(Progress, p => p.and(x => [x.sub.eq(sub), x.date.eq(AWSDate)])).then(p => {
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
  const waterRef = React.useRef<AnimatedCircularProgress | null>(null)

  React.useEffect(() => {
    if (weight) {
      const waterUserShouldHave = weight * 0.5
      waterRef.current?.animate((water / waterUserShouldHave) * 100, 800)
    }
  }, [water, weight])

  const lastRun = runs[runs.length - 1]
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView edges={['top']} style={[{ flex: 1 }, tw`h-12/12`]} >
        <View style={tw`px-4`}>
          <View style={tw`flex-row items-center justify-between`}>
            <Text weight='bold' style={tw`text-2xl max-w-9/12`}>Daily Summary</Text>
            {/* @ts-ignore */}
            <TouchableOpacity style={tw`p-3`} onPress={() => navigator.navigate('Calendar')}>
              <ExpoIcon iconName='feather' name='calendar' size={30} color={dm ? 'white' : 'black'} />
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
          <TouchableOpacity onPress={() => {
            const screen = getMatchingNavigationScreen('SummaryFoodList', navigator)
            //@ts-ignore
            navigator.navigate(screen)
          }} style={tw`bg-gray-${dm ? '700/40' : '200'} mb-4 p-5 rounded-lg flex-row items-center justify-between`}>
            <AnimatedCircularProgress
              size={150}
              width={6}
              rotation={320}
              fill={0}
              style={tw`mt-2 mb-4`}
              lineCap='round'
              tintColor="#D22B2B"
              backgroundColor={!dm ? '#50C878' : '#097969'}
              ref={cpRef}
            >
              {
                (fill) => (
                  <View style={tw`items-center`}>
                    <Text style={tw`text-lg`} weight='semibold'>{totalCalories <= caloriesFromFoodAndMeals ? 0 : Math.round(totalCalories - caloriesFromFoodAndMeals).toFixed()}{<Text style={tw`text-xs`} weight='semibold'>kcal</Text>}</Text>
                    <Text>Remaining</Text>
                  </View>
                )
              }
            </AnimatedCircularProgress>
            <View style={[tw`pr-9 rounded justify-center`]}>
              <Text style={tw`text-lg`} weight='bold'>{Math.abs(totalCalories - caloriesFromFoodAndMeals).toFixed()} {<Text style={tw`text-xs`} weight='bold'>kcal</Text>}</Text>
              <Text style={tw`text-gray-500`}>Caloric {Math.round(totalCalories) > Math.round(caloriesFromFoodAndMeals) ? 'Deficit' : totalCalories === caloriesFromFoodAndMeals ? 'Maintenance' : 'Surplus'}</Text>
              {/* @ts-ignore */}
              <Text style={tw`text-lg mt-4`} weight='bold'>{Math.round(proteinFromFoodAndMeals)}{<Text style={tw`text-xs`} weight='bold'> g</Text>}</Text>
              <Text style={tw`text-gray-500`}>Protein</Text>
              <Text style={tw`text-lg mt-4`} weight='bold'>{Math.round(carbsFromFoodAndMeals)}{<Text style={tw`text-xs`} weight='bold'> g</Text>}</Text>
              <Text style={tw`text-gray-500`}>Carbs</Text>
            </View>
          </TouchableOpacity>

          <Text style={tw`text-xl mb-2`} weight='semibold'>Metrics</Text>
          <View style={tw`flex-row items-center`}>
            <View style={tw`w-6.5/12 h-12/12 bg-gray-${dm ? '700/40' : '200'} p-5 rounded-lg items-center`}>
              <Text weight='semibold'>{<ExpoIcon name='droplet' iconName='feather' size={20} color='#0096FF' />}  Water Intake</Text>
              <AnimatedCircularProgress
                size={120}
                width={6}
                rotation={360}
                fill={0}
                style={tw`mt-2 mb-4`}
                lineCap='round'
                tintColor="#0096FF"
                backgroundColor={'#888888'}
                ref={waterRef}
              >
                {
                  (fill) => (
                    <View style={tw`items-center`}>
                      <View style={tw`flex-row items-center`}>
                        <Text style={tw`text-lg`} weight='semibold'>{water}</Text>
                      </View>
                      <Text>of {Number(weight * 0.5).toFixed()} fl oz</Text>
                    </View>
                  )
                }
              </AnimatedCircularProgress>
              <View style={tw`flex-row items-center justify-around w-12/12`}>

                <TouchableOpacity style={tw`bg-gray-${dm ? '600' : '400'} px-4 py-2 rounded-lg`} onPress={async () => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  const originalProgress = await DataStore.query(Progress, progressId)
                  if (!originalProgress) return;
                  await DataStore.save(Progress.copyOf(originalProgress, x => {
                    if (x.water && x.water > 9)
                      x.water = (x.water || 0) - 10
                  }))
                }}>
                  <Text>-</Text>
                </TouchableOpacity>

                <TouchableOpacity style={tw`bg-blue-400 px-4 py-2 rounded-lg`} onPress={async () => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  const originalProgress = await DataStore.query(Progress, progressId)
                  if (!originalProgress) return;
                  await DataStore.save(Progress.copyOf(originalProgress, x => {
                    x.water = (x.water || 0) + 10
                  }))
                }}>
                  <Text>+</Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity onPress={() => {
              navigator.navigate('PersonalInformation')
            }} style={tw`w-5/12 ml-4 h-12/12 bg-gray-${dm ? '700/40' : '200'} rounded-lg p-4`}>
              <Text style={tw``} weight='semibold'>{<ExpoIcon name='archive' iconName='feather' size={20} color='gray' />} Personal Info</Text>
              <View style={tw`mt-4`}>
                <View style={tw`items-center justify-center items-center`}>
                  <Text style={tw`text-3xl text-center mb-2`} weight='semibold'>{weight} {<Text style={tw`text-red-500 text-sm`}>lbs</Text>}</Text>
                  <Text style={tw`text-3xl mb-2`} weight='semibold'>{fat} {<Text style={tw`text-red-500 text-sm`}>%</Text>}</Text>
                  <Text style={tw`text-3xl`} weight='semibold'>Goal</Text>
                  <Text style={tw`text-red-500 text-sm`}>{goal.toString()}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
          <View style={tw`flex-row flex-wrap justify-between w-12/12 mb-6`}>

            
          </View>
          <Text style={tw`text-lg mt-2`}>Latest {lastRun?.runType || 'Run'} Activity</Text>
          {runs.length === 0 && <Text style={tw`text-center mt-4`}>No runs to display</Text>}
          {lastRun && <RunListComponent run={lastRun} onPress={() => {
            const screen = getMatchingNavigationScreen('ListRun', navigator)
            //@ts-ignore
            navigator.navigate(screen)
          }} />}
          <Text style={tw`text-lg mt-4`}>Workouts</Text>
          {workouts.length === 0 && <Text style={tw`text-center py-4`}>There are no workouts to display</Text>}
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
          <View style={tw`pb-40`} />
        </ScrollView>
        <FloatingActionButton options={[
          {
            name: 'Add Food', icon: () => (<Text style={{ fontSize: 15 }}>🍎</Text>), onPress: () => {
              //@ts-ignore
              navigator.navigate('SListFood', { progressId: progressId })
            }
          },
          {
            name: 'Add Meal', icon: () => (<Text style={{ fontSize: 15 }}>🍽</Text>), onPress: () => {
              //@ts-ignore
              navigator.navigate('SListMeals', { progressId: progressId })
            }
          },
          {
            name: 'Search Workouts', icon: () => (<Text style={{ fontSize: 15 }}>🏋️‍♀️</Text>), onPress: () => {
              //@ts-ignore
              navigator.navigate('SListWorkout', { progressId: progressId })
            }
          },
          {
            name: 'Start a Run', icon: () => (<Text style={{ fontSize: 15 }}>👟</Text>), onPress: () => {
              //@ts-ignore
              navigator.navigate('Run', { progressId: progressId })
            }
          },
        ]}
          initialIcon={'plus'}
          openIcon={() => {
            return <ExpoIcon name='close' iconName='ion' color='white' size={23} />
          }} />
      </SafeAreaView>
    </View>
  )
}
