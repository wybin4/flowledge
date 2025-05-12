import { SurveyChoice } from "./SurveyChoice";

export type SurveyQuestion = {
    _id: string;
    title: string;
    choices: SurveyChoice[];
};