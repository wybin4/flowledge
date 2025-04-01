import { Language } from "@/user/types/Language";
import { TFunction } from "i18next";

export const handlePluralTranslation = (prefix: string, t: TFunction, count: number, key: string, locale: Language) => {
    if (locale === Language.RU) {
        return t(`${prefix}.__count__${key}_${count === 0 ? 'zero' : count === 1 ? 'one' : count === 2 ? 'two' : 'plural'}`, { count });
    } else {
        return t(`${prefix}.__count__${key}_${count === 0 ? 'zero' : count === 1 ? 'one' : 'plural'}`, { count });
    }
}
