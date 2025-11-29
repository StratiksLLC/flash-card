import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/stores/rootStore.ts';

export const useAppDispatch = () => useDispatch<AppDispatch>();
