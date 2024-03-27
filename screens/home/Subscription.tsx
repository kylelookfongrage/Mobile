import React, { useState } from 'react'
import { TouchableOpacity, useColorScheme, Platform } from 'react-native'
import { Text, View } from '../../components/base/Themed'
import { BackButton } from '../../components/base/BackButton'
import { ScrollView } from 'react-native-gesture-handler'
import tw from 'twrnc'
import team from '../../assets/animations/collaborate.json'
import AnimatedLottieView from 'lottie-react-native'
import { titleCase } from '../../data'
import Purchases, { PurchasesPackage, PurchasesPromotionalOffer, PurchasesStoreProduct } from 'react-native-purchases'
import { ActivityIndicator } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useDispatch, useSelector } from '../../redux/store'
import { updateUserState } from '../../redux/reducers/auth'
import { _tokens } from '../../tamagui.config'
import { useGet } from '../../hooks/useGet'
import { XStack } from 'tamagui'
import Spacer from '../../components/base/Spacer'

export default function Subscription() {
  const navigator = useNavigation()
  const { subscribed, hasSubscribedBefore } = useSelector(x => x.auth)
  let dispatch = useDispatch()
  let g = useGet()
  let setSubscribed = (b: boolean) => dispatch(updateUserState({key: 'subscribed', value: b}))
  const freeTier: PurchasesPackage = {
    identifier: 'free-tier',
    //@ts-ignore
    packageType: 'FREE',
    //@ts-ignore
    product: {
      description: 'Free Access to Rage, no premium features',
      priceString: 'Free',
      title: 'Rage Basic'
    },
    offeringIdentifier: ''
  }
  const [selectedTier, setSelectedTier] = useState<PurchasesPackage>(freeTier)
  const [purchasePackages, setPurchasePackages] = useState<PurchasesPackage[]>([])
  const dm = useColorScheme() === 'dark'

  React.useEffect(() => {
   async function prepare(){
    try {
      const offerings = await Purchases.getOfferings();
      if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
        const packages = offerings.current.availablePackages
        setPurchasePackages(packages)
        setSelectedTier(freeTier)

      }
    } catch (e) {
      console.log(e)
     alert('There was a problem, please check your internet connection')
     //@ts-ignore
     navigator.pop()
    }
   }
   prepare()
  }, [])
  const [uploading, setUploading] = useState<boolean>(false)
  const [discountedProduct, setDiscountedProduct] = useState<PurchasesStoreProduct | null>(null)

  async function purchasePressed(){
    if (selectedTier.identifier === freeTier.identifier) return; 
    console.log(selectedTier)
    console.log(discountedProduct || 'THERE IS NO DISCOUNTED PRODUCT')
    setUploading(true)
    try {
      let paymentDiscount: PurchasesPromotionalOffer | undefined = undefined
      if (discountedProduct && discountedProduct.discounts && !hasSubscribedBefore) {
        console.log('Here')
        const disc = await Purchases.getPromotionalOffer(discountedProduct, discountedProduct.discounts[0]);
        if (disc) {
          paymentDiscount=disc;
        }
      }

      console.log(paymentDiscount && discountedProduct ? 'getting discounted product' : 'regular priced products')
      const {customerInfo, productIdentifier} = (paymentDiscount && discountedProduct) ? 
         await Purchases.purchaseDiscountedProduct(discountedProduct, paymentDiscount)
         : 
         await Purchases.purchasePackage(selectedTier)
      console.log(productIdentifier)
      if (typeof customerInfo.entitlements.active['pro'] !== "undefined") {
        setSubscribed(true)
      }
    } catch (error) {
      console.log(error)
      setUploading(false)
      //@ts-ignore
      if (error.userCancelled) return;
      //@ts-ignore
      alert(`There was a problem: ${error.toString()}`)
    }
  }
  
  return (
    <View style={{ flex: 1 }} includeBackground>
      <BackButton name='Rage Premium' Right={() => {
        return <TouchableOpacity disabled={(subscribed || uploading)} onPress={async () => {
          setUploading(true)
          try {
            await Purchases.restorePurchases()
          } catch (error) {
            //@ts-ignore
            alert(error.toString())
          }
          setUploading(false)
        }}>
          {!uploading && <Text style={{color: _tokens.primary900, paddingRight: 12}} weight='bold'>{subscribed ? '': 'Restore Purchases'}</Text>}
          {(uploading && !subscribed) && <ActivityIndicator />}
        </TouchableOpacity>
      }} />
      <ScrollView style={tw`px-4 pt-2`} showsVerticalScrollIndicator={false} contentContainerStyle={tw`items-center`}>
        {!subscribed && <View style={tw`justify-center w-12/12 items-center`}>
          <AnimatedLottieView autoPlay loop source={team} style={tw`h-50 w-50 mb-2`} />
        <Text style={tw`text-center mb-4`} h4 weight='semibold'>Support Food Professionals, Personal Trainers, and Yourself</Text>
        <View style={tw`items-center`}>
          {[freeTier, ...purchasePackages].map(t => {
            const selected = t.identifier === selectedTier?.identifier
            const description = t.product.description
            const title = t.product.title
            const price = t.product.priceString
            let discount: {numPeriods: number; period: string; price: string} | null = null
            if (t.product.discounts) {
              let discountObj = t.product.discounts[0]
              if (discountObj) {
                let duration = discountObj.periodNumberOfUnits
                let unitOfTime = titleCase(discountObj.periodUnit)
                let discountPrice = discountObj.priceString
                discount = {numPeriods: duration, period: unitOfTime, price: discountPrice}
              }
            }
            const unselectedColor = dm ? _tokens.dark1 : _tokens.gray300
            const selectedColor = _tokens.primary900
            let showDiscount = (discount && !hasSubscribedBefore) 
            return <TouchableOpacity onPress={() => { 
              if (discount) {
                setDiscountedProduct(t.product)
              }else {
                setDiscountedProduct(null)
              }
              setSelectedTier(t)
             }} style={{...tw`py-3 px-1 mx-1 justify-between rounded-xl`, backgroundColor: selected ? selectedColor : unselectedColor, width: g.s.width * 0.90, marginBottom: 10}} key={t.identifier}>
              <View style={tw`px-4 justify-between`}>
                <View>
                  <Text xl weight='bold' style={tw`${selected ? 'text-white' : ''}`}>{title}</Text>
                  <Spacer xs/>
                 <XStack>
                 {(price && price !== 'Free') && <Text weight='semibold' style={tw`${selected ? 'text-white' : ''} ${showDiscount ? 'line-through' : ''}`}>{price} </Text>}
                  {(showDiscount && discount) && <Text weight='bold' style={{color: selected ? _tokens.white : _tokens.primary900}}>{discount?.price} ({discount.numPeriods} {discount.period})</Text>}
                 </XStack>
                  <Text style={tw`${selected ? 'text-white' : ''}`}>{description}</Text>
                </View>
              </View>
            </TouchableOpacity>
          })}
        </View>
        {(selectedTier.identifier !== freeTier.identifier && !subscribed) && <TouchableOpacity disabled={uploading} onPress={purchasePressed} style={tw`mt-9 bg-red-500 w-8/12 p-3 items-center rounded-xl`}>
            {!uploading && <Text style={tw`text-white`} weight='semibold'>Change Plan</Text>}
            {uploading && <ActivityIndicator />}
          </TouchableOpacity>}
          </View>
          }
          {subscribed && <View>
              <Text style={tw`text-lg`} weight='semibold'>Cancel Your Subscription</Text>
              <Text>To manage your subscription, please visit settings in your {Platform.OS === 'ios' ? 'App Store' : 'Google Play Store'} app.</Text>
            </View>}
      </ScrollView>
    </View>
  )
}