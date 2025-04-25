import { SettingValue } from '@/types/Setting';
import { CachedCollection } from './CachedCollection';

export const PrivateSettings = new CachedCollection<SettingValue>('private-settings');

function filterSettingsByRegex(regexArray: string[]): SettingValue[] {
    const regexQueries = regexArray.map(regex => ({ _id: { '$regex': regex } }));
    const settings = PrivateSettings.collection.find({
        $and: regexQueries
    });
    return settings;
}

export function getPrivateSettingsByRegex(regexArray: string[]): SettingValue[] {
    return filterSettingsByRegex(regexArray);
}

export function getPrivateSettingByRegex<T>(regexArray: string[]): T | undefined {
    const filteredSettings = filterSettingsByRegex(regexArray);

    return filteredSettings.length > 0
        ? filteredSettings[0].value as T | undefined
        : undefined;
}
