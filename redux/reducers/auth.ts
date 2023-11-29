import { User } from "@supabase/supabase-js";
import { Tables } from "../../supabase/dao";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { fetchProfile, fetchUser } from "../api/auth";

const initialState = {
    userId : null as string | null,
    username: null as string | null,
    user: null as User | null,
    profile: null as Tables['user']['Row'] | null,
    hasSubscribedBefore: false,
    status: {pt: false, fp: false},
    signedInWithEmail: false,
    subscribed: false
};

export type UserState = typeof initialState;


let authSlice = createSlice({
    initialState,
    name: 'auth',
    reducers: {
        signOut: (state: UserState) => {
            return initialState;
        },
        login: (state: UserState, action: PayloadAction<{user: User}>) => {
            state.user = action.payload.user
            state.userId = action.payload.user.id;
            state.signedInWithEmail = action.payload.user.app_metadata.provider === 'email'
        },
        registerProfile: (state: UserState, action: PayloadAction<{profile: Tables['user']['Row']}>) => {
            let {profile} = action.payload;
            state.profile = profile;
            state.username = profile.username
        }
    },
    extraReducers: _builder => {
        _builder.addCase(fetchUser.fulfilled, (state, action) => {
            let {user, profile} = action.payload;
            state.user = user;
            state.userId = user.id;
            state.signedInWithEmail = user.app_metadata.provider === 'email'
            if (profile) {
                state.profile = profile;
                state.username = profile.username
            }
        })
        .addCase(fetchProfile.fulfilled, (state, action) => {
            let {payload: profile} = action;
            state.profile = profile;
            state.username = profile.username
        })
    }
})

export default authSlice

export const {signOut, login, registerProfile} = authSlice.actions;
