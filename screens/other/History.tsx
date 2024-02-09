import React, { useCallback, useRef, useState } from 'react'
import { View, Text, SafeAreaView } from '../../components/base/Themed'
import TopBar from '../../components/base/TopBar'
import Spacer from '../../components/base/Spacer'
import { XStack, YStack } from 'tamagui'
import { FlatList, ScrollView } from 'react-native'
import { ExerciseTile } from '../workout/WorkoutDetail'
import { formatCash, toHHMMSS } from '../../data'
import Selector from '../../components/base/Selector'
import { useSelector } from '../../redux/store'
import Chart from '../../components/features/Chart'
import Comparison from '../../components/features/Comparison'
import ManageButton from '../../components/features/ManageButton'
import { PageControl } from 'react-native-ui-lib'
import { _tokens } from '../../tamagui.config'
import { MacronutrientBarProgress } from '../../components/features/MacronutrientBar'
import tw from 'twrnc'

const History = () => {
    const searchOptions = ['1W', '1M', '3M', '6M', '1Y', 'YTD']
    const pages = ['Weight', 'Body Fat', 'Workouts', 'Calories']
    //@ts-ignore
    let onViewableItemsChanged = useCallback((k) => {
        let key = k.viewableItems[0].key
        if (!key) return;
        let i = pages.findIndex(x => x === key)
        setSelectedPage(i)
    }, [])
    const viewabilityConfigCallbackPairs = useRef([
        { onViewableItemsChanged },
    ]);

    let [selectedPage, setSelectedPage] = useState<number>(0)
    let [selectedTimeline, setSelectedTimeline] = useState<typeof searchOptions[number]>(searchOptions[0])
    let { profile } = useSelector(x => x.auth)


    return (
        <SafeAreaView edges={['top']} style={{ flex: 1 }} includeBackground>
            <Spacer />
            <TopBar title='History' iconLeft='Chart' />
            <Spacer sm />
            <ScrollView showsVerticalScrollIndicator={false}>
                <XStack justifyContent='space-between' px={4} w={'100%'} alignItems='center'>
                    <ExerciseTile iconName='fa5' icon='running' iconSize={20} title={(0).toString()} desc='workouts' />
                    <ExerciseTile iconName='ion' icon='time-outline' iconSize={20} title={toHHMMSS(([]).reduce((prev, curr) => prev + (curr?.time || 0), 0))} desc='activity' />
                    <ExerciseTile iconName='ion' icon='flame' iconSize={20} title={(0).toString()} desc='calories' />
                </XStack>
                <Spacer />
                <Selector px={4} searchOptions={searchOptions} selectedOption={selectedTimeline} onPress={setSelectedTimeline} />
                <Spacer />
                {/* @ts-ignore */}
                <FlatList viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current} viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }} keyExtractor={(x) => x} showsHorizontalScrollIndicator={false} horizontal pagingEnabled data={pages} renderItem={({ item, index }) => {
                    return <Chart />
                }} />
                <Spacer sm />
                <PageControl enlargeActive color={_tokens.primary900} inactiveColor={_tokens.dark4 + 30} containerStyle={{ borderWidth: 0 }} numOfPages={pages.length} currentPage={selectedPage} />
                <Spacer />
                <Comparison
                    title='Weight Goal'
                    desc='This Week'
                    baselineDesc='Goal Weight' baselineValue={210} baselineSuffix='lbs'
                    secondaryDesc='Difference' secondaryValue={-5} secondarySuffix='lbs'
                    tertiaryDesc='Progress' tertiaryValue={2.3} tertiarySuffix='%'
                />
                <Spacer />
                <Comparison
                    title='Body Fat Goal'
                    desc='This Week'
                    baselineDesc='Goal %' baselineValue={15} baselineSuffix='%'
                    secondaryDesc='Difference' secondaryValue={-0.5} secondarySuffix='%'
                    tertiaryDesc='Progress' tertiaryValue={1} tertiarySuffix='%'
                />
                <Spacer />
                <ManageButton viewStyle={tw`px-4`} title='Macronutrient Targets' buttonText=' ' />
                <Spacer />
                <XStack justifyContent='space-between' alignItems='center' px='$4'>
                    <YStack alignItems='center' maxWidth={'30%'}>
                        <Text h1 weight='bold'>{formatCash(10000)}</Text>
                        <Text lg weight='semibold' style={tw`text-gray-500 text-center`}>Total Caloric Deficit</Text>
                    </YStack>
                    <YStack px='$2'>
                        <MacronutrientBarProgress disableMultiplier protein weight={10} totalEnergy={20} />
                        <MacronutrientBarProgress disableMultiplier carbs weight={10} totalEnergy={50} />
                        <MacronutrientBarProgress disableMultiplier fat weight={30} totalEnergy={100} />
                    </YStack>
                </XStack>
                <Text style={tw`text-gray-500 text-right px-4`}>Average Macronutrient Consumption</Text>
                <Spacer xl />
                <Spacer xl />
                <Spacer xl />
            </ScrollView>

        </SafeAreaView>
    )
}

export default History