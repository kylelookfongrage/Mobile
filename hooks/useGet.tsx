import { useDispatch, useSelector } from "../redux/store"
import { set as _set, GetState, replace } from "../redux/reducers/get"
import { useColorScheme } from "react-native"
import moment from "moment"
import { useMemo, useRef, useState } from "react"
import { _tokens } from "../tamagui.config"

export const useGet = () => {
    let s = useSelector(x => x.get)
    let d = useDispatch()
    let dm = useColorScheme() === 'dark'
    let times = {} as {[key: string]: Date}
    let set = <T extends keyof GetState>(k: T, v: GetState[T]) => {
        d(_set({key: k, value: v}))
    }
    let setFn = (fn: (prev: GetState) => GetState) => {
        let res = fn(s)
        d(replace({state: res}))
    }
    const time = (key: string, date: Date = new Date()) => {
        if (times[key]) {
            let dif = date.getTime() - times[key].getTime()
            console.log(`Completed ${key}: ${(Math.abs(dif / 1000))}`)
            let og = {...times}
            delete og[key]
            times = og
        } else {
            console.log('Starting ' + key)
            times[key] = date
        }
    }
    
    return {set, time, dm: dm, s: s.s, error: s.error, loading: s.loading, fontThin: s.fontThin, fontRegular: s.fontRegular, fontSemibold: s.fontSemibold, fontBold: s.fontBold, msg: s.msg, setFn, textColor: dm ? _tokens.white : _tokens.black, modalBg: dm ? _tokens.dark1 : _tokens.gray100}
}