export interface Card {
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
}

export enum Mode {
    Dashboard = 'dashboard',
    Study = 'study',
    Add = 'add',
    Summary = 'summary'
}
