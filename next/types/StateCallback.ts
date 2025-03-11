export enum CallbackUsage {
    MANY = 'MANY',
    ONE = 'ONE'
}

type CallbackOneMany<T> = (newSettings: T[], usage?: CallbackUsage) => void;
type CallbackSimple<T> = (newSettings: T[]) => void;

export type SetStateCallbacks<T> =
    | ((callback: CallbackOneMany<T>, regex: string) => void)
    | ((callback: CallbackSimple<T>, regex: string) => void);

export type RemoveStateCallbacks<T> = (callback: (newItems: T[]) => void) => void;
