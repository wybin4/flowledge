import { LessonSidebarMaterials } from "../functions/getLessonSidebarMaterials";
import { LessonPageSectionItem, LessonPageSectionLessonItemMapped } from "./LessonPageSectionItem";

export interface CourseListLessonSidebarItem extends Omit<LessonPageSectionItem, 'lessons'> {
    lessons: {
        lesson: LessonPageSectionLessonItemMapped;
        materials: LessonSidebarMaterials[];
    }[];
};