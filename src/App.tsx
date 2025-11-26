import React, { useState, useEffect, useRef } from 'react';
import {
    Brain,
    CheckCircle,
    XCircle,
    Plus,
    Trash2,
    RotateCcw,
    TrendingUp,
    BookOpen,
    Clock,
    Settings,
    Briefcase,
    Volume2,
    VolumeX,
    Code,
    Server,
    GitMerge
} from 'lucide-react';

// --- 扩展后的 BQ 高频词库 (程序员/技术面试专用) ---
const INITIAL_DATA = [
    {
        id: '1',
        term: 'Technical Debt',
        definition:
            'The implied cost of additional rework caused by choosing an easy solution now instead of using a better approach that would take longer.',
        translation: '技术债 (Engineering Quality)',
        example:
            'We prioritized launching the feature quickly, but I documented the technical debt and scheduled a sprint specifically to refactor the code later.',
        category: 'Engineering',
        nextReview: Date.now(),
        interval: 0,
        easeFactor: 2.5,
        streak: 0
    },
    {
        id: '2',
        term: 'Disagree and Commit',
        definition:
            'A management principle where individuals are allowed to disagree while a decision is being made, but once a decision is made, everyone must support it.',
        translation: '保留己见，全力执行 (Conflict/Leadership)',
        example:
            "Although I preferred a SQL database, the team voted for NoSQL. I applied the 'disagree and commit' principle and optimized our schema for MongoDB.",
        category: 'Conflict',
        nextReview: Date.now(),
        interval: 0,
        easeFactor: 2.5,
        streak: 0
    },
    {
        id: '3',
        term: 'Single Point of Failure',
        definition: 'A part of a system that, if it fails, will stop the entire system from working.',
        translation: '单点故障 (System Design)',
        example:
            'I noticed the load balancer was a single point of failure, so I proposed adding a redundant backup to ensure high availability.',
        category: 'System Design',
        nextReview: Date.now(),
        interval: 0,
        easeFactor: 2.5,
        streak: 0
    },
    {
        id: '4',
        term: 'Legacy Code',
        definition: 'Source code that relates to a no-longer-supported or older version of the software.',
        translation: '遗留代码/老旧代码 (Refactoring)',
        example:
            'I was tasked with refactoring a module of legacy code. I first wrote unit tests to ensure no regressions before modernizing the syntax.',
        category: 'Refactoring',
        nextReview: Date.now(),
        interval: 0,
        easeFactor: 2.5,
        streak: 0
    },
    {
        id: '5',
        term: 'Root Cause Analysis',
        definition: 'A method of problem solving used for identifying the root causes of faults or problems.',
        translation: '根本原因分析 (Problem Solving)',
        example:
            'After the outage, I led a root cause analysis (RCA) and discovered a memory leak in the microservice, which we fixed by updating the garbage collection config.',
        category: 'Problem Solving',
        nextReview: Date.now(),
        interval: 0,
        easeFactor: 2.5,
        streak: 0
    },
    {
        id: '6',
        term: 'Cross-functional',
        definition:
            'Denoting or relating to a system whereby people from different areas of an organization work together as a team.',
        translation: '跨职能 (Collaboration)',
        example:
            'I worked in a cross-functional team with PMs and designers to ensure the new API met both frontend requirements and business logic.',
        category: 'Collaboration',
        nextReview: Date.now(),
        interval: 0,
        easeFactor: 2.5,
        streak: 0
    },
    {
        id: '7',
        term: 'Spearhead',
        definition: 'Lead an attack or movement; be the leader of.',
        translation: '带头；主导 (Leadership)',
        example:
            'I spearheaded the migration from a monolith to microservices, improving our deployment velocity by 300%.',
        category: 'Leadership',
        nextReview: Date.now(),
        interval: 0,
        easeFactor: 2.5,
        streak: 0
    },
    {
        id: '8',
        term: 'Trade-off',
        definition: 'A balance achieved between two desirable but incompatible features.',
        translation: '权衡/取舍 (Decision Making)',
        example:
            'We faced a trade-off between latency and consistency. Given it was a payment system, I prioritized consistency over speed.',
        category: 'Decision Making',
        nextReview: Date.now(),
        interval: 0,
        easeFactor: 2.5,
        streak: 0
    },
    {
        id: '9',
        term: 'Scalability',
        definition: 'The capacity to be changed in size or scale.',
        translation: '可扩展性 (System Design)',
        example:
            'To ensure scalability, I implemented Redis caching, which reduced database load by 50% during peak traffic.',
        category: 'System Design',
        nextReview: Date.now(),
        interval: 0,
        easeFactor: 2.5,
        streak: 0
    },
    {
        id: '10',
        term: 'Bottleneck',
        definition: 'A point of congestion that slows down a process.',
        translation: '瓶颈 (Performance)',
        example:
            'Profiling revealed the image processing service was the bottleneck. Moving it to an async worker queue resolved the latency issues.',
        category: 'Performance',
        nextReview: Date.now(),
        interval: 0,
        easeFactor: 2.5,
        streak: 0
    }
];

