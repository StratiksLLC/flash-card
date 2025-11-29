import { type Card, Mode } from '@/types/flashCard.ts';
import { GitMerge, Server, Volume2 } from 'lucide-react';
import useSpeaker from '@/hooks/useSpeaker.ts';
import { calculateNextReview } from '@/utils/spacedRepetition.ts';
import { updateCard } from '@/stores/cardSlice.ts';
import { useAppDispatch } from '@/stores/useAppDispatch.ts';
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
            <div className="flex-1 flex flex-col justify-center py-4 sm:py-6">
                <div className="flex justify-between items-center text-sm text-slate-400 mb-4 px-2">
                    <span>
                        进度: {currentCardIndex + 1} / {studyQueue.length}
                    </span>
                    <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <GitMerge className="w-3 h-3" /> {currentCard.category}
                    </span>
                </div>

                {/* Flashcard Area */}
                <div
                    className="perspective-1000 w-full aspect-[4/5] relative cursor-pointer group"
                    onClick={() => {
                        // 修复：允许在背面点击时翻回正面 (Toggle)
                        setIsFlipped(!isFlipped);
                    }}
                >
                    <div
                        className={`w-full h-full duration-500 preserve-3d absolute transition-all ${isFlipped ? 'rotate-y-180' : ''}`}
                    >
                        {/* Front Side */}
                        <div className="absolute backface-hidden w-full h-full bg-white rounded-3xl shadow-xl border-2 border-slate-100 flex flex-col items-center justify-center p-8 text-center hover:border-indigo-200 transition-colors relative">
                            <button
                                onClick={(e) => speak(currentCard.term, e)}
                                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-100 hover:scale-110 transition-all z-10"
                            >
                                <Volume2 className="w-5 h-5" />
                            </button>

                            {/* 自动调整字体大小，如果短语很长 */}
                            <h2
                                className={`font-bold text-slate-800 mb-4 ${currentCard.term.length > 15 ? 'text-2xl' : 'text-4xl'}`}
                            >
                                {currentCard.term}
                            </h2>
                            <div className="text-slate-400 text-sm mt-8 flex items-center gap-2 animate-pulse">
                                Tap to see details
                            </div>
                        </div>

                        {/* Back Side */}
                        <div className="absolute rotate-y-180 backface-hidden w-full h-full bg-slate-50 rounded-3xl shadow-xl border border-slate-200 flex flex-col p-6 sm:p-8 overflow-y-auto">
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
                                    title="Read Example"
                                >
                                    <Volume2 className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-5 text-left flex-1">
                                <div>
                                    <div className="text-xs uppercase text-slate-400 font-semibold tracking-wider mb-1">
                                        Definition
                                    </div>
                                    <p className="text-slate-700 leading-relaxed font-medium text-sm">
                                        {currentCard.definition}
                                    </p>
                                </div>

                                <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm ring-1 ring-indigo-50">
                                    <div className="text-xs uppercase text-indigo-500 font-semibold tracking-wider mb-2 flex items-center gap-1">
                                        <Server className="w-3 h-3" /> STAR Example
                                    </div>
                                    <p className="text-slate-700 text-sm italic leading-relaxed">
                                        "{currentCard.example}"
                                    </p>
                                </div>
                            </div>

                            {/* Visual hint that card can be flipped back */}
                            <div className="mt-4 text-center text-xs text-slate-300">Tap card to flip back</div>
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
                        显示答案
                    </button>
                ) : (
                    <div className="grid grid-cols-4 gap-2 animate-fade-in">
                        <button
                            onClick={() => handleRate(0)}
                            className="flex flex-col items-center p-2 sm:p-3 rounded-xl bg-slate-100 text-slate-600 hover:bg-red-100 hover:text-red-700 transition-colors"
                        >
                            <span className="text-sm font-bold mb-1">忘记</span>
                            <span className="text-[10px] uppercase opacity-70">重来</span>
                        </button>
                        <button
                            onClick={() => handleRate(3)}
                            className="flex flex-col items-center p-2 sm:p-3 rounded-xl bg-slate-100 text-slate-600 hover:bg-orange-100 hover:text-orange-700 transition-colors"
                        >
                            <span className="text-sm font-bold mb-1">困难</span>
                            <span className="text-[10px] uppercase opacity-70">2天</span>
                        </button>
                        <button
                            onClick={() => handleRate(4)}
                            className="flex flex-col items-center p-2 sm:p-3 rounded-xl bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                        >
                            <span className="text-sm font-bold mb-1">一般</span>
                            <span className="text-[10px] uppercase opacity-70">4天</span>
                        </button>
                        <button
                            onClick={() => handleRate(5)}
                            className="flex flex-col items-center p-2 sm:p-3 rounded-xl bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-700 transition-colors"
                        >
                            <span className="text-sm font-bold mb-1">简单</span>
                            <span className="text-[10px] uppercase opacity-70">7天</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudySession;
