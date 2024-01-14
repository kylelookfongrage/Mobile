import { ScrollView, useColorScheme, TouchableOpacity, Image, TextInput, Dimensions } from 'react-native'
import React, { useState } from 'react'
import { Text, View } from '../../components/base/Themed'
import tw from 'twrnc'
import { ExpoIcon, Icon } from '../../components/base/ExpoIcon'
import { FetchEdamamParser, getMatchingNavigationScreen, substringForLists, titleCase } from '../../data'
import { useNavigation } from '@react-navigation/native'
import Barcode from '@kichiyaki/react-native-barcode-generator'
import { BarCodeScanner } from 'expo-barcode-scanner'
import { BackButton } from '../../components/base/BackButton'
import { ActivityIndicator, FAB } from 'react-native-paper'
import moment from 'moment'
import AllergenAlert from '../../components/features/AllergenAlert'
import SearchBar from '../../components/inputs/SearchBar'
import Spacer from '../../components/base/Spacer'
import { SearchDao } from '../../types/SearchDao'
import useAsync from '../../hooks/useAsync'
import SupabaseImage from '../../components/base/SupabaseImage'
import { useSelector } from '../../redux/store'
import { XGroup } from 'tamagui'
import { _tokens } from '../../tamagui.config'
import Selector from '../../components/base/Selector'
import { USDAKeywordSearch, getEmojiByCategory } from '../../types/FoodApi'
import SearchResult from '../../components/base/SearchResult'
export const categoryMapping = {
  'generic foods': '🍎',
  'generic meals': '🍽',
  'packaged foods': '🛒',
  'fast foods': '🍟',
};


interface ListFoodSearchResults {
  id: string | number;
  fromApi?: boolean
  author?: { username: string };
  name: string;
  category?: string;
  calories: number;
  servingSize: number;
  servingUnit: string;
}

interface ListFoodProps {
  mealId?: string;
  progressId?: string;
  defaultSearch?: string;
  grocery?: boolean;
}

export default function ListFood(props: ListFoodProps) {
  const navigator = useNavigation()
  const { profile } = useSelector(x => x.auth)
  let w = Dimensions.get('screen').width
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
      let res = await USDAKeywordSearch(term)
      if (res && res.foods.length > 0) {
        console.log(res.foods.map(x => x.foodCategory))
        let apiResults: ListFoodSearchResults[] = res.foods.map((y) => ({
          name: titleCase(`${y.brandOwner ? (y.brandOwner.toLowerCase() === 'not a branded item' ? '' : y.brandOwner + ' ') : ''}${y.commonNames || y.description}`),
          category: y.foodCategory,
          id: y.fdcId,
          fromApi: true,
          calories: y.foodNutrients.filter(x => x.nutrientNumber=='208')?.[0]?.value || -1,
          servingSize: y.servingSize || 1,
          servingUnit: y.servingSizeUnit || 'servings',
          score: y.score || 0
        }))
        //@ts-ignore
        _results = apiResults
      }
    }

    let res = await dao.search('food', {
      keyword: term, keywordColumn: 'name', selectString: `
        *, author: user_id(username), calories, servingSize:quantity, servingUnit:servingSize`,
      belongsTo: selectedOption === 'My Foods' ? profile?.id : undefined,
      favorited: selectedOption === 'Favorites', user_id: profile?.id,
      filters: [{ column: 'public', value: true }]
    })
    if (res) {
      //@ts-ignore
      _results = [..._results.sort((a,b) => b.score-a.score), ...res.map(x => {
        return { ...x }
      })].filter(x => x.calories !== -1)
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
      <BackButton name='Food' />
      <Spacer />
      <View style={tw`px-2`}>
        <SearchBar full onSearch={setSearchKey} />
      </View>
      <Spacer />
      {/* @ts-ignore */}
      <Selector searchOptions={searchOptions} selectedOption={selectedOption} onPress={setSelectedOption} />
      <Spacer />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[tw`px-4`]}>
        <Spacer />
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
        {results.map((r, idx) => {
          return <TouchableOpacity
            key={`food item ${r.name} at index ${idx}`}
            onPress={() => {
              const foodDetailScreen = getMatchingNavigationScreen('FoodDetail', navigator)
              //@ts-ignore
              navigator.navigate(foodDetailScreen, {
                id: r.fromApi ? undefined : r.id,
                api_id: r.fromApi ? r.id : undefined
              })
            }}
            style={tw`flex-row items-center px-2 my-3 w-12/12`}>
            <Text h4>{getEmojiByCategory(r.category)}</Text>
            <View style={tw`w-12/12 items-start ml-2`}>
              <Text style={tw`max-w-11/12`} lg weight='semibold'>{substringForLists(r.name, 100)}</Text>
              <Text style={tw`text-gray-500`}>{r.calories.toFixed()} kcal per {r.servingSize?.toFixed()} {r.servingUnit} • {r.author ? `@${r.author.username}` : r.fromApi ? 'USDA Food Database' : 'Menustat.org'}</Text>
            </View>
          </TouchableOpacity>
        })}
        <View style={tw`pb-40`} />
      </ScrollView>
      <FAB onPress={() => setShowBarcode(!showBarcode)} icon={() => {
        if (showBarcode) {
          return <ExpoIcon name='close' iconName='ion' color='white' size={23} />
        }
        return <Icon name='Scan' color='white' weight='bold' size={24} />
      }} style={{
        ...tw`bg-red-600 items-center justify-center`, width: 55, height: 55, position: 'absolute',
        margin: 15,
        right: 0,
        padding: 0,
        bottom: 0,
      }} />
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


  return <View style={[{ flex: 1 }, tw`flex`]}>
    <BarCodeScanner
      style={props.style || tw`h-50 w-12/12`}
      onBarCodeScanned={handleBarCodeScanned}
    />
    <View style={[{ position: 'absolute', top: 1 }, tw`w-12/12 h-12/12 items-center justify-center`]}>
      <ActivityIndicator color='red' size={'large'} />
    </View>
  </View>

}