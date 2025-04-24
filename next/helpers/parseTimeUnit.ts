import { TimeUnit } from "@/types/TimeUnit";

export const formatTimeUnit = (unit: string): string => {
    switch (unit) {
        case 'MINS':
            return 'minutes-abbr';
        case 'HOURS':
            return 'hours-abbr';
        default:
            return unit;
    }
};

export function parseTimeUnit(time: string): { value: number, unit: TimeUnit } | undefined {
    const timeUnits = Object.values(TimeUnit).join('|');
    const regex = new RegExp(`^(\\d+)\\s+(${timeUnits})$`, 'i');
    const match = time.match(regex);

    if (match) {
        const value = parseInt(match[1], 10);
        const unit = match[2] as TimeUnit;
        return { value, unit };
    }

    return undefined;
}