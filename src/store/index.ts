import { configureStore } from '@reduxjs/toolkit';
import screeningReducer from './screeningSlice';

export const store = configureStore({
    reducer: {
        screening: screeningReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
