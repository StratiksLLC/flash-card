import type { BaseResponse } from '@/types/apiTypes.ts';

export const get = async <T>(path: string): Promise<BaseResponse<T> | undefined> => {
    try {
        const res = await fetch(path);
        if (!res.ok) throw new Error(`Failed to fetch data from path ${path}`);
        return res.json();
    } catch (e) {
        console.error(`Error caught: ${e}`);
    }
};
