import { Dimensions, useColorScheme } from 'react-native'
import { ChartMapping, getFormattedDate, toHHMMSS } from '../../data'
import useAsync from '../../hooks/useAsync'
import { ExerciseDao } from '../../types/ExerciseDao'
import { View, Text } from '../base/Themed'
import React, { useEffect, useState } from 'react'
import tw from 'twrnc'
import {
    LineChart
} from "react-native-chart-kit";
import moment from 'moment'
import Spacer from '../base/Spacer'
import { useSelector } from '../../redux/store'

export default function ExerciseProgress(props: {
    exerciseId: number
    excludeList?: boolean;
    width?: number
}) {
    let dao = ExerciseDao()
    const dm = useColorScheme() === 'dark'
    const { profile } = useSelector(x => x.auth)
    let [chartMapping, setChartMapping] = useState<{ [k: string]: ChartMapping }>({})
    const [chartTitle, setChartTitle] = useState<string>('Weight')
    const [metric, setMetric] = useState<boolean>(false)
    const [chartSuffix, setChartSuffix] = useState<string>(profile?.metric ? 'kgs' : 'lbs')
    const chartConfig = {
        backgroundGradientFrom: tw`bg-gray-800`.backgroundColor,
        backgroundGradientFromOpacity: 0,
        backgroundGradientTo: tw`bg-gray-800`.backgroundColor,
        backgroundGradientToOpacity: 0,
        color: (opacity = 1) => `rgba(240, 43, 43, ${opacity})`,
        strokeWidth: 2, // optional, default 3
        decimalPlaces: 0,
        propsForLabels: {
            stroke: tw`text-gray-500`.color,
            scale: 0.7,
        },
    };
    const sortedChart = Object.values(chartMapping).sort((a, b) => {
        var c = new Date(a.date);
        var d = new Date(b.date);
        //@ts-ignore
        return c - d;
    })

    const sortedChartLabels = sortedChart.filter((x, i) => i < 8).map(x => getFormattedDate(new Date(x.date)))
    useAsync(async () => {
        let sets = await dao.exercise_progress(props.exerciseId, profile?.id)
        if (sets) setChartMapping(sets[0])
        if (sets && sets[1] ===true) {
            setMetric(true)
            if (chartSuffix==='lbs') setChartSuffix('kgs')
        }
    }, [])
    if (chartTitle === '' || sortedChartLabels.length === 0 || sortedChart.length === 0) return <View>
        <Text weight='bold' h5>Progress</Text>
        <Text style={tw`my-3 text-gray-500 text-center`} weight='semibold'>No progress to display</Text>
    </View>
    return (
        <View>
            <View style={tw`flex-row items-center justify-between`}>
                <Text h5 weight='bold'>{chartTitle} Progress</Text>
                <View style={tw`flex-row items-center justify-evenly`}>
                    {['Weight', 'Reps', 'Time'].map(x => {
                        if (chartTitle === x) return <View key={x} />
                        return <Text onPress={() => {
                            setChartTitle(x)
                            if (x === 'Weight') setChartSuffix(metric ? 'kgs' : "lbs")
                            if (x === 'Reps') setChartSuffix('')
                            if (x === 'Time' && sortedChart[0]) setChartSuffix('m')
                        }} key={x} style={tw`mx-4 text-red-600`} weight='semibold'>{x}</Text>
                    })}
                </View>
            </View>
            <View card style={tw`items-center justify-center p-6 rounded-xl my-4`}>
                {/* @ts-ignore */}
                <LineChart chartConfig={chartConfig} yAxisSuffix={chartSuffix} data={{
                    labels: sortedChartLabels,
                    datasets: [
                        {
                            data: sortedChart.filter((x, i) => i < 8).map(x => {
                                if (chartTitle === 'Weight') return Math.round(x.weight)
                                if (chartTitle === 'Reps') return Math.round(x.reps)
                                return Math.round(x.secs / 60)
                            })
                        }
                    ]

                }}
                    width={props.width || Dimensions.get("window").width - 25} // from react-native
                    height={220}
                    style={tw``}
                    withInnerLines={false}
                    withOuterLines={false}
                    bezier />
            </View>
            <Spacer />
            <Text style={tw`text-xs text-gray-500 text-center mx-12 pb-2`}>This chart shows your progress for the 8 most recent days you have performed this exercise</Text>
            <Spacer />
            {(props.excludeList ? [] : sortedChart).map((x, i) => {
                let isLast = i === sortedChart.length - 1
                let borderStyle = isLast ? '' : `border-b border-gray-${dm ? '800' : '300'}`
                return <View key={x.date} style={tw`my-1 ${borderStyle} p-3`}>
                    <Text style={tw`text-gray-500`} weight='bold'>{moment(new Date(x.date)).format('LL')}</Text>
                    <View style={tw`flex-row items-center justify-evenly mt-3`}>
                        <View style={tw`items-center justify-center`}>
                            <Text weight='semibold'>{x.weight}</Text>
                            <Text style={tw`text-xs text-gray-500`}>Max Weight</Text>
                        </View>
                        <View style={tw`items-center justify-center`}>
                            <Text weight='semibold'>{x.reps}</Text>
                            <Text style={tw`text-xs text-gray-500`}>Max Reps</Text>
                        </View>
                        <View style={tw`items-center justify-center`}>
                            <Text weight='semibold'>{toHHMMSS(x.secs)}</Text>
                            <Text style={tw`text-xs text-gray-500`}>Max Time</Text>
                        </View>
                    </View>
                </View>
            })}
        </View>
    )
}