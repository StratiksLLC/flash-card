import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import FlashCard from './flashCard/FlashCard.tsx';
import { Provider } from 'react-redux';
import { rootStore } from '@/stores/rootStore.ts';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Provider store={rootStore}>
            <FlashCard />
        </Provider>
    </StrictMode>
);
