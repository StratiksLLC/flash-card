import { useSelector } from 'react-redux';
import type { RootState } from '@/stores/rootStore.ts';

export const useAppSelector = <T>(selector: (state: RootState) => T): T => {
    return useSelector(selector);
};
