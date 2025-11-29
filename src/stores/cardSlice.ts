import type { Card } from '@/types/flashCard.ts';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface CardState {
    byId: Record<string, Card>;
    allIds: string[];
}

const initialState: CardState = {
    byId: {},
    allIds: []
};

const cardSlice = createSlice({
    name: 'cardSlice',
    initialState,
    reducers: {
        setCards: (state, action: PayloadAction<Card[]>) => {
            state.byId = {};
            state.allIds = [];
            action.payload.forEach((card) => {
                state.byId[card.id] = card;
                state.allIds.push(card.id);
            });
        },

        addCard: (state, action: PayloadAction<Card>) => {
            const card = action.payload;
            state.byId[card.id] = card;
        },
        updateCard: (state, action: PayloadAction<{ id: string; changes: Partial<Card> }>) => {
            const { id, changes } = action.payload;
            const oldCard = state.byId[id];

            if (!oldCard) return;

            state.byId[id] = { ...oldCard, ...changes };
        },
        removeCard: (state, action: PayloadAction<string>) => {
            const cardId = action.payload;
            const card = state.byId[cardId];

            if (!card) return;

            delete state.byId[cardId];

            state.allIds = state.allIds.filter((id) => id !== cardId);
        },
        resetCards: (state) => {
            state.byId = {};
            state.allIds = [];
        }
    }
});

export const { setCards, addCard, updateCard, removeCard, resetCards } = cardSlice.actions;
export default cardSlice.reducer;
