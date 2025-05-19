import { SurveyQuestion } from "../courses-hub/types/SurveyQuestion";

export type Survey = {
    _id: string;
    lessonId: string;
    questions: SurveyQuestion[];
};