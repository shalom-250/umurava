import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ScreeningResult } from '@/lib/mockData';

interface ScreeningState {
    currentJobId: string | null;
    results: Record<string, ScreeningResult[]>; // jobId -> results
    isScreening: boolean;
    lastScreenedAt: Record<string, string | null>; // jobId -> date
}

const initialState: ScreeningState = {
    currentJobId: null,
    results: {},
    isScreening: false,
    lastScreenedAt: {},
};

const screeningSlice = createSlice({
    name: 'screening',
    initialState,
    reducers: {
        setCurrentJobId: (state, action: PayloadAction<string>) => {
            state.currentJobId = action.payload;
        },
        setScreeningResults: (state, action: PayloadAction<{ jobId: string; results: ScreeningResult[] }>) => {
            const { jobId, results } = action.payload;
            state.results[jobId] = results;
            state.lastScreenedAt[jobId] = new Date().toISOString();
        },
        setScreeningLoading: (state, action: PayloadAction<boolean>) => {
            state.isScreening = action.payload;
        },
        clearResults: (state, action: PayloadAction<string>) => {
            delete state.results[action.payload];
            delete state.lastScreenedAt[action.payload];
        },
    },
});

export const { setCurrentJobId, setScreeningResults, setScreeningLoading, clearResults } = screeningSlice.actions;
export default screeningSlice.reducer;
