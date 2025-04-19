import { SettingWrapperProps } from "./SettingWrapper";

export const areSettingWrapperPropsEqual = (prevProps: SettingWrapperProps, nextProps: SettingWrapperProps) => (
    JSON.stringify(prevProps.setting.value) === JSON.stringify(nextProps.setting.value) &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.setting._id === nextProps.setting._id
);

export const areSettingWrapperContainerPropsEqual = (prevProps: SettingWrapperProps, nextProps: SettingWrapperProps) => (
    prevProps.validateError === nextProps.validateError
);
