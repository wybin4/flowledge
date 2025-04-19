"use client";

import RightSidebar from "@/components/Sidebar/RightSidebar/RightSidebar";
import { useTranslation } from "react-i18next";
import styles from "./CreateLessonSurvey.module.css";
import { useState } from "react";
import { SurveyQuestionItem } from "./SurveyQuestion/SurveyQuestionItem";
import cn from "classnames";
import { SurveyQuestion } from "@/courses/courses-hub/types/SurveyQuestion";
import { SurveyQuestionBody } from "./SurveyQuestion/SurveyQuestionBody";
import { SortableList } from "@/components/Sortable/SortableList";
import { ChildrenPosition } from "@/types/ChildrenPosition";

export const CreateLessonSurvey = () => {
    const [questions, setQuestions] = useState<SurveyQuestion[]>([{
        _id: '1',
        text: "какую цель преследует статья с проектами для начинающих python-разработчиков?",
        choices: [{
            _id: '1',
            text: "1",
            isCorrect: true
        }, {
            _id: '2',
            text: "2",
        }, {
            _id: '3',
            text: "3",
        }, {
            _id: '4',
            text: "4",
        }]
    }, {
        _id: '2',
        text: "что помогут сделать предложенные в статье проекты для начинающих python-разработчиков?",
        choices: [{
            _id: '5',
            text: "1",
        }, {
            _id: '6',
            text: "2",
        }, {
            _id: '7',
            text: "3",
            isCorrect: true
        }, {
            _id: '8',
            text: "4",
        }]
    }]);

    const { t } = useTranslation();

    const handleSetQuestion = (newQuestion: SurveyQuestion) => {
        setQuestions(prevQuestions => {
            const updatedQuestions = prevQuestions.map(question =>
                question._id === newQuestion._id ? newQuestion : question
            );
            return updatedQuestions;
        });
    }

    return (
        <RightSidebar content={classNames =>
            <div className={styles.container}>
                <div className={styles.titleContainer}>
                    <div className={styles.titleText}>{t('questions.name')} ({questions.length})</div>
                    <div className={styles.titleButton}>{t('questions.add')}</div>
                </div>
                <SortableList
                    items={questions}
                    setItems={setQuestions}
                    buttonPosition={ChildrenPosition.Left}
                    renderItem={(item, index) => (
                        <SurveyQuestionItem
                            text={item.text}
                            number={index + 1}
                            key={index}
                        />
                    )}
                />
            </div>
        }>{(isExpanded, toggleSidebar) => (
            <div className={cn(styles.container, {
                [styles.expanded]: isExpanded
            })}>
                <button onClick={toggleSidebar}>toggle</button>
                {questions.map((question, index) => (
                    <SurveyQuestionBody
                        key={index}
                        number={index + 1}
                        question={question}
                        setQuestion={handleSetQuestion}
                    />
                ))}
            </div>
        )}</RightSidebar>
    )
};