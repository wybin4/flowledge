import { useState } from "react";
import { SurveyChoice } from "../types/SurveyChoice";

export const useSurveyChoices = (initialChoices: SurveyChoice[]) => {
    const [choices, setChoices] = useState<SurveyChoice[]>(initialChoices);

    const canAddChoices = choices.length < 6;
    const canDeleteChoices = choices.length > 2;

    const handleAddChoice = () => {
        if (!canAddChoices) {
            return;
        }
        const newChoice: SurveyChoice = {
            _id: String(Date.now()),
            text: '',
            isCorrect: false,
        };
        const updatedChoices = [...choices, newChoice];
        if (!updatedChoices.some(choice => choice.isCorrect)) {
            updatedChoices[0].isCorrect = true;
        }
        setChoices(updatedChoices);
    };

    const handleDeleteChoice = (_id: string) => {
        if (canDeleteChoices) {
            const deletedChoice = choices.find(choice => choice._id === _id);
            const newChoices = choices.filter(choice => choice._id !== _id);

            if (deletedChoice?.isCorrect && newChoices.length > 0) {
                const nearestChoice = newChoices[0];
                nearestChoice.isCorrect = true;
            }

            setChoices(newChoices);
        }
    };

    return { choices, setChoices, canAddChoices, canDeleteChoices, handleAddChoice, handleDeleteChoice };
};