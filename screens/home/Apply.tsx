import { Dimensions, Image, RefreshControl, useColorScheme, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { Text, View } from '../../components/base/Themed'
import { BackButton } from '../../components/base/BackButton'
import tw from 'twrnc'
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler'
import * as WebBrowser from 'expo-web-browser'
import { Checkbox, Divider } from 'react-native-paper'
import moment from 'moment'
import { defaultImage, isStorageUri } from '../../data'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useNavigation } from '@react-navigation/native'
import { Env } from '../../env'
import { ExpoIcon } from '../../components/base/ExpoIcon'
import { Tables } from '../../supabase/dao'

const Stack = createNativeStackNavigator()
export default function CreatorHub() {
  return <Stack.Navigator>
    <Stack.Group>
      <Stack.Screen name='Hub' component={CreatorScreen} options={{ headerShown: false }} />
      <Stack.Screen name='PayoutDetail' options={{ presentation: 'transparentModal', headerShown: false }}>
        {/* @ts-ignore */}
        {props => <PayoutDetail id={props.route?.params?.id} dest={props.route?.params?.dest} />}
      </Stack.Screen>
    </Stack.Group>
  </Stack.Navigator>
}

function PayoutDetail(props: { id: string, dest: string }) {
  const { id, dest } = props;
  const [payout, setPayout] = useState<any | undefined>(undefined)
  const [status, setStatus] = useState<string>('')
  const [recipt, setRecipt] = useState<string>('')
  const [uploading, setUploading] = useState<boolean>(false)

  // React.useEffect(() => {
  //   const getStripeDetailsForPayout = async () => {
  //     if (!payout || !payout.stripeId) return;
  //     const stripePayout = await getPayout(payout.stripeId)
  //     if (!stripePayout['destination_payment']) {
  //       alert('There was a problem geting this payout\'s information')
  //     }
  //     setStatus(stripePayout['destination_payment']['paid'] === true ? "Paid" : "Processing")
  //     setRecipt(stripePayout['destination_payment']['receipt_url'])
  //   }
  //   getStripeDetailsForPayout()
  // }, [payout])

  // React.useEffect(() => {
  //   if (!id) return;
  //   const prepare = async () => {
  //     const pt = await DataStore.query(Payouts, id)
  //     setPayout(pt)
  //   }
  //   prepare()
  // }, [])

  const dm = useColorScheme() === 'dark'
  const navigator = useNavigation()
  const height = Dimensions.get('screen').height
  return <View style={[{ marginTop: height * 0.30, height: height * 0.70 }, tw`bg-${dm ? 'gray-800' : 'gray-200'} rounded-t-3xl p-6`]}>
    <View style={tw`justify-between h-12/12 pb-9`}>
      {!payout && <Text>There was a problem finding this payout, please check your internet connection and try again</Text>}
      {payout && <View>
        <View style={tw`mb-4 justify-between items-start flex-row`}>
          <View>
            <Text weight='semibold' style={tw`text-lg`}>Payout Details</Text>
            <Text>{moment(payout.activityStart).format('MMM/Do')} - {moment(payout.activityEnd).format('MMM/Do')}</Text>
          </View>
          <TouchableOpacity style={tw`p-2`} onPress={() => {
            //@ts-ignore
            navigator.pop()
          }}>
            <ExpoIcon iconName='feather' name='x-circle' color='gray' size={25} />
          </TouchableOpacity>
        </View>
        <Text style={tw`text-gray-500 text-center py-2 text-xs`}>Please note that tax reporting fees could decrease your payout amount</Text>
        {payout.paidDate && <PayoutDetailLineItem name='Paid' desc={moment(payout.paidDate).format('LL')} />}
        <PayoutDetailLineItem name='Workout Activity' desc={payout.workoutActivity?.toFixed() || ''} />
        <PayoutDetailLineItem name='Meal Activity' desc={payout.mealActivity?.toFixed() || ''} />
        <PayoutDetailLineItem name='Amount' desc={"$" + payout.amount?.toFixed() || ''} />
        {(payout.paidDate && moment(payout.paidDate).month() === 11) && <PayoutDetailLineItem name='Tax Reporting Fee' desc='$2.99' />}
        {payout.stripeId && <View>
          <PayoutDetailLineItem name='Status' desc={status} />
          <Text style={tw`text-center my-4 text-gray-500 text-xs`}>Please allow up to 7 business days for your payout to be sent to the institution provided to Stripe</Text>
          <TouchableOpacity style={tw`p-3`} onPress={async () => {
            if (!recipt) return;
            await WebBrowser.openBrowserAsync(recipt)
          }}>
            <Text style={tw`text-center underline`} weight='semibold'>View Recipt</Text>
          </TouchableOpacity>
        </View>}
      </View>}
      <TouchableOpacity disabled={uploading} style={tw`rounded-xl p-3 mx-9 bg-red-${dm ? '500' : '300'}`} onPress={() => {
        //@ts-ignore
        navigator.pop()
      }}>
        {!uploading && <Text style={tw`text-center`} weight='semibold'>Close</Text>}
        {uploading && <ActivityIndicator />}
      </TouchableOpacity>
    </View>
  </View>
}

