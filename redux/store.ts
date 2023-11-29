import { applyMiddleware, compose } from "redux";
import { configureStore } from '@reduxjs/toolkit'

import thunk from "redux-thunk";

import authSlice from "./reducers/auth";

export default function createStore(preloadedState: any) {
    const middlewares = [thunk];
    const middlewareEnhancer = applyMiddleware(...middlewares);
    const storeEnhancers = [middlewareEnhancer];
    const store = configureStore({
        reducer: {
            auth: authSlice.reducer,
            progress: progressSlice.reducer
        },
        preloadedState,
        enhancers: [compose(...storeEnhancers)]
    })
    return store;
}


export const store = createStore({})

export type RootState = ReturnType<typeof store.getState>
export type RootDispatch = typeof store.dispatch;

import {
    useSelector as useReduxSelector,
    useDispatch as useReduxDispatch,
    TypedUseSelectorHook,
  } from 'react-redux'
import progressSlice from "./reducers/progress";

export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector

export const useDispatch = useReduxDispatch<RootDispatch>;
  
