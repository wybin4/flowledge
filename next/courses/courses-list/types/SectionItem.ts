import { CourseLessonItem } from "./CourseLessonItem";

export interface SectionItem {
    _id: string;
    title: string;
    lessons?: CourseLessonItem[];
}