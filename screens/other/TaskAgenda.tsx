import { BackButton } from '../../components/base/BackButton'
import { View, Text } from '../../components/base/Themed'
import React from 'react'
import tw from 'twrnc'
import { useDispatch, useSelector } from '../../redux/store'
import { XStack, YStack } from 'tamagui'
import moment from 'moment'
import Spacer from '../../components/base/Spacer'
import { ScrollView, useColorScheme } from 'react-native'
import { TAgendaTask } from '../../redux/reducers/progress'
import { titleCase } from '../../data'
import { Checkbox } from 'react-native-ui-lib'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { deleteTaskProgress, saveTaskProgress } from '../../redux/api/progress'
type TaskType = 'meal' | 'workout' | 'run' | undefined

export default function TaskAgenda() {
  let {tasks, today} = useSelector(x => x.progress)
  let dispatch = useDispatch()
  let _today = moment(today?.date)
  console.log(tasks)
  return (
    <View includeBackground style={{flex: 1}}>
        <BackButton name="Today's Tasks" />
      <View style={tw`px-4`}>
        <Spacer />
        <XStack justifyContent='space-between' alignItems='center'>
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
        <Spacer lg/>
        <Text lg weight='semibold'>{tasks.length} Total Tasks</Text>
        <Spacer />
        <ScrollView style={{paddingBottom: 20}}>
          {tasks.map(x => {
            let taskType: TaskType = x.workout ? 'workout' : (x.meal ? 'meal' : x.run ? 'run' : undefined)
            return <TaskItem taskType={taskType} task={x} completed={x.progress ? true : false} key={x.id} onTap={() => {
              if (!today) return;
              if (!x.progress) {
                dispatch(saveTaskProgress({today: today, task_progress: {task_id: x.id }}))
              } else {
                console.log('deleting progress')
                dispatch(deleteTaskProgress(x.progress))
              }
            }} />
          })}
        </ScrollView>
      </View>
    </View>
  )
}

export const TaskItem = (props: {task: TAgendaTask, taskType: TaskType, completed?: boolean, onTap: (task: TAgendaTask) => void;}) => {
  let {task, taskType} = props;
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