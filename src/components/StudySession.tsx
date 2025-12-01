import { type Card, Mode } from '@/types/flashCard.ts';
import { GitMerge, RotateCcw, Server, Volume2 } from 'lucide-react';
import useSpeaker from '@/hooks/useSpeaker.ts';
import { calculateNextReview } from '@/utils/spacedRepetition.ts';
import { updateCard } from '@/stores/cardSlice.ts';
import { useAppDispatch } from '@/stores/useAppDispatch.ts';
import { useTranslation } from '@/hooks/useTranslation.ts';
import type { Dispatch, SetStateAction } from 'react';

interface StudySessionProps {
    studyQueue: Card[];
    isFlipped: boolean;
    setIsFlipped: Dispatch<SetStateAction<boolean>>;
    currentCardIndex: number;
    setCurrentCardIndex: Dispatch<SetStateAction<number>>;
    setMode: Dispatch<SetStateAction<Mode>>;
    setSessionStats: Dispatch<SetStateAction<{ reviewed: number; correct: number }>>;
}

const StudySession = ({
    studyQueue,
    isFlipped,
    setIsFlipped,
    currentCardIndex,
    setCurrentCardIndex,
    setMode,
    setSessionStats
}: StudySessionProps) => {
    const currentCard = studyQueue[currentCardIndex];
    const { speak, cancel } = useSpeaker();
    const dispatch = useAppDispatch();
    const { t } = useTranslation();

    const handleRate = (quality: number) => {
        cancel();

        const currentCard = studyQueue[currentCardIndex];
        const updatedCard = calculateNextReview(currentCard, quality);
        dispatch(updateCard({ id: currentCard.id, changes: updatedCard }));
        setSessionStats((prev) => ({
            reviewed: prev.reviewed + 1,
            correct: quality >= 3 ? prev.correct + 1 : prev.correct
        }));

        if (currentCardIndex < studyQueue.length - 1) {
            setCurrentCardIndex((prev) => prev + 1);
            setIsFlipped(false);
        } else {
            setMode(Mode.Summary);
        }
    };

    return (
        <div className="h-full flex flex-col max-w-md mx-auto">
            <div className="flex-1 flex flex-col justify-center py-1">
                <div
                    className="flex items-center gap-2 mb-6 cursor-pointer text-slate-500 hover:text-slate-800"
                    onClick={() => setMode(Mode.Dashboard)}
                >
                    <RotateCcw className="w-4 h-4" /> {t('common.back')}
                </div>
                {/* Progress Bar */}
                <div className="flex justify-between items-center text-sm text-slate-400 mb-4 px-2">
                    <span>
                        {t('study.progress')}: {currentCardIndex + 1} / {studyQueue.length}
                    </span>
                    <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <GitMerge className="w-3 h-3" /> {currentCard.category}
                    </span>
                </div>

                {/* Flashcard Area */}
                <div
                    className="w-full aspect-[4/5] relative cursor-pointer group"
                    onClick={() => {
                        setIsFlipped(!isFlipped);
                    }}
                >
                    <div
                        data-name={'card-container'}
                        className={`w-full h-full duration-500 perspective-normal transform-3d absolute transition-all ${isFlipped ? 'rotate-y-180' : ''}`}
                    >
                        {/* Frontside */}
                        <div className="absolute backface-hidden w-full h-full bg-white rounded-3xl shadow-xl border-2 border-slate-100 flex flex-col items-center justify-center p-8 text-center hover:border-indigo-200 transition-colors">
                            <button
                                onClick={(e) => speak(currentCard.term, e)}
                                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-100 hover:scale-110 transition-all z-10"
                            >
                                <Volume2 className="w-5 h-5" />
                            </button>

                            <h2
                                className={`font-bold text-slate-800 mb-4 ${currentCard.term.length > 15 ? 'text-2xl' : 'text-4xl'}`}
                            >
                                {currentCard.term}
                            </h2>
                            <div className="text-slate-400 text-sm mt-8 flex items-center gap-2 animate-pulse">
                                {t('study.tapToSeeDetails')}
                            </div>
                        </div>

                        {/* Backside */}
                        <div className="absolute rotate-y-180 backface-hidden w-full h-full bg-slate-50 rounded-3xl shadow-xl border border-slate-200 flex flex-col p-6 sm:p-8 overflow-y-auto scrollbar-hide">
                            <div className="flex justify-between items-start mb-4">
                                <div className="pr-2">
                                    <h2
                                        className={`font-bold text-slate-800 mb-1 ${currentCard.term.length > 20 ? 'text-xl' : 'text-2xl'}`}
                                    >
                                        {currentCard.term}
                                    </h2>
                                    <div className="text-indigo-600 font-medium text-sm">{currentCard.translation}</div>
                                </div>
                                <button
                                    onClick={(e) => speak(`${currentCard.term}. ${currentCard.example}`, e)}
                                    className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 hover:scale-110 shadow-lg shadow-indigo-200 transition-all flex-shrink-0"
                                    title={t('study.readExample')}
                                >
                                    <Volume2 className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-5 text-left flex-1">
                                <div>
                                    <div className="text-xs uppercase text-slate-400 font-semibold tracking-wider mb-1">
                                        {t('study.definition')}
                                    </div>
                                    <p className="text-slate-700 leading-relaxed font-medium text-sm">
                                        {currentCard.definition}
                                    </p>
                                </div>

                                <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm ring-1 ring-indigo-50">
                                    <div className="text-xs uppercase text-indigo-500 font-semibold tracking-wider mb-2 flex items-center gap-1">
                                        <Server className="w-3 h-3" /> {t('study.starExample')}
                                    </div>
                                    <p className="text-slate-700 text-sm italic leading-relaxed">
                                        {currentCard.example}
                                    </p>
                                </div>
                            </div>

                            {/* Visual hint that card can be flipped back */}
                            <div className="mt-4 text-center text-xs text-slate-300">{t('study.tapToFlipBack')}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="pb-6 pt-4 h-24">
                {!isFlipped ? (
                    <button
                        onClick={() => setIsFlipped(true)}
                        className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 active:scale-95 transition-all"
                    >
                        {t('study.showAnswer')}
                    </button>
                ) : (
                    <div className="grid grid-cols-4 gap-2 animate-fade-in">
                        <button
                            onClick={() => handleRate(0)}
                            className="flex flex-col items-center p-2 sm:p-3 rounded-xl bg-slate-100 text-slate-600 hover:bg-red-100 hover:text-red-700 transition-colors"
                        >
                            <span className="text-sm font-bold mb-1">{t('study.forgot')}</span>
                            <span className="text-[10px] uppercase opacity-70">{t('study.restart')}</span>
                        </button>
                        <button
                            onClick={() => handleRate(3)}
                            className="flex flex-col items-center p-2 sm:p-3 rounded-xl bg-slate-100 text-slate-600 hover:bg-orange-100 hover:text-orange-700 transition-colors"
                        >
                            <span className="text-sm font-bold mb-1">{t('study.hard')}</span>
                            <span className="text-[10px] uppercase opacity-70">2 {t('study.days')}</span>
                        </button>
                        <button
                            onClick={() => handleRate(4)}
                            className="flex flex-col items-center p-2 sm:p-3 rounded-xl bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                        >
                            <span className="text-sm font-bold mb-1">{t('study.medium')}</span>
                            <span className="text-[10px] uppercase opacity-70">4 {t('study.days')}</span>
                        </button>
                        <button
                            onClick={() => handleRate(5)}
                            className="flex flex-col items-center p-2 sm:p-3 rounded-xl bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-700 transition-colors"
                        >
                            <span className="text-sm font-bold mb-1">{t('study.easy')}</span>
                            <span className="text-[10px] uppercase opacity-70">7 {t('study.days')}</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudySession;
