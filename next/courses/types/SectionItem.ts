import { LessonGetResponse } from "../courses-hub/dto/LessonGetResponse";
import { Section } from "./Section";

export interface SectionItem {
    section: Section;
    lessons?: LessonGetResponse[];
}