import { SurveyQuestion } from "./SurveyQuestion";

export type Survey = {
    _id: string;
    lessonId: string;
    questions: SurveyQuestion[];
};