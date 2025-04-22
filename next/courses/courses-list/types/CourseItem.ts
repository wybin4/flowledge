import { SectionItem } from "../../types/SectionItem";

export interface CourseItem {
    _id: string;
    title: string;
    imageUrl: string;
    description?: string;
    isFavourite?: boolean;
    sections?: SectionItem[];
    tags?: string[];
    comments?: string[];
}