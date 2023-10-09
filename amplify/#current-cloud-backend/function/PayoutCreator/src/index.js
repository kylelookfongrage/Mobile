/*
Use the following code to retrieve configured secrets from SSM:

const aws = require('aws-sdk');

const { Parameters } = await (new aws.SSM())
  .getParameters({
    Names: ["stripe_id"].map(secretName => process.env[secretName]),
    WithDecryption: true,
  })
  .promise();

Parameters will be of the form { Name: 'secretName', Value: 'secretValue', ... }[]
*/
/* Amplify Params - DO NOT EDIT
  API_RAGE_GRAPHQLAPIENDPOINTOUTPUT
  API_RAGE_GRAPHQLAPIIDOUTPUT
  API_RAGE_GRAPHQLAPIKEYOUTPUT
  ENV
  REGION
Amplify Params - DO NOT EDIT */

/*
PayoutCreator: Will create the payout objects, on command, for the current month. 
If there are already payouts created, it will delete all of the current payouts
It will then get activity for all premium meals and workouts
It will populate a users table with all of the activity for meals and workouts
It will fetch the amount of the balance in Stripe
It will then create a payout object for each user with the 

*/

const fetch = require('node-fetch')
const dayjs = require('dayjs')
const GRAPHQL_ENDPOINT = process.env.API_RAGE_GRAPHQLAPIENDPOINTOUTPUT;
const GRAPHQL_API_KEY = process.env.API_RAGE_GRAPHQLAPIKEYOUTPUT;
const end_date = dayjs().date(15)
const end_date_AWS_string = end_date.format('YYYY-MM-DD')
const start_date = end_date.subtract('1', 'month').date(15)
const start_date_AWS_string = start_date.format('YYYY-MM-DD')
console.log('Starting on: ' + start_date_AWS_string)
console.log('Ending On on: ' + end_date_AWS_string)
const mealQuery = /* GraphQL */ `
query MealActivity {
  listMeals(filter: {premium: {eq: true}}) {
    items {
      id
      userID
      MealProgresses(filter: {progressDate: {ge: "${start_date_AWS_string}", le: "${end_date_AWS_string}"}}) {
        items {
          id
          userID
        }
      }
    }
  }
}
`;

const workoutQuery = /* GraphQL */ `
query WorkoutActivity {
  listWorkouts(filter: {premium: {eq: true}}) {
    items {
      WorkoutPlays(filter: {date: {ge: "${start_date_AWS_string}", le: "${end_date_AWS_string}"}}) {
        items {
          id
          userID
        }
      }
      id
      userID
    }
  }
}
`;

const currentPayoutsQuery = /* GraphQL */ `
query CurrentPayouts {
  listPayouts(filter: {and: {activityEnd: {le: "${end_date_AWS_string}"}, activityStart: {ge: "${start_date_AWS_string}"}}}) {
    items {
      id
      _version
      _deleted
    }
  }
}
`;

const existingPayoutsQuery = /* GraphQL */ `
query ExistingPayouts {
  listPayouts(filter: {stripeId: {attributeExists: false}}) {
    items {
      id
      amount
      _deleted
      userID
    }
  }
}
`;




