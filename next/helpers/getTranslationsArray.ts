import i18n from 'i18next';

export function getTranslationsArray(key: string): string[] {
    const locales = i18n.languages;
    const translations: string[] = [];

    locales.forEach(locale => {
        const translation = i18n.getResource(locale, 'translation', key);
        if (translation) {
            translations.push(translation);
        }
    });

    return translations;
}