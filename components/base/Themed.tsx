/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */

import { Text as DefaultText, View as DefaultView, Image as DefaultImage} from 'react-native';
import { SafeAreaView as DefaultSafeAreaView } from 'react-native-safe-area-context';
import { TamaguiComponent, TamaguiComponentPropsBase, Text as TamaguiText } from 'tamagui';

import Colors from '../../constants/Colors';
import useColorScheme from '../../hooks/useColorScheme';
import tw from 'twrnc'
import React from 'react';

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

interface HeadlingProps {
  xs?: boolean; h3?: boolean; h2?: boolean; h1?: boolean
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
export type ViewProps = ThemeProps & DefaultView['props'] & {card?: boolean, translucent?: boolean};
export type ImageProps = ThemeProps & DefaultImage['props']

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, weight, ...otherProps } = props;
  
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  let fontSize = null
  if (props.xs) fontSize='$4'
  if (props.h3) fontSize='$h3'
  if (props.h2) fontSize='$h2'
  if (props.h1) fontSize='$h1'

  return <TamaguiText color={color} style={style} {...otherProps} fontSize={fontSize} />;
}
interface ViewProps2 extends ViewProps {
  includeBackground?: boolean
}
export function View(props: ViewProps2) {
  const { style, lightColor, darkColor, includeBackground, ...otherProps } = props;
  const dm = useColorScheme() === 'dark'
  let backgroundColor = includeBackground ? useThemeColor({ light: lightColor, dark: darkColor }, 'background') : '';
  if (props.card) {
    backgroundColor = dm ? Colors.dark.card : Colors.light.card
  }
  if (props.translucent) {
    backgroundColor += '99'
  }

  return <DefaultView style={[{ backgroundColor: backgroundColor }, style]} {...otherProps} />;
}


export function SafeAreaView(props: ViewProps2) {
  const { style, lightColor, darkColor, includeBackground, ...otherProps } = props;
  const backgroundColor = includeBackground ? useThemeColor({ light: lightColor, dark: darkColor }, 'background') : '';
  return <DefaultSafeAreaView style={[{ backgroundColor, flex: 1 }, style]} {...otherProps} />;
}
