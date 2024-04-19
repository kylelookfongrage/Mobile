import { ScrollView, useColorScheme, TouchableOpacity, ActivityIndicator, Image, TextInput, Dimensions, Pressable } from 'react-native'
import React, { useState } from 'react'
import { Text, View } from '../../components/base/Themed'
import tw from 'twrnc'
import { ExpoIcon, Icon } from '../../components/base/ExpoIcon'
import { OpenFoodFactToFood, OpenFoodFactsBarcodeSearch, OpenFoodFactsRequest, getMatchingNavigationScreen, substringForLists, titleCase } from '../../data'
import { useNavigation } from '@react-navigation/native'
import Barcode from '@kichiyaki/react-native-barcode-generator'
import { BarCodeScanner } from 'expo-barcode-scanner'
import { BackButton } from '../../components/base/BackButton'
import { FAB } from 'react-native-paper'
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
import { supabase } from '../../supabase'
import { useGet } from '../../hooks/useGet'
import { Tables } from '../../supabase/dao'
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
  form?: Tables['food']['Insert']
  barcode?: string;
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
  let g = useGet()
  const [searchKey, setSearchKey] = React.useState<string>('')
  const searchOptions = ['All', 'My Foods'] as const
  const [showBarcode, setShowBarcode] = useState<boolean>(false)
  const [barcode, setBarcode] = React.useState<string | null>(null);
  const [selectedOption, setSelectedOption] = React.useState<typeof searchOptions[number]>(searchOptions[0])
  const userAllergens = profile?.allergens || []
  const [results, setResults] = React.useState<ListFoodSearchResults[]>([])
  const [displaySearchState, setDisplaySearchState] = React.useState('Search for food!')
  let [barcodeError, setBarcodeError] = useState<boolean>(false)
  let dao = SearchDao()


  let search = async (term: string | null) => {
    let _results: ListFoodSearchResults[] = [];
    let fn = supabase.from('food').select('*, author:user_id(username), servingSize:quantity, servingUnit:servingSize').filter('public', 'eq', true)
    if (term) fn = fn.textSearch('name', `${term.split(' ').join(' | ')}`)
    if (selectedOption === 'My Foods' && profile) fn = fn.filter('user_id', 'eq', profile.id)
    setDisplaySearchState('Searching....')
    try {
      g.set('loading', true)
      g.time('food search from db')
      let res = await fn.range(0, 50)
      g.time('food search from db')
      //@ts-ignore
      if (res.data) _results = [..._results, ...res.data]
      if (res.error) throw Error(res.error.message)
      setResults(_results)
      g.set('loading', false)
    } catch (error) {
      g.setFn(p => {
        let og = { ...p }
        return { ...og, loading: false, error: error?.toString() || 'there was a problem' }
      })
    }
  }

  useAsync(async () => {
    search(searchKey)
  }, [searchKey, selectedOption])

  let searchBarcode = async (_barcode: string) => {
    if (barcode) return;
    if (!_barcode) return;
    try {
      g.set('loading', true)
      let res = await supabase.from('food').select('*, author:user_id(username), servingSize:quantity, servingUnit:servingSize')
        .filter('public', 'eq', true).or(`barcode.eq.${barcode},barcode.eq.0${barcode},barcode.eq.00${barcode}`)
      if (res.data && !res.error && res.data.length) {
        g.set('loading', false)
        setResults(res.data)
      } else {
        throw Error(res.error?.message || 'No food found')
      }
      return res.data ? 1 : 0
    } catch (error) {
      g.setFn(p => {
        let og = { ...p }
        return { ...og, loading: false, error: error?.toString() || 'there was a problem' }
      })
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
        {results.map((r, idx) => {
          return <TouchableOpacity
            key={`food item ${r.name} at index ${idx}`}
            onPress={() => {
              const foodDetailScreen = getMatchingNavigationScreen('FoodDetail', navigator)
              //@ts-ignore
              navigator.navigate(foodDetailScreen, {
                id: r.fromApi ? undefined : r.id,
                api_id: r.fromApi ? r.id : undefined,
                category: r.category, mealId: props.mealId, form: r.form
              })
            }}
            style={tw`flex-row items-center px-2 my-3 w-12/12`}>
            <Text h4>{getEmojiByCategory(r.category)}</Text>
            <View style={tw`w-12/12 items-start ml-2`}>
              <Text style={tw`max-w-11/12`} lg weight='semibold'>{r.name}</Text>
              <Text style={tw`text-gray-500`}>{r.calories?.toFixed()} kcal per {r.servingSize?.toFixed()} {r.servingUnit} • {(r.author) ? `@${r.author.username}` : r.barcode ? 'Open Food Facts' : 'Menustat.org'}</Text>
            </View>
          </TouchableOpacity>
        })}
        <View style={tw`pb-40`} />
      </ScrollView>
      {/* @ts-ignore */}
      <Overlay disablePadding visible={showBarcode} dialogueHeight={45} excludeBanner onDismiss={setShowBarcode}>
        <BarcodeScannerView
          onScanAgain={() => {
            setBarcode(null)
            setBarcodeError(false)
          }}
          barcode={barcode}
          style={{ ...tw``, width: s.width, height: s.height * 0.38 }}
          onBarcodeScanned={async (code) => {
            if (!code) return;
            setBarcode(code || null)
            let num = await searchBarcode(code)
            if ((num || 0) > 0) setShowBarcode(false)
          }} />
        {barcodeError && <Text lg weight='bold' style={{ alignSelf: 'center', color: _tokens.error }}>No results found for barcode</Text>}
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
  let scale = useSharedValue(1)


  // Set the opacity value to animate between 0 and 1
  opacity.value = withRepeat(
    withTiming(0.5, { duration: 1800, easing: Easing.ease }),
    isScanning ? -1 : 0,
    true
  );

  scale.value = withRepeat(
    withTiming(0.75, { duration: 2000, easing: Easing.ease }),
    isScanning ? -1 : 0, true
  )

  const avStyle = useAnimatedStyle(() => isScanning ? ({ opacity: opacity.value, transform: [{ scale: scale.value }] }) : ({ opacity: 1 }), [isScanning]);
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
    <Animated.View style={[{ position: 'absolute', alignSelf: 'center', top: isScanning ? 40 : 40, }, avStyle]}>
      {!isScanning && <Text style={tw`text-white text-center`} weight='bold' xl>Scanned!</Text>}
      <ExpoIcon name='barcode' iconName='matc' size={200} color={_tokens.gray500} />
      {isScanning && <ActivityIndicator size={'large'} />}
      {!isScanning && <TouchableOpacity style={tw`self-center flex-row items-center`} onPress={props.onScanAgain}>
        <Icon name='Scan' weight='bold' color='white' size={30} />
        <Text style={tw`text-white`} weight='bold' lg> Scan Again</Text>
      </TouchableOpacity>}
    </Animated.View>


  </View>

}