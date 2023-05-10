import { View } from 'react-native'
import { CalendarList } from 'react-native-calendars'
import React from 'react'
import { useNavigation } from '@react-navigation/native'
import useColorScheme from '../../hooks/useColorScheme'
import moment, { Moment } from 'moment'
import { BackButton } from '../../components/BackButton'
import tw from 'twrnc'
import ThisAdHelpsKeepFree from '../../components/ThisAdHelpsKeepFree'

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
    const { AWSDate, setDate, date } = useDateContext()
    const navigator = useNavigation()
    const markedDate = AWSDate
    const dm = useColorScheme() === 'dark'
    return (
        <View style={tw`bg-${dm ? 'black' : 'white'} h-12/12`}>
            <BackButton />
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
                theme={{ calendarBackground: dm ? 'black' : 'white', dayTextColor: dm ? 'white' : 'black', monthTextColor: dm ? 'white' : 'black' }}
                // date={markedDate}
                horizontal={true}
                // Enable paging on horizontal, default = false
                showsHorizontalScrollIndicator
                markingType={'custom'}
                markedDates={{
                    [markedDate]: {
                        customStyles: {
                            container: {
                                backgroundColor: 'green'
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
                    setDate(moment(newDate))
                    //@ts-ignore
                    navigator.pop()
                }}

            />
            <ThisAdHelpsKeepFree />
        </View>
    )
}