import React, { useCallback, useMemo, useRef, useState } from 'react'
import { View, Text, SafeAreaView } from '../../components/base/Themed'
import TopBar from '../../components/base/TopBar'
import Spacer from '../../components/base/Spacer'
import { XStack, YStack } from 'tamagui'
import { Alert, Dimensions, FlatList, ScrollView } from 'react-native'
import { ExerciseTile } from '../workout/WorkoutDetail'
import { formatCash, getMacroTargets, toHHMMSS } from '../../data'
import Selector from '../../components/base/Selector'
import { useSelector } from '../../redux/store'
import Chart, { ChartContainer } from '../../components/features/Chart'
import Comparison from '../../components/features/Comparison'
import ManageButton from '../../components/features/ManageButton'
import { PageControl } from 'react-native-ui-lib'
import { _tokens } from '../../tamagui.config'
import { MacronutrientBarProgress } from '../../components/features/MacronutrientBar'
import tw from 'twrnc'
import moment, { Moment } from 'moment'
import useAsync from '../../hooks/useAsync'
import { supabase } from '../../supabase'
import LineChart from '../../components/features/LineChart'
import { useGet } from '../../hooks/useGet'
import { useNavigation } from '@react-navigation/native'

interface IHistoryReport {
    caloric_diff: number; carbs: number; fat: number; progress_date: number; progress_fat: number; progress_weight: number;
    protein: number; sum_weight: number; total_time: number; workouts: number;
}

