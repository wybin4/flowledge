"use client";

import RightSidebar from "@/components/Sidebar/RightSidebar/RightSidebar";
import { useTranslation } from "react-i18next";
import styles from "./CreateLessonSurvey.module.css";
import { useState } from "react";
import { SurveyQuestionItem } from "./SurveyQuestion/SurveyQuestionItem";
import cn from "classnames";
import { SurveyQuestion } from "@/courses/courses-hub/types/SurveyQuestion";
import { SurveyQuestionBody } from "./SurveyQuestion/SurveyQuestionBody/SurveyQuestionBody";
import { SortableList } from "@/components/Sortable/SortableList";
import { ChildrenPosition } from "@/types/ChildrenPosition";
import { useScrollToElement } from "@/hooks/useScrollToElement";
import { useAddQuestionToUrl } from "@/courses/courses-hub/hooks/useAddQuestionToUrl";
import { MenuButton } from "@/components/MenuButton/MenuButton";
import { ItemSize } from "@/types/ItemSize";
import { Button, ButtonType } from "@/components/Button/Button";
import { ButtonBack } from "@/components/Button/ButtonBack/ButtonBack";
import { StickyBottomBar } from "@/components/StickyBottomBar/StickyBottomBar";
import { coursesHubLessonsPrefixTranslate } from "@/helpers/prefixes";
import { FillBorderUnderlineMode } from "@/types/FillBorderUnderlineMode";

type CreateLessonSurveyProps = {
    selectedQuestionId?: string;
};

export const CreateLessonSurvey = ({ selectedQuestionId }: CreateLessonSurveyProps) => {
    const handleScrollToQuestion = useAddQuestionToUrl();

    const initialQuestions = [{
        _id: '1',
        text: "какую цель преследует статья с проектами для начинающих python-разработчиков?",
        choices: [{
            _id: '1111',
            text: "1",
            isCorrect: true
        }, {
            _id: '2222',
            text: "2",
        }, {
            _id: '3333',
            text: "3",
        }, {
            _id: '4444',
            text: "4",
        }]
    }, {
        _id: '2',
        text: "что помогут сделать предложенные в статье проекты для начинающих python-разработчиков?",
        choices: [{
            _id: '5555',
            text: "1",
        }, {
            _id: '6666',
            text: "2",
        }, {
            _id: '7777',
            text: "3",
            isCorrect: true
        }, {
            _id: '8888',
            text: "4",
        }]
    }];
    const [questions, setQuestions] = useState<SurveyQuestion[]>(initialQuestions);

    const canDeleteQuestions = questions.length > 1;

    const { t } = useTranslation();

    const handleSetQuestion = (newQuestion?: SurveyQuestion, _id?: string) => {
        setQuestions(prevQuestions => {
            if (_id) {
                return prevQuestions.filter(question => question._id !== _id);
            } else if (newQuestion) {
                return prevQuestions.map(question =>
                    question._id === newQuestion._id ? newQuestion : question
                );
            }
            return prevQuestions;
        });
    }

    const handleAddQuestion = () => {
        const newId = String(Date.now())
        const newQuestion: SurveyQuestion = {
            _id: newId,
            text: t('type-here'),
            choices: []
        };
        setQuestions(prevQuestions => [...prevQuestions, newQuestion]);
        handleScrollToQuestion(newId);
    };

    useScrollToElement(selectedQuestionId);

    const saveItem = () => { };

    return (
        <RightSidebar content={_ =>
            <div className={styles.container}>
                <div className={cn(styles.titleContainer, styles.mt)}>
                    <div className={styles.titleText}>{t('questions.name')} ({questions.length})</div>
                    <div
                        onClick={handleAddQuestion}
                        className={styles.titleButton}
                    >
                        {t('questions.add')}
                    </div>
                </div>
                <SortableList
                    items={questions}
                    setItems={setQuestions}
                    buttonPosition={ChildrenPosition.Left}
                    className={styles.questionContainer}
                    renderItem={(item, index) => (
                        <SurveyQuestionItem
                            _id={item._id}
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
                <StickyBottomBar barContent={
                    <div className={styles.buttonContainer}>
                        <ButtonBack hasBackButtonIcon={false} />
                        {JSON.stringify(initialQuestions) != JSON.stringify(questions) &&
                            <Button
                                onClick={() => saveItem()}
                                prefix={coursesHubLessonsPrefixTranslate}
                                type={ButtonType.SAVE}
                                mode={FillBorderUnderlineMode.UNDERLINE}
                                noEffects={true}
                            />
                        }
                    </div>
                }>
                    <div className={cn(styles.titleContainer, styles.mb)}>
                        <div></div>
                        <MenuButton size={ItemSize.Little} isExpanded={isExpanded} onClick={toggleSidebar} />
                    </div>
                    {questions.map((question, index) => (
                        <SurveyQuestionBody
                            key={index}
                            number={index + 1}
                            question={question}
                            setQuestion={handleSetQuestion}
                            canDeleteQuestions={canDeleteQuestions}
                        />
                    ))}
                </StickyBottomBar>
            </div>
        )}</RightSidebar>
    )
};