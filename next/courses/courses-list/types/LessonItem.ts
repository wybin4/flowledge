import { Stuff } from "@/stuff/types/Stuff";
import { StuffTypes } from "@/stuff/types/StuffTypes";

export interface LessonItem {
    _id: string;
    title: string;
    time: string;
    imageUrl?: string;
    synopsis?: string;
    videoUrl?: string;
    stuffs?: LessonStuff[];
}

export interface LessonStuff {
    _id: string;
    type: StuffTypes;
    value?: string;
    file?: {
        name: string;
        url: string;
    }; // TODO: replace to file
}