import { SurveyQuestion } from "../courses-hub/types/SurveyQuestion";

export const getCheckedChoiceIds = (questions: SurveyQuestion[]): string[] => {
    return questions
        .flatMap(question => question.choices)
        .filter(choice => choice.isChecked)
        .map(choice => choice.id);
};