/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */

import { Text as DefaultText, View as DefaultView, Image as DefaultImage} from 'react-native';
import { SafeAreaView as DefaultSafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { TamaguiComponent, TamaguiComponentPropsBase, Text as TamaguiText } from 'tamagui';

import Colors from '../../constants/Colors';
import useColorScheme from '../../hooks/useColorScheme';
import tw from 'twrnc'
import React, { useMemo } from 'react';
import { _tokens } from '../../tamagui.config';
import { useGet } from '../../hooks/useGet';

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
  primary?: boolean; gray?: boolean; error?: boolean; warning?: boolean; inverted?: boolean
}

interface HeadlingProps {
  xl?: boolean;
  lg?: boolean;
  sm?: boolean;
  xs?: boolean; 
  h6?: boolean
  h5?: boolean
  h4?: boolean
  h3?: boolean; 
  h2?: boolean; 
  h1?: boolean
  medium?: boolean; regular?: boolean; thin?: boolean; extralight?: boolean; semibold?: boolean; bold?: boolean; extrabold?: boolean; blackWeight?: boolean;
  center?: boolean; left?: boolean; right?: boolean;
  white?: boolean
}


// Urbanist_400Regular,
//   Urbanist_400Regular_Italic,
//   Urbanist_500Medium,
//   Urbanist_500Medium_Italic,
//   Urbanist_600SemiBold,
//   Urbanist_600SemiBold_Italic,
//   Urbanist_700Bold,
//   Urbanist_700Bold_Italic

export type TextProps = ThemeProps & DefaultText['props'] & WeightProps & HeadlingProps ;
export type ViewProps = ThemeProps & DefaultView['props'] & {card?: boolean, translucent?: boolean; safeAreaBottom?: boolean, safeAreaTop?: boolean};
export type ImageProps = ThemeProps & DefaultImage['props']

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, weight, ...otherProps } = props;
  let font = 'Urbanist_500Medium'

  if (weight === 'thin' || props.thin) {
    font = 'Urbanist_400Regular'
  } else if (weight === 'extralight' || props.extralight) {
    font = 'Urbanist_400Regular'
  } else if (weight === 'medium' || props.medium) {
    font = "Urbanist_500Medium"
  } else if (weight === 'regular' || props.regular) {
    font = "Urbanist_500Medium"
  } else if (weight === 'semibold' || props.semibold) {
    font = 'Urbanist_600SemiBold'
  } else if (weight === 'bold' || props.bold){
    font = 'Urbanist_700Bold';
  } else if (weight === 'extrabold' || props.extrabold) {
    font = 'Urbanist_700Bold';
  } else if (weight === 'black' || props.blackWeight) {
    font = 'Urbanist_700Bold';
  }

  let g = useGet();
  let color = useMemo(() => {
    if (props.white) return _tokens.white
    if (props.primary) return _tokens.primary900;
    if (props.gray) return _tokens.gray500
    if (props.error) return _tokens.error;
    if (props.warning) return _tokens.warning;
    if (props.inverted) return g.dm ? _tokens.black : _tokens.white
    return g.dm ? _tokens.white : _tokens.black
  }, [props.primary, props.white, props.gray, props.warning, props.error, props.inverted, g.dm])
  let fontSize = 14
  if (props.xs) fontSize=10
  if (props.sm) fontSize=12
  if (props.lg) fontSize=16
  if (props.xl) fontSize=18
  if (props.h6) fontSize=18
  if (props.h5) fontSize=20
  if (props.h4) fontSize=24
  if (props.h3) fontSize=32
  if (props.h2) fontSize=40
  if (props.h1) fontSize=48
  return <DefaultText style={[{ color, fontFamily: font, fontSize, ...tw`${props.center ? 'text-center' : (props.right ? 'text-right' : (props.left ? 'text-left' : ''))}` }, style]} {...otherProps} />;
}

interface ViewProps2 extends ViewProps {
  includeBackground?: boolean
}
export function View(props: ViewProps2) {
  const { style, lightColor, darkColor, includeBackground, ...otherProps } = props;
  const dm = useColorScheme() === 'dark'
  let insets = useSafeAreaInsets()
  let backgroundColor = includeBackground ? (dm ? _tokens.darkBg : _tokens.lightBg) : '';
  if (props.card) {
    backgroundColor = dm ? _tokens.dark1 : _tokens.gray100
  }
  if (props.translucent) {
    backgroundColor += '99'
  }

  return <DefaultView style={[{ backgroundColor: backgroundColor, ...(props.safeAreaTop ? {paddingTop: insets.top} : {}),  ...(props.safeAreaBottom ? {paddingBottom: insets.bottom} : {}) }, style]} {...otherProps} />;
}


export function SafeAreaView(props: ViewProps2) {
  const { style, lightColor, darkColor, includeBackground, ...otherProps } = props;
  let dm = useColorScheme() === 'dark'
  const backgroundColor = includeBackground ? (dm ? _tokens.darkBg : _tokens.lightBg) : '';
  return <DefaultSafeAreaView style={[{ backgroundColor, flex: 1 }, style]} {...otherProps} />;
}
