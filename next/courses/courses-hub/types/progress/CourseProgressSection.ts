import { CourseProgressLesson } from "./CourseProgressLesson";

export interface CourseProgressSection {
    _id: string;
    lessons: CourseProgressLesson[];
    progress: number;
}