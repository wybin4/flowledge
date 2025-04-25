import { ICourse } from "@/types/Course";
import { SectionItem } from "../../types/SectionItem";

export interface CourseItem extends ICourse {
    sections?: SectionItem[];
    comments?: string[];
}

export interface CourseWithSubscriptionItem extends CourseItem {
    isFavourite?: boolean;
}