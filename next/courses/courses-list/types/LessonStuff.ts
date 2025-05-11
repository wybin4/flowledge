import { StuffTypes } from "@/stuff/types/StuffTypes";

export interface LessonStuff {
    _id: string;
    type: StuffTypes;
    value?: string;
    file?: {
        name: string;
        url: string;
    };
}