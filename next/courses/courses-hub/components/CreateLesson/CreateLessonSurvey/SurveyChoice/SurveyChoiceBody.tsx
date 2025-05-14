import styles from "./SurveyChoice.module.css";
import { useIcon } from "@/hooks/useIcon";
import cn from "classnames";
import { SurveyChoice } from "@/courses/courses-hub/types/SurveyChoice";
import { Input } from "@/components/InputBox/Input";
import { SurveyChoiceItem } from "./SurveyChoiceItem";

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
    const { _id, title } = choice;

    const deleteIcon = useIcon('delete');

    const handleChoiceTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const text = e.target.value;
        setChoices(prevChoices => prevChoices.map(c =>
            c._id === choice._id ? { ...c, text } : c
        ));
    };

    return (
        <SurveyChoiceItem
            choice={choice}
            setChoices={setChoices}
            text={<Input type='text' value={title} onChange={handleChoiceTextChange} />}
            actions={<>
                <div
                    className={cn(styles.itemDelete, deleteClassNames)}
                    onClick={() => onDelete(_id)}
                >
                    {deleteIcon}
                </div>
            </>}
            handledIconClassName={styles.correctIcon}
        />
    );
};
