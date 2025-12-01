import { useEffect, useState } from 'react';
import Dashboard from '@/components/Dashboard.tsx';
import StudySession from '@/components/StudySession.tsx';
import AddCard from '@/components/AddCard.tsx';
import Summary from '@/components/Summary.tsx';
import { type Card, Mode } from '@/types/flashCard.ts';
import { selectAllCards } from '@/stores/cardSelectors.ts';
import { useAppSelector } from '@/stores/useAppSelector.ts';
import { get } from '@/api/common.ts';
import { SERVER_DATA_PATH } from '@/constants/pathUrls.ts';
import { useAppDispatch } from '@/stores/useAppDispatch.ts';
import { setCards } from '@/stores/cardSlice.ts';
import type { GetCardsOkResponse } from '@/types/apiTypes.ts';
import { useTranslation } from '@/hooks/useTranslation.ts';

const FlashCard = () => {
    const allCards = useAppSelector(selectAllCards);
    const [mode, setMode] = useState<Mode>(Mode.Dashboard);
    const [studyQueue, setStudyQueue] = useState<Card[]>([]);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [sessionStats, setSessionStats] = useState({ reviewed: 0, correct: 0 });
    const dispatch = useAppDispatch();
    const { t } = useTranslation();

    useEffect(() => {
        const loadAllCards = async () => {
            const allCards = await get<GetCardsOkResponse>(SERVER_DATA_PATH.cards);
            if (allCards)
                dispatch(
                    setCards(
                        allCards.map((card) => ({
                            id: card.id,
                            term: card.term,
                            definition: card.definition,
                            translation: card.translation,
                            example: card.example,
                            category: card.category,
                            nextReview: card.nextReview,
                            interval: card.interval,
                            easeFactor: card.easeFactor,
                            streak: card.streak
                        }))
                    )
                );
        };

        void loadAllCards();
    }, [dispatch]);

    const startSession = () => {
        const due = allCards.filter((c) => c.nextReview <= Date.now()).sort((a, b) => a.nextReview - b.nextReview);
        if (due.length === 0) {
            alert(t('flashCard.noCardsToReview'));
            return;
        }
        setStudyQueue(due);
        setCurrentCardIndex(0);
        setIsFlipped(false);
        setSessionStats({ reviewed: 0, correct: 0 });
        setMode(Mode.Study);
    };

    return (
        <div
            data-name={'flash-card-page'}
            className="min-h-screen w-screen bg-slate-50 font-sans text-slate-900 flex justify-center"
        >
            <div className="w-full min-h-full overflow-y-auto scrollbar-hide p-6">
                {mode === Mode.Dashboard && (
                    <Dashboard allCards={allCards} setMode={setMode} startSession={startSession} />
                )}
                {mode === Mode.Study && (
                    <StudySession
                        studyQueue={studyQueue}
                        isFlipped={isFlipped}
                        setIsFlipped={setIsFlipped}
                        currentCardIndex={currentCardIndex}
                        setCurrentCardIndex={setCurrentCardIndex}
                        setMode={setMode}
                        setSessionStats={setSessionStats}
                    />
                )}
                {mode === Mode.Add && <AddCard setMode={setMode} />}
                {mode === Mode.Summary && <Summary sessionStats={sessionStats} setMode={setMode} />}
            </div>
        </div>
    );
};

export default FlashCard;
