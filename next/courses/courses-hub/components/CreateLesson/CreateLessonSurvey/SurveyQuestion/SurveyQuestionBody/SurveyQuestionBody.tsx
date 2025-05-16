import { TextArea } from "@/components/TextArea/TextArea";
import { t } from "i18next";
import { SurveyQuestionItem } from "../SurveyQuestionItem/SurveyQuestionItem";
import styles from "./SurveyQuestionBody.module.css";
import { SurveyQuestion } from "@/courses/courses-hub/types/SurveyQuestion";
import { SortableList } from "@/components/Sortable/SortableList";
import { SurveyChoiceBody } from "../../SurveyChoice/SurveyChoiceBody";
import cn from "classnames";
import { useEffect } from "react";
import { useSurveyChoices } from "@/courses/courses-hub/hooks/useSurveyChoices";
import { ItemSize } from "@/types/ItemSize";

type SurveyQuestionBodyProps = {
    number?: number;
    question: SurveyQuestion;
    setQuestion?: (newQuestion?: SurveyQuestion, _id?: string) => void;
    canDeleteQuestions?: boolean;
};

export const SurveyQuestionBody = ({
    number,
    question, setQuestion,
    canDeleteQuestions
}: SurveyQuestionBodyProps) => {
    const {
        choices, setChoices,
        canAddChoices, canDeleteChoices,
        handleAddChoice, handleDeleteChoice
    } = useSurveyChoices(question.choices);

    useEffect(() => {
        setQuestion?.({ ...question, choices });
    }, [JSON.stringify(choices)]);

    const handleQuestionTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const title = e.target.value;
        setQuestion?.({ ...question, title });
    };

    const handleDeleteQuestion = () => canDeleteQuestions && setQuestion?.(undefined, question._id);

    return (
        <SurveyQuestionItem
            _id={question._id}
            number={number}
            size={ItemSize.Big}
            handleDelete={handleDeleteQuestion}
            deleteClassNames={cn({
                [styles.locked]: !canDeleteQuestions
            })}
            children={
                <>
                    <TextArea value={question.title} onChange={handleQuestionTextChange} />
                    {!!choices.length && <div>{t('questions.choices.name')}</div>}
                    <SortableList
                        items={choices}
                        setItems={setChoices}
                        renderItem={item =>
                            <SurveyChoiceBody
                                setChoices={setChoices}
                                onDelete={handleDeleteChoice}
                                deleteClassNames={cn({
                                    [styles.locked]: !canDeleteChoices
                                })}
                                choice={item}
                            />
                        }
                    />
                    <div
                        onClick={handleAddChoice}
                        className={cn(styles.action, {
                            [styles.locked]: !canAddChoices
                        })}
                    >
                        {t('questions.choices.add')}
                    </div>
                </>
            }
        />
    );
};