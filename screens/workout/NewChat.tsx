import { View, Text } from '../../components/base/Themed'
import React, { useEffect, useMemo, useState } from 'react'
import tw from 'twrnc'
import { Dimensions, Keyboard, Pressable, TouchableOpacity, useColorScheme, Image } from 'react-native'
import { ScrollView, TextInput } from 'react-native-gesture-handler'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { ExpoIcon } from '../../components/base/ExpoIcon'
import { useDebounce } from '../../hooks/useDebounce'
import { defaultImage, isStorageUri } from '../../data'

export default function NewChat() {
    return <View />
}