function PayoutDetailLineItem(props: { name: string, desc: string }) {
  const { name, desc } = props;
  return <View style={tw`flex-row items-center justify-between my-2`}>
    <Text>{name}</Text>
    <Text>{desc}</Text>
  </View>
}


function CreatorScreen() {
  const [stripeResponse, setStripeResponse] = useState<any>(null)
  const [stripeEnabled, setStripeEnabled] = useState<boolean>(false)
  const [destinationObject, setDestinationObject] = useState<string>('')
  const [bankAccount, setBankAccount] = useState<boolean>(false)
  const [lastFour, setLastFour] = useState<string>('')
  const [bankName, setBankName] = useState<string>('')
  const [uploading, setUploading] = useState<boolean>(false)
  const [payouts, setPayouts] = useState<any[]>([])
  const navigator = useNavigation()
  const [refreshing, setRefresing] = useState<boolean>(false)
  const [outstandingPayouts, setOutstandingPayouts] = useState<any[]>([])


  const onBankPress = async () => {
    setUploading(true)
    // let stripeId = ''
    // const createAccountObj = await createStripeAccount(userId)
    // stripeId = createAccountObj.id
    // await DataStore.save(User.copyOf(user, u => {
    //     u.stripeId = createAccountObj.id
    //   }))
    // }
    // const res = await createStripeAccountLink(stripeId)
    // const accountLink = res.url
    // await WebBrowser.openBrowserAsync(accountLink)
    // await getStripeStatus(stripeId)
    // setUploading(false)
  }

  const onFinalizePress = async () => {
    setUploading(true)
    // const res = await createPayout(outstandingPayoutAmount * 100, destinationObject)
    // if (res['error']) {
    //   alert(res['error']['message'] || 'There was a problem processing this payout')
    //   setUploading(false)
    //   return;
    // }
    // let paidDate = moment().format('YYYY-MM-DD')
    // let stripePayoutId = res.id
    // for (var payout of outstandingPayouts) {
    //   const ogPayout = await DataStore.query(Payouts, payout.id)
    //   if (ogPayout) {
    //     await DataStore.save(Payouts.copyOf(ogPayout, x => {
    //       x.paidDate=paidDate;
    //       x.stripeId=stripePayoutId
    //     }))
    //   }
    // }
    // await prepare()
  }

  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false)
  const onAcceptTerms = async () => {
    setUploading(true)
    try {
      
    } catch (error) {
      alert('There was a problem')
      setUploading(false)
    }
    setUploading(false)
  }

  return <View />
}


export const getFormEncodedBody = (body: any) => {
  let formBody = []
  for (var property in body) {
    var encodedKey = encodeURIComponent(property)
    //@ts-ignore
    var encodedValue = encodeURIComponent(body[property])
    formBody.push(encodedKey + '=' + encodedValue)

  }
  return formBody.join('&')
}


export const createStripeAccountLink = async (id: string) => {
  console.log('Creating link for: ' + id + ' with example likns')
  const url = 'https://api.stripe.com/v1/account_links'
  const body = {
    account: id,
    type: 'account_onboarding',
    refresh_url: 'https://ragemobile.app/returnToApp',
    return_url: 'https://ragemobile.app/returnToApp'
  }
  const formString = getFormEncodedBody(body)
  const res = await fetch(url, {
    headers: { 'Authorization': stripeHeaders.Authorization },
    method: 'post',
    body: formString
  })
  //@ts-ignore
  return await res.json()
}

export const createStripeAccount = async (userId: string) => {
  let url = 'https://api.stripe.com/v1/accounts'
  let body = {
    'type': 'express',
    'country': 'US',
    'metadata[awsId]': userId
  }
  let res = await fetch(url, {
    method: 'POST',
    headers: stripeHeaders,
    body: getFormEncodedBody(body)
  })
  return await res.json();
}


export const getAccountDetailsFromStripe = async (stripeAccountId: string) => {
  let url = 'https://api.stripe.com/v1/accounts/' + stripeAccountId
  let res = await fetch(url, { headers: stripeHeaders })
  return await res.json()
}


export const getPayout = async (payoutId: string) => {
  const url = 'https://api.stripe.com/v1/transfers/' + payoutId + "?expand[]=destination_payment"
  const res = await fetch(url, { headers: stripeHeaders })
  return await res.json()
}

export const createPayout = async (amount: number, dest: string) => {
  const url = 'https://api.stripe.com/v1/transfers'
  const body = {
    amount: amount,
    currency: 'usd',
    destination: dest
  }
  let res = await fetch(url, {
    method: 'POST',
    headers: stripeHeaders,
    body: getFormEncodedBody(body)
  })
  return await res.json()
}


export const stripeHeaders = {
  Authorization: `Bearer ${Env.STRIPE_API_KEY || 'sk_test_51Muh8GIcSSXdXL0WKnxgJs2xUREpH2KPBEEfcc10fntYzkkYmuwgXrcBYbPQD1nNykSkZotKxU0pwzJpwKqDKmOt00pBXM0eTO'}`,
  Accept: 'application/json',
  'Content-Type': 'application/x-www-form-urlencoded',
}