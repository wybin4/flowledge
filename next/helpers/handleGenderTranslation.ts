import { Gender } from "@/types/Gender";
import { Language } from "@/user/types/Language";
import { TFunction } from "i18next";

export const handleGenderTranslation = (
    prefix: string,
    t: TFunction,
    gender: Gender,
    key: string,
    locale: Language,
): string => {
    if (locale === Language.RU) {
        const genderKey = `${prefix}.__gender__${key}_${gender}`;
        return t(genderKey);
    } else {
        const genderKey = `${prefix}.__gender__${key}`;
        return t(genderKey);
    }
};