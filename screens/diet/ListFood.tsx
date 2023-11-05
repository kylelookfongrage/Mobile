import { ScrollView, useColorScheme, TouchableOpacity, Image, TextInput } from 'react-native'
import React, { useState } from 'react'
import { Text, View } from '../../components/base/Themed'
import tw from 'twrnc'
import { ExpoIcon } from '../../components/base/ExpoIcon'
import { FetchEdamamParser, getMatchingNavigationScreen } from '../../data'
import { useNavigation } from '@react-navigation/native'
import Barcode from '@kichiyaki/react-native-barcode-generator'
import { BarCodeScanner } from 'expo-barcode-scanner'
import { useCommonAWSIds } from '../../hooks/useCommonContext'
import { BackButton } from '../../components/base/BackButton'
import { ActivityIndicator, FAB } from 'react-native-paper'
import moment from 'moment'
import AllergenAlert from '../../components/features/AllergenAlert'
import SearchBar from '../../components/inputs/SearchBar'
import Spacer from '../../components/base/Spacer'
import { SearchDao } from '../../types/SearchDao'
import useAsync from '../../hooks/useAsync'
import SupabaseImage from '../../components/base/SupabaseImage'
export const categoryMapping = {
  'generic foods': '🍎',
  'generic meals': '🍽',
  'packaged foods': '🛒',
  'fast foods': '🍟',
};


interface ListFoodSearchResults {
  id: string;
  edamamId?: string;
  fromEdamam?: boolean
  name: string;
  calories: number;
  image: string;
  createdAt?: Date,
  foodContentsLabel: string;
  category?: "Generic foods" | 'Generic meals' | 'Packaged foods' | 'Fast foods';
  measures?: {
    uri: string;
    label: string;
    weight: number
    qualified?: {
      qualifiers?: {
        uri: string;
        label: string;
      }[]
      weight: number;
    }[]
  }[]

}

interface ListFoodProps {
  mealId?: string;
  progressId?: string;
  defaultSearch?: string;
  grocery?: boolean;
}

