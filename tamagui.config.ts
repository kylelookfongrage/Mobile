// the v2 config imports the css driver on web and react-native on native

// for reanimated: @tamagui/config/v2-reanimated

// for react-native only: @tamagui/config/v2-native

import { config } from '@tamagui/config'
import { shorthands } from '@tamagui/shorthands'
import { themes as TH, tokens as T } from '@tamagui/themes'



import { createTamagui, createFont, createTokens } from 'tamagui'


let urbanist = createFont({
  family: 'Urbanist_400Regular',
  size: {
    1: 18,
    2: 14,
    3: 12,
    4: 10,
    h1: 48,
    h2: 40,
    h3: 32,
    h4: 24,
    h5: 20,
    h6: 18

  },
  // lineHeight: {
  //   // 1 will be 22
  //   2: 22,
  //   h1: 50
  // },
  weight: {
    1: '400',
    2: '500',
    // 2 will be 300
    3: '600',
    4: '700',
    h1: '700',
    h2: '600',
    h3: '600',
    h4: '600',
    h5: '500',
    h6: '500'
  },
  // letterSpacing: {
  //   1: 0,
  //   // 3 will be -1
  // },
  // (native) swap out fonts by face/style
  face: {
    400: { normal: 'Urbanist_400Regular', italic: 'Urbanist_400Regular_Italic' },
    500: { normal: 'Urbanist_500Medium', italic: 'Urbanist_500Medium_Italic' },
    600: { normal: 'Urbanist_600SemiBold', italic: 'Urbanist_600SemiBold_Italic' },
    700: { normal: 'Urbanist_700Bold', italic: 'Urbanist_700Bold_Italic' },
  },

})

export const _tokens = {
  primary900: '#1946FF',
    primary800: '#3059FF',
    primary700: '#476BFF',
    primary600: '#5E7EFF',
    primary500: '#7590FF',
    primary400: '#8CA3FF',
    primary300: '#A3B5FF',
    primary200: '#BAC8FF',
    primary100: '#D1DAFF',
    primary50: '#E8EDFF',
    secondary900: '#0006B1',
    secondary800: '#1A1FB9',
    secondary700: '#3338C1',
    secondary600: '#4D51C8',
    secondary500: '#666AD0',
    secondary400: '#8083D8',
    secondary300: '#999BE0',
    secondary200: '#B3B4E8',
    secondary100: '#CCCDEF',
    secondary50: '#E6E6F7',
    info: '#235DFF',
    success: '#12D18E',
    warning: '#FACC15',
    error: '#F75555',
    lightBg: '#D8D8D8',
    darkBg: '#070707',
    buttonBg: '#1438CC',
    gray900: '#212121',
    gray800: '#424242',
    gray700: '#616161',
    gray600: '#757575',
    gray500: '#9E9E9E',
    gray400: '#BDBDBD',
    gray300: '#E0E0E0',
    gray200: '#EEEEEE',
    gray100: '#F5F5F5',
    gray50: '#FAFAFA',
    dark1: '#0D0E10',
    dark2: '#1E2025',
    dark3: '#1F222A',
    dark4: '#262A35',
    dark5: '#35383F',
    white: '#FFFFFF',
    black: '#000000',
    red: '#F44336',
    pink: '#E91E63',
    purple: '#9C27B0',
    deepPurple: '#673AB7',
    indigo: '#3F51B5',
    blue: '#2196F3',
    lightBlue: '#03A9F4',
    cyan: '#00BCD4',
    teal: '#009688',
    green: '#4CAF50',
    lightGreen: '#8BC34A',
    lime: '#CDDC39',
    yellow: '#FFEB3B',
    amber: '#FFC107',
    orange: '#FF9800',
    deepOrange: '#FF5722',
    brown: '#795548',
    blueGray: '#607D8B',
    bgBlue: '#F0F3FF',
    bgGreen: '#EFF9F5',
    bgPurple: '#F7ECFF',
    bgRed: '#FFEFEE',
    bgTeal: '#EDF7F6',
    bgBrown: '#F8F3F1',
    bgYellow: '#FFFCEB',
    bgOrange: '#FFF7EB',
    tBlue: '#1946FF20',
    tGreen: '#34B27D20',
    tPurple: '#9610FF20',
    tRed: '#FE332320',
    tTeal: '#1A998E20',
    tBrown: '#A4634D20',
    tYellow: '#FFD30020',
    tOrange: '#F8930020'
};

let tokens = createTokens({
  ...T, color: _tokens
})



const tamaguiConfig = createTamagui(
  {
    ...config,
    fonts: {
      body: urbanist, heading: urbanist
    }, tokens
  })
// this makes typescript properly type everything based on the config

type Conf = typeof tamaguiConfig

declare module 'tamagui' {

  interface TamaguiCustomConfig extends Conf { }

}
export default tamaguiConfig
// depending on if you chose tamagui, @tamagui/core, or @tamagui/web

// be sure the import and declare module lines both use that same name
