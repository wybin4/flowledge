import { EnhancedItemProps, EnhancedItemSettingKey } from "./EnhancedItem"
import { EnhancedItemBodyProps } from "./EnhancedItemBody"

const areSettingKeysEqual = (prevKeys: EnhancedItemSettingKey[], nextKeys: EnhancedItemSettingKey[]) => {
    return prevKeys.every((key, index) =>
        key.error === nextKeys[index].error &&
        key.additionalProps?.options === nextKeys[index].additionalProps?.options
    )
}

export const areEnhancedItemPropsEqual = <T, U>(prevProps: EnhancedItemProps<T, U>, nextProps: EnhancedItemProps<T, U>) => {
    return prevProps._id === nextProps._id &&
        prevProps.mode === nextProps.mode &&
        prevProps.title === nextProps.title &&
        JSON.stringify(prevProps.passedInitialValues) === JSON.stringify(nextProps.passedInitialValues) &&
        areSettingKeysEqual(prevProps.settingKeys, nextProps.settingKeys);
}

export const areEnhancedItemBodyPropsEqual = <T,>(prevProps: EnhancedItemBodyProps<T>, nextProps: EnhancedItemBodyProps<T>) => {
    return JSON.stringify(prevProps.item) === JSON.stringify(nextProps.item) &&
        prevProps.title === nextProps.title &&
        prevProps.mode === nextProps.mode &&
        areSettingKeysEqual(prevProps.settingKeys, nextProps.settingKeys);
}
