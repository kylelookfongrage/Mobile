/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */

import { Storage } from 'aws-amplify';
import { useEffect, useState } from 'react';
import { Text as DefaultText, View as DefaultView, Image as DefaultImage} from 'react-native';
import { SafeAreaView as DefaultSafeAreaView } from 'react-native-safe-area-context';

import Colors from '../constants/Colors';
import { isStorageUri } from '../data';
import useColorScheme from '../hooks/useColorScheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme();
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

interface WeightProps{
  weight?: 'thin' | 'extralight' | 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black'
}


export type TextProps = ThemeProps & DefaultText['props'] & WeightProps ;
export type ViewProps = ThemeProps & DefaultView['props'];
export type ImageProps = ThemeProps & DefaultImage['props']

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, weight, ...otherProps } = props;
  let font = 'Poppins_400Regular'
  switch (weight) {
    case 'thin': 
      font = 'Poppins_100Thin'
      break;
    case 'extralight': 
      font = 'Poppins_200ExtraLight'
      break;
    case 'medium': 
      font = "Poppins_500Medium"
      break;
    case 'semibold': 
      font = 'Poppins_600SemiBold'
      break;
    case 'bold' : 
      font = 'Poppins_700Bold';
      break;
    case 'extrabold' : 
      font = 'Poppins_800ExtraBold';
      break;
    case 'black': 
      font = 'Poppins_900Black';
      break;
    default: 
      break;
  }
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return <DefaultText style={[{ color, fontFamily: font }, style]} {...otherProps} />;
}
interface ViewProps2 extends ViewProps {
  includeBackground?: boolean
}
export function View(props: ViewProps2) {
  const { style, lightColor, darkColor, includeBackground, ...otherProps } = props;
  const backgroundColor = includeBackground ? useThemeColor({ light: lightColor, dark: darkColor }, 'background') : '';

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}


export function SafeAreaView(props: ViewProps2) {
  const { style, lightColor, darkColor, includeBackground, ...otherProps } = props;
  const backgroundColor = includeBackground ? useThemeColor({ light: lightColor, dark: darkColor }, 'background') : '';

  return <DefaultSafeAreaView style={[{ backgroundColor }, style]} {...otherProps} />;
}

