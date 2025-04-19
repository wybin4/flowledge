import { SurveyChoice } from "./SurveyChoice";

export type SurveyQuestion = {
    _id: string;
    text: string;
    choices: SurveyChoice[];
};