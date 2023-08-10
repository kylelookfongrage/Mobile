import { View, Text } from '../../components/Themed'
import React, { useState } from 'react'
import { ScrollView, TouchableOpacity, Swipeable } from 'react-native-gesture-handler'
import { ExpoIcon } from '../../components/ExpoIcon'
import tw from 'twrnc'
import { useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Favorite, FavoriteType } from '../../aws/models'
import { Pressable, useColorScheme , Image} from 'react-native'
import { useCommonAWSIds } from '../../hooks/useCommonContext'
import { DataStore, Storage } from 'aws-amplify'
import { defaultImage, getMatchingNavigationScreen, isStorageUri } from '../../data'
import * as WebBrowser from 'expo-web-browser'
/*
ShowMore Options: 
Favorite
Go to Creator
 -- share? --
Report
*/

export const ShowMoreButton = (props: {name: string, desc: string, img: string, id?: string; type?: FavoriteType, userId?: string;}) => {
  const navigator = useNavigation()
  const dm = useColorScheme() === 'dark'
  return (
    <TouchableOpacity style={tw`p-2.5 rounded-xl bg-gray-${dm ? '700' : '200'}`} onPress={() => {
      //@ts-ignore
      navigator.navigate('ShowMore', {...props})
    }}>
      <ExpoIcon color='gray' size={25} iconName='feather' name='more-horizontal' />
    </TouchableOpacity>
  )
}

export default function ShowMore(props: {name: string, desc: string, img: string, id: string; type: FavoriteType, userId: string;}) {
  const {name, desc, img, id, type} = props;
  const navigator = useNavigation()
  const {userId} = useCommonAWSIds()
  const padding = useSafeAreaInsets()
  const dm = useColorScheme() === 'dark'
  const [hasFavorited, setHasFavorited] = useState<boolean>(false)
  const [picture, setPicture] = useState<string | null>(null)
  React.useEffect(() => {
    (async () => {
      const potentialFavorite = await DataStore.query(Favorite, f => f.and(fav => [
      fav.potentialID.eq(props.id), fav.userID.eq(userId), fav.type.eq(props.type)
    ]))
    if (potentialFavorite.length > 0) {
      setHasFavorited(true)
    }
    if (img === defaultImage || isStorageUri(img)) {
      const pic = await Storage.get(img)
      setPicture(pic)
    } else {
      setPicture(img)
    }
  })()

  }, [])

  const options = []

  if (props.id!!) {
    options.unshift({name: 'Report', icon: 'alert-circle', onPress: async () => {
      //@ts-ignore
      navigator.pop()
      //@ts-ignore
      navigator.navigate('Report', {...props})
    }},)
  }

  if (props.userId!!) {
    options.unshift({name: 'Go to Creator', icon: 'user', onPress: async () => {
      if (props.desc === '@Edamam Nutrition') {
        await WebBrowser.openBrowserAsync('https://www.edamam.com/')
      } else {
        //@ts-ignore
      navigator.pop()
      //@ts-ignore
      navigator.navigate('Profile', {id: props.userId})
      }
  }},)
  }
  if (props.type !== FavoriteType.FOOD && props.type) {
    options.unshift({name: hasFavorited ? 'Unfavorite' : 'Favorite', icon: 'heart', onPress: async () => {
      const potentialFavorite = await DataStore.query(Favorite, f => f.and(fav => [
        fav.potentialID.eq(props.id), fav.userID.eq(userId), fav.type.eq(props.type)
      ]))
      if (potentialFavorite.length === 0) {
        await DataStore.save(new Favorite({
          userID: userId, type: props.type, potentialID: props.id
        }))
        setHasFavorited(true)
      } else {
        await DataStore.delete(Favorite, potentialFavorite[0].id)
        setHasFavorited(false)
      }
    }})
  }

  return <View style={[tw`bg-gray-${dm ? '800' : '200'}/95`, {paddingTop: padding.top, flex: 1}]}>
    <ScrollView>
      <View style={tw`items-center justify-center mx-9`}>
      {picture && <Image style={tw`h-40 w-40 rounded-lg mt-12 mb-3`} source={{uri: picture}} />}
      <Text style={tw`pt-2 text-center`} weight='bold'>{props.name}</Text>
      <Text style={tw`text-gray-500`}>{props.desc}</Text>
      </View>
      <View style={tw`h-6`}/>
      {options.map(option => {
        return <TouchableOpacity onPress={option.onPress} style={tw`flex-row items-center justify-between mx-6 p-4`} key={option.name}>
          <View style={tw`flex-row items-center`}>  
            <ExpoIcon name={option.icon} iconName='feather' size={20} color='gray' />
            <Text style={tw`ml-4`}>{option.name}</Text>
          </View>
        </TouchableOpacity>
      })}
    </ScrollView>
    {/* @ts-ignore */}
    <TouchableOpacity onPress={() => navigator.pop()} style={[{paddingBottom: padding.bottom + 20}, tw`px-3 pt-3`]}>
      <Text style={tw`text-center text-gray-500 text-lg`} weight='bold'>Close</Text>
    </TouchableOpacity>
  </View>
}