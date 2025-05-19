import { TimeUnit } from "@/types/TimeUnit";
import { Survey } from "../../types/Survey";

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
    survey?: Survey;
    synopsisText?: string;

    isDraft?: boolean;
}