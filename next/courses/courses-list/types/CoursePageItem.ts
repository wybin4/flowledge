import { SectionItem } from "../../types/SectionItem";

export interface CoursePageItem {
    _id: string;
    title: string;
    imageUrl: string;
    description?: string;
    favorite?: boolean;
    sections?: SectionItem[];
    tags?: string[];
    comments?: string[];
}