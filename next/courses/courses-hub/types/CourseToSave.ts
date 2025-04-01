import { CourseCreator } from "../../types/CourseCreator";

export interface CourseToSave {
    title: string;
    description: string;
    imageUrl: string;
    u: CourseCreator;
}