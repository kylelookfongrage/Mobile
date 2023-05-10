import { ScrollView, View, TextInput, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { Text } from '../../components/Themed'
import * as ImagePicker from 'expo-image-picker';
import tw from 'twrnc'
import { ExpoIcon } from '../../components/ExpoIcon'
import useColorScheme from '../../hooks/useColorScheme'
import { useNavigation } from '@react-navigation/native';
import { Equiptment, ExerciseEquiptmentDetail } from '../../aws/models';
import { DataStore, Predicates, Storage } from 'aws-amplify';
import { useCommonAWSIds } from '../../hooks/useCommonContext';
import { defaultImage, isStorageUri, uploadImageAndGetID } from '../../data';
import { ActivityIndicator } from 'react-native-paper';
import { BackButton } from '../../components/BackButton';
import { useDebounce } from '../../hooks/useDebounce';

export default function EquiptmentSearch(props: { exerciseId: string }) {
    const dm = useColorScheme() === 'dark'
    const { sub, userId } = useCommonAWSIds()
    const [searchKey, setSearchKey] = React.useState('')
    const [searchResults, setSearchResults] = React.useState<Equiptment[]>([])
    const [addMode, setAddMode] = React.useState<boolean>(false)
    const [newName, setNewName] = React.useState<string>('')
    const [newImage, setNewImage] = React.useState<string>('')
    var letters = searchResults.map((e) => e.name[0])
    const navigator = useNavigation()
    const currentMediaPermissions = ImagePicker.useMediaLibraryPermissions()
    const [uploading, setUploading] = React.useState<boolean>(false)
    const debouncedSearchTerm = useDebounce(searchKey, 500)
    letters = [... new Set(letters)]
    React.useEffect(() => {
        DataStore.observeQuery(Equiptment, e => e.and(eq => [
            debouncedSearchTerm ? eq.name.contains(searchKey) : eq.name.ne(''),
            eq.or(u => [u.userID.eq(userId)])
        ])).subscribe(ss => {
            const {items} = ss
            Promise.all(items.map((async r => {
                if (isStorageUri(r.img)) {
                    const url = await Storage.get(r.img)
                    return { ...r, img: url }
                } else {
                    return r
                }
            }))).then(setSearchResults).finally(() => {
                setUploading(false)
            })
        })

    }, [debouncedSearchTerm])

    const pickMedia = async () => {
        if (!currentMediaPermissions[0] || !currentMediaPermissions[0]?.granted) {
            ImagePicker.requestMediaLibraryPermissionsAsync().then((x) => {
                if (x.granted) {
                    getFromCameraRoll()
                } else {
                    alert('We need your permission to access your camera roll!')
                }
            }).catch(_ => alert('We need your permission to access your camera roll!'))
        } else {
            getFromCameraRoll()
        }

    }

    const getFromCameraRoll = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        })
        if (!result.canceled && result.assets.length > 0) {
            setNewImage(result.assets[0].uri)
        }
    }

    const addEquiptment = async () => {
        if (!newName) return;
        setUploading(true)
        let img = defaultImage
        if (newImage) {
            img = await uploadImageAndGetID({ type: 'image', uri: newImage })
        }
        const newEquiptment = new Equiptment({ name: newName, img: img, userID: userId, sub: sub })
        await DataStore.save(newEquiptment)
        setSearchKey('')
    }

    const onEquiptmentPress = async (id: string) => {
        await DataStore.save(new ExerciseEquiptmentDetail({ sub: sub, userID: userId, equiptmentID: id, exerciseID: props.exerciseId }))
        //@ts-ignore
        navigator.pop()
    }

    return (
        <View style={{flex: 1}}>
            <BackButton />
            <ScrollView contentContainerStyle={tw`pb-40`} showsVerticalScrollIndicator={false}>
                <View style={tw`px-4 h-12/12`}>
                    <View style={tw`flex flex-row items-center py-3 px-5 mt-6 w-12/12 bg-${dm ? 'gray-600' : 'gray-300'} rounded-xl`}>
                        <ExpoIcon name='search' iconName='feather' color='gray' size={25} />
                        <TextInput
                            placeholder='Name'
                            placeholderTextColor={dm ? 'white' : 'gray'}
                            style={tw`w-9/12 py-2 px-3 text-${dm ? 'white' : 'black'}`}
                            value={searchKey} onChangeText={setSearchKey}
                        />
                    </View>
                    <View style={tw`py-3`}>
                        <View style={tw`flex-row items-center justify-around`}>
                        {addMode && <TouchableOpacity
                                    onPress={pickMedia}
                                    style={[tw`bg-red-${dm ? "700" : '200'} mr-3 items-center justify-center`, { height: 60, width: 60, borderRadius: 60 / 2 }]}
                                >
                                    {!newImage && <ExpoIcon iconName='feather' name='camera' size={20} color={dm ? 'white' : 'black'} />}
                                    {newImage && <Image source={{ uri: newImage }} style={{ height: 60, width: 60, borderRadius: 60 / 2 }} />}
                                </TouchableOpacity>}
                                {addMode && <TextInput
                                    value={newName} onChangeText={setNewName}
                                    placeholder='New name'
                                    placeholderTextColor={dm ? 'white' : 'gray'}
                                    style={tw`w-7/12 py-2 px-3 text-${dm ? 'white' : 'black'} border-b border-${dm ? 'white' : 'black'}`}
                                />}
                                <TouchableOpacity onPress={() => setAddMode(!addMode)}>
                            <Text>{addMode ? "Cancel" : "Add New"}</Text>
                        </TouchableOpacity>
                        </View>
                        {addMode && <TouchableOpacity style={tw`mt-2 mx-4 mb-3 mt-6 py-2 rounded-xl bg-red-500 text-white`} onPress={addEquiptment}>
                                <Text style={tw`text-center`} weight='bold'>Add New</Text>
                            </TouchableOpacity>}
                    </View>
                    {uploading && <ActivityIndicator />}
                    {!uploading && letters.sort().map((l, idx) => {
                        return <View key={`letter ${l} at ${idx}`} style={tw``}>
                            <View style={tw`w-12/12 mb-2 py-2 px-3 bg-gray-${dm ? '600' : '300'}/60`}>
                                <Text weight='bold'>{l}</Text>
                            </View>
                            {searchResults.filter((e) => e.name[0] === l).map((e, x) => {
                                const isUsersEquiptment = e.userID === userId
                                return <View style={tw`flex-row w-12/12 justify-between items-center`} key={`equiptment ${e.name} at ${x}`}>
                                    <TouchableOpacity onPress={() => onEquiptmentPress(e.id)} style={tw`flex-row items-center h-12/12 w-10/12 my-2`}>
                                        <Image source={{ uri: e.img }} style={[{
                                            width: 60,
                                            height: 60,
                                            resizeMode: 'contain',
                                        }, tw`rounded-lg`]} />
                                        <Text style={tw`text-lg ml-4`} weight='bold'>{e.name}</Text>
                                    </TouchableOpacity>
                                    {isUsersEquiptment && <TouchableOpacity>
                                        <ExpoIcon style={tw`p-3`} name='trash' iconName='feather' size={20} color={dm ? 'white' : 'black'} />
                                    </TouchableOpacity>}
                                </View>
                            })}
                        </View>
                    })}
                </View>
            </ScrollView>
        </View>
    )
}


