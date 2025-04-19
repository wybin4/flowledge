import { TextArea } from "@/components/InputBox/TextArea";
import { t } from "i18next";
import { SurveyQuestionItem, SurveyQuestionItemType } from "./SurveyQuestionItem";
import styles from "./SurveyQuestion.module.css";
import { SurveyQuestion } from "@/courses/courses-hub/types/SurveyQuestion";
import { SurveyChoice } from "@/courses/courses-hub/types/SurveyChoice";
import { SortableList } from "@/components/Sortable/SortableList";
import { SurveyChoiceBody } from "../SurveyChoice/SurveyChoiceBody";

type SurveyQuestionBodyProps = {
    number: number;
    question: SurveyQuestion;
    setQuestion: (newQuestion: SurveyQuestion) => void;
};

export const SurveyQuestionBody = ({ number, question, setQuestion }: SurveyQuestionBodyProps) => {
    const handleTextChange = (text: string) => {
        setQuestion({ ...question, text });
    };

    const handleChoicesChange = (newChoices: SurveyChoice[]) => {
        setQuestion({ ...question, choices: newChoices });
    };

    const handleAddChoice = () => {
        const newChoice: SurveyChoice = {
            _id: String(Date.now()),
            text: '',
            isCorrect: false,
        };
        handleChoicesChange([...question.choices, newChoice]);
    };
    
    return (
        <SurveyQuestionItem
            number={number}
            type={SurveyQuestionItemType.Big}
            children={
                <>
                    <TextArea value={question.text} />
                    <div>{t('questions.choices.name')}</div>
                    <SortableList
                        items={question.choices}
                        setItems={handleChoicesChange}
                        renderItem={item => <SurveyChoiceBody choice={item} />}
                    />
                    <div className={styles.addChoice}>{t('questions.choices.add')}</div>
                </>
            }
        />
    );
};