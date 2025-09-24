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
    fieldToHandle?: keyof SurveyChoice;
    handledIconClassName?: string;
};

export const SurveyChoiceItem = ({
    text,
    choice, setChoices,
    actions,
    fieldToHandle = 'isCorrect', handledIconClassName
}: SurveyChoiceItemProps) => {
    const isHandled = Boolean(choice[fieldToHandle]);

    const handledIcon = useIcon('round-filled');
    const inhandledIcon = useIcon('round');

    const handleToggle = () => {
        setChoices(prevChoices =>
            prevChoices.map(c => {
                if (c.id === choice.id) {
                    return { ...c, [fieldToHandle]: !c[fieldToHandle] };
                } else {
                    return { ...c, [fieldToHandle]: false };
                }
            })
        );
    };

    return (
        <div className={styles.bodyContainer} onClick={handleToggle}>
            <div className={cn(styles.icon, isHandled ? handledIconClassName : undefined)}>
                {isHandled ? handledIcon : inhandledIcon}
            </div>
            {text}
            {actions}
        </div>
    );
};
