import { SurveyChoice } from "./SurveyChoice";

export type SurveyQuestion = {
    id: string;
    title: string;
    choices: SurveyChoice[];
};