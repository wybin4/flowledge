import { TimeUnit } from "@/types/TimeUnit";

export interface CourseLessonItem {
    _id: string;
    title: string;
    time: TimeUnit;
    imageUrl?: string;
    additionalInfo?: string;
    isVisible?: boolean;
}