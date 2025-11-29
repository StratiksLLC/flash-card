import { configureStore } from '@reduxjs/toolkit';
import cardSlice from '@/stores/cardSlice.ts';

export const rootStore = configureStore({
    reducer: {
        cardSlice: cardSlice
    }
});

export type RootState = ReturnType<typeof rootStore.getState>;
export type AppDispatch = typeof rootStore.dispatch;
export const getState = () => rootStore.getState();
