"use client";

import { userApiClient } from "@/apiClient";
import { SurveyChoiceBody } from "@/courses/courses-hub/components/CreateLesson/CreateLessonSurvey/SurveyChoice/SurveyChoiceBody";
import { SurveyChoiceItem } from "@/courses/courses-hub/components/CreateLesson/CreateLessonSurvey/SurveyChoice/SurveyChoiceItem";
import { SurveyQuestionBody } from "@/courses/courses-hub/components/CreateLesson/CreateLessonSurvey/SurveyQuestion/SurveyQuestionBody/SurveyQuestionBody";
import { Survey } from "@/courses/courses-hub/types/Survey";
import { SurveyQuestion } from "@/courses/courses-hub/types/SurveyQuestion";
import { coursesHubSurveysPrefixApi } from "@/helpers/prefixes";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type CourseListSurveyProps = {
    lessonId: string;
};

export const CourseListSurvey = ({ lessonId }: CourseListSurveyProps) => {
    const [selectedQuestion, setSelectedQuestion] = useState<SurveyQuestion | undefined>();
    const [questions, setQuestions] = useState<SurveyQuestion[]>([]);

    const { t } = useTranslation();

    useEffect(() => {
        userApiClient.get<Survey>(
            `${coursesHubSurveysPrefixApi}.get/${lessonId}`
        ).then(survey => {
            if (survey.questions.length) {
                setQuestions(survey.questions);
                setSelectedQuestion(survey.questions[0]);
            }
        });
    }, [lessonId]);

    return (<>
        {selectedQuestion && (
            <>
                <div>вопрос {questions.indexOf(selectedQuestion) + 1} из {questions.length}</div>
                <div>{selectedQuestion.title}</div>
                <div>{t('select-one-choice')}</div>
                {selectedQuestion.choices.map((choice, index) => (
                    <SurveyChoiceItem
                        choice={choice}
                        setChoices={() => { }} // TODO
                        text={<div>{choice.title}</div>}
                    />
                ))}
            </>
        )}
    </>);
};