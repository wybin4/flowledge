import styles from "./SurveyChoice.module.css";
import { useIcon } from "@/hooks/useIcon";
import cn from "classnames";
import { ReactNode } from "react";
import { SurveyChoice } from "@/courses/courses-hub/types/SurveyChoice";

type SurveyChoiceItemProps = {
    choice: SurveyChoice;
    actions?: ReactNode;
    text: ReactNode;
    setChoices: (fn: (prevChoices: SurveyChoice[]) => SurveyChoice[]) => void;
};

export const SurveyChoiceItem = ({
    text, choice, setChoices, actions
}: SurveyChoiceItemProps) => {
    const { isCorrect } = choice;

    const correctIcon = useIcon('round-filled');
    const incorrectIcon = useIcon('round');

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

    return (
        <div className={styles.bodyContainer}>
            <div onClick={handleToggleCorrect} className={cn(styles.correctionIcon, {
                [styles.correctIcon]: isCorrect,
                [styles.incorrectIcon]: isCorrect
            })}>{
                    isCorrect ? correctIcon : incorrectIcon
                }</div>
            {text}
            {actions}
        </div>
    );
};
