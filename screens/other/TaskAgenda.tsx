import { BackButton } from '../../components/base/BackButton'
import { View, Text } from '../../components/base/Themed'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import tw from 'twrnc'
import { useDispatch, useSelector } from '../../redux/store'
import { XStack, YStack } from 'tamagui'
import moment from 'moment'
import Spacer from '../../components/base/Spacer'
import { Platform, Pressable, ScrollView, useColorScheme } from 'react-native'
import { TAgendaTask, TFoodProgress, TMealProgress, TWorkoutPlay } from '../../redux/reducers/progress'
import { defaultImage, getMatchingNavigationScreen, titleCase, validate } from '../../data'
import { ActionSheet, Checkbox, Timeline } from 'react-native-ui-lib'
import { FlatList, Swipeable, TextInput, TouchableOpacity } from 'react-native-gesture-handler'
import { deleteTaskProgress, fetchTodaysTasks, saveTaskProgress } from '../../redux/api/progress'
import { _tokens } from '../../tamagui.config'
import Selector, { HideView } from '../../components/base/Selector'
import SaveButton from '../../components/base/SaveButton'
import { useGet } from '../../hooks/useGet'
import { Tables } from '../../supabase/dao'
import { useIsFocused, useNavigation } from '@react-navigation/native'
import SupabaseImage from '../../components/base/SupabaseImage'
import { ExpoIcon } from '../../components/base/ExpoIcon'
import { getEmojiByCategory } from '../../types/FoodApi'
import { PlanDao, TAgendaTaskAppended, agendaTaskToAppended, def, isTaskCompleted } from '../../types/PlanDao'
import Overlay, { TRefOverlay } from '../../components/screens/Overlay'
import Button from '../../components/base/Button'
import Description from '../../components/base/Description'
import { getTwentyFourHourTime, Picker, timeStringToMoment } from '../../components/inputs/Picker'
import SwipeWithDelete, { TSwipeableWithDeleteRef } from '../../components/base/SwipeWithDelete'
import { useMultiPartForm } from '../../redux/api/mpf'
// @ts-ignore 
import { v4 } from 'uuid';
import useOnLeaveScreen from '../../hooks/useOnLeaveScreen'

type TaskType = 'meal' | 'workout' | 'run' | 'task' | undefined
let HOURS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
let defaultObj = { food: [] as TFoodProgress[], meal: [] as TMealProgress[], run: [] as Tables['run_progress']['Row'][], workouts: [] as TWorkoutPlay[], tasks: [] as TaskAgenda[] }


