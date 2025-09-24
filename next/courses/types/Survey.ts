import { SurveyQuestion } from "../courses-hub/types/SurveyQuestion";

export type Survey = {
    id: string;
    lessonId: string;
    questions: SurveyQuestion[];
};