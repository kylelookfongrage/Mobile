import { View, Text } from '../../components/base/Themed'
import React, { useState } from 'react'
import { Dimensions, Keyboard, Pressable, TouchableOpacity, useColorScheme } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import tw from 'twrnc'
import { ExpoIcon } from '../../components/base/ExpoIcon'
import { useCommonAWSIds } from '../../hooks/useCommonContext'
import { titleCase } from '../../data'
import { ScrollView, TextInput } from 'react-native-gesture-handler'
import { UserQueries } from '../../types/UserDao'

export default function Allergens() {
    const dm = useColorScheme() === 'dark'
    const { profile, setProfile } = useCommonAWSIds()
    const navigator = useNavigation()
    const [allergens, setAllergens] = useState<string[]>(profile?.allergens || [])
    let dao = UserQueries()

    const onPress = async () => {
        if (!profile) return;
        let res = await dao.update_profile({allergens: allergens}, profile)
        if (res) setProfile(res)
        navigator.pop()
        // const user = await DataStore.query(User, userId)
        // if (!user) {
        //     Alert.alert('There was a problem updating your allergens, please try again')
        //     return;
        // }
        // await DataStore.save(User.copyOf(user, x => {
        //     x.allergens = allergens;
        // }))
        // //@ts-ignore
        // navigator.pop()
    }
    const height = Dimensions.get('screen').height
    const [editMode, setEditMode] = useState<boolean>(false)
    const [newAllergen, setNewAllergen] = useState<string>('')
    return <View card style={[{ marginTop: height * 0.25, height: height * 0.75, flex: 1 }, tw`rounded-t-3xl p-6`]}>
        <Pressable style={tw`justify-between h-12/12 pb-12`} onPress={() => Keyboard.dismiss()}>
            <View>
                <View style={tw`flex-row justify-between`}>
                    <Text style={tw`text-lg`} weight='bold'>Allergies</Text>
                    <TouchableOpacity onPress={() => {
                        //@ts-ignore
                        navigator.pop()
                    }}>
                        <ExpoIcon iconName='feather' name='x-circle' color='gray' size={25} />
                    </TouchableOpacity>
                </View>
                <Text style={tw`text-xs text-gray-500 text-center py-3 mx-9`}>A warning will display for these allergies when you are viewing food & meals!</Text>
                <Text weight='semibold' style={tw`my-3`}>Add a New Allergy</Text>
                <View style={tw`flex flex-row items-center justify-between`}>
                    <View translucent includeBackground style={tw`w-9/12 w-9/12 p-3 rounded-xl mr-2 flex-row items-center justify-between`}>
                        <TextInput style={tw`w-10/12 text-${dm ? 'white' : 'black'}`} value={newAllergen} onChangeText={setNewAllergen} />
                        <TouchableOpacity style={tw`px-2`} onPress={() => {
                            setNewAllergen('')
                        }}>
                        <ExpoIcon name='x' iconName='feather' size={20} color='gray' />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={tw`bg-red-600 p-3 rounded-xl`} onPress={() => {
                        if (newAllergen !== '') {
                            setAllergens([...allergens, newAllergen.toLowerCase()])
                            setNewAllergen('')
                        }
                    }}>
                        <Text style={tw`text-white text-center`}>Save</Text>
                    </TouchableOpacity>
                </View>
                <View style={tw`flex flex-row items-center justify-between mt-6`}>
                    <Text weight='semibold' style={tw``}>My Allergies</Text>
                    {allergens.length > 0 && <TouchableOpacity onPress={() => { setEditMode(!editMode) }}>
                        <Text style={tw`text-gray-500`}>{editMode ? 'Cancel' : 'Edit'}</Text>
                    </TouchableOpacity>}
                </View>
                {allergens.length === 0 && <Text style={tw`py-3 text-gray-500 text-xs text-center`}>You can add allergies above</Text>}
                <View style={tw`justify-center items-center flex flex-col w-12/12`}>
                    <ScrollView contentContainerStyle={tw`flex-row items-center flex-wrap w-12/12`}>
                        {allergens.map((x, i) => {
                            return <TouchableOpacity key={`allergen-${x}`} style={tw`w-3/12 items-center py-3`} disabled={!editMode} onPress={() => {
                                setAllergens(allergens.filter(f => f !== x))
                            }}>
                                {editMode && <ExpoIcon name='x-circle' iconName='feather' size={18} color='gray' />}
                                <Text style={tw`text-gray-500 text-center mt-1 text-xs`} weight='semibold'>{titleCase(x)}</Text>
                            </TouchableOpacity>
                        })}
                    </ScrollView>
                </View>
            </View>
            <TouchableOpacity style={tw`rounded-xl items-center justify-center p-3 mx-12 bg-red-600`} onPress={onPress}>
                <Text style={tw`text-center text-white`} weight='semibold'>Update Allergies</Text>
            </TouchableOpacity>
        </Pressable>
    </View>
}