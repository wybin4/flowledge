import { CourseLessonItem } from "../courses-list/types/CourseLessonItem";

export interface SectionItem {
    _id: string;
    title: string;
    lessons?: CourseLessonItem[];
}