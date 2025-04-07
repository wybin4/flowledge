import { CourseLessonItem } from "../courses-list/types/CourseLessonItem";
import { Section } from "./Section";

export interface SectionItem {
    section: Section;
    lessons?: CourseLessonItem[];
}