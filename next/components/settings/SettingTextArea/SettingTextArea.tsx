import { memo } from "react";
import { SettingWrapperProps } from "../SettingWrapper/SettingWrapper";
import { SettingValueType } from "@/types/Setting";
import { useDebouncedSave } from "@/hooks/useDebouncedSave";
import { TextArea } from "@/components/TextArea/TextArea";
import styles from "./SettingTextArea.module.css";

export const SettingTextArea = memo(({ setting, handleSave, debounceTime = 1000 }: SettingWrapperProps) => {
    const [inputValue, setInputValue] = useDebouncedSave<SettingValueType>(
        setting.value,
        debounceTime,
        (value) => handleSave({ id: setting.id, value })
    );

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputValue(e.target.value);
    };

    return (
        <TextArea
            value={inputValue as string}
            onChange={handleChange}
            fullScreen={true}
            textAreaClassName={styles.container}
        />
    );
}, (prevProps, nextProps) =>
    JSON.stringify(prevProps.setting) === JSON.stringify(nextProps.setting) &&
    prevProps.disabled === nextProps.disabled
);
