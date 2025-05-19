import { Survey } from "@/courses/types/Survey";
import { SurveyResult } from "@/courses/types/SurveyResult";

export type SurveyGetByIdResponse = {
    survey: Survey;
    result?: SurveyResult;
};