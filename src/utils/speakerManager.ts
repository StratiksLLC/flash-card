export class SpeakerManager {
    private static instance: SpeakerManager;
    private synthesis: SpeechSynthesis | null = null;
    private isSpeaking: boolean = false;
    private callbacks: Set<() => void> = new Set();
    private currentUtterance: SpeechSynthesisUtterance | null = null;

    private constructor() {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            this.synthesis = window.speechSynthesis;
        }
    }

    static getInstance() {
        if (!SpeakerManager.instance) {
            SpeakerManager.instance = new SpeakerManager();
        }
        return SpeakerManager.instance;
    }

    subscribe(callback: () => void) {
        this.callbacks.add(callback);
        return () => this.callbacks.delete(callback);
    }

    private notify() {
        this.callbacks.forEach((callback) => callback());
    }

    speak(text: string, lang: string, rate: number) {
        if (!this.synthesis) return;

        if (this.synthesis.speaking) {
            this.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = rate;

        utterance.onstart = () => {
            this.isSpeaking = true;
            this.notify();
        };

        utterance.onend = () => {
            this.isSpeaking = false;
            this.currentUtterance = null;
            this.notify();
        };

        utterance.onerror = () => {
            this.isSpeaking = false;
            this.currentUtterance = null;
            console.error('TTS Error!');
            this.notify();
        };

        this.currentUtterance = utterance;
        this.synthesis.speak(utterance);
    }

    cancel() {
        if (this.synthesis && this.synthesis.speaking) {
            this.synthesis.cancel();
            this.isSpeaking = false;
            this.currentUtterance = null;
            this.notify();
        }
    }

    getIsSpeaking() {
        return this.isSpeaking;
    }
}
