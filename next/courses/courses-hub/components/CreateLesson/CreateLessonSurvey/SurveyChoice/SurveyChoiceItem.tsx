import { Input } from "@/components/InputBox/Input";
import styles from "./SurveyChoice.module.css";
import { useIcon } from "@/hooks/useIcon";

type SurveyChoiceItemProps = {
    text: string;
};

export const SurveyChoiceItem = ({ text }: SurveyChoiceItemProps) => {
    const deleteIcon = useIcon('delete');

    return (
        <div className={styles.itemContainer}>
            <Input type='text' value={text} />
            <div className={styles.itemDelete}>{deleteIcon}</div>
        </div>
    );
};
