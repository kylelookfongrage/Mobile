import { useDispatch, useSelector } from "../redux/store"
import { set as _set, GetState, replace } from "../redux/reducers/get"
import { useColorScheme } from "react-native"

export const useGet = () => {
    let s = useSelector(x => x.get)
    let d = useDispatch()
    let dm = useColorScheme() === 'dark'
    let set = <T extends keyof GetState>(k: T, v: GetState[T]) => {
        d(_set({key: k, value: v}))
    }
    let setFn = (fn: (prev: GetState) => GetState) => {
        let res = fn(s)
        d(replace({state: res}))

    }
    return {set, dm: dm, s: s.s, error: s.error, loading: s.loading, fontThin: s.fontThin, fontRegular: s.fontRegular, fontSemibold: s.fontSemibold, fontBold: s.fontBold, msg: s.msg, setFn}
}
