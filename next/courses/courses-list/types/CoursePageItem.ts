import { LessonItem } from "./LessonItem";

export interface CoursePageItem {
    _id: string;
    title: string;
    imageUrl: string;
    description?: string;
    lessons?: LessonItem[];
}