const History = () => {
    const searchOptions = ['1W', '1M', '6M', 'YTD', '1Y']
    const pages = ['Weight', 'Body Fat', 'Workouts', 'Calories']
    let g = useGet()
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
    let [_results, set_Results] = useState<IHistoryReport[]>([])
    let s = Dimensions.get('screen')
    let w = s.width - 10
    
    let [results, presets] = useMemo(() => {
        let res = [..._results]
        let _presets = {
            date_format: undefined as string | undefined,
            xTickCount: undefined as number | undefined,
            angled: undefined as boolean | undefined,
            desc: 'Past Year' as string
        }
        let _dFilter: Moment;
        if (selectedTimeline === '1W') {
            _dFilter = moment().subtract(1, 'week')
            _presets.date_format = 'ddd'
            _presets.desc = 'This Week'
        }
        else if (selectedTimeline === '1M') {
            _dFilter = moment().subtract(1, 'month')
            _presets.date_format = 'MMM.DD'
            _presets.xTickCount = 6
            _presets.desc = 'This Month'
        }
        else if (selectedTimeline === '6M') {
            _dFilter = moment().subtract(6, 'months')
            _presets.date_format = 'MMM'
            _presets.xTickCount = 6
            _presets.desc = 'Past 6 Months'
        }
        else if (selectedTimeline === 'YTD') {
            _dFilter = moment().startOf('year')
            _presets.date_format = 'MMM'
            _presets.xTickCount = moment().month() + 1
            _presets.angled = true
            _presets.desc = 'Year to Date'
        }
        else {
            _dFilter = moment().subtract(1, 'year');
            _presets.date_format = 'MMM'
            _presets.xTickCount = 12
            _presets.angled = true
        }
        // evaluate the aggregated values for today
        if (!_dFilter) return [res, _presets];
        return [res.filter(x => {
            let d = moment(x.progress_date || '2000-01-01')
            return d.isSameOrAfter(_dFilter)
        }), _presets];
    }, [_results, selectedTimeline])

    let data = useMemo(() => {
        let [protein, carbs, fat, calories, workouts, time, weight, count, minWeight, minFat, maxWeight, maxFat] = [0,0,0,0,0,0,0,0,0,0,0,0];
        if ((results?.length || 0) === 0) return {protein, calories, carbs, fat, workouts, time, weight, count, minWeight, minFat, maxWeight, maxFat}
        results.forEach((result, i) => {
            count += 1;
            protein += result.protein
            calories += result.caloric_diff
            fat += result.fat
            carbs += result.carbs
            weight += result.sum_weight
            time += result.total_time
            workouts += result.workouts
            if (!minWeight) minWeight = result.progress_weight
            if (!minFat) minFat = result.progress_fat
            if (result.progress_weight) maxWeight = result.progress_weight
            if (result.progress_fat) maxFat=result.progress_fat
        })
        
        return {protein: protein / count, carbs: carbs / count, fat: fat / count, calories, workouts, time, weight, count, minWeight, minFat, maxWeight, maxFat}
    }, [results])

    useAsync(async () => {
        g.set('loading', true)
        try {
            if (!profile?.id) return;
            let res = await supabase.rpc('fn_report', {user_id: profile.id})
            if (res.data) set_Results(res.data)
        } catch (error) {
            //@ts-ignore
            g.set('error', error.toString())
        } finally {
            g.set('loading', false)
        }
    }, [])
    
    let {tdee, totalCarbsGrams, totalFatGrams, totalProteinGrams} = getMacroTargets(profile)
    let pageMapping = {
        'Weight': <LineChart w={w} yTickValues={Array(6).fill(0).map((_, i) => ((i + 1) * 50))} xTick={(d) => {
            return moment(d).format(presets.date_format)
        }} disableContainer rotatedX={presets.angled} xtickCount={presets.xTickCount} lineColor={_tokens.primary900} containerLabels={({datum}) => `${datum.progress_date}: ${datum.progress_weight} (${profile?.metric ? 'kgs' : 'lbs'})`} title={`Weight Goal (${profile?.metric ? 'kgs' : 'lbs'})`} data={results} x='progress_date' y='progress_weight' />, 
        'Body Fat': <LineChart w={w} yTickValues={Array(5).fill(0).map((_, i) => ((i + 1) * 10))} xTick={(d) => {
            return moment(d).format(presets.date_format)
        }} disableContainer rotatedX={presets.angled}  xtickCount={presets.xTickCount} containerLabels={({datum}) => `${datum.progress_date}: ${datum.progress_fat}%`} lineColor={_tokens.indigo} title='Fat Goal (%)' data={results} x='progress_date' y='progress_fat' />,
        'Workouts': <LineChart w={w} lineColor={_tokens.amber} xTick={(d) => {
            let m = moment(d)
            return m.format(presets.date_format)
        }} xtickCount={presets.xTickCount} rotatedX={presets.angled}  yTickValues={Array(5).fill(0).map((_, i) => ((i + 1) * 3))} disableContainer containerLabels={({datum}) => `${datum.progress_date}: ${datum.workouts}`} data={results} title='Workouts (completed)' x='progress_date' y='workouts' />, //<Chart title='Workouts' labels={labels} bottomLabel={label} datasets={datasets[selectedTimeline]['workouts']} />, 
        'Calories': <ChartContainer w={w} title='Macronutrient Targets'>
            <XStack w={w} justifyContent='space-between' alignItems='center' px='$4'>
                    <YStack alignItems='center' maxWidth={'30%'}>
                        <Text h2 weight='bold'>{formatCash(data.calories)}</Text>
                        <Text lg weight='semibold' style={tw`text-gray-500 text-center`}>Total Caloric Deficit</Text>
                    </YStack>
                    <YStack px='$2'>
                        <MacronutrientBarProgress disableMultiplier protein weight={data.protein} totalEnergy={totalProteinGrams || 1} />
                        <MacronutrientBarProgress disableMultiplier carbs weight={data.carbs} totalEnergy={totalCarbsGrams || 1} />
                        <MacronutrientBarProgress disableMultiplier fat weight={data.fat} totalEnergy={totalFatGrams || 1} />
                    </YStack>
                </XStack>
                <Text style={{...tw`text-gray-500 text-right px-6`, width: w}}>Average Macronutrient Consumption</Text>
        </ChartContainer>
    }

    let startWeight = data.minWeight ? data.minWeight : (profile?.weight ? profile.weight : 0)
    let currentWeight = data.maxWeight || profile?.weight || 0
    let goalWeight = profile?.weightGoal || 1

    let startFat = data.minFat ? data.minFat : (profile?.startFat ? profile.startFat : 0)
    let currentFat = data.maxFat || profile?.startFat || 0
    let goalFat = profile?.fatGoal || 1 
    let n = useNavigation()
    let editGoal = () => {
        Alert.alert('Update Goal', 'Updating your goal will reset your progress', [
            {text: 'Cancel'},
            {text: 'Continue', onPress: () => n.navigate('Setup')},
        ])
    }

    console.log({startWeight, currentWeight, goalWeight})

    return (
        // @ts-ignore 
        <SafeAreaView edges={['top']} style={{ flex: 1 }} includeBackground>
            <Spacer />
            <TopBar title='History' iconLeft='Chart' />
            <Spacer sm />
            <ScrollView showsVerticalScrollIndicator={false}>
                <XStack justifyContent='space-between' px={4} w={'100%'} alignItems='center'>
                    <ExerciseTile iconName='fa5' icon='running' iconSize={20} title={formatCash(data.workouts) || ''} desc='workouts' />
                    <ExerciseTile iconName='ion' icon='time-outline' iconSize={20} title={toHHMMSS(data.time)} desc='activity' />
                    <ExerciseTile iconName='matc' icon='weight' iconSize={20} title={formatCash(data.weight) || ''} desc='weight' />
                </XStack>
                <Spacer />
                <Selector px={4} searchOptions={searchOptions} selectedOption={selectedTimeline} onPress={setSelectedTimeline} />
                <Spacer />
                {/* @ts-ignore */}
                <FlatList viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current} viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }} keyExtractor={(x) => x} showsHorizontalScrollIndicator={false} horizontal pagingEnabled data={pages} renderItem={({ item, index }) => {
                    //@ts-ignore
                    return pageMapping[item]
                }} />
                <Spacer sm />
                <PageControl enlargeActive color={_tokens.primary900} inactiveColor={_tokens.dark4 + 30} containerStyle={{ borderWidth: 0 }} numOfPages={pages.length} currentPage={selectedPage} />
                <Spacer />
                <Comparison
                    title='Weight Goal'
                    desc={presets.desc}
                    buttonOnPress={editGoal}
                    currentValue={`Weight Goal: ${goalWeight}`}
                    currentValueSuffix={profile?.metric ? 'kgs' : 'lbs'}
                    baselineDesc='Start Weight' baselineValue={startWeight?.toFixed() || '-'} baselineSuffix='lbs'
                    secondaryDesc='Current Weight' secondaryValue={(currentWeight).toFixed(0)} secondarySuffix='lbs'
                    tertiaryDesc='Progress' tertiaryValue={(Math.abs(100 * (startWeight - currentWeight) / (goalWeight))).toFixed()} tertiarySuffix='%'
                />
                <Spacer />
                <Comparison
                    title='Body Fat Goal'
                    desc={presets.desc}
                    buttonOnPress={editGoal}
                    currentValue={`Body Fat Goal: ${profile?.startFat || '0'}`}
                    currentValueSuffix='%'
                    baselineDesc='Start Fat' baselineValue={startFat?.toFixed() || '-'} baselineSuffix='%'
                    secondaryDesc='Current Fat' secondaryValue={(currentFat).toFixed(0)} secondarySuffix='%'
                    tertiaryDesc='Progress' tertiaryValue={((100 * (startFat - currentFat) / (goalFat))).toFixed()} tertiarySuffix='%'
                />
                <Spacer />
                <Spacer xl />
                <Spacer xl />
            </ScrollView>

        </SafeAreaView>
    )
}

export default History