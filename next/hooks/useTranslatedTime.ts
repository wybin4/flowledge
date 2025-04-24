import { formatTimeUnit, parseTimeUnit } from "@/helpers/parseTimeUnit";
import { useTranslation } from "react-i18next";

export const useTranslatedTime = (): ((time: string) => string | undefined) => {
    const { t } = useTranslation();

    return (time: string) => {
        const parsedTime = parseTimeUnit(time);

        if (parsedTime) {
            const { value, unit } = parsedTime;
            const formattedUnit = formatTimeUnit(unit);
            return `${value} ${t(formattedUnit)}`;
        }

        return undefined;
    };
}
