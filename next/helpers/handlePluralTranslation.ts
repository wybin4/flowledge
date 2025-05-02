import { Language } from "@/user/types/Language";
import { TFunction } from "i18next";

export const handlePluralTranslation = (prefix: string, t: TFunction, count: number, key: string, locale: Language) => {
    if (locale === Language.RU) {
        const mod100 = count % 100;
        const mod10 = count % 10;

        if (count === 0) {
            return t(`${prefix}.__count__${key}_zero`, { count });
        }

        let pluralKey;
        if (mod10 === 1 && mod100 !== 11) {
            pluralKey = 'one';
        } else if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) {
            pluralKey = 'few';
        } else if (mod10 === 0 || [5, 6, 7, 8, 9].includes(mod10) || [11, 12, 13, 14].includes(mod100)) {
            pluralKey = 'many';
        } else {
            pluralKey = 'plural';
        }

        return t(`${prefix}.__count__${key}_${pluralKey}`, { count });
    } else {
        return t(`${prefix}.__count__${key}_${count === 0 ? 'zero' : count === 1 ? 'one' : 'plural'}`, { count });
    }
}
