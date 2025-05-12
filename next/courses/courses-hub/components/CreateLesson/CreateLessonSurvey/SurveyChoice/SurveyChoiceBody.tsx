import styles from "./SurveyChoice.module.css";
import { useIcon } from "@/hooks/useIcon";
import cn from "classnames";
import { SurveyChoice } from "@/courses/courses-hub/types/SurveyChoice";
import { Input } from "@/components/InputBox/Input";
import { useSurveyChoice } from "@/courses/courses-hub/hooks/useSurveyChoice";

type SurveyChoiceBodyProps = {
    choice: SurveyChoice;
    setChoices: (fn: (prevChoices: SurveyChoice[]) => SurveyChoice[]) => void;
    onDelete: (_id: string) => void;
    deleteClassNames?: string;
};

export const SurveyChoiceBody = ({
    choice, setChoices,
    onDelete, deleteClassNames
}: SurveyChoiceBodyProps) => {
    const { _id, title, isCorrect } = choice;

    const correctIcon = useIcon('round-filled');
    const incorrectIcon = useIcon('round');
    const deleteIcon = useIcon('delete');

    const { handleChoiceTextChange, handleToggleCorrect } = useSurveyChoice(choice, setChoices);

    return (
        <div className={styles.bodyContainer}>
            <div onClick={handleToggleCorrect} className={cn(styles.correctionIcon, {
                [styles.correctIcon]: isCorrect,
                [styles.incorrectIcon]: isCorrect
            })}>{
                    isCorrect ? correctIcon : incorrectIcon
                }</div>
            <Input type='text' value={title} onChange={handleChoiceTextChange} />
            <div
                className={cn(styles.itemDelete, deleteClassNames)}
                onClick={() => onDelete(_id)}
            >
                {deleteIcon}
            </div>
        </div>
    );
};
