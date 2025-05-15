import { LessonStuff } from "./LessonStuff";

export type LessonPageItem = {
    _id: string;
    title?: string;
    time?: string;
    imageUrl?: string;
    synopsisText?: string;
    videoUrl?: string;
    stuffList?: LessonStuff[];

    comments?: string[];
    courseName?: string;
};
