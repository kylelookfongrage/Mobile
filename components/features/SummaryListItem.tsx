import React, { useMemo } from "react";
import { Dimensions, ScrollView, TouchableOpacity, useColorScheme } from "react-native";
import { Text, View } from "../base/Themed";
import tw from 'twrnc'
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { _tokens } from "../../tamagui.config";
import { ProgressBar } from 'react-native-ui-lib';
import { FlatList, ListRenderItem } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getMatchingNavigationScreen } from "../../data";

let SummaryListItem = <T extends any>(props: {
    description?: string;
    type?: 'circle-progress' | 'text' | 'progress' | 'list'
    textValue?: string;
    textValue2?: string;
    textValue3?: string;
    suffix2?: string;
    suffix3?: string;
    progressValue?: number;
    progressTotal?: number;
    progressValue2?: number;
    progressTotal2?: number;
    progressAsPercentage?: boolean;
    progressColor?: string;
    progressAsPercentage2?: boolean;
    progressColor2?: string;
    suffix?: string;
    listData?: T[];
    listKeyExtractor?: ((item: T, index: number) => string);
    renderList?: ListRenderItem<T>;
    useMatchingScreen?: boolean;
    title: string;
    screen?: string;
    size?: 'lg' | 'long' | undefined
    color?: string
}) => {
    let s = Dimensions.get('screen')
    let n = useNavigation()
    let size = useMemo(() => {
        let _size = { height: s.height * 0.19, width: s.width * 0.45 }
        if (props.size === 'long' || (props.size === 'lg' && props.type === 'text')) {
            _size.height = s.height * 0.30
        } else if (props.size === 'lg' || props.type === 'list') {
            _size.height = s.height * 0.35
        } else if (props.type === 'progress') {
            _size = { height: s.height * 0.19, width: s.width * 0.45 }
        }
        return { ..._size, maxWidth: _size.width, maxHeight: _size.height }
    }, [props.size, props.type])

    const cpRef = React.useRef<AnimatedCircularProgress | null>(null);
    const cpRef2 = React.useRef<AnimatedCircularProgress | null>(null);
    let [progressValue, progressTotal] = useMemo(() => {
        return [props.progressValue || 0, props.progressTotal || 0]
    }, [props.progressTotal, props.progressValue])
    let [progressValue2, progressTotal2] = useMemo(() => {
        return [props.progressValue2 || 0, props.progressTotal2 || 0]
    }, [props.progressTotal2, props.progressValue2])
    let dm = useColorScheme() === 'dark'

    React.useEffect(() => {
        if (progressTotal && cpRef) {
            cpRef.current?.animate(
                (progressValue / progressTotal) * 100,
                800
            );
        }
    }, [progressValue, progressTotal]);

    React.useEffect(() => {
        if (progressTotal2 && cpRef2) {
            cpRef2.current?.animate(
                (progressValue2 / progressTotal2) * 100,
                800
            );
        }
    }, [progressValue2, progressTotal2]);
    return (
        <TouchableOpacity disabled={!props.screen} onPress={() => {
            if (!props.screen) return;
            let screen = props.useMatchingScreen ? getMatchingNavigationScreen(props.screen, n) : props.screen
            if (screen) { //@ts-ignore
                n.navigate(screen)
            }
        }} style={{ ...size, margin: 8, alignSelf: 'center' }}>
            <View card={!props.color} style={{ width: '100%', height: '100%', ...tw`rounded justify-between`, ...(props.color ? { backgroundColor: props.color } : {}) }}>
                <Text weight="bold" lg style={tw`text-center pt-2`}>
                    {props.title}
                </Text>
                {props.type === 'circle-progress' && <View style={tw`flex-row items-center justify-around`}>
                    <AnimatedCircularProgress
                        size={size.height * 0.6}
                        width={size.height * 0.03}
                        rotation={270}
                        fill={0}
                        style={tw`self-center items-center justify-center`}
                        lineCap="round"
                        tintColor={props.progressColor || '#D22B2B'}
                        backgroundColor={dm ? _tokens.dark2 : _tokens.gray300}
                        ref={cpRef}
                    >
                        {(fill) => (
                            <View style={tw`items-center self-center ${props.progressAsPercentage ? 'flex-row' : ''}`}>
                                <Text h4 weight="black">
                                    {props.progressAsPercentage ? fill.toFixed(0) : progressValue.toFixed()}
                                </Text>
                                {(props.suffix || props.progressAsPercentage) && <Text weight="semibold">{props.progressAsPercentage ? ' %' : props.suffix}</Text>}
                            </View>
                        )}
                    </AnimatedCircularProgress>
                    {(props.progressValue2 && props.progressTotal2) && <AnimatedCircularProgress
                        size={size.height * 0.6}
                        width={size.height * 0.03}
                        rotation={270}
                        fill={0}
                        style={tw`self-center items-center justify-center`}
                        lineCap="round"
                        tintColor={props.progressColor2 || '#D22B2B'}
                        backgroundColor={dm ? _tokens.dark2 : _tokens.gray300}
                        ref={cpRef2}
                    >
                        {(fill) => (
                            <View style={tw`items-center self-center ${props.progressAsPercentage2 ? 'flex-row' : ''}`}>
                                <Text h4 weight="black">
                                    {props.progressAsPercentage2 ? fill.toFixed(0) : progressValue2.toFixed()}
                                </Text>
                                {(props.suffix2 || props.progressAsPercentage2) && <Text weight="semibold">{props.progressAsPercentage2 ? ' %' : props.suffix2}</Text>}
                            </View>
                        )}
                    </AnimatedCircularProgress>}
                </View>}
                {(props.type === 'text' && props.textValue) && <View>
                <Text h1 style={tw`text-center`} weight="bold">
                    {props.textValue}
                    {props.suffix && <Text lg> {props.suffix}</Text>}
                </Text>
                {props.textValue2 && <Text h1 style={tw`text-center`} weight="bold">
                    {props.textValue2}
                    {props.suffix2 && <Text lg> {props.suffix2}</Text>}
                </Text>}
                {props.textValue3 && <Text h1 style={tw`text-center`} weight="bold">
                    {props.textValue3}
                    {props.suffix3 && <Text lg> {props.suffix3}</Text>}
                </Text>}
                    </View>}
                {(props.type === 'progress') && <View>
                <View style={tw`flex-row items-center justify-between px-2 mb-2`}>
                        <Text weight="bold">{props.suffix || 'Progress'}</Text>
                        <Text>{props.progressAsPercentage ? `${(((props.progressValue || 0) / (props.progressTotal || 1)) * 100).toFixed()}%` : `${props.progressValue?.toFixed()} / ${props.progressTotal?.toFixed()}`}</Text>
                    </View>
                    <ProgressBar progress={(((props.progressValue || 0) / (props.progressTotal || 1)) * 100)} progressColor={props.progressColor || _tokens.primary900} style={{...tw`mx-2`, backgroundColor: dm ? _tokens.dark2 : _tokens.gray300}} />
                </View>}
                {(props.type === 'list' && props.listData && props.renderList) && <ScrollView  horizontal scrollEnabled={false}>
                <FlatList style={{width: size.width, marginTop: 10}} keyExtractor={props.listKeyExtractor} data={props.listData} showsVerticalScrollIndicator={false} renderItem={props.renderList} />
                    </ScrollView>}
                <Text sm style={tw`text-center p-2`}>{props.description || ''}</Text>
            </View>
        </TouchableOpacity>
    );
};


export default SummaryListItem