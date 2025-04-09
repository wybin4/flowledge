import { TFunction } from "i18next";

const SYMBOL_MAP: Record<string, string> = {
    'a-zA-Z': 'latin-letters',
    'а-яА-Я': 'cyrillic-letters',
    '0-9': 'digits',
    '_': 'underscore',
    '-': 'dash',
    '@': 'at',
    '\\.': 'dot',
    ' ': 'spaces'
};

export const getErrorByRegex = (pattern: string, prefix: string, t: TFunction): (value: string) => string => {
    let regex = new RegExp(`^${pattern}$`);

    const matches = pattern.match(/\[([^\]]+)\]/)?.[1] || '';
    const allowed = matches.split('').reduce((acc, char, i, arr) => {
        if (char === '\\' && arr[i + 1]) {
            acc.push(SYMBOL_MAP[char + arr[i + 1]] || `${char}${arr[i + 1]}`);
            arr.splice(i, 1);
            return acc;
        }
        const key = Object.keys(SYMBOL_MAP).find(k => k.includes(char));
        if (key) acc.push(SYMBOL_MAP[key]);
        return acc;
    }, [] as string[]);

    const uniqueAllowed = [...new Set(allowed)];
    const lastPart = uniqueAllowed.length > 1
        ? uniqueAllowed.pop()
        : '';

    return (value: string) => {
        if (regex.test(value)) return '';

        return t(`${prefix}.title-regex.error`, {
            start: uniqueAllowed.map(item => t(item)).join(', '),
            end: lastPart && lastPart != '' ? t('and') + ' ' + t(lastPart) : ''
        });
    }
}