export default function ListFood(props: ListFoodProps) {
  const navigator = useNavigation()
  const { userId, profile } = useCommonAWSIds()
  const dm = useColorScheme() === 'dark'
  const color = dm ? 'white' : 'black'
  const [searchKey, setSearchKey] = React.useState<string>('')
  const searchOptions = ['All', 'My Foods', 'Favorites'] as const
  const [showBarcode, setShowBarcode] = useState<boolean>(false)
  const [barcode, setBarcode] = React.useState<string | null>(null);
  const [selectedOption, setSelectedOption] = React.useState<typeof searchOptions[number]>(searchOptions[0])
  const userAllergens = profile?.allergens || []
  const [results, setResults] = React.useState<ListFoodSearchResults[]>([])
  const [displaySearchState, setDisplaySearchState] = React.useState('Search for food!')
  let dao = SearchDao()
  let search = async (term: string | null) => {
    let _results: ListFoodSearchResults[] = []
    if (selectedOption == 'All' && term) {
      setDisplaySearchState('Searching....')
      let res = await FetchEdamamParser({
        ingr: term
      })
      if (res.hints && res.hints.length > 0 && !res?.error) {
        let edamamResults: ListFoodSearchResults[] = res.hints.map((y) => ({
          name: y.food.label,
          image: y.food.image,
          category: y.food.category,
          id: y.food.foodId,
          edamamId: y.food.foodId,
          fromEdamam: true,
          calories: y.food.nutrients.ENERC_KCAL,
          measures: y.measures,
          foodContentsLabel: y.food.foodContentsLabel || ''
        }))
        //@ts-ignore
        _results = edamamResults
      }
    }
    let res = await dao.search('food', {
      keyword: term, keywordColumn: 'name', selectString: `
        *, author: user_id(username)`,
      belongsTo: selectedOption === 'My Foods' ? profile?.id : undefined,
      favorited: selectedOption === 'Favorites', user_id: profile?.id,
      filters: [{column: 'public', value: true}]
  })
  if (res) {
    //@ts-ignore
    _results = [..._results, ...res.map(x => {
      return {...x, foodContentsLabel: x.ingredients, createdAt: x.created_at}
    })]
  }
  setResults(_results)
  }

  useAsync(async () => {
    search(searchKey)
  }, [searchKey, selectedOption])



  React.useEffect(() => {
    if (barcode) {
      FetchEdamamParser({
        upc: barcode
      }).then((x) => {
        if (x?.error) {
          setDisplaySearchState('No matches found')
          setResults([])
          return;
        }
        if (x?.hints?.length > 0) {
          setResults(x.hints.map((y) => ({
            name: y.food.label,
            image: y.food.image,
            id: y.food.foodId,
            category: y.food.category,
            calories: y.food.nutrients.ENERC_KCAL,
            measures: y.measures,
            fromEdamam: true,
            edamamId: y.food.foodId,
            foodContentsLabel: y.food.foodContentsLabel || ''
          })))
        } else {
          setDisplaySearchState('There is no food to display, please refine your search')
        }
      }).catch(e => {
        alert(e.toString())
      })
    }
  }, [barcode])


  React.useLayoutEffect(() => {
    setSearchKey('')
    setResults([])
    setBarcode(null)
  }, [selectedOption])

  React.useEffect(() => {
    if (props.defaultSearch) {
      setSearchKey(props.defaultSearch)

    }
  }, [props.defaultSearch])

  return (
    <View style={{ flex: 1 }} includeBackground>
      <BackButton />
      <Spacer />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[tw`px-4`]}>
        <SearchBar full onSearch={setSearchKey} />
        <View style={tw`flex-row justify-between py-4 px-5`}>
          {searchOptions.map((o, i) => {
            const selected = selectedOption === o
            return <TouchableOpacity
              key={`Search option ${o} at idx ${i}`}
              style={tw`items-center py-2 px-5 ${selected ? 'border-b border-' + color : ''}`}
              onPress={() => {
                setSelectedOption(o)
                setResults([])
              }}>
              <Text
                weight={selected ? 'semibold' : 'regular'}>{o}</Text>
            </TouchableOpacity>
          })}
        </View>
        {showBarcode && <View>
          {!barcode && <BarcodeScannerView
            style={tw`h-50 w-12/12 rounded-xl border border-${dm ? 'white' : 'black'}`}
            onBarcodeScanned={(code) => {
              setBarcode(code || null)
            }} />}
          {barcode && <View>
            <Barcode value={barcode} text={barcode} style={tw`pt-2`} />
            <TouchableOpacity
              onPress={() => setBarcode(null)}
              style={tw`w-12/12 items-center justify-center py-2 px-4 bg-gray-${dm ? '700' : '300'}`}>
              <Text>Scan Again</Text>
            </TouchableOpacity>
          </View>}
        </View>}
        {(displaySearchState !== '' && results.length === 0) && <View style={tw`w-12/12 justify-center items-center mt-9`}><Text>{displaySearchState}</Text></View>}
        {(results.length === 0 && selectedOption === 'Barcode' && barcode) && <View style={tw`w-12/12 justify-center items-center my-9`}><Text>{displaySearchState}</Text></View>}
        {results.map((r, idx) => {
          const userIsAllergic = userAllergens.filter(x => `${r.name} ${r.foodContentsLabel}`.toLowerCase().includes(x)).length > 0
          // TODO: some images are undefined, replace with icon in these cases
          return <TouchableOpacity
            key={`food item ${r.name} at index ${idx}`}
            onPress={() => {
              const foodDetailScreen = getMatchingNavigationScreen('FoodDetail', navigator)
              //@ts-ignore
              navigator.navigate(foodDetailScreen, {
                id: r.id,
                editable: true,
                img: r.image,
                name: r.name,
                category: r.category,
                src: r.edamamId ? 'api' : props.mealId ? 'edit' : 'backend',
                edamamId: r.edamamId || null,
                measures: r.fromEdamam ? r.measures : null,
                foodContentsLabel: r.foodContentsLabel,
                progressId: props.progressId,
                mealId: props.mealId,
                grocery: props.grocery
              })
            }}
            style={tw`flex-row items-center px-2 my-3 w-12/12`}>
            {r.image ? <SupabaseImage uri={r.image} style={tw`h-15 w-15 rounded-xl`} resizeMode='cover' /> : <View style={tw`h-15 w-15 items-center justify-center rounded-xl bg-gray-${dm ? '700' : '300'}`}>
              {/* @ts-ignore */}
              <Text style={tw`text-2xl`}>{categoryMapping['generic foods']}</Text></View>}
            <View style={tw`w-12/12 items-start ml-2`}>
              <Text style={tw`max-w-9/12`} weight='semibold'>{r.name} {userIsAllergic && <AllergenAlert size={15} />}</Text>
              {selectedOption === 'My Foods' && <Text style={tw`text-xs`}>{r.createdAt && moment(r.createdAt).format('LL')}</Text>}
              {(selectedOption !== 'My Foods' && r.author?.username) && <Text style={tw`text-xs text-red-500`}>@{r.author?.username}</Text>}
            </View>
          </TouchableOpacity>
        })}
        <View style={tw`pb-40`} />
      </ScrollView>
      <FAB onPress={() => setShowBarcode(!showBarcode)} icon={() => {
        if (showBarcode) {
          return <ExpoIcon name='close' iconName='ion' color='white' size={23} />
        }
        return <ExpoIcon name='barcode-outline' iconName='ion' color='white' size={23} />
        }} style={{...tw`bg-red-600 items-center justify-center pl-.5`, width: 55, height: 55, position: 'absolute',
        margin: 15,
        right: 0,
        padding: 0,
        bottom: 0,}} />
    </View>
  )
}


interface BarcodeScannerViewProps {
  style?: any;
  shouldStillScan?: boolean;
  waitBetweenScans?: number;
  onBarcodeScanned: (code: string | undefined) => void;
}
const BarcodeScannerView = (props: BarcodeScannerViewProps) => {
  const [hasPermission, setHasPermission] = React.useState<boolean>(false)
  React.useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();

  }, [])
  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  //@ts-ignore
  const handleBarCodeScanned = async ({ type, data }) => {
    if (props.shouldStillScan !== false && data) {
      props.onBarcodeScanned && props.onBarcodeScanned(data)
      if (props.waitBetweenScans) {
        await delay(props.waitBetweenScans)
      }
    }

  };
  if (hasPermission === null) {
    return <Text style={tw`text-center mt-6`}>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text style={tw`text-center mt-6`}>We don't have your camera access, please go to your settings and grant permission!</Text>;
  }


  return <View style={[{ flex: 1 }, tw``]}>
    <BarCodeScanner
      style={props.style || tw`h-50 w-12/12`}
      onBarCodeScanned={handleBarCodeScanned}
    />
    <View style={[{ position: 'absolute', top: 1 }, tw`w-12/12 h-12/12 items-center justify-center`]}>
      <ActivityIndicator color='red' size={'large'} style={tw``} />
    </View>
  </View>

}