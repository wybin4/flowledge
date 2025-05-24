import { CourseEditor } from "@/courses/courses-hub/types/CourseEditor";
import { SectionItem } from "@/courses/types/SectionItem";

export interface CoursesHubDetail {
    _id: string;
    title: string;
    imageUrl: string;
    description?: string;
    sections?: SectionItem[];
    tags?: string[];
    editors: CourseEditor[];
    isPublished?: boolean;
    versionId: string;
    versionName: string;
}