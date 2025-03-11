// import { SettingValueType, SettingType } from '@/types/Setting';
// import { SettingWithTab } from '@/types/SettingWithTab';
// import { Application } from '.';

// export const PublicSettings = Application.addCollection<SettingWithTab<SettingValueType>>('public-settings');

// export function setPublicSetting(setting: SettingWithTab<SettingValueType>) {
//     PublicSettings.insertOne(setting);
// }

// export function getPublicSetting(name: string) {
//     const setting = PublicSettings.findOne({ name });
//     return setting ?? undefined;
// }

// export function getPublicSettingsByTab(tab: string): SettingWithTab<SettingValueType>[] {
//     return PublicSettings.find({ tab }) ?? [];
// }

// setPublicSetting({
//     tab: 'appearance',
//     name: 'theme',
//     i18nLabel: 'public-settings.appearance.theme.name',
//     type: SettingType.SelectorFinite,
//     i18nDescription: 'public-settings.appearance.theme.description',
//     options: [
//         {
//             label: 'public-settings.appearance.theme.auto',
//             value: 'auto'
//         },
//         {
//             label: 'public-settings.appearance.theme.dark',
//             value: 'dark'
//         },
//         {
//             label: 'public-settings.appearance.theme.light',
//             value: 'light'
//         }
//     ],
//     value: 'auto'
// });

// setPublicSetting({
//     tab: 'appearance',
//     name: 'language',
//     i18nLabel: 'public-settings.appearance.language.name',
//     type: SettingType.SelectorInfinite,
//     i18nDescription: 'public-settings.appearance.language.description',
//     options: [
//         {
//             label: 'public-settings.appearance.language.ru',
//             value: 'ru'
//         },
//         {
//             label: 'public-settings.appearance.language.en',
//             value: 'en'
//         },
//     ],
//     value: 'en',
//     placeholder: 'public-settings.appearance.language.placeholder'
// });
