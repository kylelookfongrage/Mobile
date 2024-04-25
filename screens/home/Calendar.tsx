import { CalendarList } from 'react-native-calendars'
import React from 'react'
import { View, Text } from '../../components/base/Themed'
import { useNavigation } from '@react-navigation/native'
import useColorScheme from '../../hooks/useColorScheme'
import moment, { Moment } from 'moment'
import { BackButton } from '../../components/base/BackButton'
import tw from 'twrnc'
import ThisAdHelpsKeepFree from '../../components/features/ThisAdHelpsKeepFree'
import { useDispatch, useSelector } from '../../redux/store'
import { changeDate } from '../../redux/reducers/progress'
import { _tokens } from '../../tamagui.config'
import { TouchableOpacity } from 'react-native'
import Spacer from '../../components/base/Spacer'
import { useGet } from '../../hooks/useGet'

interface DateContextType {
    date: Moment;
    setDate: React.Dispatch<React.SetStateAction<Moment>>;
    formattedDate: string;
    AWSDate: string;
}
//@ts-ignore
export const DateContext = React.createContext<DateContextType>()
export const useDateContext = () => React.useContext<DateContextType>(DateContext)

// export const dateToAWSDate = (x: Date) => {
//     const dateString = x.
// }

export default function Calendar() {
    let { formattedDate } = useSelector(x => x.progress)
    let dispatch = useDispatch()
    let setDate = (_date: string) => dispatch(changeDate({ date: _date }))
    const navigator = useNavigation()
    const markedDate = moment(formattedDate).format('YYYY-MM-DD')
    const dm = useColorScheme() === 'dark'
    let g = useGet()
    return (
        <View style={{ flex: 1 }} includeBackground>
            <BackButton name='Calendar' Right={() => {
                //@ts-ignore
                return <TouchableOpacity onPress={() => navigator.navigate('TaskAgenda')} style={tw`px-4`}>
                    <Text lg semibold style={{ color: _tokens.primary900 }}>Agenda</Text>
                </TouchableOpacity>
            }} />
            <Spacer />
            <View style={{...tw`mr-1 ml-.5 rounded-xl pt-2`, backgroundColor: dm ? _tokens.dark1 : _tokens.gray300}}>
            <CalendarList
                // Callback which gets executed when visible months change in scroll view. Default = undefined
                // Max amount of months allowed to scroll to the past. Default = 50
                pastScrollRange={24}
                // Max amount of months allowed to scroll to the future. Default = 50
                futureScrollRange={3}
                // Enable or disable scrolling of calendar list
                scrollEnabled={false}
                hideExtraDays={false}
                hideArrows={false}
                theme={{ 
                    calendarBackground: 'transparent', 
                    dayTextColor: dm ? "white" : "black",
                    textDisabledColor: 'gray', 
                    monthTextColor: 'gray', 
                    textMonthFontFamily: g.fontBold,
                    todayTextColor: 'gray',
                    textDayHeaderFontFamily: g.fontBold,
                    textDayFontFamily: g.fontRegular,
                    textMonthFontWeight: '700', 
                    arrowColor: dm ? 'white' : 'black', 
                    arrowHeight: 30, 
                    arrowWidth: 30, 
                    arrowStyle: { 
                        backgroundColor: dm ? _tokens.dark2 : _tokens.gray300, 
                        borderRadius: 15, 
                        height: 30, 
                        width: 30, 
                        ...tw`text-center items-center justify-center` 
                    } 
                }}
                // date={markedDate}
                horizontal={true}
                // Enable paging on horizontal, default = false
                showsHorizontalScrollIndicator
                markingType={'custom'}
                markedDates={{
                    [markedDate]: {
                        customStyles: {
                            container: {
                                backgroundColor: _tokens.primary900,
                            },
                            text: {
                                color: 'white',
                                fontWeight: 'bold',
                                fontFamily: g.fontBold
                            }
                        }
                    }
                }}



                // Enable or disable vertical scroll indicator. Default = false
                onDayPress={day => {
                    let newDate: Date = new Date(Date.parse(`${day.month}/${day.day}/${day.year}`))
                    setDate(moment(newDate).format())
                    //@ts-ignore
                    navigator.pop()
                }}

            />
            </View>
            <Spacer />
            <ThisAdHelpsKeepFree />
        </View>
    )
}