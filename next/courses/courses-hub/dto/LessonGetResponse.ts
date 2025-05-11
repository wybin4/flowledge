import { TimeUnit } from "@/types/TimeUnit";

export interface LessonGetResponse {
    _id: string;
    title: string;
    time: TimeUnit;
    imageUrl?: string;
    additionalInfo?: string;
    isVisible?: boolean;
}