import { LessonStuff } from "./LessonStuff";

export type LessonPageItem = {
    _id: string;
    title: string;
    time: string;
    imageUrl?: string;
    sectionId?: string;

    synopsisText?: string;
    videoId?: string;
    stuffList?: LessonStuff[];
};
