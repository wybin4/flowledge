import { SettingValue } from '@/types/Setting';
import { CachedCollection } from './CachedCollection';

// export const PrivateSettings = Application.addCollection<SettingValue>('private-settings');

export const PrivateSettings = new CachedCollection<SettingValue>('private-settings');

// export function setPrivateSetting(setting: SettingValue) {
//     PrivateSettings.collection.insertOne(setting);
// }

export function getPrivateSetting<T>(_id: string): T | undefined {
    const setting = PrivateSettings.collection.findOne({ _id });
    return setting?.value as T ?? undefined;
}

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
        ? (filteredSettings[0].value || filteredSettings[0].packageValue) as T | undefined
        : undefined;
}


// export function getPrivateSettingsByTab(tab: string): SettingValue[] {
//     return PrivateSettings.find({ tab }) ?? [];
// }

// setPrivateSetting({
//     tab: 'search',
//     name: 'page-size',
//     i18nLabel: 'private-settings.search.page-size',
//     type: SettingType.InputNumber,
//     value: 10
// });

// setPrivateSetting({
//     tab: 'ldap',
//     name: 'enable',
//     i18nLabel: 'private-settings.ldap.enable.name',
//     type: SettingType.Radio,
//     value: false
// });

// setPrivateSetting({
//     tab: 'ldap',
//     name: 'host',
//     i18nLabel: 'private-settings.ldap.host.name',
//     type: SettingType.InputText,
//     value: ''
// });

// setPrivateSetting({
//     tab: 'ldap',
//     name: 'port',
//     i18nLabel: 'private-settings.ldap.port.name',
//     type: SettingType.InputNumber,
//     value: ''
// });

// setPrivateSetting({
//     tab: 'ldap',
//     name: 'authentication_password',
//     i18nLabel: 'private-settings.ldap.authentication_password.name',
//     type: SettingType.InputPassword,
//     value: ''
// });

// setPrivateSetting({
//     tab: 'ldap',
//     name: 'field_map',
//     i18nLabel: 'private-settings.ldap.field_map.name',
//     type: SettingType.Code,
//     value: '{\n\t"employee": "general",\n\t"techsupport": [\n\t\t"helpdesk",\n\t\t"support"\n\t]\n}',
// });
