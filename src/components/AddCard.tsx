import { Mode } from '@/types/flashCard.ts';
import { type Dispatch, type SetStateAction, useState } from 'react';
import { useAppDispatch } from '@/stores/useAppDispatch.ts';
import { addCard } from '@/stores/cardSlice.ts';
import { RotateCcw } from 'lucide-react';

interface AddCardProps {
    setMode: Dispatch<SetStateAction<Mode>>;
}

const AddCard = ({ setMode }: AddCardProps) => {
    const dispatch = useAppDispatch();
    const [newCard, setNewCard] = useState({
        term: '',
        definition: '',
        translation: '',
        example: '',
        category: 'General'
    });

    const handleAddCard = () => {
        if (!newCard.term || !newCard.definition) return;
        const card = {
            id: Date.now().toString(),
            ...newCard,
            nextReview: Date.now(),
            interval: 0,
            easeFactor: 2.5,
            streak: 0
        };
        dispatch(addCard(card));
        setNewCard({ term: '', definition: '', translation: '', example: '', category: 'General' });
        setMode(Mode.Dashboard);
    };

    return (
        <div className="animate-fade-in pb-8">
            <div
                className="flex items-center gap-2 mb-6 cursor-pointer text-slate-500 hover:text-slate-800"
                onClick={() => setMode(Mode.Dashboard)}
            >
                <RotateCcw className="w-4 h-4" /> 返回
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">添加新短语</h2>

            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phrase (短语/术语)</label>
                    <input
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-bold text-lg"
                        placeholder="e.g. Technical Debt"
                        value={newCard.term}
                        onChange={(e) => setNewCard({ ...newCard, term: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Chinese (中文释义)</label>
                    <input
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                        placeholder="e.g. 技术债"
                        value={newCard.translation}
                        onChange={(e) => setNewCard({ ...newCard, translation: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                        Definition (英文定义)
                    </label>
                    <textarea
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 h-20"
                        placeholder="Brief definition in English..."
                        value={newCard.definition}
                        onChange={(e) => setNewCard({ ...newCard, definition: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-indigo-500 uppercase mb-1">
                        STAR Example (面试例句)
                    </label>
                    <textarea
                        className="w-full p-3 bg-indigo-50 border border-indigo-100 rounded-xl focus:outline-none focus:border-indigo-500 h-24 text-sm"
                        placeholder="I managed expectations by holding weekly syncs..."
                        value={newCard.example}
                        onChange={(e) => setNewCard({ ...newCard, example: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category (分类)</label>
                    <select
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                        value={newCard.category}
                        onChange={(e) => setNewCard({ ...newCard, category: e.target.value })}
                    >
                        <option>Engineering</option>
                        <option>System Design</option>
                        <option>Problem Solving</option>
                        <option>Conflict</option>
                        <option>Leadership</option>
                        <option>Refactoring</option>
                        <option>General</option>
                    </select>
                </div>

                <button
                    onClick={handleAddCard}
                    className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 active:scale-95 transition-all mt-4"
                >
                    保存到词库
                </button>
            </div>
        </div>
    );
};

export default AddCard;
