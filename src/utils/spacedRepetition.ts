import type { Card } from '@/types/flashCard.ts';

export const calculateNextReview = (card: Card, quality: number) => {
    let { interval, easeFactor, streak } = card;

    if (quality < 3) {
        streak = 0;
        interval = 1;
    } else {
        if (streak === 0) interval = 1;
        else if (streak === 1) interval = 3;
        else interval = Math.round(interval * easeFactor);
        streak++;
    }

    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (easeFactor < 1.3) easeFactor = 1.3;

    const nextReview = Date.now() + interval * 24 * 60 * 60 * 1000;
    return { ...card, interval, easeFactor, streak, nextReview };
};
