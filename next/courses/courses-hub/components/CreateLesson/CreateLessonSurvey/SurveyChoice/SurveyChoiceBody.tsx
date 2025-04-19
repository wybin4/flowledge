import styles from "./SurveyChoice.module.css";
import { useIcon } from "@/hooks/useIcon";
import cn from "classnames";
import { SurveyChoiceItem } from "./SurveyChoiceItem";
import { SurveyChoice } from "@/courses/courses-hub/types/SurveyChoice";

type SurveyChoiceBodyProps = {
    choice: SurveyChoice;
};

export const SurveyChoiceBody = ({ choice: { isCorrect, text } }: SurveyChoiceBodyProps) => {
    const correctIcon = useIcon('round-filled');
    const incorrectIcon = useIcon('round');

    return (
        <div className={styles.bodyContainer}>
            <div className={cn(styles.correctionIcon, {
                [styles.correctIcon]: isCorrect,
                [styles.incorrectIcon]: isCorrect
            })}>{
                    isCorrect ? correctIcon : incorrectIcon
                }</div>
            <SurveyChoiceItem text={text} />
        </div>
    );
};
