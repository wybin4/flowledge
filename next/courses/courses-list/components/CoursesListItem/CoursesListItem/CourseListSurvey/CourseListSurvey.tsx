"use client";

import { userApiClient } from "@/apiClient";
import { SurveyChoiceItem } from "@/courses/courses-hub/components/CreateLesson/CreateLessonSurvey/SurveyChoice/SurveyChoiceItem";
import { Survey } from "@/courses/courses-hub/types/Survey";
import { SurveyQuestion } from "@/courses/courses-hub/types/SurveyQuestion";
import { coursesHubSurveysPrefixApi } from "@/helpers/prefixes";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./CourseListSurvey.module.css";
import { CardContainer } from "@/components/Card/CardContainer";
import { TablePagePagination } from "@/components/TablePage/TablePage/TablePagePagination";
import { SurveyChoice } from "@/courses/courses-hub/types/SurveyChoice";
import cn from "classnames";
import { getCheckedChoiceIds } from "@/courses/functions/getCheckedChoiceIds";

type CourseListSurveyProps = {
    lessonId: string;
};

export const CourseListSurvey = ({ lessonId }: CourseListSurveyProps) => {
    const [selectedQuestion, setSelectedQuestion] = useState<SurveyQuestion | undefined>();
    const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
    const [surveyId, setSurveyId] = useState<string | undefined>();

    const { t } = useTranslation();

    useEffect(() => {
        userApiClient.get<Survey>(
            `${coursesHubSurveysPrefixApi}.get/${lessonId}`
        ).then(survey => {
            if (survey.questions.length) {
                setQuestions(survey.questions);
                setSelectedQuestion(survey.questions[0]);
                setSurveyId(survey._id);
            }
        });
    }, [lessonId]);

    const currentQuestionIndex = selectedQuestion ? questions.indexOf(selectedQuestion) + 1 : 0;
    const totalQuestions = questions.length;
    const hasCheckedChoices = selectedQuestion?.choices.some(choice => choice.isChecked);
    const isLastQuestion = currentQuestionIndex === totalQuestions;

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 1) {
            const previousQuestion = questions[currentQuestionIndex - 2];
            setSelectedQuestion(previousQuestion);
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < totalQuestions) {
            const nextQuestion = questions[currentQuestionIndex];
            setSelectedQuestion(nextQuestion);
        }
    };

    const setChoices = (questionId: string) => {
        return (fn: (prevChoices: SurveyChoice[]) => SurveyChoice[]) => {
            setQuestions(prevQuestions => {
                const updatedQuestions = prevQuestions.map(question => {
                    if (question._id === questionId) {
                        const updatedChoices = fn(question.choices);
                        return {
                            ...question,
                            choices: updatedChoices
                        };
                    }
                    return question;
                });

                const updatedSelectedQuestion = updatedQuestions.find(q => q._id === questionId);
                if (updatedSelectedQuestion) {
                    setSelectedQuestion(updatedSelectedQuestion);
                }

                return updatedQuestions;
            });
        };
    };

    const handleFinish = () => {
        userApiClient.post(`${coursesHubSurveysPrefixApi}.attempt`, {
            surveyId, userChoices: getCheckedChoiceIds(questions)
        }).then(res => console.warn(res))
    };

    return (<>
        {selectedQuestion && (
            <div className={styles.container}>
                <TablePagePagination
                    currentPage={currentQuestionIndex}
                    totalPages={totalQuestions}
                    handlePreviousPage={handlePreviousQuestion}
                    handleNextPage={handleNextQuestion}
                    hideRightButton={!hasCheckedChoices}
                    onRightButtonClick={isLastQuestion ? handleFinish : undefined}
                    rightButton={isLastQuestion && (
                        <div>{t('finish')}</div>
                    )}
                />
                <div className={styles.questionContainer}>
                    <div className={styles.count}>{t('question')} {currentQuestionIndex} {t('from')} {totalQuestions}</div>
                    <div className={styles.questionBody}>
                        <div className={styles.questionTitle}>{selectedQuestion.title}</div>
                        <div className={styles.questionDescription}>{t('select-one-choice')}</div>
                        {selectedQuestion.choices.map((choice, index) => (
                            <CardContainer key={index} className={cn(styles.choiceContainer, {
                                [styles.checkedChoice]: choice.isChecked
                            })}>
                                <SurveyChoiceItem
                                    choice={choice}
                                    fieldToHandle='isChecked'
                                    setChoices={setChoices(selectedQuestion._id)}
                                    text={<div>{choice.title}</div>}
                                    handledIconClassName={styles.checkedChoiceIcon}
                                />
                            </CardContainer>
                        ))}
                    </div>
                </div>
            </div>
        )}
    </>);
};