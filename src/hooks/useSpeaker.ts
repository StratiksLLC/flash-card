import { type MouseEvent, useCallback, useEffect, useState } from 'react';
import { SpeakerManager } from '@/utils/speakerManager.ts';

type UseSpeaker = (
    lang?: string,
    rate?: number
) => {
    isSpeaking: boolean;
    speak: (text: string, e?: MouseEvent) => void;
    cancel: () => void;
};

/**
 * Custom hook for text-to-speech functionality
 * @param lang - Language code for speech synthesis, defaults to 'en-US'
 * @param rate - Speech rate (0.1-10), defaults to 0.9
 * @returns Object with isSpeaking state, speak function, and cancel function
 */
const useSpeaker: UseSpeaker = (lang = 'en-US', rate = 0.9) => {
    const manager = SpeakerManager.getInstance();
    const [isSpeaking, setIsSpeaking] = useState<boolean>(manager.getIsSpeaking());

    useEffect(() => {
        const unsubscribe = manager.subscribe(() => setIsSpeaking(manager.getIsSpeaking()));

        return () => {
            unsubscribe();
        };
    }, [manager]);

    const speak = useCallback(
        (text: string, event?: MouseEvent) => {
            if (event) {
                event.stopPropagation();
            }
            manager.speak(text, lang, rate);
        },
        [manager, lang, rate]
    );

    const cancel = useCallback(() => {
        manager.cancel();
    }, [manager]);

    return { isSpeaking, speak, cancel };
};
export default useSpeaker;
