import { TimeUnit } from "@/types/TimeUnit";
import { Survey } from "../../types/Survey";

export interface LessonGetResponse {
    _id: string;
    title: string;
    time?: TimeUnit;
    imageUrl?: string;
    additionalInfo?: string;
    isVisible?: boolean;

    videoId?: string;
    synopsisText?: string; // TODO: stuff
    surveyText?: string;
    survey?: Survey; // TODO: only id for small response

    isMandatory?: boolean;
}