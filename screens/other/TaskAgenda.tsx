import { BackButton } from '../../components/base/BackButton'
import { View, Text } from '../../components/base/Themed'
import React, { useState } from 'react'
import tw from 'twrnc'
import { useDispatch, useSelector } from '../../redux/store'
import { XStack, YStack } from 'tamagui'
import moment from 'moment'
import Spacer from '../../components/base/Spacer'
import { ScrollView, useColorScheme } from 'react-native'
import { TAgendaTask } from '../../redux/reducers/progress'
import { titleCase } from '../../data'
import { Checkbox, Timeline } from 'react-native-ui-lib'
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler'
import { deleteTaskProgress, saveTaskProgress } from '../../redux/api/progress'
import { _tokens } from '../../tamagui.config'
import { ExpoIcon } from '../../components/base/ExpoIcon'
import ManageButton from '../../components/features/ManageButton'
import Selector, { HideView } from '../../components/base/Selector'
type TaskType = 'meal' | 'workout' | 'run' | undefined

export default function TaskAgenda() {
  let { tasks, today } = useSelector(x => x.progress)
  let dispatch = useDispatch()
  let _today = moment(today?.date)
  let h = moment().hour()
  let dm = useColorScheme() === 'dark'
  let [selectedOption, setSelectedOption] = useState('Timeline')
  return (
    <View includeBackground style={{ flex: 1 }}>
      <BackButton name="Today's Tasks"
      // Right={() => {
      //   return <TouchableOpacity style={tw`mr-2 p-1`}>
      //     <ExpoIcon name='edit' iconName='feather' size={20} color={dm ? 'white' : 'black'} />
      //   </TouchableOpacity>
      // }} 
      />
      <View>
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
            return <Timeline key={x} point={{ type: isNow ? Timeline.pointTypes.BULLET : Timeline.pointTypes.CIRCLE, color: _tokens.primary900 }} bottomLine={{ type: Timeline.lineTypes.DASHED, color: _tokens.secondary900 }} topLine={{ type: Timeline.lineTypes.DASHED, color: _tokens.secondary900 }}>
              <YStack>
                <Text style={tw`${!isNow ? "text-gray-500" : ''}`} weight={isNow ? 'black' : 'semibold'}>{hour}</Text>
                <Spacer sm />
                
              </YStack>
            </Timeline>
          }} data={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]} style={tw`-mx-3 max-h-10/12`} />
        </HideView>
        <HideView hidden={selectedOption !== 'All Tasks'}>
          <ManageButton viewStyle={tw`px-2`} buttonText='Edit' title={`${tasks.length} Total Tasks`} />
          <ScrollView style={{ paddingBottom: 20, ...tw`px-2` }}>
            {tasks.map(x => {
              let taskType: TaskType = x.workout ? 'workout' : (x.meal ? 'meal' : x.run ? 'run' : undefined)
              return <TaskItem taskType={taskType} task={x} completed={x.progress ? true : false} key={x.id} onTap={() => {
                if (!today) return;
                if (!x.progress) {
                  dispatch(saveTaskProgress({ today: today, task_progress: { task_id: x.id } }))
                } else {
                  console.log('deleting progress')
                  dispatch(deleteTaskProgress(x.progress))
                }
              }} />
            })}
          </ScrollView>
        </HideView>
      </View>
    </View>
  )
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