import { ScrollView, useColorScheme, TouchableOpacity, Image, TextInput, Dimensions, Pressable } from 'react-native'
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
import { USDABarcodeSearch, USDAKeywordSearch, getEmojiByCategory } from '../../types/FoodApi'
import SearchResult from '../../components/base/SearchResult'
import Overlay from '../../components/screens/Overlay'
import Animated, { Easing, interpolate, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated'
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
  let s = Dimensions.get('screen')
  const dm = useColorScheme() === 'dark'
  const [searchKey, setSearchKey] = React.useState<string>('')
  const searchOptions = ['All', 'My Foods', 'Favorites'] as const
  const [showBarcode, setShowBarcode] = useState<boolean>(false)
  const [barcode, setBarcode] = React.useState<string | null>(null);
  const [selectedOption, setSelectedOption] = React.useState<typeof searchOptions[number]>(searchOptions[0])
  const userAllergens = profile?.allergens || []
  const [results, setResults] = React.useState<ListFoodSearchResults[]>([])
  const [displaySearchState, setDisplaySearchState] = React.useState('Search for food!')
  let [barcodeError, setBarcodeError] = useState<boolean>(false)
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
          calories: y.foodNutrients.filter(x => x.nutrientNumber == '208')?.[0]?.value || -1,
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
      _results = [..._results.sort((a, b) => b.score - a.score), ...res.map(x => {
        return { ...x }
      })].filter(x => x.calories !== -1)
    }
    setResults(_results)
  }

  useAsync(async () => {
    search(searchKey)
  }, [searchKey, selectedOption])
  console.log('barcode', barcode)

  let searchBarcode = async (_barcode: string) => {
    if (barcode) return;
    if (!_barcode) return;
    let res = await USDABarcodeSearch(_barcode)
    if (res && res.foods && res.foods[0]) {
      let apiResults: ListFoodSearchResults[] = res.foods.map((y) => ({
        name: titleCase(`${y.brandOwner ? (y.brandOwner.toLowerCase() === 'not a branded item' ? '' : y.brandOwner + ' ') : ''}${y.commonNames || y.description}`),
        category: y.foodCategory,
        id: y.fdcId,
        fromApi: true,
        calories: y.foodNutrients.filter(x => x.nutrientNumber == '208')?.[0]?.value || -1,
        servingSize: y.servingSize || 1,
        servingUnit: y.servingSizeUnit || 'servings',
        score: y.score || 0
      }))
      setResults(apiResults)
      setShowBarcode(false)
    } else {
      setBarcodeError(true)
    }
  }

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
        {/* {showBarcode && <View>
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
        </View>} */}
        {(displaySearchState !== '' && results.length === 0) && <View style={tw`w-12/12 justify-center items-center mt-9`}><Text>{displaySearchState}</Text></View>}
        {results.map((r, idx) => {
          return <TouchableOpacity
            key={`food item ${r.name} at index ${idx}`}
            onPress={() => {
              const foodDetailScreen = getMatchingNavigationScreen('FoodDetail', navigator)
              //@ts-ignore
              navigator.navigate(foodDetailScreen, {
                id: r.fromApi ? undefined : r.id,
                api_id: r.fromApi ? r.id : undefined,
                category: r.category, mealId: props.mealId
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
      {/* @ts-ignore */}
      <Overlay disablePadding visible={showBarcode} onDismiss={setShowBarcode}>
        <BarcodeScannerView
          onScanAgain={() => {
            setBarcode(null)
            setBarcodeError(false)
          }}
          barcode={barcode}
          style={{ ...tw``, width: s.width, height: s.height * 0.35 }}
          onBarcodeScanned={async (code) => {
            if (!code) return;
            setBarcode(code || null)
            await searchBarcode(code)
          }} />
          {barcodeError && <Text lg weight='bold' style={{alignSelf: 'center', color: _tokens.error}}>No results found for barcode</Text>}
      </Overlay>
      <FAB onPress={() => {
        setShowBarcode(true)
        setBarcodeError(false)
      }} icon={() => {
        if (showBarcode) {
          return <ExpoIcon name='close' iconName='ion' color='white' size={23} />
        }
        return <Icon name='Scan' color='white' weight='bold' size={24} />
      }} style={{
        ...tw`items-center justify-center`, width: 55, height: 55, position: 'absolute',
        margin: 15,
        right: 0,
        padding: 0,
        bottom: 0,
        backgroundColor: _tokens.primary900
      }} />
    </View>
  )
}


interface BarcodeScannerViewProps {
  style?: any;
  shouldStillScan?: boolean;
  waitBetweenScans?: number;
  onBarcodeScanned: (code: string | undefined) => void;
  barcode?: string | null | undefined;
  onScanAgain?: () => void;
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
  let isScanning = !props.barcode

  //@ts-ignore
  const handleBarCodeScanned = async ({ type, data }) => {
    if (!props.barcode) {
      props.onBarcodeScanned && props.onBarcodeScanned(data)
    }


  };
  const opacity = useSharedValue(0);

  // Set the opacity value to animate between 0 and 1
  opacity.value = withRepeat(
    withTiming(0.8, { duration: 2000, easing: Easing.ease }),
    isScanning ? -1 : 0,
    true
  );

  const avStyle = useAnimatedStyle(() => isScanning ? ({ opacity: opacity.value }) : ({ opacity: 1 }), [isScanning]);
  if (hasPermission === null) {
    return <Text style={tw`text-center mt-6`}>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text style={tw`text-center mt-6`}>We don't have your camera access, please go to your settings and grant permission!</Text>;
  }

  return <View style={[{ flex: 1 }, tw``]}>
    <BarCodeScanner
      style={props.style || tw`h-50 w-12/12 self-center`}
      onBarCodeScanned={handleBarCodeScanned}
    />
    <Animated.View style={[{ position: 'absolute', alignSelf: 'center', top: isScanning ? 70 : 40 }, avStyle]}>
      {!isScanning && <Text style={tw`text-white text-center`} weight='bold' xl>Scanned!</Text>}
      <ExpoIcon name='barcode' iconName='matc' size={150} color={_tokens.white} />
      {!isScanning && <TouchableOpacity style={tw`self-center flex-row items-center`} onPress={props.onScanAgain}>
            <Icon name='Scan' weight='bold' color='white' size={30} />
            <Text style={tw`text-white`} weight='bold' lg> Scan Again</Text>
          </TouchableOpacity>}
    </Animated.View>
    

  </View>

}