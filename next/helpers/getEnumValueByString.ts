export const getEnumValueByString = <T extends Record<string, string>>(
    value: string,
    enumObj: T
): T[keyof T] => {
    return Object.values(enumObj).find(v => v === value) as T[keyof T];
};
