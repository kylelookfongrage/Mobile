import { Dimensions, ScrollView, useColorScheme } from 'react-native'
import React, { useMemo, useState } from 'react'
import { ChartContainer } from './Chart'
import { VictoryLine, VictoryBar, VictoryLabel, VictoryChart, VictoryTheme, VictoryAxis, LineSegment, VictoryVoronoiContainer, VictoryContainer } from "victory-native";
import tw from 'twrnc'
import { _tokens } from '../../tamagui.config';
import { View, Text, SafeAreaView } from '../base/Themed';
import { useNavigation } from '@react-navigation/native';
import { Modal } from 'react-native-ui-lib';
import { useGet } from '../../hooks/useGet';
import Overlay from '../screens/Overlay';
import ManageButton from './ManageButton';
import Spacer from '../base/Spacer';

let defaultData = [
    {quarter: 1, earnings: 13000},
    {quarter: 2, earnings: 16500},
    {quarter: 3, earnings: 14250},
    {quarter: 4, earnings: 19000}
  ]

export interface IChartProps {
    data?: any[];
    x?: string;
    y?: string;
    yTickValues?: any[];
    xTickValues?: any[];
    lineColor?: string
    containerLabels?: ((point: any, index: number, points: any[]) => string) | undefined;
    ytickCount?: number | undefined;
    xtickCount?: number | undefined;
    xDomain?: [number, number];
    yDomain?: [number, number];
    xTick?: any[] | ((tick: any, index: number, ticks: any[]) => string | number) | undefined
    yTick?: any[] | ((tick: any, index: number, ticks: any[]) => string | number) | undefined;
    rotatedX?: boolean
}

const LineChart = (props: {
    title?: string;
    w?: number;
    hideDetails?: boolean;
    disableContainer?: boolean;
} & IChartProps) => {
    let w = Dimensions.get('screen').width
    let data = useMemo(() => (props.data || defaultData), [props.data])
    let dm = useColorScheme() === 'dark'
    let n = useNavigation()
    let [showDetails, setShowDetails] = useState<boolean>(false);
  return (
    <ChartContainer title={props.title} w={props.w || w} style={tw``} buttonOnPress={() => {
        if (props.hideDetails) return;
        setShowDetails(true)
        // n.navigate('LineChartData', {...props})
    }} buttonText={props.hideDetails ? undefined : 'View Details'}>
        <View style={tw`self-center -mt-2  items-center justify-center`}>
            <LineChartDisplay _disableContainer={props.disableContainer} {...props} data={data} w={w} />
        </View>
        <LineChartDataView {...props} data={data} w={w} visible={showDetails} onDismiss={setShowDetails} />
    </ChartContainer>
  )
}

export default LineChart;


export const LineChartDisplay = (props: {
    w: number
    _disableContainer?: boolean;
} & IChartProps) => {
    let g = useGet()
    return <VictoryChart containerComponent={props._disableContainer ? <VictoryContainer /> :
    <VictoryVoronoiContainer
    //@ts-ignore
      labels={props.containerLabels ? (p) => props.containerLabels(p) : ({ datum }) => {
        console.log(datum)
        return `${datum.x}, ${datum.y}`
      }}
    />
  }  height={260} width={props.w * 0.98} theme={VictoryTheme.material}>
          <VictoryLine style={{data: {stroke:(props.lineColor || _tokens.primary900)}}} height={260} width={props.w * 0.98} interpolation={'cardinal'} animate data={props.data} x={props.x || 'quarter'} y={props.y || 'earnings'} />
          {/* X Axis  */}
          <VictoryAxis tickLabelComponent={<VictoryLabel angle={props.rotatedX ? -45 : 0} style={{textAnchor: props.rotatedX ? 'end' : 'middle', fontSize: 12, fontFamily: 'Urbanist_600SemiBold', fill: g.dm ? 'white' : 'black'}} />} tickFormat={props.xTick || undefined} style={{ticks: {opacity: 0}}} tickCount={props.xtickCount || undefined} tickValues={props.xTickValues || undefined} crossAxis axisComponent={<LineSegment active={false} style={{opacity: 1}} />} gridComponent={<LineSegment active={false} style={{opacity: 0}} />}  />
          {/* Y Axis  */}
          <VictoryAxis tickLabelComponent={<VictoryLabel style={{textAnchor: 'middle', fontSize: 12, fontFamily: 'Urbanist_600SemiBold', fill: g.dm ? 'white' : 'black'}} />} domain={{x: props.yDomain !== undefined ? props.yDomain : undefined}}  tickFormat={props.yTick || undefined} tickCount={props.ytickCount || undefined} tickValues={props.yTickValues || undefined} style={{ticks: {opacity: 0}}} dependentAxis crossAxis axisComponent={<LineSegment active={false} style={{opacity: 0}} />} gridComponent={<LineSegment active={false} style={{opacity: 0}} />}  />
        </VictoryChart>
}


export const LineChartDataView = (props: {
    visible?: boolean
    onDismiss?: (b: boolean) => void;
    title?: string;
    w: number
} & IChartProps) => {
    let g = useGet();
    return <Overlay visible={props.visible} onDismiss={() => {props.onDismiss && props.onDismiss(false)}}>
        <ManageButton title={props.title || 'Chart Details'} buttonText=' ' />
            <Spacer />
        <ScrollView showsVerticalScrollIndicator={false}>
           <View style={tw`self-center items-center justify-center`}>
           <LineChartDisplay _disableContainer={false} {...props} />
           </View>
           <ManageButton buttonText=' ' title='Data' />
           <Spacer />
           {props.containerLabels && (props.data || [])?.map((x, i) => {
            let datum = {}
            datum[props.x] = x[props.x]
            datum[props.y] = x[props.y]
            return <View style={tw`flex-row items-center justify-between mb-2`} key={`Chart Data ${props.x}x${props.y}-${i}`}>
                <Text weight='bold' lg>{datum[props.x]}</Text>
                <Text>{datum[props.y]}</Text>
            </View>
           })}
           <Spacer xl/>
           <Spacer xl />
        </ScrollView>
    </Overlay>
}