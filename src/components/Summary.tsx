import { CheckCircle } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';
import { Mode } from '@/types/flashCard.ts';

interface SummaryProps {
    sessionStats: { reviewed: number; correct: number };
    setMode: Dispatch<SetStateAction<Mode>>;
}

const Summary = ({ sessionStats, setMode }: SummaryProps) => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">复习完成!</h2>
            <p className="text-slate-500 mb-8">System Design 和 BQ 都准备得不错！</p>

            <div className="grid grid-cols-2 gap-4 w-full max-w-xs mb-8">
                <div className="bg-slate-50 p-4 rounded-xl">
                    <div className="text-2xl font-bold text-slate-800">{sessionStats.reviewed}</div>
                    <div className="text-xs text-slate-500">复习短语</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl">
                    <div className="text-2xl font-bold text-emerald-600">
                        {Math.round((sessionStats.correct / (sessionStats.reviewed || 1)) * 100)}%
                    </div>
                    <div className="text-xs text-slate-500">记忆准确率</div>
                </div>
            </div>

            <button
                onClick={() => setMode(Mode.Dashboard)}
                className="px-8 py-3 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl"
            >
                返回首页
            </button>
        </div>
    );
};

export default Summary;
