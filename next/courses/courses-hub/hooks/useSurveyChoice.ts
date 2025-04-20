import { SurveyChoice } from "../types/SurveyChoice";

export const useSurveyChoice = (choice: SurveyChoice, setChoices: (fn: (prevChoices: SurveyChoice[]) => SurveyChoice[]) => void) => {
    const handleChoiceTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const text = e.target.value;
        setChoices(prevChoices => prevChoices.map(c =>
            c._id === choice._id ? { ...c, text } : c
        ));
    };

    const handleToggleCorrect = () => {
        setChoices(prevChoices =>
            prevChoices.map(c => {
                if (c._id === choice._id) {
                    return { ...c, isCorrect: !c.isCorrect };
                } else {
                    return { ...c, isCorrect: false };
                }
            })
        );
    };

    return { handleChoiceTextChange, handleToggleCorrect };
};