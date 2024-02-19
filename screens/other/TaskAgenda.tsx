import { BackButton } from '../../components/base/BackButton'
import { View, Text } from '../../components/base/Themed'
import React, { useMemo, useState } from 'react'
import tw from 'twrnc'
import { useDispatch, useSelector } from '../../redux/store'
import { XStack, YStack } from 'tamagui'
import moment from 'moment'
import Spacer from '../../components/base/Spacer'
import { Pressable, ScrollView, useColorScheme } from 'react-native'
import { TAgendaTask, TFoodProgress, TMealProgress, TWorkoutPlay } from '../../redux/reducers/progress'
import { defaultImage, getMatchingNavigationScreen, titleCase } from '../../data'
import { Checkbox, Timeline } from 'react-native-ui-lib'
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler'
import { deleteTaskProgress, saveTaskProgress } from '../../redux/api/progress'
import { _tokens } from '../../tamagui.config'
import ManageButton from '../../components/features/ManageButton'
import Selector, { HideView } from '../../components/base/Selector'
import SaveButton from '../../components/base/SaveButton'
import { useGet } from '../../hooks/useGet'
import { Tables } from '../../supabase/dao'
import { useNavigation } from '@react-navigation/native'
import SupabaseImage from '../../components/base/SupabaseImage'
import { ExpoIcon } from '../../components/base/ExpoIcon'
import { getEmojiByCategory } from '../../types/FoodApi'
import ThisAdHelpsKeepFree from '../../components/features/ThisAdHelpsKeepFree'
import { ProgressDao } from '../../types/ProgressDao'
import { PlanDao } from '../../types/PlanDao'
type TaskType = 'meal' | 'workout' | 'run' | undefined
let HOURS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
let defaultObj = {food: [] as TFoodProgress[], meal: [] as TMealProgress[], run: [] as Tables['run_progress']['Row'][], workouts: [] as TWorkoutPlay[]}



export default function TaskAgenda() {
  let { tasks, today, foodProgress, runProgress, workoutProgress, mealProgress } = useSelector(x => x.progress)
  let dao = PlanDao()
  let tasksGroupedByTime = useMemo(() => {
    let res: {[k: number]: typeof defaultObj} = {}
    let appendToRes = <K extends keyof typeof defaultObj, V extends typeof defaultObj[K][number]>(type: keyof typeof defaultObj, f: V) => {
      let h = moment(f.created_at).hour()
      if (res[h] === undefined) {
        res[h] = {food: [], meal: [], workouts: [], run: []}
      }  //@ts-ignore
      res[h][type].push(f)
      
    }
    for (var f of foodProgress) {
      appendToRes('food', f)
    }
    for (var m of mealProgress) {
      appendToRes('meal', m)
    }
    for (var run of runProgress) {
      appendToRes('run', run)
    }
    for (var workout of workoutProgress) {
      appendToRes('workouts', workout)
    }
    return res;
  }, [foodProgress, runProgress, workoutProgress, mealProgress])
  let dispatch = useDispatch()
  let g = useGet()
  let _today = moment(today?.date)
  let h = moment().hour()
  let [selectedOption, setSelectedOption] = useState('Timeline')
  console.log(tasks)

  return (
    <View includeBackground style={{ flex: 1 }}>
      <BackButton name="Today's Tasks"/>
        <Spacer />
        <XStack px='$2' justifyContent='space-between' alignItems='center'>
          <XStack alignItems='center'>
            <Text h2 weight='bold'>{_today.get('D')}</Text>
            <Spacer horizontal />
            <YStack>
              <Text h5 weight='bold'>{_today.format('MMMM')}</Text>
              <Text style={tw`text-gray-500`}>{_today.get('year')}</Text>
            </YStack>
          </XStack>
          <Text xl weight='semibold'>{_today.format('dddd')}</Text>
        </XStack>
        <Spacer />
        <Selector searchOptions={['Timeline', 'All Tasks']} selectedOption={selectedOption} onPress={setSelectedOption} />
        <Spacer />
        <HideView hidden={selectedOption !== 'Timeline'}>
          <FlatList showsVerticalScrollIndicator renderItem={({ item: x, index }) => {
            let hour = moment().hour(x).format('h A')
            let isNow = x === h
            return <TimelineItem hour={hour} isNow={isNow} data={tasksGroupedByTime[x] || undefined} />
          }} data={HOURS} style={tw`-mx-3 max-h-10/12`} />
          {/* <ThisAdHelpsKeepFree /> */}
        </HideView>
        <HideView hidden={selectedOption !== 'All Tasks'}>
          <Spacer sm />
          <ManageButton viewStyle={tw`px-2`} buttonText=' ' title={`${tasks.length} Total Tasks`} />
          <ScrollView style={{ paddingBottom: 20, ...tw`px-2`}}>
            {tasks.map(x => {
              let taskType: TaskType = x.workout ? 'workout' : (x.meal ? 'meal' : x.run ? 'run' : undefined)
              return <TaskItem taskType={taskType} task={x} completed={x.progress ? true : false} key={x.id} onTap={() => {
                if (!today) return;
                if (!x.progress) {
                  dispatch(saveTaskProgress({ today: today, task_progress: { task_id: x.id } }))
                } else {
                  dispatch(deleteTaskProgress(x.progress))
                }
              }} />
            })}
          </ScrollView>
        </HideView>
      {selectedOption === 'All Tasks' && <SaveButton title='Add Task' safeArea />}
    </View>
  )
}


