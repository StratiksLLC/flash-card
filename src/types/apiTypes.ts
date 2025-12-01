export type BaseResponse<T> = T;

export type GetCardsOkResponse = BaseResponse<
    {
        id: string;
        term: string;
        definition: string;
        translation: string;
        example: string;
        category: string;
        nextReview: number;
        interval: number;
        easeFactor: number;
        streak: number;
    }[]
>;
