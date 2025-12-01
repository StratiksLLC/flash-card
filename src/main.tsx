import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import FlashCard from './flashCard/FlashCard.tsx';
import { Provider } from 'react-redux';
import { rootStore } from '@/stores/rootStore.ts';
import { initI18n } from '@/utils/i18n.ts';

void initI18n();

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Provider store={rootStore}>
            <FlashCard />
        </Provider>
    </StrictMode>
);
