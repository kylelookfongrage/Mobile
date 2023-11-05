import { Dimensions, Image, RefreshControl, useColorScheme, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { Text, View } from '../../components/base/Themed'
import { BackButton } from '../../components/base/BackButton'
import tw from 'twrnc'
import { useCommonAWSIds } from '../../hooks/useCommonContext'
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler'
import * as WebBrowser from 'expo-web-browser'
import { DataStore, Predicates, Storage } from 'aws-amplify'
import { Meal, MealProgress, Payouts, User, Workout, WorkoutPlay } from '../../aws/models'
import { Checkbox, Divider } from 'react-native-paper'
import moment from 'moment'
import { defaultImage, isStorageUri } from '../../data'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useNavigation } from '@react-navigation/native'
import { Env } from '../../env'
import { ExpoIcon } from '../../components/base/ExpoIcon'

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
  console.log(dest)
  const [payout, setPayout] = useState<Payouts | undefined>(undefined)
  const [status, setStatus] = useState<string>('')
  const [recipt, setRecipt] = useState<string>('')
  const [uploading, setUploading] = useState<boolean>(false)

  React.useEffect(() => {
    const getStripeDetailsForPayout = async () => {
      if (!payout || !payout.stripeId) return;
      const stripePayout = await getPayout(payout.stripeId)
      if (!stripePayout['destination_payment']) {
        alert('There was a problem geting this payout\'s information')
      }
      setStatus(stripePayout['destination_payment']['paid'] === true ? "Paid" : "Processing")
      setRecipt(stripePayout['destination_payment']['receipt_url'])
    }
    getStripeDetailsForPayout()
  }, [payout])
  React.useEffect(() => {
    if (!id) return;
    const prepare = async () => {
      const pt = await DataStore.query(Payouts, id)
      setPayout(pt)
    }
    prepare()
  }, [])

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
            console.log(recipt)
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
  const { status, userId } = useCommonAWSIds()
  const [stripeResponse, setStripeResponse] = useState<any>(null)
  const [stripeEnabled, setStripeEnabled] = useState<boolean>(false)
  const [destinationObject, setDestinationObject] = useState<string>('')
  const [bankAccount, setBankAccount] = useState<boolean>(false)
  const [lastFour, setLastFour] = useState<string>('')
  const [bankName, setBankName] = useState<string>('')
  const [uploading, setUploading] = useState<boolean>(false)
  const [payouts, setPayouts] = useState<Payouts[]>([])
  const navigator = useNavigation()
  const [refreshing, setRefresing] = useState<boolean>(false)
  const [outstandingPayouts, setOutstandingPayouts] = useState<Payouts[]>([])

  //TODO: Make stripeId object on user, how do we automate payouts? Add payouts table

  const getStripeStatus = async (stripeId: string) => {
    let res2 = await getAccountDetailsFromStripe(stripeId)
    let awsId = res2.metadata?.awsId
    const enabled = res2.payouts_enabled!!
    setStripeEnabled(enabled)
    const user = await DataStore.query(User, userId)
    if (user && !user.stripeEnabled) {
      await DataStore.save(User.copyOf(user, x => {
        x.stripeEnabled = enabled
      }))
    }
    let banks = res2.external_accounts?.data || []
    let currentBank = banks[0]
    if (currentBank) {
      setDestinationObject(currentBank.account)
      setBankAccount(currentBank.object === 'bank_account')
      setBankName(currentBank.object === 'card' ? currentBank.brand : currentBank.bank_name)
      setLastFour(currentBank.last4)
    }
  }

  React.useEffect(() => {
    setUploading(true)
    DataStore.query(User, userId).then(u => {
      if (!u) return
      if (u.stripeId) {
        getStripeStatus(u.stripeId).then(() => { })
      }
      setUploading(false)
    })
  }, [])

  const prepare = async () => {
    setRefresing(true)
    const workoutData = await DataStore.query(Workout, x => x.and(wo => [
      wo.userID.eq(userId), wo.name.ne(''), wo.premium.eq(true),
      wo.createdAt.ge(moment().subtract(30, 'days').format('YYYY-MM-DD'))
    ]))
    const mealData = await DataStore.query(Meal, x => x.and(m => [
      m.userID.eq(userId), m.premium.eq(true), m.name.ne(''), m.public.eq(true),
      m.createdAt.ge(moment().subtract(30, 'days').format('YYYY-MM-DD'))
    ]))
    const workoutsWithData = await Promise.all(workoutData.map(async workout => {

      const usages = (await DataStore.query(WorkoutPlay, x => x.and(wp => [
        wp.date.ge(moment().startOf('month').format('YYYY-MM-DD')),
        wp.date.le(moment().endOf('month').format('YYYY-MM-DD')),
        wp.WorkoutPlayDetails.workoutID.eq(workout.id),
        wp.userID.ne(userId)
      ]))).length
      const usage = usages
      let image = workout.img || defaultImage
      if (isStorageUri(image)) {
        image = await Storage.get(image)
      }

      return {
        name: workout.name,
        id: workout.id,
        image: image,
        usage: usage
      }
    }))
    const mealsWithData = await Promise.all(mealData.map(async meal => {
      let obj = {
        name: meal.name,
        id: meal.id,
        image: defaultImage,
        usage: 0
      }
      const usages = (await DataStore.query(MealProgress, x => x.and(mp => [
        mp.or(x => [x.mealID.eq(meal.id), x.initialMeal.eq(meal.id)]),
        mp.progressDate.ge(moment().startOf('month').format('YYYY-MM-DD')),
        mp.progressDate.le(moment().endOf('month').format('YYYY-MM-DD')),
        mp.userID.ne(userId)
      ]))).length
      obj.usage = usages
      let img = meal.preview || defaultImage
      obj.image = isStorageUri(img) ? await Storage.get(img) : img

      return obj
    }))
    const pts = await DataStore.query(Payouts, x => x.and(p => [
      p.userID.eq(userId)//, p.amount.ne(0)
    ]), {
      sort: x => x.createdAt('DESCENDING'),
    })
    setRefresing(false)
    setOutstandingPayouts(pts.filter(x => (!x.stripeId && !x.paidDate)))
    setPayouts(pts.slice(0, 19))
    setWorkouts(workoutsWithData)
    setMeals(mealsWithData)
  }
  const {creatorTerms} = {creatorTerms: false}
  const outstandingPayoutAmount = outstandingPayouts.reduce((prev, curr) => prev + (curr.amount || 0), 0)

  React.useEffect(() => {
    setUploading(true)
    if (!stripeEnabled) return;
    if (stripeEnabled) {
      prepare().then(_ => {
        setUploading(false)
      })
    }
  }, [stripeEnabled])


  interface ActivityDisplay {
    name: string,
    usage: number,
    image: string,
    id: string;
  }
  const [workouts, setWorkouts] = useState<ActivityDisplay[]>([])
  const [meals, setMeals] = useState<ActivityDisplay[]>([])

  const onBankPress = async () => {
    setUploading(true)
    let stripeId = ''
    let user = await DataStore.query(User, userId)
    if (!user) return;
    if (user.stripeId) {
      stripeId = user.stripeId
    } else {
      const createAccountObj = await createStripeAccount(userId)
      stripeId = createAccountObj.id
      await DataStore.save(User.copyOf(user, u => {
        u.stripeId = createAccountObj.id
      }))
    }
    const res = await createStripeAccountLink(stripeId)
    const accountLink = res.url
    await WebBrowser.openBrowserAsync(accountLink)
    await getStripeStatus(stripeId)
    setUploading(false)
  }

  const dm = useColorScheme() === 'dark'

  const onFinalizePress = async () => {
    setUploading(true)
    const res = await createPayout(outstandingPayoutAmount * 100, destinationObject)
    if (res['error']) {
      alert(res['error']['message'] || 'There was a problem processing this payout')
      setUploading(false)
      return;
    }
    let paidDate = moment().format('YYYY-MM-DD')
    let stripePayoutId = res.id
    for (var payout of outstandingPayouts) {
      const ogPayout = await DataStore.query(Payouts, payout.id)
      if (ogPayout) {
        await DataStore.save(Payouts.copyOf(ogPayout, x => {
          x.paidDate=paidDate;
          x.stripeId=stripePayoutId
        }))
      }
    }
    await prepare()
  }
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false)
  console.log(creatorTerms)
  const onAcceptTerms = async () => {
    setUploading(true)
    try {
      const user = await DataStore.query(User, userId)
      if (!user) {
        alert('There was a problem, please try again')
        return;
      }
      const id = await DataStore.save(User.copyOf(user, x => {
        x.accepted_content_creator_terms=true;
      }))
      console.log(id.id)
    } catch (error) {
      alert('There was a problem')
      setUploading(false)
    }
    setUploading(false)
  }
  if (!creatorTerms) {
    return <View style={{flex: 1}} includeBackground>
      <BackButton />
      <View style={tw`px-6 py-4`}>
      <Text style={tw`text-xl`} weight='bold'>Content Creator Sign-Up</Text>
      <Text style={tw`text-gray-500 my-3`}>By signing up as a content creator, you are agreeing to abide by the {<Text style={tw`text-red-500`} weight='semibold'>terms and conditions</Text>} of content creators. You may not upload other people's content as your own!</Text>
      <View key={'accept-terms'} style={tw`flex-row items-center max-w-12/12`}>
            <Checkbox.Android status={acceptedTerms ? 'checked' : 'unchecked'} color='red' uncheckedColor='gray' onPress={() => {
                setAcceptedTerms(!acceptedTerms)
            }} />   
            <Text style={tw`max-w-10/12 text-gray-500`}>I accept</Text>
        </View>
        {acceptedTerms && <View style={tw`py-5 w-12/12 items-center px-7 flex-row justify-center`}>
                    <TouchableOpacity
                        disabled={uploading}
                        onPress={() => {
                            onAcceptTerms()
                        }}
                        style={tw`bg-${dm ? 'red-600' : "red-500"} mr-2 px-5 h-12 justify-center rounded-full`}>
                        {!uploading && <Text numberOfLines={1} style={tw`text-center text-white`} weight='semibold'>Finish</Text>}
                        {uploading && <ActivityIndicator />}
                    </TouchableOpacity>
                </View>}
      </View>
    </View>
  }

  return (
    <View style={{ flex: 1 }} includeBackground>
      <BackButton />
      <ScrollView style={tw`px-4 pt-6`} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={prepare} />} showsVerticalScrollIndicator={false}>
        <Text style={tw`text-lg`} weight='semibold'>{stripeEnabled ? 'Creator Portal' : 'Become a Personal Trainer or Food Professional'}</Text>
        {!stripeEnabled && <Text style={tw`mt-2`}>Please validate your banking info.</Text>}
        {stripeEnabled && <Text style={tw`mt-2`}>If you need to update your Stripe account, you can do so at the link below:</Text>}
        <View style={tw`w-12/12 justify-center items-center`}>
          {(bankName!! && lastFour!!) && <View style={tw`p-5 w-7/12 mb-2 mt-4 rounded-xl bg-${dm ? 'gray-500' : 'red-200'}`}>
            <Text>{bankAccount ? 'Bank Account' : 'Debit Card'}</Text>
            <Text weight='semibold'>{bankName}</Text>
            <View style={tw`p-3 items-end rounded-xl`}>
              <Text style={tw`text-black`}>****{lastFour}</Text>
            </View>
            {!stripeEnabled && <Text style={tw`text-red-500 text-center`} weight='semibold'>Not Complete!</Text>}
          </View>}
          <TouchableOpacity disabled={uploading} onPress={onBankPress} style={tw`mt-6 mb-4 bg-red-500 mx-9 rounded-xl p-3 justify-center items-center`}>
            {!uploading && <Text style={tw`text-white`}>{stripeEnabled ? 'Update' : 'Add'} Banking Info</Text>}
            {uploading && <ActivityIndicator />}
          </TouchableOpacity>
        </View>
        <Text style={tw`text-gray-500 text-xs text-center`}>You will be redirected to Stripe</Text>
        {stripeEnabled && <View>
          <Divider style={tw`bg-gray-500 my-6`} />
          <Text style={tw`text-lg`} weight='semibold'>Usage Information</Text>
          <Text style={tw`text-center text-xs text-gray-500 mt-3`}>This includes workouts and meals that are premium for the month by other users</Text>
          {workouts.length > 0 && <Text weight='semibold' style={tw`my-4`}>Workouts</Text>}
          {workouts.map(wo => {
            return <View key={wo.id} style={tw`flex-row items-center my-2`}>
              <Image source={{ uri: wo.image }} style={tw`h-15 w-15 rounded-xl`} />
              <View style={tw`ml-4`}>
                <Text weight='semibold'>{wo.name}</Text>
                <Text>Used {wo.usage} times</Text>
              </View>
            </View>
          })}
          {meals.length > 0 && <Text weight='semibold' style={tw`my-4`}>Meals</Text>}
          {meals.map(wo => {
            return <View key={wo.id} style={tw`flex-row items-center my-2`}>
              <Image source={{ uri: wo.image }} style={tw`h-15 w-15 rounded-xl`} />
              <View style={tw`ml-4`}>
                <Text weight='semibold'>{wo.name}</Text>
                <Text>Used {wo.usage} times</Text>
              </View>
            </View>
          })}
          <Text weight='semibold' style={tw`mt-6 text-lg`}>Payouts</Text>
          <Text style={tw`text-gray-500 text-xs text-center mt-3`}>Payouts are made on the 16th of each month, creators get a prorated percentage Rage's profits.</Text>
          {payouts.map((payout, i) => {
            console.log(payout.id)
            if (!payout.activityEnd || !payout.activityStart) return;
            return <TouchableOpacity onPress={() => {
              //@ts-ignore
              navigator.navigate('PayoutDetail', { id: payout.id, dest: destinationObject })
            }} key={payout.id} style={tw`my-2 mx-4 mt-4 px-3 py-4 bg-gray-${dm ? '600' : '300'} rounded-xl`}>
              <View style={tw`flex-row items-center justify-between`}>
                <Text weight='semibold'>Payout {payouts.length - i}</Text>
                <Text>{moment(payout.activityStart).format('MMM/Do')} - {moment(payout.activityEnd).format('MMM/Do')}</Text>
              </View>
              <View style={tw`flex-row items-center justify-around mt-3`}>
                <Text style={tw`text-lg`} weight='semibold'>${payout.amount || 0}</Text>
                <CenteredVerticalDisplay title='Meals' desc={payout.mealActivity?.toFixed() || ''} />
                <CenteredVerticalDisplay title='Workouts' desc={payout.workoutActivity?.toFixed() || ''} />
              </View>
              <Text style={tw`text-center mt-3 text-${payout.stripeId ? 'green' : 'red'}-500`} weight='semibold'>{payout.stripeId ? 'Paid' : 'Unpaid'}</Text>
            </TouchableOpacity>
          })}
        </View>}
        <View style={tw`h-60`} />
      </ScrollView>
      {outstandingPayoutAmount > 4.99 && <View style={[
        {
          position: 'absolute',
          bottom: 10,
          flex: 1
        },
        tw`w-12/12`
      ]}>
        {/* Add Food Button */}
        <View style={tw`py-5 w-12/12 items-center px-7 flex-row justify-center`}>
          <TouchableOpacity disabled={uploading === true} onPress={onFinalizePress} style={tw`bg-${dm ? 'red-600' : "red-500"} mr-2 px-5 h-12 justify-center rounded-full`}>
            {!uploading && <Text numberOfLines={1} style={tw`text-center text-white`} weight='semibold'>Cash Out</Text>}
            {uploading && <ActivityIndicator />}
          </TouchableOpacity>
        </View>
      </View>}
    </View>
  )
}

interface CenteredVerticalDisplayProps { title: string; desc: string; }
const CenteredVerticalDisplay = (props: CenteredVerticalDisplayProps) => {
  const { title, desc } = props;
  return <View style={tw`mx-2 p-2 items-center justify-center`}>
    <Text weight='semibold'>{title}</Text>
    <Text>{desc}</Text>
  </View>
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