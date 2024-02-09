import { View, Text } from '../base/Themed'
import React from 'react'
import { Dimensions, useColorScheme } from 'react-native';
import tw from 'twrnc'
import { _tokens } from '../../tamagui.config';
import Spacer from '../base/Spacer';
import { LineChart } from 'react-native-chart-kit';
import ManageButton from './ManageButton';

const Chart = () => {
    const chartConfig = {
        backgroundGradientFrom: tw`bg-gray-800`.backgroundColor,
        backgroundGradientFromOpacity: 0,
        backgroundGradientTo: tw`bg-gray-800`.backgroundColor,
        backgroundGradientToOpacity: 0,
        color: (opacity = 1) => _tokens.primary900 ,
        strokeWidth: 1, // optional, default 3
        decimalPlaces: 0,
        propsForLabels: {
            stroke: tw`text-gray-500`.color,
            scale: 0.9,
            strokeWidth: 0.8,
        },
        propsForDots: {
            r: '3'
        },
        // propsForBackgroundLines: {
        //     stroke: _tokens.gray500 + 30,
        //     strokeDashArray: undefined
        // }
    };
    let dm = useColorScheme() === 'dark'
    let s = Dimensions.get('screen')
    let w = s.width - 10
    return (
        <View style={{width: w, marginHorizontal: 5, backgroundColor: dm ? _tokens.dark1 : _tokens.gray200, ...tw`rounded-xl`}}>
            <Spacer />
            <ManageButton viewStyle={tw`px-4`} title='Weight Goal (lbs)' buttonText=' ' />
            <Spacer divider />
            {/* @ts-ignore */}
            <LineChart getDotColor={(d, i) => (i === 3 ? _tokens.white : _tokens.primary900)} chartConfig={chartConfig} data={{
                // labels: ['1', '2', '3', '4', '5', '6', '7', '8', 9, 10, 11, 12],
                labels: ['M', 'T', 'W', 'Th', 'F', 'S', 'Su',],
                datasets: [{
                    // data: [20, 30, 25, 35, 40, 34, 31, 32, 33,33,33,33]
                    data: [20, 30, 25, 35, 40, 34, 31]
                }]
            }} 
            width={w + 25} // from react-native
                    height={220}
                    style={tw`self-center -ml-1.5`}
                    withInnerLines={false}
                    withOuterLines={false}
                    bezier
            />
            <Spacer sm />
        </View>
    )
}

export default Chart