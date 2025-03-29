export const getFormattedDateWithTime = (date: string, locale: string) => {
    return new Date(date).toLocaleString(locale, { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' });
}