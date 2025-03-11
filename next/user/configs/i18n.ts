import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "@/locales/en.json";
import ru from "@/locales/ru.json";
import { Language } from "@/user/types/Language";

i18n.use(initReactI18next).init({
    resources: {
        EN: { translation: en },
        RU: { translation: ru },
    },
    lng: Language.EN,
    fallbackLng: Language.RU,
    interpolation: { escapeValue: false },
});

export default i18n;
