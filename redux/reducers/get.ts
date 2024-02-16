import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Dimensions } from "react-native";

const initialState = {
    dm: false as boolean,
    msg: null as string | null,
    s: Dimensions.get('screen'),
    error: null as string | null,
    loading: false,
    fontThin: 'Urbanist_400Regular',
    fontRegular: 'Urbanist_500Medium',
    fontSemibold: 'Urbanist_600SemiBold',
    fontBold: 'Urbanist_700Bold'
};

export type GetState = typeof initialState;


let getSlice = createSlice({
    initialState,
    name: 'get',
    reducers: {
        set: <T extends keyof GetState>(state: GetState, action: PayloadAction<{key: T, value: GetState[T]}>) => {
            state[action.payload.key] = action.payload.value
        },
        replace: (state: GetState, action: PayloadAction<{state: GetState}>) => {
            return action.payload.state;
        }
    },
    
})

export default getSlice

export const {set, replace} = getSlice.actions
