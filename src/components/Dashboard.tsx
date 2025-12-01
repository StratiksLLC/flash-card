import { BookOpen, Brain, Clock, Code, Plus, RotateCcw, Trash2, Volume2 } from 'lucide-react';
import { useAppDispatch } from '@/stores/useAppDispatch.ts';
import { removeCard, resetCards } from '@/stores/cardSlice.ts';
import { useAppSelector } from '@/stores/useAppSelector.ts';
import { selectDueCount, selectMasteredCount } from '@/stores/cardSelectors.ts';
import { type Card, Mode } from '@/types/flashCard.ts';
import useSpeaker from '@/hooks/useSpeaker.ts';
import { useTranslation } from '@/hooks/useTranslation.ts';
import type { Dispatch, SetStateAction } from 'react';

interface DashboardProps {
    allCards: Card[];
    setMode: Dispatch<SetStateAction<Mode>>;
    startSession: () => void;
}

const Dashboard = ({ allCards, setMode, startSession }: DashboardProps) => {
    const dispatch = useAppDispatch();
    const dueCount = useAppSelector(selectDueCount);
    const masteredCount = useAppSelector(selectMasteredCount);
    const { speak } = useSpeaker();
    const { t } = useTranslation();

    const resetData = () => {
        if (confirm(t('dashboard.resetConfirm'))) {
            dispatch(resetCards());
            localStorage.removeItem('bq-cards-pro-v2');
            alert(t('dashboard.dataReset'));
        }
    };

    return (
        <div data-name={'dashboard-container'} className="">
            {/* Header */}
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="font-bold text-nowrap text-slate-800 flex items-center gap-2">
                        <Code className="w-8 h-8 text-indigo-600" />
                        {t('dashboard.title')}
                    </h1>
                    <p className="text-slate-500 text-sm">{t('dashboard.subtitle')}</p>
                </div>
                <button onClick={resetData} className="text-slate-300">
                    <RotateCcw className="w-5 h-5" />
                </button>
            </header>

            {/* Review and Master Stats */}
            <div data-name={'stats-container'} className="grid grid-cols-2 gap-4 my-2">
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-5 rounded-2xl text-white shadow-lg shadow-indigo-200">
                    <div className="flex items-center gap-2 mb-2 opacity-90">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs font-semibold uppercase tracking-wider">
                            {t('dashboard.dueReview')}
                        </span>
                    </div>
                    <div className="text-4xl font-bold">{dueCount}</div>
                    <div className="text-xs opacity-75 mt-1">{t('dashboard.phrasesDueToday')}</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-emerald-600">
                        <Brain className="w-4 h-4" />
                        <span className="text-xs font-semibold uppercase tracking-wider">{t('dashboard.mastery')}</span>
                    </div>
                    <div className="text-4xl font-bold text-slate-800">{masteredCount}</div>
                    <div className="text-xs text-slate-400 mt-1">{t('dashboard.phrasesMemorized')}</div>
                </div>
            </div>

            {/* Start Session Button */}
            <div className="my-[12px] w-full" data-name={'start-session-button-container'}>
                <button
                    onClick={startSession}
                    disabled={dueCount == 0}
                    className={`w-full py-4 rounded-xl font-bold text-lg shadow-md transition-all flex items-center justify-center gap-2 ${
                        dueCount > 0
                            ? 'bg-slate-900 text-white hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98]'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                >
                    <BookOpen className="w-5 h-5" />
                    {dueCount > 0 ? t('dashboard.startReview') : t('dashboard.taskCompleted')}
                </button>
            </div>

            {/* Cards List */}
            <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-700">
                        {t('dashboard.vocabulary')} ({allCards.length})
                    </h3>
                    <button
                        onClick={() => setMode(Mode.Add)}
                        className="text-indigo-600 text-sm font-medium flex items-center gap-1 hover:bg-indigo-50 px-3 py-1.5 rounded-full transition-colors"
                    >
                        <Plus className="w-4 h-4" /> {t('dashboard.addNewPhrase')}
                    </button>
                </div>
                <div className="space-y-3">
                    {allCards.map((card) => (
                        <div
                            key={card.id}
                            className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center group hover:border-indigo-100 hover:shadow-md transition-all"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <div className="font-bold text-slate-800">{card.term}</div>
                                    <button
                                        onClick={(e) => speak(card.term, e)}
                                        className="text-slate-300 hover:text-indigo-500 transition-colors"
                                    >
                                        <Volume2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="text-xs text-slate-500 mt-0.5">{card.translation}</div>
                            </div>
                            <div className="flex items-center gap-2 pl-2">
                                <span className="text-[10px] px-2 py-1 bg-slate-100 rounded-full text-slate-500 whitespace-nowrap">
                                    {card.category}
                                </span>
                                <button
                                    onClick={() => {
                                        if (confirm(t('flashCard.deleteCardConfirm'))) dispatch(removeCard(card.id));
                                    }}
                                    className="text-red-400 opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 rounded-full transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
