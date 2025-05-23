import { ICourse } from "@/types/Course";
import { SectionItem } from "../../types/SectionItem";
import { CourseSubscriptionItem } from "./CourseSubscriptionItem";

export interface CourseItem extends ICourse {
    sections?: SectionItem[];
    comments?: string[];
}

export type CourseWithSubscriptionItem =
    CourseItem & Pick<CourseSubscriptionItem, 'isFavourite' | 'isSubscribed' | 'progress' | 'courseVersion'>;