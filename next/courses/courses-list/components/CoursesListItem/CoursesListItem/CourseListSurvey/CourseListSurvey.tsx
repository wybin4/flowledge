"use client";

import { userApiClient } from "@/apiClient";
import { SurveyChoiceItem } from "@/courses/courses-hub/components/CreateLesson/CreateLessonSurvey/SurveyChoice/SurveyChoiceItem";
import { Survey } from "@/courses/types/Survey";
import { SurveyQuestion } from "@/courses/courses-hub/types/SurveyQuestion";
import { coursesListPrefix, surveysPrefix } from "@/helpers/prefixes";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./CourseListSurvey.module.css";
import { CardContainer } from "@/components/Card/CardContainer";
import { TablePagePagination } from "@/components/TablePage/TablePage/TablePagePagination";
import { SurveyChoice } from "@/courses/courses-hub/types/SurveyChoice";
import cn from "classnames";
import { getCheckedChoiceIds } from "@/courses/functions/getCheckedChoiceIds";
import { SurveyResult } from "@/courses/types/SurveyResult";
import { CourseListSurveyResultModalContent } from "./CourseListSurveyResultModalContent/CourseListSurveyResultModalContent";
import { Modal } from "@/components/Modal/Modal";
import { SurveyGetByIdResponse } from "@/courses/courses-list/dtos/SurveyGetByIdResponse";
import { ButtonBackContainer } from "@/components/Button/ButtonBack/ButtonBackContainer";
import { ChildrenPosition } from "@/types/ChildrenPosition";
import { CourseListLessonPageStickyBottomBar } from "../../CourseListLessonPage/CourseListLessonPageStickyBottomBar";

type CourseListSurveyProps = {
    courseId: string;
    lessonId: string;
    onExit: () => void;
    onBack: () => void;
    onNext: () => void;
    titlePostfix: string;
};

export const CourseListSurvey = ({ courseId, lessonId, onExit, onBack, onNext, titlePostfix }: CourseListSurveyProps) => {
    const [selectedQuestion, setSelectedQuestion] = useState<SurveyQuestion | undefined>();
    const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
    const [surveyId, setSurveyId] = useState<string | undefined>();
    const [surveyResult, setSurveyResult] = useState<SurveyResult | undefined>(undefined);
    const [hasInitialResult, setHasInitialResult] = useState<boolean>(false);

    const { t } = useTranslation();

    useEffect(() => {
        userApiClient.get<SurveyGetByIdResponse>(
            `${surveysPrefix}.get/${lessonId}?courseId=${courseId}`
        ).then(({ survey, result }) => {
            if (survey.questions.length) {
                setQuestions(survey.questions);
                setSelectedQuestion(survey.questions[0]);
                setSurveyId(survey._id);
            }

            if (result) {
                setHasInitialResult(true);
                setSurveyResult(result);
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
        userApiClient.post<SurveyResult>(`${surveysPrefix}.attempt`, {
            surveyId, userChoices: getCheckedChoiceIds(questions)
        }).then(res => setSurveyResult(res));
    };

    const handleRetry = () => {
        setHasInitialResult(false);
        setSurveyResult(undefined);

        const resetQuestions = questions.map(question => ({
            ...question,
            choices: question.choices.map(choice => ({
                ...choice,
                isChecked: false
            }))
        }));
        setQuestions(resetQuestions);
        setSelectedQuestion(resetQuestions[0]);
    };

    return (
        <>
            {hasInitialResult && surveyResult && (
                <div className={styles.resultContainer}>
                    <CourseListSurveyResultModalContent
                        titleNext={titlePostfix}
                        isInitial={true}
                        result={surveyResult}
                        onExit={onExit}
                        onStart={() => {
                            handleRetry();
                            setSurveyResult(undefined);
                        }}
                        onNext={onNext}
                    />
                </div>
            )}
            {!hasInitialResult && (
                <CourseListLessonPageStickyBottomBar
                    titlePostfix={titlePostfix}
                    onClick={onNext}
                    hasBackButton={false}
                >
                    <ButtonBackContainer
                        backButtonText={t(`${coursesListPrefix}.back-to-materials`)}
                        type={ChildrenPosition.TopRight}
                        onBackButtonClick={onBack}
                        className={styles.surveyContainer}
                        compressBody={false}
                    >{_ => (
                        <>
                            <Modal isOpen={!!surveyResult}>{_ =>
                                <>
                                    {surveyResult && (
                                        <CourseListSurveyResultModalContent
                                            titleNext={titlePostfix}
                                            isInitial={false}
                                            result={surveyResult}
                                            onExit={onExit}
                                            onRetry={handleRetry}
                                            onNext={onNext}
                                        />
                                    )}
                                </>
                            }</Modal>
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
                        </>
                    )}</ButtonBackContainer>
                </CourseListLessonPageStickyBottomBar>
            )}
        </>
    );
};