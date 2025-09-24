import { SettingWrapperProps } from "./SettingWrapper";

export const areSettingWrapperPropsEqual = (prevProps: SettingWrapperProps, nextProps: SettingWrapperProps) => (
    JSON.stringify(prevProps.setting.value) === JSON.stringify(nextProps.setting.value) &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.setting.id === nextProps.setting.id &&
    (prevProps.setting as any).options === (nextProps.setting as any).options &&
    prevProps.isOptionsTranslatable === nextProps.isOptionsTranslatable
);

export const areSettingWrapperContainerPropsEqual = (prevProps: SettingWrapperProps, nextProps: SettingWrapperProps) => (
    prevProps.validateError === nextProps.validateError
);