/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
  const options = (query) => ({
    method: 'POST',
    headers: {
      'x-api-key': GRAPHQL_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  });
  let body = 'Nothing here'
  let status_code = 200
  let stripeUrl = 'https://api.stripe.com/v1/balance'

  try {
    let currentPayoutsRes = await fetch(GRAPHQL_ENDPOINT, options(currentPayoutsQuery))
    const currentPayoutsJSON = await currentPayoutsRes.json()
    let payouts = currentPayoutsJSON['data']?.['listPayouts']?.['items']
    if (!payouts) {
      throw Error('Cannot find payouts')
    }

    for (var payout of payouts) {
      const id = payout['id']
      const version = payout['_version']
      const deleted = payout['_deleted']
      if (deleted) {
        continue;
      }
      console.log('deleting ' + id)
      if (!id) throw Error('Cannot find ID for payouts')
      const deleteQuery = /* GraphQL */`
      mutation deleteCurrentPayout {
        deletePayouts(input: {id: "${id}", _version: ${version}}){
          id
        }
      }
      `
      const r = await fetch(GRAPHQL_ENDPOINT, options(deleteQuery))
      const payoutJSON = await r.json()
      if (payoutJSON.errors?.length > 0) {
        console.log('Error occured posting')
        console.log(res.errors)
        throw Exception('There was a problem posting the workouts')
      }
    }

    let balance = -1
    const stripeRes = await fetch(stripeUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_ID}`,
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
    }})
    const stripeJson = await stripeRes.json()
    if (stripeJson['available']) {
      const usd = (stripeJson['available'].filter(x => x.currency === 'usd') || [])
      if (usd.length > 0) {
        balance = (usd[0].amount) / 100
      }
    } else {
      throw Error('No balance available')
    }
    const existingReq = await fetch(GRAPHQL_ENDPOINT, options(existingPayoutsQuery))
    const existingJson = await existingReq.json()
    const existingPayouts = existingJson['data']?.['listPayouts']?.['items']
    if (existingPayouts) {
      for (var payout of existingPayouts) {
        const amt = payout['amount']
        if (payout['_deleted']) {
          continue
        }
        console.log(`existing payout of ${amt} will be deducted from balance`)
        if (amt) {
          balance = balance - amt
        }
      }
    }
    const meals = await fetch(GRAPHQL_ENDPOINT, options(mealQuery))
    const mealBody = await meals.json();
    let data = mealBody['data']['listMeals']['items']
    if (!mealBody) {
      throw Error('There is no body for the meals')
    }
    let userTable = {}
    for (var meal of data) {
      const mealUser = meal['userID']
      const activityArr = meal['MealProgresses']?.['items']
      if (activityArr.length > 0) {
        const total = activityArr.filter(x => x['userID'] !== mealUser).length
        userTable[mealUser] = {...userTable[mealUser], mealActivity: (userTable[mealUser]?.mealActivity + total) || total}
      }
    }

    const workoutResult = await fetch(GRAPHQL_ENDPOINT, options(workoutQuery))
    const workoutJSON = await workoutResult.json()
    const workouts = workoutJSON['data']['listWorkouts']['items']
    if (!workouts) {
      throw Error('There are no workouts for the request')
    }
    for (var workout of workouts) {
      const workoutUser = workout['userID']
      const activityArr = workout['WorkoutPlays']?.['items']
      if (activityArr.length > 0) {
        const total = activityArr.filter(x => x['userID'] !== workoutUser).length
        userTable[workoutUser] = {...userTable[workoutUser], workoutActivity: (userTable[workoutUser]?.workoutActivity + total) || total}
      }
    }
    console.log(userTable)
    const totalActivity = Object.values(userTable).reduce((a, b) => a + ((b.mealActivity || 0) + (b.workoutActivity || 0)), 0);
    console.log('Total Activity: ' + totalActivity)
    for (let key in userTable) {
      const activity = userTable[key]
      const workoutActivity = Number(activity.workoutActivity) || 0
      const mealActivity = Number(activity.mealActivity) || 0
      console.log(`meal: ${mealActivity}, workout: ${workoutActivity}`)
      const ratio = (mealActivity + workoutActivity) / (totalActivity || 1)
      const payoutAmount = getStripeAmount(balance * ratio)
      console.log(`User ${key} will get the amount ${payoutAmount}, due to ratio ${ratio} and activity ${mealActivity + workoutActivity}`)
      let gql =  /* GraphQL */ `
      mutation PayoutInsert {
        createPayouts(input: {activityStart: "${start_date_AWS_string}", activityEnd: "${end_date_AWS_string}", userID: "${key}", amount: ${payoutAmount}, mealActivity: ${mealActivity}, workoutActivity: ${workoutActivity}}){
          id
        }
      }
    ` 
      const res = await fetch(GRAPHQL_ENDPOINT, options(gql))
      if (res.errors?.length > 0) {
        console.log('Error occured posting')
        console.log(res.errors)
        throw Exception('There was a problem posting the workouts')
      }
    }
    body = userTable
  } catch (error) {
    status_code = 500
    body = error.toString()
  }

  return {
    statusCode: status_code,
    body: JSON.stringify(body),
  };
};




const getStripeAmount = (desiredAmt) => {
  let fee = 2 // monthly user fee
  fee += 0.25 // payout fee
  let payoutPercentage = 0.25
  let date = new Date()
  if(date.getMonth() === 11){
      fee += 3 // tax fee
  }
  let variable = payoutPercentage/100
  let amountWithoutFees = desiredAmt / (1+variable / 100) - (fee)
  return amountWithoutFees < 0 ? 0 : amountWithoutFees
}