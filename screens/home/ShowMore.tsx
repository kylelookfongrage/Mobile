import { View } from '../../components/base/Themed'
import React, { useState } from 'react'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { ExpoIcon } from '../../components/base/ExpoIcon'
import tw from 'twrnc'
import { useNavigation } from '@react-navigation/native'
import { useColorScheme, Dimensions, Alert } from 'react-native'
import { getMatchingNavigationScreen } from '../../data'
import Overlay from '../../components/screens/Overlay'
import { _tokens } from '../../tamagui.config'
import { SettingItem } from './Settings'


type TActionButton = {
  title: string;
  icon: string;
  onPress: () => void;
  hidden?: boolean;
}

type TShowMoreDialogue = {
  workout_id?: number;
  exercise_id?: number;
  food_id?: number;
  meal_id?: number;
  user_id?: string;
  plan_id?: number;
  post_id?: number;
  comment_id?: number;
  messgage_id?: string;
  options?: TActionButton[];
  px?: number | string;
}

export const EditModeButton = (editing: boolean, onPress: () => void, user_id: string | null | undefined, current_user_id: string | null | undefined): TActionButton => {
  console.log(user_id === current_user_id)
  return {
    title: editing ? 'Stop Editing' : 'Edit', icon: editing ? 'Close-Square' : 'Edit', onPress: onPress, hidden: user_id !== current_user_id
  }
}

export const ShowUserButton = (user_id: string | null | undefined, navigator: any): TActionButton => {
  return {
    title: 'View User', icon: 'Profile', onPress: () => {
      const screen = getMatchingNavigationScreen('User', navigator)
      if (screen && user_id) {
        navigator.navigate(screen, { id: user_id })
      }
    }
  }
}

export const ShareButton = (props: TShowMoreDialogue): TActionButton => {
  return { title: 'Share', icon: '3-User', onPress: () => {}, hidden: true }
}

export const DeleteButton = (name: string, onDelete: () => Promise<any>, user_id: string | null | undefined, current_user_id: string | null | undefined): TActionButton => {
  return {
    title: 'Delete ' + name, icon: 'Delete', hidden: user_id !== current_user_id, onPress: () => {
      Alert.alert('You are deleting your ' + name.toLowerCase(), 'Are you sure?', [
        { text: 'Cancel' },
        {
          text: 'Confirm', onPress: async () => {
            await onDelete()
          }
        }
      ])
    }
  }
}

export const ShowMoreDialogue = (props: TShowMoreDialogue) => {
  const navigator = useNavigation()
  const [showDialogue, setShowDialogue] = useState<boolean>(false)
  let options: TActionButton[] = (props.options || [])
  let dm = useColorScheme() === 'dark'
  let { workout_id, exercise_id, meal_id, messgage_id, post_id, plan_id, food_id, user_id, comment_id } = props;
  let ids = {workout_id, exercise_id, meal_id, messgage_id, post_id, plan_id, food_id, user_id, comment_id}
  let canReport = workout_id || exercise_id || meal_id || messgage_id || plan_id || post_id || food_id || user_id || comment_id
  if (canReport) {
    options = [...options, {
      title: 'Report',
      icon: 'Danger',
      hidden: false,
      onPress: () => {
        //@ts-ignore
        navigator.navigate('Report', { ...ids })
      }
    }]
  }
  const s = Dimensions.get('screen')
  return (
    <TouchableOpacity onPress={() => {
      //@ts-ignore
      setShowDialogue(!showDialogue)
    }}>
      <View style={[tw`p-2 rounded-full items-center justify-center mx-${props.px ? props.px : 2}`, { zIndex: 1, backgroundColor: dm ? _tokens.dark2 + '90' : _tokens.gray300 + '90'}]}>
        <ExpoIcon color='gray' size={20} iconName='feather' name={showDialogue ? 'x' : 'more-horizontal'} />
      </View>
      <Overlay style={{ ...tw`` }} dialogueHeight={35} visible={showDialogue} onDismiss={() => setShowDialogue(false)}>
        {options.filter(x => !x.hidden).map((x, i) => {
          return <SettingItem key={x.title + 'Setting item -' + i} hideCarat setting={{title: x.title, dangerous: x.title.toLowerCase().includes('delete'), icon: x.icon, onPress: () => {
            x.onPress && x.onPress();
            setShowDialogue(false)
          }  }} />
        })}
      </Overlay>
    </TouchableOpacity>
  )
}