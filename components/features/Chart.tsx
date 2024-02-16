import { View, Text } from '../base/Themed'
import React, { useMemo } from 'react'
import { Dimensions, useColorScheme } from 'react-native';
import tw from 'twrnc'
import { _tokens } from '../../tamagui.config';
import Spacer from '../base/Spacer';
import { LineChart } from 'react-native-chart-kit';
import ManageButton from './ManageButton';
import { View as DView } from 'react-native';
import { LineChartProps } from 'react-native-chart-kit/dist/line-chart/LineChart';

const Chart = (props: {
    labels?: any[];
    datasets?: number[];
    color?: string;
    title?: string;
    bottomLabel?: string;
    
} & Omit<LineChartProps, 'data' | 'height' | 'width'>) => {
    const chartConfig = {
        backgroundGradientFrom: tw`bg-gray-800`.backgroundColor,
        backgroundGradientFromOpacity: 0,
        backgroundGradientTo: tw`bg-gray-800`.backgroundColor,
        backgroundGradientToOpacity: 0,
        color: (opacity = 1) => (props.color || _tokens.primary900) ,
        strokeWidth: 1, // optional, default 3
        decimalPlaces: 0,
        propsForLabels: {
            stroke: tw`text-gray-500`.color,
            scale: 0.9,
            strokeWidth: 0.8,
        },
        propsForDots: {
            r: '0'
        },
        // propsForBackgroundLines: {
        //     stroke: _tokens.gray500 + 30,
        //     strokeDashArray: undefined
        // }
    };
    let s = Dimensions.get('screen')
    let w = s.width - 10
    let labels = useMemo(() => (props.labels), [props.labels])
    let datasets = useMemo(() => (props.datasets), [props.datasets])
    return (
        <ChartContainer title={props.title}>
            {/* @ts-ignore */}
            <LineChart {...props} getDotColor={(d, i) => (i === 3 ? _tokens.white : _tokens.primary900)} chartConfig={chartConfig} data={{
                // labels: ['1', '2', '3', '4', '5', '6', '7', '8', 9, 10, 11, 12],
                labels: labels || ['M', 'T', 'W', 'Th', 'F', 'S', 'Su',],
                datasets: [{
                    // data: [20, 30, 25, 35, 40, 34, 31, 32, 33,33,33,33]
                    data: datasets || [20, 30, 25, 35, 40, 34, 31]
                }]
            }} 
            width={w + 25} // from react-native
                    height={220}
                    style={tw`self-center ${(labels || []).length > 10 ? '-ml-4' : ''}`}
                    withInnerLines={false}
                    withOuterLines={false}
                    
                    bezier
            />
            <Spacer xs />
            <Text style={tw`text-center`}>{props.bottomLabel}</Text>
            <Spacer sm/>
        </ChartContainer>
    )
}

export const ChartContainer = (props: {w?: number, title?: string; buttonText?: string; buttonOnPress?: () => void;} & DView['props']) => {
    let dm = useColorScheme() === 'dark'
    return <View style={[{width: props.w || Dimensions.get('screen').width - 10, marginHorizontal: 5, backgroundColor: dm ? _tokens.dark1 : _tokens.gray100, ...tw`rounded-xl`}, props.style]}>
        <Spacer />
            <ManageButton viewStyle={tw`px-4`} title={props.title || 'Weight Goal (lbs)'} buttonText={props.buttonText || ' '} onPress={props.buttonOnPress} />
            <Spacer divider />
            <View style={{height: 250, width: props.w || Dimensions.get('screen').width - 10, ...tw`-mt-4 justify-center items-center`}}>
            {props.children}
            </View>
    </View>

}

export default Chart