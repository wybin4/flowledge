import { CourseProgressLesson } from "./CourseProgressLesson";

export interface CourseProgressSection {
    id: string;
    lessons: CourseProgressLesson[];
    progress: number;
}