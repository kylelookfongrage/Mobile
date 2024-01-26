import { CalendarList } from 'react-native-calendars'
import React from 'react'
import { View } from '../../components/base/Themed'
import { useNavigation } from '@react-navigation/native'
import useColorScheme from '../../hooks/useColorScheme'
import moment, { Moment } from 'moment'
import { BackButton } from '../../components/base/BackButton'
import tw from 'twrnc'
import ThisAdHelpsKeepFree from '../../components/features/ThisAdHelpsKeepFree'
import { useDispatch, useSelector } from '../../redux/store'
import { changeDate } from '../../redux/reducers/progress'
import { _tokens } from '../../tamagui.config'

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
    let {formattedDate} = useSelector(x => x.progress)
    let dispatch = useDispatch()
    let setDate = (_date: string) => dispatch(changeDate({date: _date}))
    const navigator = useNavigation()
    console.log(formattedDate)
    const markedDate = moment(formattedDate).format('YYYY-MM-DD')
    console.log(markedDate)
    const dm = useColorScheme() === 'dark'
    return (
        <View style={{flex: 1}} includeBackground>
            <BackButton name='My Agenda' />
            <CalendarList
                // Callback which gets executed when visible months change in scroll view. Default = undefined
                // Max amount of months allowed to scroll to the past. Default = 50
                pastScrollRange={24}
                // Max amount of months allowed to scroll to the future. Default = 50
                futureScrollRange={3}
                // Enable or disable scrolling of calendar list
                scrollEnabled={true}
                hideExtraDays={true}
                hideArrows={false}
                style={tw``}
                theme={{ calendarBackground: 'transparent', dayTextColor: dm ? 'white' : 'black', monthTextColor: dm ? 'white' : 'black', arrowColor: 'gray' }}
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
                                fontWeight: 'bold'
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
            <ThisAdHelpsKeepFree />
        </View>
    )
}