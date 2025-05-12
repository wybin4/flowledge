import { SurveyQuestion } from "../types/SurveyQuestion";

export const parseSurveyText = (title: string): SurveyQuestion[] => {
    const questionBlocks = title.split(/\n\s*\d+\./)
    const questions: SurveyQuestion[] = [];

    questionBlocks.forEach((block, index) => {
        if (block.trim() === '') return;

        const lines = block.split('\n');
        const questionText = lines[0].trim();
        const answers = lines.slice(1, -1).map(line => {
            const match = line.match(/[A-Z]\.\s*(.*)/);
            return match ? match[1] : '';
        }).filter(answer => answer !== '');
        const correctAnswer = lines[lines.length - 1].match(/Правильный ответ:\s*([A-Z])/)?.[1];

        questions.push({
            _id: String(Date.now() + index),
            title: questionText,
            choices: answers.map((answer, i) => ({
                _id: String(i + 1),
                title: answer,
                isCorrect: correctAnswer === String.fromCharCode(65 + i)
            }))
        });
    });

    return questions;
};