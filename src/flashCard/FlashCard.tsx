import { useEffect, useState } from 'react';
import Dashboard from '@/components/Dashboard.tsx';
import StudySession from '@/components/StudySession.tsx';
import AddCard from '@/components/AddCard.tsx';
import Summary from '@/components/Summary.tsx';
import { type Card, Mode } from '@/types/flashCard.ts';
import { selectAllCards } from '@/stores/cardSelectors.ts';
import { useAppSelector } from '@/stores/useAppSelector.ts';

const FlashCard = () => {
    const allCards = useAppSelector(selectAllCards);
    const [mode, setMode] = useState<Mode>(Mode.Dashboard);
    const [studyQueue, setStudyQueue] = useState<Card[]>([]);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [sessionStats, setSessionStats] = useState({ reviewed: 0, correct: 0 });

    useEffect(() => {
        // TODO: Save to database
    }, [allCards]);

    const startSession = () => {
        const due = allCards.filter((c) => c.nextReview <= Date.now()).sort((a, b) => a.nextReview - b.nextReview);
        if (due.length === 0) {
            alert('目前没有需要复习的单词！建议添加新词或休息一下。');
            return;
        }
        setStudyQueue(due);
        setCurrentCardIndex(0);
        setIsFlipped(false);
        setSessionStats({ reviewed: 0, correct: 0 });
        setMode(Mode.Study);
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex justify-center">
            <div className="w-full max-w-md bg-white min-h-screen sm:min-h-[800px] sm:h-[800px] sm:my-8 sm:rounded-[3rem] sm:shadow-2xl sm:border-[8px] sm:border-slate-800 overflow-hidden relative">
                <div className="h-full overflow-y-auto scrollbar-hide p-6">
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
        </div>
    );
};

export default FlashCard;