const TimelineItem = (props: {
  hour: string; isNow: boolean; data: typeof defaultObj | undefined;
}) => {
  let {hour, isNow, data} = props;
  let sortedTime = useMemo(() => {
    if (!data) return null
    let res = [...data.food, ...data.meal, ...data.workouts, ...data.run].sort((prev, curr) => moment(prev.created_at).diff(curr.created_at))
    return res;
  }, [data])
  let n = useNavigation()
  return <Timeline point={{ type: isNow ? Timeline.pointTypes.BULLET : Timeline.pointTypes.CIRCLE, color: _tokens.primary900 }} bottomLine={{ type: Timeline.lineTypes.DASHED, color: _tokens.secondary900 }} topLine={{ type: Timeline.lineTypes.DASHED, color: _tokens.secondary900 }}>
  <YStack>
    <Text style={tw`${!isNow ? "text-gray-500" : ''}`} weight={isNow ? 'black' : 'semibold'}>{hour}</Text>
    <Spacer sm />
    {(sortedTime && sortedTime.length > 0) && <YStack backgroundColor={_tokens.dark1} borderRadius={'$2'} px='$2' pt='$2'>
    {sortedTime.map((x, i) => {
          let [name, image, category, type, props, screen] = ['', '', '', '', {}, '' as string | undefined | null];
          //@ts-ignore
          if (x.otherNutrition) { //@ts-ignore
            name = x.name; props={progress_id: x.id}; category = x.category; 
            type = 'Food'
            screen = getMatchingNavigationScreen('FoodDetail', n)
            //@ts-ignore
          } else if (x.meal) { //@ts-ignore
            name = x.meal.name; props={id: x.meal.id, idFromProgress: x.id}; image=x.meal.preview || defaultImage;
            //@ts-ignore
            type = 'Meal'
            screen = getMatchingNavigationScreen('MealDetail', n);
            //@ts-ignore
          } else if (x.workout) { //@ts-ignore
            name = x.workout.name; props={id:x.workout.id}; image=x.workout.image || defaultImage;
            type = 'Workout'
            screen = getMatchingNavigationScreen('WorkoutDetail', n)
          } else { //@ts-ignore
          }
          if (!name) return <View key={`Hour-${hour}-${i}`}/>
        return <Pressable key={`Hour-${hour}-${i}`} onPress={() => {
          if (screen) {
            //@ts-ignore
            n.navigate(screen, props ? {...props} : {} )
          }
        }}>
          <XStack alignItems='center' justifyContent='space-between' mb='$2'>
         <XStack>
         {image && <SupabaseImage uri={image} style={{height: 30, width: 30, borderRadius: 15}} />}
         {category && <Text h3>{getEmojiByCategory(category)}</Text>}
          <Spacer horizontal sm />
            <YStack>
            <Text lg weight='bold'>{name}</Text>
            <Text style={tw`text-gray-500`}>{type}</Text>
            </YStack>
         </XStack>
         {screen && <ExpoIcon name='chevron-right' iconName='feather' color='gray' size={20} />}
        </XStack>
        </Pressable>
      })}
    </YStack>}
  </YStack>
</Timeline>
}

export const TaskItem = (props: { task: TAgendaTask, taskType: TaskType, completed?: boolean, onTap: (task: TAgendaTask) => void; }) => {
  let { task, taskType } = props;
  let completed = props.completed
  let title = titleCase(taskType || 'task')
  let name = task.workout ? task.workout.name : (task.meal ? task.meal.name : task.run ? 'Run' : (task.name || 'Task'))
  let id = task.workout ? task.workout.id : (task.meal ? task.meal.id : undefined)
  let dm = useColorScheme() === 'dark'
  return <TouchableOpacity onPress={() => {
    props.onTap && props.onTap(task)
  }}>
    <XStack marginVertical='$1' paddingVertical='$2' justifyContent='space-between' alignItems='center'>
      <YStack>
        <Text lg weight='bold' style={tw`${completed ? 'line-through ' + (dm ? 'text-gray-700' : 'text-gray-400') : ''}`}>{name} </Text>
        <Text sm style={tw`text-gray-500`}>{title}</Text>
      </YStack>
      <Checkbox value={completed} style={tw`${completed ? '' : "border-gray-500"}`} borderRadius={100} />
    </XStack>
  </TouchableOpacity>
}