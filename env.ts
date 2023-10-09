import Constants from 'expo-constants';
import {
  APPLE_AD_UNIT,
  AWS_AMPLIFY_CONFIG,
  DEFAULT_IMAGE_URI,
  EDAMAM_API_KEY,
  EDAMAM_PROJECT_ID,
  GOOGLE_AD_UNIT,
  OPENAI_API_KEY,
  REVENUE_CAT_ANDROID_KEY,
  REVENUE_CAT_APPLE_KEY,
  STRIPE_API_KEY,
  SUPABASE_URL,
  SUPABASE_KEY
  //@ts-ignore
} from '@env'; // have to configure dotenv in app config, have to add to .babelrc.js


const config = {
  APPLE_AD_UNIT, AWS_AMPLIFY_CONFIG, DEFAULT_IMAGE_URI, 
  EDAMAM_API_KEY, EDAMAM_PROJECT_ID, GOOGLE_AD_UNIT, 
  OPENAI_API_KEY, REVENUE_CAT_ANDROID_KEY, 
  REVENUE_CAT_APPLE_KEY, STRIPE_API_KEY, SUPABASE_URL, SUPABASE_KEY
}


function getApiUrl(name: string) {
  //@ts-ignore  what I want                             for dev           just in case
  const VALUE = Constants?.expoConfig?.extra?.[name] || config?.[name] || process.env?.[name];
  return VALUE;
}

export const Env = {
    STRIPE_API_KEY: getApiUrl('STRIPE_API_KEY'),
    REVENUE_CAT_APPLE_KEY: getApiUrl('REVENUE_CAT_APPLE_KEY'),
    REVENUE_CAT_ANDROID_KEY: getApiUrl('REVENUE_CAT_ANDROID_KEY'),
    OPENAI_API_KEY: getApiUrl('OPENAI_API_KEY'),
    EDAMAM_PROJECT_ID: getApiUrl('EDAMAM_PROJECT_ID'),
    EDAMAM_API_KEY: getApiUrl('EDAMAM_API_KEY'),
    DEFAULT_IMAGE_URI: getApiUrl('DEFAULT_IMAGE_URI'),
    AWS_AMPLIFY_CONFIG: getApiUrl('AWS_AMPLIFY_CONFIG'),
    GOOGLE_AD_UNIT: getApiUrl('GOOGLE_AD_UNIT'),
    APPLE_AD_UNIT: getApiUrl('APPLE_AD_UNIT'),
    SUPABASE_URL: getApiUrl('SUPABASE_URL'),
    SUPABASE_KEY: getApiUrl('SUPABASE_KEY')
};
