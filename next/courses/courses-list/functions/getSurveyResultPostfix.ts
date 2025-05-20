export const getSurveyResultPostfix = (isPassed: boolean, isAttemptsExhausted: boolean): string => {
    if (isPassed) {
        return 'passed';
    } else if (isAttemptsExhausted) {
        return 'attempts-exhausted';
    } else {
        return 'failed';
    }
};