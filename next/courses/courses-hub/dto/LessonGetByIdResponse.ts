import { TimeUnit } from "@/types/TimeUnit";

export interface LessonGetByIdResponse {
    _id: string;
    title: string;
    time: TimeUnit;
    imageUrl?: string;
    isVisible?: boolean;

    courseId?: string;
    sectionId?: string;
    videoId?: string;
    createdAt: Date;
    updatedAt: Date;
    surveyText?: string;
    synopsisText?: string;

    isDraft?: boolean;
}