// --- 间隔重复算法 (SM-2 Simplified) ---
const calculateNextReview = (card, quality) => {
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

export default function BQVocabPro() {
    const [cards, setCards] = useState(() => {
        const saved = localStorage.getItem('bq-cards-pro-v2');
        return saved ? JSON.parse(saved) : INITIAL_DATA;
    });

    const [mode, setMode] = useState('dashboard');
    const [studyQueue, setStudyQueue] = useState([]);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [sessionStats, setSessionStats] = useState({ reviewed: 0, correct: 0 });

    // TTS State
    const [isSpeaking, setIsSpeaking] = useState(false);
    const synthesisRef = useRef(window.speechSynthesis);

    useEffect(() => {
        localStorage.setItem('bq-cards-pro-v2', JSON.stringify(cards));
    }, [cards]);

    useEffect(() => {
        return () => {
            if (synthesisRef.current) {
                synthesisRef.current.cancel();
            }
        };
    }, []);

    const speakText = (text, e) => {
        if (e) e.stopPropagation();

        if (synthesisRef.current.speaking) {
            synthesisRef.current.cancel();
            setIsSpeaking(false);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        synthesisRef.current.speak(utterance);
    };

    const dueCount = cards.filter((c) => c.nextReview <= Date.now()).length;
    const masteredCount = cards.filter((c) => c.interval > 21).length;

    const startSession = () => {
        const due = cards.filter((c) => c.nextReview <= Date.now()).sort((a, b) => a.nextReview - b.nextReview);
        if (due.length === 0) {
            alert('目前没有需要复习的单词！建议添加新词或休息一下。');
            return;
        }
        setStudyQueue(due);
        setCurrentCardIndex(0);
        setIsFlipped(false);
        setSessionStats({ reviewed: 0, correct: 0 });
        setMode('study');
    };

    const handleRate = (quality) => {
        synthesisRef.current.cancel();
        setIsSpeaking(false);

        const currentCard = studyQueue[currentCardIndex];
        const updatedCard = calculateNextReview(currentCard, quality);
        setCards((prev) => prev.map((c) => (c.id === updatedCard.id ? updatedCard : c)));
        setSessionStats((prev) => ({
            reviewed: prev.reviewed + 1,
            correct: quality >= 3 ? prev.correct + 1 : prev.correct
        }));

        if (currentCardIndex < studyQueue.length - 1) {
            setCurrentCardIndex((prev) => prev + 1);
            setIsFlipped(false);
        } else {
            setMode('summary');
        }
    };

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
        setCards([...cards, card]);
        setNewCard({ term: '', definition: '', translation: '', example: '', category: 'General' });
        setMode('dashboard');
    };

    const resetData = () => {
        if (confirm('确定要重置所有数据并恢复默认词库吗？这将清除您的学习进度。')) {
            setCards(INITIAL_DATA);
            localStorage.removeItem('bq-cards-pro-v2');
            alert('数据已重置');
        }
    };

    // --- Components ---

    const Dashboard = () => (
        <div className="space-y-6 animate-fade-in pb-12">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Code className="w-8 h-8 text-indigo-600" />
                        Dev BQ Master
                    </h1>
                    <p className="text-slate-500 text-sm">程序员行为面试高频短语</p>
                </div>
                <button onClick={resetData} className="text-slate-300 hover:text-red-400 p-2">
                    <RotateCcw className="w-5 h-5" />
                </button>
            </header>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-5 rounded-2xl text-white shadow-lg shadow-indigo-200">
                    <div className="flex items-center gap-2 mb-2 opacity-90">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs font-semibold uppercase tracking-wider">待复习</span>
                    </div>
                    <div className="text-4xl font-bold">{dueCount}</div>
                    <div className="text-xs opacity-75 mt-1">个短语今日到期</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-emerald-600">
                        <Brain className="w-4 h-4" />
                        <span className="text-xs font-semibold uppercase tracking-wider">掌握程度</span>
                    </div>
                    <div className="text-4xl font-bold text-slate-800">{masteredCount}</div>
                    <div className="text-xs text-slate-400 mt-1">个短语已形成肌肉记忆</div>
                </div>
            </div>

            <button
                onClick={startSession}
                disabled={dueCount === 0}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-md transition-all flex items-center justify-center gap-2
          ${
              dueCount > 0
                  ? 'bg-slate-900 text-white hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
            >
                <BookOpen className="w-5 h-5" />
                {dueCount > 0 ? '开始今日复习' : '今日任务已完成'}
            </button>

            <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-700">词汇库 ({cards.length})</h3>
                    <button
                        onClick={() => setMode('add')}
                        className="text-indigo-600 text-sm font-medium flex items-center gap-1 hover:bg-indigo-50 px-3 py-1.5 rounded-full transition-colors"
                    >
                        <Plus className="w-4 h-4" /> 添加新词
                    </button>
                </div>
                <div className="space-y-3">
                    {cards.map((card) => (
                        <div
                            key={card.id}
                            className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center group hover:border-indigo-100 hover:shadow-md transition-all"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <div className="font-bold text-slate-800">{card.term}</div>
                                    <button
                                        onClick={(e) => speakText(card.term, e)}
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
                                        if (confirm('Delete this card?'))
                                            setCards(cards.filter((c) => c.id !== card.id));
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

    const StudySession = () => {
        const currentCard = studyQueue[currentCardIndex];

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
                                    onClick={(e) => speakText(currentCard.term, e)}
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
                                        <div className="text-indigo-600 font-medium text-sm">
                                            {currentCard.translation}
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => speakText(`${currentCard.term}. ${currentCard.example}`, e)}
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

    const Summary = () => (
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
                onClick={() => setMode('dashboard')}
                className="px-8 py-3 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl"
            >
                返回首页
            </button>
        </div>
    );

    const AddCard = () => (
        <div className="animate-fade-in pb-8">
            <div
                className="flex items-center gap-2 mb-6 cursor-pointer text-slate-500 hover:text-slate-800"
                onClick={() => setMode('dashboard')}
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

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex justify-center">
            <div className="w-full max-w-md bg-white min-h-screen sm:min-h-[800px] sm:h-[800px] sm:my-8 sm:rounded-[3rem] sm:shadow-2xl sm:border-[8px] sm:border-slate-800 overflow-hidden relative">
                <div className="h-full overflow-y-auto scrollbar-hide p-6">
                    {mode === 'dashboard' && <Dashboard />}
                    {mode === 'study' && <StudySession />}
                    {mode === 'add' && <AddCard />}
                    {mode === 'summary' && <Summary />}
                </div>
            </div>
        </div>
    );
}
