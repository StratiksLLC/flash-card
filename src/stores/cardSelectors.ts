import type { RootState } from '@/stores/rootStore.ts';
import type { Card } from '@/types/flashCard.ts';

export const selectAllCards = (state: RootState): Card[] => {
    return state.cardSlice.allIds.map((id) => state.cardSlice.byId[id]).filter(Boolean);
};

export const selectDueCount = (state: RootState): number => {
    const now = Date.now();
    return state.cardSlice.allIds.filter((id) => {
        const card = state.cardSlice.byId[id];
        return card && card.nextReview <= now;
    }).length;
};

export const selectMasteredCount = (state: RootState): number => {
    return state.cardSlice.allIds.filter((id) => {
        const card = state.cardSlice.byId[id];
        return card && card.interval > 21;
    }).length;
};