export default function TaskAgenda() {
  let { tasks, today, foodProgress, runProgress, workoutProgress, mealProgress } = useSelector(x => x.progress)
  let { profile } = useSelector(x => x.auth)
  let dao = PlanDao();
  let ref = useRef<TRefOverlay | null>(null);
  let isfocused = useIsFocused();
  const minimizeSheet = () => {
    setShowAddRelate(false)
    ref?.current?.snapTo(0, true);
    // ref.current?.disable(false);
  }
  let todaysTasks = useMemo(() => {
    return tasks.filter(x => taskIncludesToday(x, today?.date || moment().format()))
  }, [tasks, today])

  let tasksGroupedByTime = useMemo(() => {
    let res: { [k: number]: typeof defaultObj } = {}
    let appendToRes = <K extends keyof typeof defaultObj, V extends typeof defaultObj[K][number]>(type: keyof typeof defaultObj, f: V, key='created_at') => {
      let h = -1
      if (key === 'created_at') h = moment(f[key]).hour()
      if (key === 'start_time') {
        let r = getTwentyFourHourTime(f[key])
        if (r.hour) h = r.hour
      }
      if (h === -1) return;
      if (res[h] === undefined) {
        res[h] = { food: [], meal: [], workouts: [], run: [], tasks: [] }
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
    for (var task of todaysTasks) {
      appendToRes('tasks', task, 'start_time')
    }
    return res;
  }, [foodProgress, runProgress, workoutProgress, mealProgress, todaysTasks])
  let dispatch = useDispatch()
  let g = useGet()
  let _today = moment(today?.date)
  let h = moment().hour()
  let n = useNavigation()
  let [selectedOption, setSelectedOption] = useState('Timeline')
  let [selectedTask, setSelectedTask] = useState<null | TAgendaTask>(null)
  const [newTask, _setNewTask] = useState<null | TAgendaTaskAppended>(null)
  let setNewTask = <K extends keyof TAgendaTaskAppended>(k: K, v: TAgendaTaskAppended[K]) => {
    _setNewTask(p => (p ? { ...p, [k]: v } : null))
  }
  let updateTask = <U extends Partial<TAgendaTaskAppended>>(update: U) => {
    _setNewTask(p => (p ? { ...p, ...update } : null))
  }
  let uuid = useMemo(() => (v4()), [newTask])
  let mpf = useMultiPartForm('tasks', uuid)
  let staged_update = mpf?.data

  useOnLeaveScreen(() => {
    mpf.remove()
  })

  useEffect(() => {
    if (staged_update && newTask) {
      if (staged_update.meal) {
        //@ts-ignore
        _setNewTask(p => (p ? { ...p, type: 'Meal', screen: 'MealDetail', child_id: staged_update.meal?.id, related: staged_update.meal?.name, meal: staged_update.meal, meal_id: staged_update.meal?.id } : null))
      } else if (staged_update.workout) {
        //@ts-ignore
        _setNewTask(p => (p ? { ...p, type: 'Workout', screen: 'WorkoutDetail', child_id: staged_update.workout?.id, related: staged_update.workout?.name, workout: staged_update.workout, workout_id: staged_update.workout?.id } : null))
      }
      mpf.remove()
    }
  }, [staged_update])


  //@ts-ignore
  let selectedTaskDetails: TAgendaTaskAppended = useMemo(() => {
    if (newTask) return newTask;
    if (!selectedTask) return def
    //TODO: Allow description field on task 
    //@ts-ignore
    return agendaTaskToAppended(selectedTask)
  }, [selectedTask, newTask])

  let disabled = !newTask;
  let [showAddRelate, setShowAddRelate] = useState(false)

  const completeTask = (t: TAgendaTask) => {
    if (!today) return;
    if (!isTaskCompleted(t)) {
      dispatch(saveTaskProgress({ today: today, task_progress: { task_id: t.id } }))
    } else {
      let _p = t.progress
      if (Array.isArray(t.progress)) {
        _p = t.progress[0]
      }
      dispatch(deleteTaskProgress(_p))
    }
    if (selectedTask) { setSelectedTask(null) }
  }


  const saveTask = async () => {
    if (newTask) {
      let r = validate([
        { name: 'Task Name', value: newTask.name, options: { required: true } },
      ])
      if (Array.isArray(r) && r[0]) {
        g.set('error', r[0])
        return;
      }
      try {
        g.set('loading', true)
        console.log('new task', newTask)
        let res = await dao.createOrUpdatePlan({ ...newTask, user_id: profile?.id || null })
        console.log('res', res)
        if (res) {
          _setNewTask(null);
          setSelectedTask(null)
          if (today) {
            dispatch(fetchTodaysTasks(today))
          }
        }
      } catch (error) { // @ts-ignore
        g.set('error', error?.toString())
      } finally {
        g.setFn(p => ({ ...p, loading: false }))
      }

    }
  }


  return (
    <View includeBackground style={{ flex: 1 }}>
      <BackButton name="Today's Tasks" />
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
      <Selector searchOptions={['Timeline', 'Today', 'All Tasks']} selectedOption={selectedOption} onPress={setSelectedOption} />
      <Spacer />
      <HideView hidden={selectedOption !== 'Timeline'}>
        <FlatList showsVerticalScrollIndicator renderItem={({ item: x, index }) => {
          let hour = moment().hour(x).format('h A')
          let isNow = x === h
          return <TimelineItem hour={hour} isNow={isNow} data={tasksGroupedByTime[x] || undefined} />
        }} data={HOURS} style={tw`-mx-3 max-h-10/12`} />
        {/* <ThisAdHelpsKeepFree /> */}
      </HideView>
      <HideView style={{ flex: 1 }} hidden={selectedOption !== 'Today'}>
        <Spacer sm />
        <ScrollView style={{ paddingBottom: 20, ...tw`px-2` }}>
          <ManageButton title='Rage Tasks' buttonText=' ' />
          <TaskBody taskType='task' name="Progress Pictures" completed={(today?.back || today?.left || today?.right || today?.front) ? true : false} onTap={() => n.navigate('ProgressPicture')} description='• All Day'  />
          <TaskBody taskType='task' name={"Log weight"} completed={today?.weight ? true : false} onTap={() => n.navigate('SummaryMetric', {weight: true})} description='• All Day'  />
          <TaskBody taskType='task' name="Log body fat %" completed={today?.fat ? true : false} description='• All Day' onTap={() => n.navigate('SummaryMetric', {weight: false})}  />
          <Spacer divider sm />
          <Spacer  />
          {/* TODO: Navigate to details  */}
          <ManageButton title='Your Tasks' hidden />
          {todaysTasks.length === 0 && <Text gray weight='bold' style={tw`text-center mt-6`}>No tasks for today</Text>}
          {todaysTasks.map(x => {
            let taskType: TaskType = x.workout ? 'workout' : (x.meal ? 'meal' : x.run ? 'run' : undefined)
            return <TaskItem onDelete={async () => {
              g.set('loading', true)
              try {
                await dao.remove('agenda_task', x.id)
                if (today) {
                  dispatch(fetchTodaysTasks(today))
                }
              } catch (error) {
                g.set('error', error?.toString())
              } finally {
                g.set('loading', false)
              }
            }} taskType={taskType} task={x} onDetailsPress={(t) => {
              setSelectedTask(t)
            }} completed={isTaskCompleted(x)} key={x.id} onTap={() => completeTask(x)} />
          })}
        </ScrollView>
      </HideView>
      <HideView style={{flex: 1}} hidden={selectedOption !== 'All Tasks'}>
        <Spacer sm/>
        <ScrollView>
        {tasks.map(x => {
            let taskType: TaskType = x.workout ? 'workout' : (x.meal ? 'meal' : x.run ? 'run' : undefined)
            return <TaskItem discludeCheckbox taskType={taskType} task={x} onTap={(t) => {
              setSelectedTask(t)
            }} key={x.id} />
          })}
        </ScrollView>
      </HideView>
      <Overlay id='task_new_task'
        dialogueHeight={'70'}
        ignoreBackdrop
        disableClose={(!isfocused) ? true : false}
        snapPoints={!isfocused ? ['10%', '70%'] : undefined}
        ref={ref}
        visible={(selectedTask || newTask) ? true : false}
        onDismiss={() => {
          setSelectedTask(null)
          _setNewTask(null)
        }}>
        <TextInput onChangeText={v => setNewTask('name', v)} editable={newTask ? true : false} value={selectedTaskDetails.name} style={{ ...tw`text-${g.dm ? 'white' : 'black'}`, fontFamily: g.fontBold, fontSize: 24 }} placeholder='Task Name' />
        <Spacer sm />
        {selectedTaskDetails.fitness_plan && <TouchableOpacity onPress={() => {
          let s = getMatchingNavigationScreen('FitnessPlan', n)
          //@ts-ignore
          n.navigate(s, { id: selectedTaskDetails.fitness_plan.id })
          setSelectedTask(null)
        }}>
          <Text>As part of {<Text weight='bold' style={{ color: _tokens.primary900 }}>{selectedTaskDetails.fitness_plan.name}</Text>}</Text>
        </TouchableOpacity>}
        {selectedTaskDetails.fitness_plan && <Spacer sm />}
        <Description onChangeText={v => setNewTask('description', v)} editable={newTask ? true : false} placeholder='Your task description' value={selectedTaskDetails.description} />
        <Spacer sm />
        <Spacer divider xs />
        <OverlayRowItem onDelete={() => updateTask({ child_id: undefined, screen: undefined, related: null, type: 'Task' })} disabled={disabled} title={`Related ${selectedTaskDetails.type ? `(${selectedTaskDetails.type})` : ''}`} Right={<TouchableOpacity disabled={disabled} onPress={() => {
          if (selectedTaskDetails.child_id && selectedTaskDetails.screen) {
            let s = getMatchingNavigationScreen(selectedTaskDetails.screen, n) //@ts-ignore
            n.navigate(s, { id: selectedTaskDetails.child_id, task_id: uuid })
          } else {
            setShowAddRelate(true)
          }
        }}>
          {/* @ts-ignore */}
          <Text weight={selectedTaskDetails?.related ? 'bold' : 'regular'} style={{ color: !selectedTaskDetails.related ? tw`text-gray-500`.color : _tokens.primary900 }}>{selectedTaskDetails.related || 'No Related Workout/Meal'}</Text>
        </TouchableOpacity>} />
        
        {!newTask && <OverlayRowItem title='Starting' disabled={true} date value={selectedTaskDetails.start_date || moment().format()} dateValue={selectedTaskDetails.start_date} />}
        <OverlayRowItem onDelete={selectedTaskDetails.start_time ? () => setNewTask('start_time', null) : undefined} title='@ Time' disabled={disabled} onDateChange={v => setNewTask('start_time', moment(v).format('hh:mm:ss A'))} value={selectedTaskDetails.start_time || 'All Day'} time dateValue={selectedTaskDetails.start_time} />
        <OverlayRowItem onDelete={selectedTaskDetails.repeat_frequency ? () => setNewTask('repeat_frequency', null) : undefined} title='Repeating' disabled={disabled} value={titleCase(selectedTaskDetails.repeat_frequency || '')} Right={<Picker.Select title='Repeating' displayValue={titleCase} formatValue={titleCase} options={['DAILY', 'WEEKLY', 'MONTHLY', 'ANNUALLY']} selected={selectedTaskDetails.repeat_frequency} onSelect={v => setNewTask('repeat_frequency', v)} />} />
        {selectedTaskDetails.repeat_frequency === 'WEEKLY' &&  <OverlayRowItem onDelete={selectedTaskDetails.days_of_week ? () => setNewTask('days_of_week', null) : undefined} title='On' disabled={disabled} Right={<Picker.Select title='Day(s) of Week' disabled={disabled} displayValue={v => moment().day(v).format('ddd')} formatValue={(v) => (moment().day(v).format(' dddd'))} joinOptions=', ' options={[0, 1, 2, 3, 4, 5, 6]} selected={selectedTaskDetails.days_of_week} onMultiSelect={v => setNewTask('days_of_week', v || [])} />} />}
        {selectedTaskDetails.repeat_frequency === 'MONTHLY' && <OverlayRowItem onDelete={selectedTaskDetails.days_of_month ? () => setNewTask('days_of_month', null) : undefined} title={`Monthly on`} disabled={disabled} Right={<Picker.Select title='Day(s) of Month' disabled={disabled} displayValue={v => moment().date(v).format('D')} formatValue={(v) => (moment().date(v).format(' Do'))} joinOptions=', ' options={Array(31).fill(0).map((x, i) => i + 1) as number[]} selected={selectedTaskDetails.days_of_month} onMultiSelect={v => setNewTask('days_of_month', v || [])} />} /> }
        <OverlayRowItem onDelete={selectedTaskDetails.end_date ? () => setNewTask('end_date', null) : undefined} title='Ending' minDate={moment(selectedTaskDetails.start_date).add(1, 'day').toDate()} date onDateChange={v => setNewTask('end_date', moment(v).format())} disabled={disabled} dateValue={selectedTaskDetails.end_date} />
        <Spacer xl />
        <HideView hidden={!selectedTask || !selectedTaskDetails.id}>
          <TouchableOpacity style={tw`mb-2`} onPress={() => {
            if (newTask) {
              _setNewTask(null);
            } else if (selectedTask) {
              _setNewTask(agendaTaskToAppended(selectedTask))
            }
          }}>
            <Text error={newTask ? true : false} primary={newTask ? false : true} lg weight='bold' style={tw`text-center`}>{newTask ? 'Cancel Editing' : 'Edit Task'}</Text>
          </TouchableOpacity>
        </HideView>
        <Spacer />
        {(newTask || (selectedTask && today && taskIncludesToday(selectedTask, today.date))) && <Button disabled={g.loading} onPress={() => {
          if (selectedTask && !newTask) {
            completeTask(selectedTask)
          } else if (newTask) {
            saveTask()
          }
        }} type={selectedTaskDetails.completed ? 'light' : "primary"} color={selectedTaskDetails.completed ? undefined : _tokens.primary900} title={newTask ? 'Save Task' : selectedTaskDetails.completed ? 'Redo Task' : 'Mark Completed'} />}
        <ActionSheet cancelButtonIndex={2} destructiveButtonIndex={2} visible={showAddRelate ? true : false} useNativeIOS={Platform.OS === 'ios'} options={[
          {
            label: 'Add Meal', onPress: async () => {
              let s = getMatchingNavigationScreen('ListMeal', n)

              //@ts-ignore
              n.navigate(s, { task_id: uuid })
              minimizeSheet()
            }
          },
          {
            label: 'Add Workout', onPress: async () => {
              let s = getMatchingNavigationScreen('ListWorkout', n)
              //@ts-ignore
              n.navigate(s, { task_id: uuid });
              minimizeSheet()
            }
          },
          {
            label: 'Cancel', onPress: () => {
              minimizeSheet();
            }
          }
        ]} />
      </Overlay>

      {selectedOption === 'Today' && <SaveButton disabled={g.loading} discludeBackground safeArea onSave={() => {
        _setNewTask(def)
      }} title='Add Task' />}


    </View>
  )
}


const OverlayRowItem = (props: {
  value?: string | number | null | undefined;
  title: string;
  disabled?: boolean;
  date?: boolean; time?: boolean; dateValue?: Date | null | undefined | string,
  onDateChange?: (d: Date) => void;
  Right?: React.ReactNode;
  minDate?: Date;
  onDelete?: () => void;
  bg?: string;
}) => {
  let g = useGet()
  let r = useRef<TSwipeableWithDeleteRef>(null)
  return <SwipeWithDelete ref={r} disabled={!props.onDelete || props.disabled} onDelete={() => {
    props.onDelete && props.onDelete()
    r.current?.close();
  }}>
    <XStack bg={g.modalBg} justifyContent='space-between' paddingVertical='$4' borderBottomColor={_tokens.dark4} borderBottomWidth='$0.25' alignItems='center'>
      <Text lg weight='bold'>{props.title}</Text>
      {(!props.Right && !props.date && !props.time) && <Text style={tw`${props.disabled ? 'text-gray-500' : ''}`}>{props.value}</Text>}
      {(props.date || props.time) && <Picker.DateOrTimePicker minDate={props.minDate} onDateChange={props.onDateChange} time={props.time} value={props.dateValue} disabled={props.disabled} title={props.title} />}
      {props.Right && props.Right}
    </XStack>
  </SwipeWithDelete>
}


const TimelineItem = (props: {
  hour: string; isNow: boolean; data: typeof defaultObj | undefined;
}) => {
  let { hour, isNow, data } = props;
  let sortedTime = useMemo(() => {
    if (!data) return null
    let res = [...data.food, ...data.meal, ...data.workouts, ...data.run].sort((prev, curr) => moment(prev.created_at).diff(curr.created_at))
    return res;
  }, [data])
  let n = useNavigation()
  let g = useGet()
  return <Timeline point={{ type: isNow ? Timeline.pointTypes.BULLET : Timeline.pointTypes.CIRCLE, color: _tokens.primary900 }} bottomLine={{ type: Timeline.lineTypes.DASHED, color: _tokens.secondary900 }} topLine={{ type: Timeline.lineTypes.DASHED, color: _tokens.secondary900 }}>
    <YStack>
      <Text style={tw`${!isNow ? "text-gray-500" : ''}`} weight={isNow ? 'black' : 'semibold'}>{hour}</Text>
      <Spacer sm />
      {((sortedTime && sortedTime.length > 0 || (data?.tasks && data.tasks.length))) && <YStack backgroundColor={g.dm ? _tokens.dark1 : _tokens.gray100} borderRadius={'$2'} px='$2' pt='$2'>
        {(data?.tasks || []).map(x => {
          return <View key={x.id + ' - task'} style={tw`mb-2`}>
            <XStack justifyContent='space-between' alignItems='center'>
              <View>
                <Text lg bold>{x.name}</Text>
                <Text>Task</Text>
              </View>
              {x?.progress?.[0] && <ExpoIcon name='checkbox' iconName='ion' size={25} color={_tokens.primary900} />}
            </XStack>
          </View>
        })}
        {(sortedTime || []).map((x, i) => {
          let [name, image, category, type, props, screen] = ['', '', '', '', {}, '' as string | undefined | null];
          //@ts-ignore
          if (x.otherNutrition) { //@ts-ignore
            name = x.name; props = { progress_id: x.id }; category = x.category;
            type = 'Food'
            screen = getMatchingNavigationScreen('FoodDetail', n)
            //@ts-ignore
          } else if (x.meal) { //@ts-ignore
            name = x.meal.name; props = { id: x.meal.id, idFromProgress: x.id }; image = x.meal.preview || defaultImage;
            //@ts-ignore
            type = 'Meal'
            screen = getMatchingNavigationScreen('MealDetail', n);
            //@ts-ignore
          } else if (x.workout) { //@ts-ignore
            name = x.workout.name; props = { id: x.workout.id }; image = x.workout.image || defaultImage;
            type = 'Workout'
            screen = getMatchingNavigationScreen('WorkoutDetail', n)
          } else { //@ts-ignore
          }
          if (!name) return <View key={`Hour-${hour}-${i}`} />
          return <Pressable key={`Hour-${hour}-${i}`} onPress={() => {
            if (screen) {
              //@ts-ignore
              n.navigate(screen, props ? { ...props } : {})
            }
          }}>
            <XStack alignItems='center' justifyContent='space-between' mb='$2'>
              <XStack>
                {image && <SupabaseImage uri={image} style={{ height: 30, width: 30, borderRadius: 15 }} />}
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

export const TaskItem = (props: { task: TAgendaTask, discludeCheckbox?: boolean; taskType: TaskType, completed?: boolean, onTap: (task: TAgendaTask) => void; onDetailsPress?: (task: TAgendaTask) => void; onDelete?: (task: TAgendaTask) => void; }) => {
  let { task, taskType } = props;
  let completed = props.completed
  let name = task.name || (task.workout ? task.workout.name : (task.meal ? task.meal.name : task.run ? 'Run' : (task.name || 'Task')))
  let onDelete = () => props.onDelete && props.onDelete(task)
  let onTap = () => props.onTap && props.onTap(task)
  let onDetailsPress = () => props.onDetailsPress && props.onDetailsPress(task)
  return <TaskBody completed={completed} discludeCheckbox={props.discludeCheckbox} taskType={taskType} onDelete={onDelete} onTap={onTap} onDetailsPress={onDetailsPress} name={name || ''} description={`${task.fitness_plan ? '• ' + task.fitness_plan.name : ""}• ${task.start_time ? '@'+ timeStringToMoment(task.start_time).format('hh:mm A') : 'All Day'}`} />
}


export const TaskBody = (props: { name: string, description?: string; discludeCheckbox?: boolean; taskType: TaskType, completed?: boolean, onTap?: () => void; onDetailsPress?: () => void; onDelete?: () => void; }) => {
  let { taskType, completed, name, description } = props;
  let title = titleCase(taskType || 'task')
  let dm = useColorScheme() === 'dark'
  let r = useRef<Swipeable>(null)
  return <Swipeable ref={r} renderRightActions={() => {
    if (!props.onDelete) return null;
    //@ts-ignore
    return <TouchableOpacity onPress={() => {
      props.onDelete && props.onDelete();
      r.current?.close()
    }} style={{ ...tw`w-15 h-12/12 items-center justify-center px-1 rounded`, backgroundColor: _tokens.error }}>
      <ExpoIcon name='x' iconName='feather' size={23} color={'white'} />
      <Text weight='bold' style={tw`text-center text-white`}>Delete</Text>
    </TouchableOpacity>
  }} renderLeftActions={() => {
    if (!props.onDetailsPress) return null;
    //@ts-ignore
    return <TouchableOpacity onPress={() => {
      props.onDetailsPress && props.onDetailsPress()
      r?.current?.close();
    }} style={{ ...tw`w-15 h-12/12 items-center justify-center px-1 rounded`, backgroundColor: _tokens.primary900 }}>
      <Text weight='bold' style={tw`text-center text-white`}>View Details</Text>
    </TouchableOpacity>
  }}>
    <View includeBackground>
      <TouchableOpacity onLongPress={() => {
        if (props.onDetailsPress) props.onDetailsPress()
      }} onPress={() => { props.onTap && props.onTap() }}>
        <XStack paddingVertical='$2.5' paddingHorizontal='$1' justifyContent='space-between' alignItems='center'>
          <YStack>
            <Text lg weight='bold' style={tw`${completed ? 'line-through ' + (dm ? 'text-gray-700' : 'text-gray-400') : ''}`}>{name} </Text>
            <Text gray style={tw`${completed ? 'line-through ' : ''}`}>{title} {description}</Text>
          </YStack>
         {!props.discludeCheckbox &&  <Checkbox value={completed} color={_tokens.primary900} style={tw`${completed ? '' : "border-gray-500"} mr-2`} />}
        </XStack>
      </TouchableOpacity>
    </View>
  </Swipeable>
}





import { datetime, Frequency, RRule, RRuleSet, rrulestr, Weekday } from 'rrule'
import ManageButton from '../../components/features/ManageButton'





const weekdayToRRule = (d: number): Weekday => {
  let _d = d
  let arr = [RRule.SU, RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR, RRule.SA]
  if (d > 6) _d = d % 6;
  return arr[_d]
}

let taskIncludesToday = (task: TAgendaTask, _today: string): boolean => {
  if (!task.start_date) return false;
  let today = moment(_today)
  let start_date = moment(task.start_date)
  console.log('here2')
  if (task.end_date) {
    if (moment(task.end_date).isBefore(today, 'day')) return false;
  }
  let freq: Frequency | null = Frequency.YEARLY
  if (task.repeat_frequency) {
    if (task.repeat_frequency === 'WEEKLY') freq = RRule.WEEKLY;
    if (task.repeat_frequency === 'DAILY') freq = RRule.DAILY;
    if (task.repeat_frequency === 'MONTHLY') freq = RRule.MONTHLY;
    if (task.repeat_frequency === 'ANNUALLY') freq = Frequency.YEARLY;
  } else {
    return today.isSame(start_date, 'day')
  }
  const rule = new RRule({
    freq: freq,
    interval: 1,
    bymonthday: task.days_of_month,
    byweekday: task.days_of_week ? task.days_of_week.map(x => weekdayToRRule(x)) : null,
    dtstart: datetime(start_date.year(), start_date.month() + 1, start_date.date()),
    until: datetime(today.year(), today.month() + 1, today.date())
  })
  let _all = rule.all()
  let last = _all[_all.length - 1]
  if (last) {
    return moment(last).utc().isSame(today, 'day')
  }
  return false;
};

// const testFreq = () => {
//   console.log(TEST_DATE)
//   for (var d of testTasks) {
//     let res = taskIncludesToday(d, TEST_DATE);
//     console.log(d, res, d.expected ? '• true' : '• false')
//   }
// }
